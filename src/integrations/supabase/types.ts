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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      food_items: {
        Row: {
          calories_per_100g: number
          category: string
          cost_per_100g_rupees: number
          created_at: string
          id: string
          is_veg: boolean
          name: string
        }
        Insert: {
          calories_per_100g: number
          category?: string
          cost_per_100g_rupees: number
          created_at?: string
          id?: string
          is_veg?: boolean
          name: string
        }
        Update: {
          calories_per_100g?: number
          category?: string
          cost_per_100g_rupees?: number
          created_at?: string
          id?: string
          is_veg?: boolean
          name?: string
        }
        Relationships: []
      }
      meal_plan_items: {
        Row: {
          created_at: string
          food_item_id: string
          id: string
          meal_plan_id: string
          quantity_grams: number
        }
        Insert: {
          created_at?: string
          food_item_id: string
          id?: string
          meal_plan_id: string
          quantity_grams?: number
        }
        Update: {
          created_at?: string
          food_item_id?: string
          id?: string
          meal_plan_id?: string
          quantity_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_items_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_items_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string
          day_of_week: number
          id: string
          is_veg: boolean
          meal_type: string
          total_calories: number
          total_cost: number
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          id?: string
          is_veg?: boolean
          meal_type: string
          total_calories?: number
          total_cost?: number
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          id?: string
          is_veg?: boolean
          meal_type?: string
          total_calories?: number
          total_cost?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age_group: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age_group?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      teacher_credentials: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          teacher_code: string
          teacher_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          teacher_code: string
          teacher_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          teacher_code?: string
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_broadcast: boolean
          is_read: boolean
          message_type: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          subject: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
          is_read?: boolean
          message_type: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          subject: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
          is_read?: boolean
          message_type?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          subject?: string
        }
        Relationships: []
      }
      ai_suggestions: {
        Row: {
          suggestion_type: string
          content: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          target_audience: string
          title: string
          updated_at: string
        }
        Insert: {
          suggestion_type: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          target_audience: string
          title: string
          updated_at?: string
        }
        Update: {
          suggestion_type?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          target_audience?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      personalized_meal_plans: {
        Row: {
          id: string
          student_id: string
          plan_name: string
          description: string | null
          target_calories: number
          target_protein: number
          target_carbs: number
          target_fat: number
          duration_days: number
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          plan_name: string
          description?: string | null
          target_calories: number
          target_protein: number
          target_carbs: number
          target_fat: number
          duration_days?: number
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
          id?: string
        }
        Update: {
          student_id?: string
          plan_name?: string
          description?: string | null
          target_calories?: number
          target_protein?: number
          target_carbs?: number
          target_fat?: number
          duration_days?: number
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
          id?: string
        }
        Relationships: []
      }
      personalized_meal_plan_items: {
        Row: {
          created_at: string
          day_of_week: number
          food_item_id: string
          id: string
          meal_plan_id: string
          meal_type: string
          quantity_grams: number
        }
        Insert: {
          created_at?: string
          day_of_week: number
          food_item_id: string
          id?: string
          meal_plan_id: string
          meal_type: string
          quantity_grams?: number
        }
        Update: {
          created_at?: string
          day_of_week?: number
          food_item_id?: string
          id?: string
          meal_plan_id?: string
          meal_type?: string
          quantity_grams?: number
        }
        Relationships: []
      }
      student_analytics: {
        Row: {
          id: string
          student_id: string
          metric_name: string
          metric_value: number
          metric_unit: string
          recorded_at: string
          notes: string | null
        }
        Insert: {
          student_id: string
          metric_name: string
          metric_value: number
          metric_unit: string
          recorded_at?: string
          notes?: string | null
          id?: string
        }
        Update: {
          student_id?: string
          metric_name?: string
          metric_value?: number
          metric_unit?: string
          recorded_at?: string
          notes?: string | null
          id?: string
        }
        Relationships: []
      }
      student_details: {
        Row: {
          body_type: string
          created_at: string
          goal: string
          height_cm: number
          height_feet: string
          id: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          body_type: string
          created_at?: string
          goal: string
          height_cm: number
          height_feet: string
          id?: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          body_type?: string
          created_at?: string
          goal?: string
          height_cm?: number
          height_feet?: string
          id?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      user_meal_items: {
        Row: {
          created_at: string
          food_item_id: string
          id: string
          quantity_grams: number
          user_meal_id: string
        }
        Insert: {
          created_at?: string
          food_item_id: string
          id?: string
          quantity_grams?: number
          user_meal_id: string
        }
        Update: {
          created_at?: string
          food_item_id?: string
          id?: string
          quantity_grams?: number
          user_meal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_meal_items_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_meal_items_user_meal_id_fkey"
            columns: ["user_meal_id"]
            isOneToOne: false
            referencedRelation: "user_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_meals: {
        Row: {
          created_at: string
          id: string
          meal_date: string
          meal_name: string
          meal_type: string
          total_calories: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_date?: string
          meal_name: string
          meal_type: string
          total_calories?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_date?: string
          meal_name?: string
          meal_type?: string
          total_calories?: number
          user_id?: string
        }
        Relationships: []
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
    : never,
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
