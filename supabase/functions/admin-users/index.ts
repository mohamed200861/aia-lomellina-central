import { createClient } from "npm:@supabase/supabase-js@2.100.0";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({
    action: z.literal("setRole"),
    userId: z.string().uuid(),
    role: z.enum(["super_admin", "admin", "editor", "member"]),
  }),
  z.object({
    action: z.literal("setActive"),
    userId: z.string().uuid(),
    active: z.boolean(),
  }),
]);

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const jwt = authHeader?.replace("Bearer ", "");

    if (!jwt) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });

    const { data: authData, error: authError } = await authClient.auth.getUser(jwt);
    if (authError || !authData.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const requesterId = authData.user.id;
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data: requesterRoles, error: rolesError } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requesterId);

    if (rolesError) {
      return jsonResponse({ error: rolesError.message }, 500);
    }

    const roleSet = new Set((requesterRoles ?? []).map((item) => item.role));
    const isSuperAdmin = roleSet.has("super_admin");
    const isAdmin = isSuperAdmin || roleSet.has("admin") || roleSet.has("editor");

    if (!isAdmin) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const parsed = actionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: parsed.error.flatten().fieldErrors }, 400);
    }

    if (parsed.data.action === "list") {
      const { data: userList, error } = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      const userIds = userList.users.map((entry) => entry.id);
      const [{ data: profiles }, { data: roleRows }] = await Promise.all([
        serviceClient.from("profiles").select("user_id, full_name").in("user_id", userIds),
        serviceClient.from("user_roles").select("user_id, role").in("user_id", userIds),
      ]);

      const users = userList.users.map((entry) => {
        const bannedUntil = entry.banned_until ? new Date(entry.banned_until) : null;
        return {
          user_id: entry.id,
          email: entry.email,
          full_name: profiles?.find((profile) => profile.user_id === entry.id)?.full_name ?? null,
          created_at: entry.created_at,
          email_confirmed_at: entry.email_confirmed_at,
          role: roleRows?.find((role) => role.user_id === entry.id)?.role ?? "member",
          is_active: !bannedUntil || bannedUntil.getTime() < Date.now(),
        };
      });

      return jsonResponse({ users });
    }

    if (!isSuperAdmin) {
      return jsonResponse({ error: "Only Il Grande P can manage roles and user activation." }, 403);
    }

    if (parsed.data.action === "setRole") {
      if (parsed.data.userId === requesterId && parsed.data.role !== "super_admin") {
        return jsonResponse({ error: "You cannot remove your own super admin access." }, 400);
      }

      await serviceClient.from("user_roles").delete().eq("user_id", parsed.data.userId);
      const { error } = await serviceClient.from("user_roles").insert({
        user_id: parsed.data.userId,
        role: parsed.data.role,
      });

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      await serviceClient.from("activity_log").insert({
        action: "role_change",
        entity_type: "user",
        entity_id: parsed.data.userId,
        user_id: requesterId,
        details: { role: parsed.data.role },
      });

      return jsonResponse({ success: true });
    }

    const { error } = await serviceClient.auth.admin.updateUserById(parsed.data.userId, {
      ban_duration: parsed.data.active ? "none" : "876000h",
    });

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    await serviceClient.from("activity_log").insert({
      action: parsed.data.active ? "user_reactivated" : "user_deactivated",
      entity_type: "user",
      entity_id: parsed.data.userId,
      user_id: requesterId,
      details: { active: parsed.data.active },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});