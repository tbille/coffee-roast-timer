export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string
          default_temperature_unit: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          default_temperature_unit?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          default_temperature_unit?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      roast_profile_likes: {
        Row: {
          created_at: string
          id: string
          roast_profile_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          roast_profile_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          roast_profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roast_profile_likes_roast_profile_id_fkey"
            columns: ["roast_profile_id"]
            isOneToOne: false
            referencedRelation: "roast_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roast_profile_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      roast_profiles: {
        Row: {
          beans_name: string
          brew_method: string | null
          coffee_roaster: string | null
          crack_events: Json
          created_at: string
          cupping_date: string | null
          cupping_score: number | null
          development_stats: Json | null
          duration_seconds: number
          environmental_notes: string | null
          farm_name: string | null
          final_weight: number | null
          flavor_notes: string | null
          flavor_tags: string[] | null
          id: string
          initial_weight: number | null
          milestones: Json | null
          notes: string | null
          origin: string | null
          rest_days: number | null
          roast_process: string | null
          roasted_bean_photo_url: string | null
          roaster_data: Json | null
          roaster_settings: Json | null
          roaster_type: string | null
          temperature_data: Json
          temperature_unit: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          beans_name: string
          brew_method?: string | null
          coffee_roaster?: string | null
          crack_events?: Json
          created_at?: string
          cupping_date?: string | null
          cupping_score?: number | null
          development_stats?: Json | null
          duration_seconds: number
          environmental_notes?: string | null
          farm_name?: string | null
          final_weight?: number | null
          flavor_notes?: string | null
          flavor_tags?: string[] | null
          id?: string
          initial_weight?: number | null
          milestones?: Json | null
          notes?: string | null
          origin?: string | null
          rest_days?: number | null
          roast_process?: string | null
          roasted_bean_photo_url?: string | null
          roaster_data?: Json | null
          roaster_settings?: Json | null
          roaster_type?: string | null
          temperature_data?: Json
          temperature_unit?: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          beans_name?: string
          brew_method?: string | null
          coffee_roaster?: string | null
          crack_events?: Json
          created_at?: string
          cupping_date?: string | null
          cupping_score?: number | null
          development_stats?: Json | null
          duration_seconds?: number
          environmental_notes?: string | null
          farm_name?: string | null
          final_weight?: number | null
          flavor_notes?: string | null
          flavor_tags?: string[] | null
          id?: string
          initial_weight?: number | null
          milestones?: Json | null
          notes?: string | null
          origin?: string | null
          rest_days?: number | null
          roast_process?: string | null
          roasted_bean_photo_url?: string | null
          roaster_data?: Json | null
          roaster_settings?: Json | null
          roaster_type?: string | null
          temperature_data?: Json
          temperature_unit?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      user_roaster_preferences: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          last_used_at: string | null
          roaster_type: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          last_used_at?: string | null
          roaster_type: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          last_used_at?: string | null
          roaster_type?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roaster_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
