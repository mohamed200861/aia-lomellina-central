export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      absence_justifications: {
        Row: {
          attachment_url: string | null
          created_at: string
          full_name: string
          id: string
          reason: string
          rto_date_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          reason: string
          rto_date_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          reason?: string
          rto_date_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "absence_justifications_rto_date_id_fkey"
            columns: ["rto_date_id"]
            isOneToOne: false
            referencedRelation: "rto_dates"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      athletic_content: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          is_published: boolean | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      course_registrations: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string
          status: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_url: string
          id: string
          is_published: boolean | null
          sort_order: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_url: string
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_url?: string
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          cta_label: string | null
          footer_note: string | null
          heading: string | null
          id: string
          is_enabled: boolean
          name: string
          subject: string
          template_key: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          cta_label?: string | null
          footer_note?: string | null
          heading?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          subject: string
          template_key: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          cta_label?: string | null
          footer_note?: string | null
          heading?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          subject?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          is_published: boolean | null
          location: string | null
          registration_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          registration_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          registration_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_communications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          title?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          description: string | null
          file_url: string
          gallery: string | null
          id: string
          media_type: string | null
          sort_order: number | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_url: string
          gallery?: string | null
          id?: string
          media_type?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_url?: string
          gallery?: string | null
          id?: string
          media_type?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Relationships: []
      }
      medical_centers: {
        Row: {
          address: string | null
          created_at: string
          id: string
          instructions: string | null
          name: string
          phone: string | null
          required_docs: string | null
          sort_order: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          name: string
          phone?: string | null
          required_docs?: string | null
          sort_order?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          instructions?: string | null
          name?: string
          phone?: string | null
          required_docs?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          slug: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      press_review: {
        Row: {
          article_date: string
          created_at: string
          description: string | null
          external_url: string | null
          file_url: string | null
          id: string
          newspaper: string
          page: string | null
          sort_order: number | null
          thumbnail_url: string | null
          year: number
        }
        Insert: {
          article_date: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          newspaper: string
          page?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          year: number
        }
        Update: {
          article_date?: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          file_url?: string | null
          id?: string
          newspaper?: string
          page?: string | null
          sort_order?: number | null
          thumbnail_url?: string | null
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referees: {
        Row: {
          created_at: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          qualification: string
          sort_order: number | null
          technical_body: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          qualification?: string
          sort_order?: number | null
          technical_body?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          qualification?: string
          sort_order?: number | null
          technical_body?: string
          updated_at?: string
        }
        Relationships: []
      }
      reimbursement_rules: {
        Row: {
          amount: number
          category: string
          created_at: string
          distance_bracket: string
          id: string
          role: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          distance_bracket: string
          id?: string
          role: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          distance_bracket?: string
          id?: string
          role?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      report_settings: {
        Row: {
          category: string
          created_at: string
          deadline: string | null
          destination_email: string | null
          id: string
          instructions: string | null
          sort_order: number | null
          template_url: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          deadline?: string | null
          destination_email?: string | null
          id?: string
          instructions?: string | null
          sort_order?: number | null
          template_url?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          deadline?: string | null
          destination_email?: string | null
          id?: string
          instructions?: string | null
          sort_order?: number | null
          template_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rto_dates: {
        Row: {
          created_at: string
          id: string
          is_published: boolean | null
          location: string | null
          notes: string | null
          notice_url: string | null
          rto_date: string
          rto_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          location?: string | null
          notes?: string | null
          notice_url?: string | null
          rto_date: string
          rto_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean | null
          location?: string | null
          notes?: string | null
          notice_url?: string | null
          rto_date?: string
          rto_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          email: string | null
          email_confirm_absence: boolean
          email_confirm_contact: boolean
          email_confirm_course: boolean
          email_confirm_welcome: boolean
          facebook_url: string | null
          footer_text: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          next_course_date: string | null
          notification_email_primary: string | null
          notification_email_secondary: string | null
          phone1: string | null
          phone2: string | null
          sender_email: string | null
          sender_name: string | null
          site_name: string | null
          telegram_url: string | null
          updated_at: string
          whatsapp: string | null
          x_url: string | null
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          email?: string | null
          email_confirm_absence?: boolean
          email_confirm_contact?: boolean
          email_confirm_course?: boolean
          email_confirm_welcome?: boolean
          facebook_url?: string | null
          footer_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          next_course_date?: string | null
          notification_email_primary?: string | null
          notification_email_secondary?: string | null
          phone1?: string | null
          phone2?: string | null
          sender_email?: string | null
          sender_name?: string | null
          site_name?: string | null
          telegram_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          email?: string | null
          email_confirm_absence?: boolean
          email_confirm_contact?: boolean
          email_confirm_course?: boolean
          email_confirm_welcome?: boolean
          facebook_url?: string | null
          footer_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          next_course_date?: string | null
          notification_email_primary?: string | null
          notification_email_secondary?: string | null
          phone1?: string | null
          phone2?: string | null
          sender_email?: string | null
          sender_name?: string | null
          site_name?: string | null
          telegram_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          x_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          caption: string | null
          created_at: string
          external_url: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          platform: string
          post_date: string | null
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          platform?: string
          post_date?: string | null
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          platform?: string
          post_date?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          category: string
          created_at: string
          full_name: string
          id: string
          photo_url: string | null
          role: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          full_name: string
          id?: string
          photo_url?: string | null
          role: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          full_name?: string
          id?: string
          photo_url?: string | null
          role?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "editor", "member"],
    },
  },
} as const
