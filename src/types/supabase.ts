/**
 * Placeholder for Supabase auto-generated types.
 * 
 * Generate with:
 *   npx supabase gen types typescript --local > src/types/supabase.ts
 * 
 * Or from remote:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          business_name: string | null;
          brand_color: string | null;
          brand_logo_url: string | null;
          plan_tier: "free" | "pro" | "team";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          business_name?: string | null;
          brand_color?: string | null;
          brand_logo_url?: string | null;
          plan_tier?: "free" | "pro" | "team";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          business_name?: string | null;
          brand_color?: string | null;
          brand_logo_url?: string | null;
          plan_tier?: "free" | "pro" | "team";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      client_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          company_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          company_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          company_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          id: string;
          designer_id: string;
          name: string;
          project_type: "branding" | "web_design" | "social_media";
          questions: Json;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          designer_id: string;
          name: string;
          project_type: "branding" | "web_design" | "social_media";
          questions?: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          designer_id?: string;
          name?: string;
          project_type?: "branding" | "web_design" | "social_media";
          questions?: Json;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "templates_designer_id_fkey";
            columns: ["designer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          designer_id: string;
          client_id: string | null;
          client_email: string;
          client_name: string | null;
          project_type: "branding" | "web_design" | "social_media";
          template_id: string | null;
          status: "draft" | "sent" | "in_progress" | "completed" | "reviewed";
          magic_link_token: string | null;
          share_token: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          designer_id: string;
          client_id?: string | null;
          client_email: string;
          client_name?: string | null;
          project_type: "branding" | "web_design" | "social_media";
          template_id?: string | null;
          status?: "draft" | "sent" | "in_progress" | "completed" | "reviewed";
          magic_link_token?: string | null;
          share_token?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          designer_id?: string;
          client_id?: string | null;
          client_email?: string;
          client_name?: string | null;
          project_type?: "branding" | "web_design" | "social_media";
          template_id?: string | null;
          status?: "draft" | "sent" | "in_progress" | "completed" | "reviewed";
          magic_link_token?: string | null;
          share_token?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_designer_id_fkey";
            columns: ["designer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "client_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
      responses: {
        Row: {
          id: string;
          project_id: string;
          step_key: string;
          answers: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          step_key: string;
          answers?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          step_key?: string;
          answers?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "responses_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      assets: {
        Row: {
          id: string;
          project_id: string;
          storage_path: string;
          file_name: string;
          file_type: string;
          category: "inspiration" | "reference" | "existing_brand";
          metadata: Json | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          storage_path: string;
          file_name: string;
          file_type: string;
          category?: "inspiration" | "reference" | "existing_brand";
          metadata?: Json | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          storage_path?: string;
          file_name?: string;
          file_type?: string;
          category?: "inspiration" | "reference" | "existing_brand";
          metadata?: Json | null;
          uploaded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assets_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      briefs: {
        Row: {
          id: string;
          project_id: string;
          content: Json;
          pdf_storage_path: string | null;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          content?: Json;
          pdf_storage_path?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          content?: Json;
          pdf_storage_path?: string | null;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "briefs_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string | null;
          project_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message?: string | null;
          project_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string | null;
          project_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      revision_requests: {
        Row: {
          id: string;
          project_id: string;
          designer_id: string;
          step_key: string;
          field_key: string | null;
          message: string;
          status: "pending" | "responded";
          response: string | null;
          responded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          designer_id: string;
          step_key: string;
          field_key?: string | null;
          message: string;
          status?: "pending" | "responded";
          response?: string | null;
          responded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          designer_id?: string;
          step_key?: string;
          field_key?: string | null;
          message?: string;
          status?: "pending" | "responded";
          response?: string | null;
          responded_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "revision_requests_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "revision_requests_designer_id_fkey";
            columns: ["designer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
