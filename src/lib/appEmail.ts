import { supabase } from "@/integrations/supabase/client";

interface AppEmailParams {
  templateName: string;
  recipientEmail: string;
  idempotencyKey: string;
  templateData?: Record<string, unknown>;
}

export async function sendAppEmail({
  templateName,
  recipientEmail,
  idempotencyKey,
  templateData,
}: AppEmailParams) {
  const { error } = await supabase.functions.invoke("send-transactional-email", {
    body: {
      templateName,
      recipientEmail,
      idempotencyKey,
      templateData,
    },
  });

  if (error) throw error;
}