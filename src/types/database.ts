export type InteractionType = 'like' | 'skip' | 'save' | 'remove';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      boards: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      board_images: {
        Row: {
          id: string;
          board_id: string;
          image_url: string;
          thumbnail_url: string | null;
          source: string | null;
          source_id: string | null;
          position_x: number;
          position_y: number;
          scale: number;
          width: number;
          height: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          board_id: string;
          image_url: string;
          thumbnail_url?: string | null;
          source?: string | null;
          source_id?: string | null;
          position_x?: number;
          position_y?: number;
          scale?: number;
          width: number;
          height: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          board_id?: string;
          image_url?: string;
          thumbnail_url?: string | null;
          source?: string | null;
          source_id?: string | null;
          position_x?: number;
          position_y?: number;
          scale?: number;
          width?: number;
          height?: number;
          created_at?: string;
        };
      };
      images: {
        Row: {
          id: string;
          url: string;
          thumbnail_url: string | null;
          source: string | null;
          source_id: string | null;
          width: number;
          height: number;
          dominant_colors: Record<string, unknown> | null;
          clip_embedding_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          thumbnail_url?: string | null;
          source?: string | null;
          source_id?: string | null;
          width: number;
          height: number;
          dominant_colors?: Record<string, unknown> | null;
          clip_embedding_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          thumbnail_url?: string | null;
          source?: string | null;
          source_id?: string | null;
          width?: number;
          height?: number;
          dominant_colors?: Record<string, unknown> | null;
          clip_embedding_id?: string | null;
          created_at?: string;
        };
      };
      design_dna: {
        Row: {
          id: string;
          user_id: string;
          color_preferences: Record<string, unknown> | null;
          style_tags: string[] | null;
          taste_vector: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          color_preferences?: Record<string, unknown> | null;
          style_tags?: string[] | null;
          taste_vector?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          color_preferences?: Record<string, unknown> | null;
          style_tags?: string[] | null;
          taste_vector?: string | null;
          updated_at?: string;
        };
      };
      user_interactions: {
        Row: {
          id: string;
          user_id: string;
          image_id: string;
          interaction_type: InteractionType;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_id: string;
          interaction_type: InteractionType;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_id?: string;
          interaction_type?: InteractionType;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      interaction_type: InteractionType;
    };
  };
}
