export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Employee_Profile: {
        Row: {
          employee_id: number
          soc_code: number | null
        }
        Insert: {
          employee_id: number
          soc_code?: number | null
        }
        Update: {
          employee_id?: number
          soc_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Employee_Profile_soc_code_fkey"
            columns: ["soc_code"]
            isOneToOne: false
            referencedRelation: "Job_Risk"
            referencedColumns: ["soc_code"]
          },
        ]
      }
      Employee_Reskilling_cases: {
        Row: {
          case_id: number
          certification_earned: boolean | null
          completion_date: string | null
          employee_id: number | null
          perceived_skill_improvement: number | null
          start_date: string | null
          training_feedback_score: number | null
          training_program: string | null
        }
        Insert: {
          case_id: number
          certification_earned?: boolean | null
          completion_date?: string | null
          employee_id?: number | null
          perceived_skill_improvement?: number | null
          start_date?: string | null
          training_feedback_score?: number | null
          training_program?: string | null
        }
        Update: {
          case_id?: number
          certification_earned?: boolean | null
          completion_date?: string | null
          employee_id?: number | null
          perceived_skill_improvement?: number | null
          start_date?: string | null
          training_feedback_score?: number | null
          training_program?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Employee_Reskilling_cases_with_trainning_effec_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "Employee_Profile"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      Job_Risk: {
        Row: {
          automation_probability: number | null
          job_title: string | null
          soc_code: number
        }
        Insert: {
          automation_probability?: number | null
          job_title?: string | null
          soc_code: number
        }
        Update: {
          automation_probability?: number | null
          job_title?: string | null
          soc_code?: number
        }
        Relationships: []
      }
      WorkforceReskilling_events: {
        Row: {
          activity: string | null
          actor: string | null
          case_id: number | null
          completion_status: string | null
          event_id: number
          score: string | null
          skill_category: string | null
          timestamp: string | null
        }
        Insert: {
          activity?: string | null
          actor?: string | null
          case_id?: number | null
          completion_status?: string | null
          event_id: number
          score?: string | null
          skill_category?: string | null
          timestamp?: string | null
        }
        Update: {
          activity?: string | null
          actor?: string | null
          case_id?: number | null
          completion_status?: string | null
          event_id?: number
          score?: string | null
          skill_category?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "WorkforceReskilling_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "Employee_Reskilling_cases"
            referencedColumns: ["case_id"]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
