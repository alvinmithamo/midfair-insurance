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
      claims: {
        Row: {
          assessor_contact: string | null
          assessor_name: string | null
          claim_amount: number | null
          claim_number: string
          claim_type: string
          created_at: string
          description: string
          garage_contact: string | null
          garage_name: string | null
          id: string
          incident_date: string
          location_of_incident: string | null
          notes: string | null
          police_report_number: string | null
          policy_id: string
          reported_date: string
          settled_amount: number | null
          settlement_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assessor_contact?: string | null
          assessor_name?: string | null
          claim_amount?: number | null
          claim_number: string
          claim_type: string
          created_at?: string
          description: string
          garage_contact?: string | null
          garage_name?: string | null
          id?: string
          incident_date: string
          location_of_incident?: string | null
          notes?: string | null
          police_report_number?: string | null
          policy_id: string
          reported_date?: string
          settled_amount?: number | null
          settlement_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assessor_contact?: string | null
          assessor_name?: string | null
          claim_amount?: number | null
          claim_number?: string
          claim_type?: string
          created_at?: string
          description?: string
          garage_contact?: string | null
          garage_name?: string | null
          id?: string
          incident_date?: string
          location_of_incident?: string | null
          notes?: string | null
          police_report_number?: string | null
          policy_id?: string
          reported_date?: string
          settled_amount?: number | null
          settlement_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          id: string
          id_number: string | null
          last_name: string
          phone: string
          postal_code: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          id?: string
          id_number?: string | null
          last_name: string
          phone: string
          postal_code?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          id_number?: string | null
          last_name?: string
          phone?: string
          postal_code?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          mpesa_transaction_id: string | null
          payment_date: string
          payment_method: string
          payment_reference: string | null
          payment_type: string
          policy_id: string
          receipt_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          mpesa_transaction_id?: string | null
          payment_date?: string
          payment_method: string
          payment_reference?: string | null
          payment_type: string
          policy_id: string
          receipt_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          mpesa_transaction_id?: string | null
          payment_date?: string
          payment_method?: string
          payment_reference?: string | null
          payment_type?: string
          policy_id?: string
          receipt_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policies: {
        Row: {
          agent_commission: number | null
          client_id: string
          created_at: string
          end_date: string
          excess_amount: number | null
          id: string
          notes: string | null
          policy_number: string
          policy_type: string
          premium_amount: number
          renewal_date: string | null
          start_date: string
          status: string
          sum_insured: number
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          agent_commission?: number | null
          client_id: string
          created_at?: string
          end_date: string
          excess_amount?: number | null
          id?: string
          notes?: string | null
          policy_number: string
          policy_type: string
          premium_amount: number
          renewal_date?: string | null
          start_date: string
          status?: string
          sum_insured: number
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          agent_commission?: number | null
          client_id?: string
          created_at?: string
          end_date?: string
          excess_amount?: number | null
          id?: string
          notes?: string | null
          policy_number?: string
          policy_type?: string
          premium_amount?: number
          renewal_date?: string | null
          start_date?: string
          status?: string
          sum_insured?: number
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          data_type: string
          description: string | null
          id: string
          is_public: boolean
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          is_public?: boolean
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          is_public?: boolean
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          body_type: string | null
          chassis_number: string | null
          client_id: string
          color: string | null
          created_at: string
          engine_capacity: string | null
          engine_number: string | null
          fuel_type: string | null
          id: string
          make: string
          model: string
          registration_number: string
          seating_capacity: number | null
          status: string
          transmission: string | null
          updated_at: string
          vehicle_value: number
          year: number
        }
        Insert: {
          body_type?: string | null
          chassis_number?: string | null
          client_id: string
          color?: string | null
          created_at?: string
          engine_capacity?: string | null
          engine_number?: string | null
          fuel_type?: string | null
          id?: string
          make: string
          model: string
          registration_number: string
          seating_capacity?: number | null
          status?: string
          transmission?: string | null
          updated_at?: string
          vehicle_value: number
          year: number
        }
        Update: {
          body_type?: string | null
          chassis_number?: string | null
          client_id?: string
          color?: string | null
          created_at?: string
          engine_capacity?: string | null
          engine_number?: string | null
          fuel_type?: string | null
          id?: string
          make?: string
          model?: string
          registration_number?: string
          seating_capacity?: number | null
          status?: string
          transmission?: string | null
          updated_at?: string
          vehicle_value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
