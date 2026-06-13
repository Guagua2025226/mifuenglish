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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          assigned_sales: string | null
          coach_id: string
          confirmed_at: string | null
          created_at: string
          deadline_at: string
          duration_minutes: number
          id: string
          mbti: string | null
          notes: string | null
          parent_email: string | null
          parent_name: string
          parent_phone: string
          reassigned_from_coach_id: string | null
          scheduled_date: string
          scheduled_start_hour: number
          score_range: string | null
          status: Database["public"]["Enums"]["booking_status"]
          student_id: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_sales?: string | null
          coach_id: string
          confirmed_at?: string | null
          created_at?: string
          deadline_at?: string
          duration_minutes: number
          id?: string
          mbti?: string | null
          notes?: string | null
          parent_email?: string | null
          parent_name: string
          parent_phone: string
          reassigned_from_coach_id?: string | null
          scheduled_date: string
          scheduled_start_hour: number
          score_range?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          student_id?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_sales?: string | null
          coach_id?: string
          confirmed_at?: string | null
          created_at?: string
          deadline_at?: string
          duration_minutes?: number
          id?: string
          mbti?: string | null
          notes?: string | null
          parent_email?: string | null
          parent_name?: string
          parent_phone?: string
          reassigned_from_coach_id?: string | null
          scheduled_date?: string
          scheduled_start_hour?: number
          score_range?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          student_id?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_reassigned_from_coach_id_fkey"
            columns: ["reassigned_from_coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_availability: {
        Row: {
          coach_id: string
          created_at: string
          end_hour: number
          id: string
          start_hour: number
          weekday: number
        }
        Insert: {
          coach_id: string
          created_at?: string
          end_hour: number
          id?: string
          start_hour: number
          weekday: number
        }
        Update: {
          coach_id?: string
          created_at?: string
          end_hour?: number
          id?: string
          start_hour?: number
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "coach_availability_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_time_off: {
        Row: {
          coach_id: string
          created_at: string
          end_hour: number | null
          id: string
          off_date: string
          reason: string | null
          start_hour: number | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          end_hour?: number | null
          id?: string
          off_date: string
          reason?: string | null
          start_hour?: number | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          end_hour?: number | null
          id?: string
          off_date?: string
          reason?: string | null
          start_hour?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_time_off_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_whitelist: {
        Row: {
          created_at: string
          note: string | null
          phone: string
          suggested_name: string | null
          suggested_subject: string | null
        }
        Insert: {
          created_at?: string
          note?: string | null
          phone: string
          suggested_name?: string | null
          suggested_subject?: string | null
        }
        Update: {
          created_at?: string
          note?: string | null
          phone?: string
          suggested_name?: string | null
          suggested_subject?: string | null
        }
        Relationships: []
      }
      coaches: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_order: number
          en_name: string | null
          features: Json | null
          highlights: Json | null
          id: string
          mbti: string | null
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["coach_status"]
          subject: string | null
          title: string | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_order?: number
          en_name?: string | null
          features?: Json | null
          highlights?: Json | null
          id: string
          mbti?: string | null
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["coach_status"]
          subject?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_order?: number
          en_name?: string | null
          features?: Json | null
          highlights?: Json | null
          id?: string
          mbti?: string | null
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["coach_status"]
          subject?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      daily_checkin: {
        Row: {
          checkin_date: string
          correct_count: number
          created_at: string
          id: string
          user_id: string
          words_studied: number
        }
        Insert: {
          checkin_date: string
          correct_count?: number
          created_at?: string
          id?: string
          user_id: string
          words_studied?: number
        }
        Update: {
          checkin_date?: string
          correct_count?: number
          created_at?: string
          id?: string
          user_id?: string
          words_studied?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_sales: string
          coach_id: string
          coach_name: string
          created_at: string
          email: string | null
          id: string
          mbti: string | null
          parent_name: string
          phone: string
          score_range: string
          student_id: string | null
          subject: string
        }
        Insert: {
          assigned_sales: string
          coach_id: string
          coach_name: string
          created_at?: string
          email?: string | null
          id?: string
          mbti?: string | null
          parent_name: string
          phone: string
          score_range: string
          student_id?: string | null
          subject: string
        }
        Update: {
          assigned_sales?: string
          coach_id?: string
          coach_name?: string
          created_at?: string
          email?: string | null
          id?: string
          mbti?: string | null
          parent_name?: string
          phone?: string
          score_range?: string
          student_id?: string | null
          subject?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nickname: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nickname?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nickname?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          district: string
          grade: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          district: string
          grade: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          district?: string
          grade?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      study_logs: {
        Row: {
          correct_count: number
          created_at: string
          id: string
          mode: string
          score: number
          student_id: string
          words_studied: number
        }
        Insert: {
          correct_count?: number
          created_at?: string
          id?: string
          mode: string
          score?: number
          student_id: string
          words_studied?: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          mode?: string
          score?: number
          student_id?: string
          words_studied?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          correct_count: number
          created_at: string
          id: string
          last_reviewed_at: string | null
          mastery: number
          updated_at: string
          user_id: string
          word_id: string
          wrong_count: number
        }
        Insert: {
          correct_count?: number
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          mastery?: number
          updated_at?: string
          user_id: string
          word_id: string
          wrong_count?: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          mastery?: number
          updated_at?: string
          user_id?: string
          word_id?: string
          wrong_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "vocabulary"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary: {
        Row: {
          created_at: string
          id: string
          meaning: string
          pos: string | null
          word: string
        }
        Insert: {
          created_at?: string
          id?: string
          meaning: string
          pos?: string | null
          word: string
        }
        Update: {
          created_at?: string
          id?: string
          meaning?: string
          pos?: string | null
          word?: string
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
      booking_status:
        | "pending"
        | "confirmed"
        | "rejected"
        | "timeout"
        | "reassigned"
        | "cancelled"
      coach_status: "pending" | "approved" | "rejected" | "disabled"
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
      booking_status: [
        "pending",
        "confirmed",
        "rejected",
        "timeout",
        "reassigned",
        "cancelled",
      ],
      coach_status: ["pending", "approved", "rejected", "disabled"],
    },
  },
} as const
