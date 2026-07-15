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
          username: string | null;
          avatar_url: string | null;
          theme: "dark" | "light" | "system";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          theme?: "dark" | "light" | "system";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          theme?: "dark" | "light" | "system";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      links: {
        Row: {
          id: string;
          user_id: string;
          original_url: string;
          slug: string;
          title: string | null;
          description: string | null;
          password_hash: string | null;
          expires_at: string | null;
          is_active: boolean;
          click_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          original_url: string;
          slug: string;
          title?: string | null;
          description?: string | null;
          password_hash?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          click_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          original_url?: string;
          slug?: string;
          title?: string | null;
          description?: string | null;
          password_hash?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          click_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      click_events: {
        Row: {
          id: string;
          link_id: string;
          visitor_id: string | null;
          ip_hash: string | null;
          country: string | null;
          city: string | null;
          device: string | null;
          browser: string | null;
          os: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          link_id: string;
          visitor_id?: string | null;
          ip_hash?: string | null;
          country?: string | null;
          city?: string | null;
          device?: string | null;
          browser?: string | null;
          os?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          link_id?: string;
          visitor_id?: string | null;
          ip_hash?: string | null;
          country?: string | null;
          city?: string | null;
          device?: string | null;
          browser?: string | null;
          os?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          last_used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          last_used_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_click_count: {
        Args: { link_uuid: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Link = Database["public"]["Tables"]["links"]["Row"];
export type ClickEvent = Database["public"]["Tables"]["click_events"]["Row"];
export type ApiKey = Database["public"]["Tables"]["api_keys"]["Row"];

export type LinkInsert = Database["public"]["Tables"]["links"]["Insert"];
export type LinkUpdate = Database["public"]["Tables"]["links"]["Update"];
