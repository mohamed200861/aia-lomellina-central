import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_site_settings" as any);
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return row ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
