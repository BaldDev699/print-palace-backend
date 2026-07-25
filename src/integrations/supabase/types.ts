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
      manufacturer_portfolio: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_featured: boolean | null
          manufacturer_id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          manufacturer_id: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          manufacturer_id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_portfolio_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          address: string | null
          certifications: string[] | null
          commission_rate: number
          company_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_verified: boolean | null
          lead_time_days: number | null
          minimum_order_quantity: number | null
          specialties: string[] | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          certifications?: string[] | null
          commission_rate?: number
          company_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          specialties?: string[] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          certifications?: string[] | null
          commission_rate?: number
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_verified?: boolean | null
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          specialties?: string[] | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      order_messages: {
        Row: {
          attachments: Json | null
          created_at: string
          id: string
          message: string
          order_id: string
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          base_price_cents: number
          completed_at: string | null
          created_at: string
          currency: string
          customer_id: string
          decline_reason: string | null
          delivery_notes: string | null
          delivery_status: string
          design_coverage_adjustment_cents: number
          design_data: Json
          id: string
          manufacturer_confirmed_at: string | null
          manufacturer_declined_at: string | null
          manufacturer_id: string | null
          manufacturer_notes: string | null
          measurements: Json
          notes: string | null
          paid_at: string | null
          payment_status: string
          platform_fee_cents: number | null
          pricing_breakdown: Json | null
          printing_method: string | null
          printing_surcharge_cents: number
          product_type: string
          quantity: number
          quantity_discount_cents: number
          shipping_address: Json | null
          shipping_cents: number
          shipping_final_cents: number
          status: string
          stripe_session_id: string | null
          subtotal_cents: number
          tax_cents: number
          total_cents: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          base_price_cents?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_id: string
          decline_reason?: string | null
          delivery_notes?: string | null
          delivery_status?: string
          design_coverage_adjustment_cents?: number
          design_data: Json
          id?: string
          manufacturer_confirmed_at?: string | null
          manufacturer_declined_at?: string | null
          manufacturer_id?: string | null
          manufacturer_notes?: string | null
          measurements: Json
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          platform_fee_cents?: number | null
          pricing_breakdown?: Json | null
          printing_method?: string | null
          printing_surcharge_cents?: number
          product_type: string
          quantity?: number
          quantity_discount_cents?: number
          shipping_address?: Json | null
          shipping_cents?: number
          shipping_final_cents?: number
          status?: string
          stripe_session_id?: string | null
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          base_price_cents?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          decline_reason?: string | null
          delivery_notes?: string | null
          delivery_status?: string
          design_coverage_adjustment_cents?: number
          design_data?: Json
          id?: string
          manufacturer_confirmed_at?: string | null
          manufacturer_declined_at?: string | null
          manufacturer_id?: string | null
          manufacturer_notes?: string | null
          measurements?: Json
          notes?: string | null
          paid_at?: string | null
          payment_status?: string
          platform_fee_cents?: number | null
          pricing_breakdown?: Json | null
          printing_method?: string | null
          printing_surcharge_cents?: number
          product_type?: string
          quantity?: number
          quantity_discount_cents?: number
          shipping_address?: Json | null
          shipping_cents?: number
          shipping_final_cents?: number
          status?: string
          stripe_session_id?: string | null
          subtotal_cents?: number
          tax_cents?: number
          total_cents?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          created_at: string
          event_type: string
          id: string
          order_id: string | null
          payload: Json | null
          recipient_email: string | null
          sent: boolean
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          order_id?: string | null
          payload?: Json | null
          recipient_email?: string | null
          sent?: boolean
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          order_id?: string | null
          payload?: Json | null
          recipient_email?: string | null
          sent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      roge_transactions: {
        Row: {
          amount: number
          blockchain_tx_hash: string | null
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          blockchain_tx_hash?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          blockchain_tx_hash?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
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
      user_wallets: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          network: Database["public"]["Enums"]["blockchain_network"]
          updated_at: string
          user_id: string
          wallet_address: string
          wallet_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          network: Database["public"]["Enums"]["blockchain_network"]
          updated_at?: string
          user_id: string
          wallet_address: string
          wallet_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          network?: Database["public"]["Enums"]["blockchain_network"]
          updated_at?: string
          user_id?: string
          wallet_address?: string
          wallet_name?: string | null
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount: number
          blockchain_tx_hash: string | null
          created_at: string
          final_amount: number | null
          id: string
          network: Database["public"]["Enums"]["blockchain_network"]
          network_fee: number | null
          notes: string | null
          processed_at: string | null
          status: Database["public"]["Enums"]["withdrawal_status"] | null
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          blockchain_tx_hash?: string | null
          created_at?: string
          final_amount?: number | null
          id?: string
          network: Database["public"]["Enums"]["blockchain_network"]
          network_fee?: number | null
          notes?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          blockchain_tx_hash?: string | null
          created_at?: string
          final_amount?: number | null
          id?: string
          network?: Database["public"]["Enums"]["blockchain_network"]
          network_fee?: number | null
          notes?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          display_name: string
          email: string
          is_admin: boolean
          is_manufacturer: boolean
          user_id: string
        }[]
      }
      get_pending_withdrawals: { Args: { user_uuid: string }; Returns: number }
      get_public_manufacturers: {
        Args: never
        Returns: {
          certifications: string[]
          company_name: string
          created_at: string
          description: string
          id: string
          is_verified: boolean
          lead_time_days: number
          minimum_order_quantity: number
          specialties: string[]
          updated_at: string
          user_id: string
          website_url: string
        }[]
      }
      get_user_roge_balance: { Args: { user_uuid: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "manufacturer" | "admin"
      blockchain_network: "TRC20" | "ERC20" | "ETH" | "BTC"
      transaction_type: "earned" | "spent" | "withdrawn" | "bonus" | "referral"
      withdrawal_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
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
      app_role: ["customer", "manufacturer", "admin"],
      blockchain_network: ["TRC20", "ERC20", "ETH", "BTC"],
      transaction_type: ["earned", "spent", "withdrawn", "bonus", "referral"],
      withdrawal_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
    },
  },
} as const
