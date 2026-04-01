import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to Supabase realtime changes on key tables
 * and invalidates the relevant React Query caches instantly.
 */
const TABLE_QUERY_MAP: Record<string, string[]> = {
  news: ["public-news", "admin-news", "admin-news-count"],
  events: ["admin-events", "admin-events-count"],
  staff_members: ["admin-staff", "public-staff"],
  referees: ["admin-referees", "public-referees", "admin-referees-count"],
  media: ["admin-media", "public-media"],
  press_review: ["admin-press-review", "public-press-review"],
  rto_dates: ["admin-rto", "member-rto"],
  reimbursement_rules: ["admin-reimbursements", "member-reimbursements"],
  report_settings: ["admin-reports", "member-reports"],
  medical_centers: ["admin-medical", "member-medical"],
  athletic_content: ["admin-athletic", "member-athletic"],
  documents: ["admin-documents", "member-documents"],
  internal_communications: ["admin-communications", "member-communications"],
  contact_submissions: ["admin-submissions", "admin-msgs-count"],
  course_registrations: ["admin-registrations", "admin-regs-count"],
  absence_justifications: ["admin-justifications", "admin-just-count"],
  site_settings: ["site-settings"],
  user_roles: ["admin-users", "admin-users-count"],
};

export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("global-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        (payload) => {
          const table = payload.table;
          const keys = TABLE_QUERY_MAP[table];
          if (keys) {
            keys.forEach((key) => {
              qc.invalidateQueries({ queryKey: [key] });
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
