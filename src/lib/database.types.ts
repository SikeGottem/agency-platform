Initialising login role...
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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assets: {
        Row: {
          category: string | null
          file_name: string
          file_type: string
          id: string
          metadata: Json | null
          project_id: string
          storage_path: string
          uploaded_at: string | null
        }
        Insert: {
          category?: string | null
          file_name: string
          file_type: string
          id?: string
          metadata?: Json | null
          project_id: string
          storage_path: string
          uploaded_at?: string | null
        }
        Update: {
          category?: string | null
          file_name?: string
          file_type?: string
          id?: string
          metadata?: Json | null
          project_id?: string
          storage_path?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      briefs: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          pdf_storage_path: string | null
          project_id: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content?: Json
          created_at?: string | null
          id?: string
          pdf_storage_path?: string | null
          project_id: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          pdf_storage_path?: string | null
          project_id?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "briefs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          created_at: string
          description: string
          id: string
          impact: string
          requested_by: string
          scope_document_id: string
          status: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          impact?: string
          requested_by: string
          scope_document_id: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          impact?: string
          requested_by?: string
          scope_document_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_scope_document_id_fkey"
            columns: ["scope_document_id"]
            isOneToOne: false
            referencedRelation: "scope_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deliverable_feedback: {
        Row: {
          addressed: boolean
          category_ratings: Json
          client_id: string
          comments: string | null
          created_at: string
          deliverable_id: string
          id: string
          overall_rating: string
        }
        Insert: {
          addressed?: boolean
          category_ratings?: Json
          client_id: string
          comments?: string | null
          created_at?: string
          deliverable_id: string
          id?: string
          overall_rating?: string
        }
        Update: {
          addressed?: boolean
          category_ratings?: Json
          client_id?: string
          comments?: string | null
          created_at?: string
          deliverable_id?: string
          id?: string
          overall_rating?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_feedback_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          created_at: string
          description: string | null
          designer_id: string
          file_type: string
          file_url: string | null
          id: string
          project_id: string
          round: number
          shared_at: string | null
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          designer_id: string
          file_type?: string
          file_url?: string | null
          id?: string
          project_id: string
          round?: number
          shared_at?: string | null
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          designer_id?: string
          file_type?: string
          file_url?: string | null
          id?: string
          project_id?: string
          round?: number
          shared_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_defaults: {
        Row: {
          average_budget: string | null
          average_timeline: string | null
          common_styles: Json | null
          common_typography: Json | null
          confidence_level: number | null
          created_at: string | null
          id: string
          industry: string
          last_updated: string | null
          preferred_colors: Json | null
          sample_size: number | null
          style_scores: Json
          updated_at: string | null
        }
        Insert: {
          average_budget?: string | null
          average_timeline?: string | null
          common_styles?: Json | null
          common_typography?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          id?: string
          industry: string
          last_updated?: string | null
          preferred_colors?: Json | null
          sample_size?: number | null
          style_scores?: Json
          updated_at?: string | null
        }
        Update: {
          average_budget?: string | null
          average_timeline?: string | null
          common_styles?: Json | null
          common_typography?: Json | null
          confidence_level?: number | null
          created_at?: string | null
          id?: string
          industry?: string
          last_updated?: string | null
          preferred_colors?: Json | null
          sample_size?: number | null
          style_scores?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number
          client_email: string
          created_at: string
          currency: string
          designer_id: string
          due_date: string | null
          id: string
          line_items: Json
          paid_at: string | null
          project_id: string
          status: string
          stripe_invoice_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          client_email: string
          created_at?: string
          currency?: string
          designer_id: string
          due_date?: string | null
          id?: string
          line_items?: Json
          paid_at?: string | null
          project_id: string
          status?: string
          stripe_invoice_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_email?: string
          created_at?: string
          currency?: string
          designer_id?: string
          due_date?: string | null
          id?: string
          line_items?: Json
          paid_at?: string | null
          project_id?: string
          status?: string
          stripe_invoice_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lifecycle_states: {
        Row: {
          blockers: Json
          client_health_score: number
          current_phase: string
          id: string
          phase_started_at: string
          phases_completed: Json
          project_id: string
          updated_at: string
        }
        Insert: {
          blockers?: Json
          client_health_score?: number
          current_phase?: string
          id?: string
          phase_started_at?: string
          phases_completed?: Json
          project_id: string
          updated_at?: string
        }
        Update: {
          blockers?: Json
          client_health_score?: number
          current_phase?: string
          id?: string
          phase_started_at?: string
          phases_completed?: Json
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lifecycle_states_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          sender_id: string
          sender_type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          project_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          project_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          project_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          brand_color: string | null
          brand_logo_url: string | null
          business_name: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          plan_tier: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_current_period_end: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          brand_color?: string | null
          brand_logo_url?: string | null
          business_name?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          plan_tier?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          brand_color?: string | null
          brand_logo_url?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          plan_tier?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_end?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_analytics: {
        Row: {
          average_confidence: number | null
          budget_range: string | null
          color_preferences: Json | null
          completed_at: string | null
          id: string
          industry: string
          processed_for_defaults: boolean | null
          project_id: string
          style_scores: Json | null
          timeline: string | null
        }
        Insert: {
          average_confidence?: number | null
          budget_range?: string | null
          color_preferences?: Json | null
          completed_at?: string | null
          id?: string
          industry: string
          processed_for_defaults?: boolean | null
          project_id: string
          style_scores?: Json | null
          timeline?: string | null
        }
        Update: {
          average_confidence?: number | null
          budget_range?: string | null
          color_preferences?: Json | null
          completed_at?: string | null
          id?: string
          industry?: string
          processed_for_defaults?: boolean | null
          project_id?: string
          style_scores?: Json | null
          timeline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          id: string
          project_id: string
          rating: number
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          project_id: string
          rating: number
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          project_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_types: {
        Row: {
          created_at: string | null
          description: string | null
          designer_id: string | null
          icon: string | null
          id: string
          name: string
          questionnaire_config: Json | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          designer_id?: string | null
          icon?: string | null
          id?: string
          name: string
          questionnaire_config?: Json | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          designer_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          questionnaire_config?: Json | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_types_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_email: string
          client_id: string | null
          client_name: string | null
          completed_at: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_notes: string | null
          designer_id: string
          id: string
          magic_link_token: string | null
          project_type: string
          share_token: string | null
          status: string | null
          template_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_email: string
          client_id?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_notes?: string | null
          designer_id: string
          id?: string
          magic_link_token?: string | null
          project_type: string
          share_token?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_email?: string
          client_id?: string | null
          client_name?: string | null
          completed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_notes?: string | null
          designer_id?: string
          id?: string
          magic_link_token?: string | null
          project_type?: string
          share_token?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_analytics: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          id: string
          project_id: string
          skipped: boolean
          started_at: string
          step_key: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          project_id: string
          skipped?: boolean
          started_at?: string
          step_key: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          id?: string
          project_id?: string
          skipped?: boolean
          started_at?: string
          step_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_analytics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          answers: Json
          created_at: string | null
          id: string
          project_id: string
          step_key: string
          updated_at: string | null
        }
        Insert: {
          answers?: Json
          created_at?: string | null
          id?: string
          project_id: string
          step_key: string
          updated_at?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string | null
          id?: string
          project_id?: string
          step_key?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      revision_requests: {
        Row: {
          created_at: string | null
          designer_id: string
          field_key: string | null
          id: string
          message: string
          project_id: string
          responded_at: string | null
          response: string | null
          status: string | null
          step_key: string
        }
        Insert: {
          created_at?: string | null
          designer_id: string
          field_key?: string | null
          id?: string
          message: string
          project_id: string
          responded_at?: string | null
          response?: string | null
          status?: string | null
          step_key: string
        }
        Update: {
          created_at?: string | null
          designer_id?: string
          field_key?: string | null
          id?: string
          message?: string
          project_id?: string
          responded_at?: string | null
          response?: string | null
          status?: string | null
          step_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "revision_requests_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revision_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scope_documents: {
        Row: {
          change_orders: Json
          constraints: Json
          created_at: string
          deliverables: Json
          id: string
          project_id: string
          version: number
        }
        Insert: {
          change_orders?: Json
          constraints?: Json
          created_at?: string
          deliverables?: Json
          id?: string
          project_id: string
          version?: number
        }
        Update: {
          change_orders?: Json
          constraints?: Json
          created_at?: string
          deliverables?: Json
          id?: string
          project_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "scope_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string | null
          designer_id: string
          id: string
          is_default: boolean | null
          name: string
          project_type: string
          questions: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          designer_id: string
          id?: string
          is_default?: boolean | null
          name: string
          project_type: string
          questions?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          designer_id?: string
          id?: string
          is_default?: boolean | null
          name?: string
          project_type?: string
          questions?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      industry_insights: {
        Row: {
          avg_client_confidence: number | null
          common_styles: Json | null
          confidence_level: number | null
          industry: string | null
          last_updated: string | null
          preferred_colors: Json | null
          recent_projects: number | null
          sample_size: number | null
          style_scores: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
