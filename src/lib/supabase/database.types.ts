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
      api_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
        }
        Relationships: []
      }
      app_versions: {
        Row: {
          build_number: number
          id: string
          is_active: boolean | null
          is_force_update: boolean | null
          platform: string | null
          release_notes: string | null
          released_at: string | null
          update_message: string | null
          version: string
        }
        Insert: {
          build_number: number
          id?: string
          is_active?: boolean | null
          is_force_update?: boolean | null
          platform?: string | null
          release_notes?: string | null
          released_at?: string | null
          update_message?: string | null
          version: string
        }
        Update: {
          build_number?: number
          id?: string
          is_active?: boolean | null
          is_force_update?: boolean | null
          platform?: string | null
          release_notes?: string | null
          released_at?: string | null
          update_message?: string | null
          version?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          click_count: number | null
          created_at: string | null
          end_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          link_id: string | null
          link_type: string | null
          link_url: string | null
          position: number | null
          start_date: string | null
          subtitle: string | null
          target_audience: string | null
          title: string | null
          view_count: number | null
          zone_ids: string[] | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link_id?: string | null
          link_type?: string | null
          link_url?: string | null
          position?: number | null
          start_date?: string | null
          subtitle?: string | null
          target_audience?: string | null
          title?: string | null
          view_count?: number | null
          zone_ids?: string[] | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link_id?: string | null
          link_type?: string | null
          link_url?: string | null
          position?: number | null
          start_date?: string | null
          subtitle?: string | null
          target_audience?: string | null
          title?: string | null
          view_count?: number | null
          zone_ids?: string[] | null
        }
        Relationships: []
      }
      cart: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          product_id: string | null
          quantity: number
          seller_id: string | null
          updated_at: string | null
          variant: Json | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          seller_id?: string | null
          updated_at?: string | null
          variant?: Json | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          seller_id?: string | null
          updated_at?: string | null
          variant?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          icon_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          name: string
          parent_id: string | null
          slug: string | null
          sort_order: number | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name: string
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          name?: string
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          sender_id: string | null
          sender_type: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          sender_id?: string | null
          sender_type?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          sender_id?: string | null
          sender_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          customer_id: string | null
          id: string
          last_message_at: string | null
          status: string | null
        }
        Insert: {
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
        }
        Update: {
          customer_id?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          category_ids: string[] | null
          code: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          is_first_order_only: boolean | null
          max_discount: number | null
          min_order_value: number | null
          product_ids: string[] | null
          seller_id: string | null
          usage_limit: number | null
          usage_per_user: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
          zone_ids: string[] | null
        }
        Insert: {
          category_ids?: string[] | null
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          is_first_order_only?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          product_ids?: string[] | null
          seller_id?: string | null
          usage_limit?: number | null
          usage_per_user?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          zone_ids?: string[] | null
        }
        Update: {
          category_ids?: string[] | null
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          is_first_order_only?: boolean | null
          max_discount?: number | null
          min_order_value?: number | null
          product_ids?: string[] | null
          seller_id?: string | null
          usage_limit?: number | null
          usage_per_user?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
          zone_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string | null
          city: string
          country: string | null
          created_at: string | null
          customer_id: string | null
          geo_point: unknown
          id: string
          is_default: boolean | null
          label: string | null
          landmark: string | null
          pincode: string
          recipient_name: string | null
          recipient_phone: string | null
          state: string
          updated_at: string | null
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string | null
          city: string
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          geo_point?: unknown
          id?: string
          is_default?: boolean | null
          label?: string | null
          landmark?: string | null
          pincode: string
          recipient_name?: string | null
          recipient_phone?: string | null
          state: string
          updated_at?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string | null
          city?: string
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          geo_point?: unknown
          id?: string
          is_default?: boolean | null
          label?: string | null
          landmark?: string | null
          pincode?: string
          recipient_name?: string | null
          recipient_phone?: string | null
          state?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_return_stats: {
        Row: {
          abuse_score: number | null
          block_reason: string | null
          customer_id: string
          flag_reason: string | null
          flagged_at: string | null
          flagged_by: string | null
          is_flagged: boolean | null
          is_return_blocked: boolean | null
          last_return_date: string | null
          returns_last_30_days: number | null
          returns_last_90_days: number | null
          total_refunded_amount: number | null
          total_returned_amount: number | null
          total_returns: number | null
          updated_at: string | null
        }
        Insert: {
          abuse_score?: number | null
          block_reason?: string | null
          customer_id: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          is_flagged?: boolean | null
          is_return_blocked?: boolean | null
          last_return_date?: string | null
          returns_last_30_days?: number | null
          returns_last_90_days?: number | null
          total_refunded_amount?: number | null
          total_returned_amount?: number | null
          total_returns?: number | null
          updated_at?: string | null
        }
        Update: {
          abuse_score?: number | null
          block_reason?: string | null
          customer_id?: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          is_flagged?: boolean | null
          is_return_blocked?: boolean | null
          last_return_date?: string | null
          returns_last_30_days?: number | null
          returns_last_90_days?: number | null
          total_refunded_amount?: number | null
          total_returned_amount?: number | null
          total_returns?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_return_stats_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_centers: {
        Row: {
          address: Json | null
          contact_phone: string | null
          created_at: string | null
          geo_point: unknown
          hub_id: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          max_capacity: number | null
          name: string
          owner_id: string | null
          updated_at: string | null
          vehicle_types: string[] | null
        }
        Insert: {
          address?: Json | null
          contact_phone?: string | null
          created_at?: string | null
          geo_point?: unknown
          hub_id?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          max_capacity?: number | null
          name: string
          owner_id?: string | null
          updated_at?: string | null
          vehicle_types?: string[] | null
        }
        Update: {
          address?: Json | null
          contact_phone?: string | null
          created_at?: string | null
          geo_point?: unknown
          hub_id?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          max_capacity?: number | null
          name?: string
          owner_id?: string | null
          updated_at?: string | null
          vehicle_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_centers_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_centers_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_centers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_hubs: {
        Row: {
          active_riders: number | null
          address: string | null
          capacity_orders_per_day: number | null
          city: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          lat: number | null
          lng: number | null
          manager_name: string | null
          manager_phone: string | null
          name: string
          pincode: string | null
          serviceable_zones: string[] | null
          state: string | null
          total_riders: number | null
        }
        Insert: {
          active_riders?: number | null
          address?: string | null
          capacity_orders_per_day?: number | null
          city?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          manager_name?: string | null
          manager_phone?: string | null
          name: string
          pincode?: string | null
          serviceable_zones?: string[] | null
          state?: string | null
          total_riders?: number | null
        }
        Update: {
          active_riders?: number | null
          address?: string | null
          capacity_orders_per_day?: number | null
          city?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          manager_name?: string | null
          manager_phone?: string | null
          name?: string
          pincode?: string | null
          serviceable_zones?: string[] | null
          state?: string | null
          total_riders?: number | null
        }
        Relationships: []
      }
      delivery_partner_attendance: {
        Row: {
          check_in_at: string
          check_in_geo_address: string | null
          check_in_location: unknown
          check_in_selfie_url: string | null
          check_out_at: string | null
          created_at: string | null
          id: string
          partner_id: string | null
          total_deliveries: number | null
          working_hours: number | null
        }
        Insert: {
          check_in_at: string
          check_in_geo_address?: string | null
          check_in_location?: unknown
          check_in_selfie_url?: string | null
          check_out_at?: string | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          total_deliveries?: number | null
          working_hours?: number | null
        }
        Update: {
          check_in_at?: string
          check_in_geo_address?: string | null
          check_in_location?: unknown
          check_in_selfie_url?: string | null
          check_out_at?: string | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          total_deliveries?: number | null
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partner_attendance_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_partners: {
        Row: {
          aadhar_number: string | null
          aadhar_url: string | null
          approved_at: string | null
          avatar_url: string | null
          bank_details: Json | null
          cash_collected: number | null
          cash_deposited: number | null
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          current_location: unknown
          delivery_center_id: string | null
          driving_license: string | null
          driving_license_url: string | null
          earnings: number | null
          email: string | null
          full_name: string | null
          hub_id: string | null
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          is_available: boolean | null
          is_online: boolean | null
          is_rejected: boolean | null
          is_verified: boolean | null
          joining_date: string | null
          last_active_at: string | null
          last_location_update: string | null
          license_number: string | null
          pan_number: string | null
          pan_url: string | null
          partner_id: string | null
          phone: string | null
          photo_url: string | null
          rating: number | null
          rejected_at: string | null
          status: string | null
          total_deliveries: number | null
          total_reverse_pickups: number | null
          updated_at: string | null
          user_id: string | null
          vehicle_model: string | null
          vehicle_number: string | null
          vehicle_type: string | null
          wallet_balance: number | null
          zone_ids: string[] | null
        }
        Insert: {
          aadhar_number?: string | null
          aadhar_url?: string | null
          approved_at?: string | null
          avatar_url?: string | null
          bank_details?: Json | null
          cash_collected?: number | null
          cash_deposited?: number | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          current_location?: unknown
          delivery_center_id?: string | null
          driving_license?: string | null
          driving_license_url?: string | null
          earnings?: number | null
          email?: string | null
          full_name?: string | null
          hub_id?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_available?: boolean | null
          is_online?: boolean | null
          is_rejected?: boolean | null
          is_verified?: boolean | null
          joining_date?: string | null
          last_active_at?: string | null
          last_location_update?: string | null
          license_number?: string | null
          pan_number?: string | null
          pan_url?: string | null
          partner_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          rejected_at?: string | null
          status?: string | null
          total_deliveries?: number | null
          total_reverse_pickups?: number | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_model?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
          wallet_balance?: number | null
          zone_ids?: string[] | null
        }
        Update: {
          aadhar_number?: string | null
          aadhar_url?: string | null
          approved_at?: string | null
          avatar_url?: string | null
          bank_details?: Json | null
          cash_collected?: number | null
          cash_deposited?: number | null
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          current_location?: unknown
          delivery_center_id?: string | null
          driving_license?: string | null
          driving_license_url?: string | null
          earnings?: number | null
          email?: string | null
          full_name?: string | null
          hub_id?: string | null
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          is_available?: boolean | null
          is_online?: boolean | null
          is_rejected?: boolean | null
          is_verified?: boolean | null
          joining_date?: string | null
          last_active_at?: string | null
          last_location_update?: string | null
          license_number?: string | null
          pan_number?: string | null
          pan_url?: string | null
          partner_id?: string | null
          phone?: string | null
          photo_url?: string | null
          rating?: number | null
          rejected_at?: string | null
          status?: string | null
          total_deliveries?: number | null
          total_reverse_pickups?: number | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_model?: string | null
          vehicle_number?: string | null
          vehicle_type?: string | null
          wallet_balance?: number | null
          zone_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_partners_delivery_center_id_fkey"
            columns: ["delivery_center_id"]
            isOneToOne: false
            referencedRelation: "delivery_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_partners_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "delivery_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          created_at: string | null
          css_styles: string | null
          html_template: string
          id: string
          is_active: boolean | null
          name: string
          role: string | null
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          css_styles?: string | null
          html_template: string
          id?: string
          is_active?: boolean | null
          name: string
          role?: string | null
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          css_styles?: string | null
          html_template?: string
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string | null
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      fcm_tokens: {
        Row: {
          created_at: string | null
          device_id: string | null
          device_type: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          device_type?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fcm_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      field_agent_activities: {
        Row: {
          activity_type: string | null
          agent_id: string | null
          commission_amount: number
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          status: string | null
        }
        Insert: {
          activity_type?: string | null
          agent_id?: string | null
          commission_amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
        }
        Update: {
          activity_type?: string | null
          agent_id?: string | null
          commission_amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_agent_activities_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "field_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      field_agents: {
        Row: {
          agent_id: string | null
          assigned_zone_ids: string[] | null
          commission_per_customer: number | null
          commission_per_seller: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          joined_at: string | null
          pending_payout: number | null
          target_per_month: number | null
          total_earned: number | null
          total_withdrawn: number | null
          updated_at: string | null
        }
        Insert: {
          agent_id?: string | null
          assigned_zone_ids?: string[] | null
          commission_per_customer?: number | null
          commission_per_seller?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          pending_payout?: number | null
          target_per_month?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string | null
          assigned_zone_ids?: string[] | null
          commission_per_customer?: number | null
          commission_per_seller?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          pending_payout?: number | null
          target_per_month?: number | null
          total_earned?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_vehicles: {
        Row: {
          assigned_partner_id: string | null
          created_at: string | null
          fitness_expiry: string | null
          id: string
          insurance_expiry: string | null
          insurance_number: string | null
          insurance_url: string | null
          metadata: Json | null
          owner_id: string | null
          owner_type: string | null
          permit_expiry: string | null
          rc_number: string | null
          rc_url: string | null
          status: string | null
          updated_at: string | null
          vehicle_number: string
          vehicle_type: string
        }
        Insert: {
          assigned_partner_id?: string | null
          created_at?: string | null
          fitness_expiry?: string | null
          id?: string
          insurance_expiry?: string | null
          insurance_number?: string | null
          insurance_url?: string | null
          metadata?: Json | null
          owner_id?: string | null
          owner_type?: string | null
          permit_expiry?: string | null
          rc_number?: string | null
          rc_url?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_number: string
          vehicle_type: string
        }
        Update: {
          assigned_partner_id?: string | null
          created_at?: string | null
          fitness_expiry?: string | null
          id?: string
          insurance_expiry?: string | null
          insurance_number?: string | null
          insurance_url?: string | null
          metadata?: Json | null
          owner_id?: string | null
          owner_type?: string | null
          permit_expiry?: string | null
          rc_number?: string | null
          rc_url?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_number?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_vehicles_assigned_partner_id_fkey"
            columns: ["assigned_partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      franchisees: {
        Row: {
          commission_rate: number | null
          email: string | null
          full_name: string
          hub_id: string | null
          id: string
          investment_amount: number | null
          joined_at: string | null
          phone: string | null
          status: string | null
          total_earnings: number | null
          user_id: string | null
        }
        Insert: {
          commission_rate?: number | null
          email?: string | null
          full_name: string
          hub_id?: string | null
          id?: string
          investment_amount?: number | null
          joined_at?: string | null
          phone?: string | null
          status?: string | null
          total_earnings?: number | null
          user_id?: string | null
        }
        Update: {
          commission_rate?: number | null
          email?: string | null
          full_name?: string
          hub_id?: string | null
          id?: string
          investment_amount?: number | null
          joined_at?: string | null
          phone?: string | null
          status?: string | null
          total_earnings?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "franchisees_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "delivery_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_performance: {
        Row: {
          avg_delivery_time: number | null
          date: string | null
          hub_id: string | null
          id: string
          orders_today: number | null
          revenue_today: number | null
          success_rate: number | null
        }
        Insert: {
          avg_delivery_time?: number | null
          date?: string | null
          hub_id?: string | null
          id?: string
          orders_today?: number | null
          revenue_today?: number | null
          success_rate?: number | null
        }
        Update: {
          avg_delivery_time?: number | null
          date?: string | null
          hub_id?: string | null
          id?: string
          orders_today?: number | null
          revenue_today?: number | null
          success_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_performance_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "delivery_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hubs: {
        Row: {
          address: Json
          capacity: number | null
          code: string | null
          contact_phone: string | null
          created_at: string | null
          franchise_id: string | null
          geo_point: unknown
          id: string
          is_active: boolean | null
          manager_id: string | null
          metadata: Json | null
          name: string
          owner_id: string | null
          updated_at: string | null
          zone_ids: string[] | null
        }
        Insert: {
          address: Json
          capacity?: number | null
          code?: string | null
          contact_phone?: string | null
          created_at?: string | null
          franchise_id?: string | null
          geo_point?: unknown
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          metadata?: Json | null
          name: string
          owner_id?: string | null
          updated_at?: string | null
          zone_ids?: string[] | null
        }
        Update: {
          address?: Json
          capacity?: number | null
          code?: string | null
          contact_phone?: string | null
          created_at?: string | null
          franchise_id?: string | null
          geo_point?: unknown
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          updated_at?: string | null
          zone_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "hubs_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubs_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hubs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          aadhaar_back_url: string | null
          aadhaar_front_url: string | null
          bank_statement_url: string | null
          gst_certificate_url: string | null
          id: string
          pan_card_url: string | null
          seller_id: string | null
          uploaded_at: string | null
        }
        Insert: {
          aadhaar_back_url?: string | null
          aadhaar_front_url?: string | null
          bank_statement_url?: string | null
          gst_certificate_url?: string | null
          id?: string
          pan_card_url?: string | null
          seller_id?: string | null
          uploaded_at?: string | null
        }
        Update: {
          aadhaar_back_url?: string | null
          aadhaar_front_url?: string | null
          bank_statement_url?: string | null
          gst_certificate_url?: string | null
          id?: string
          pan_card_url?: string | null
          seller_id?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_documents_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_kyc"
            referencedColumns: ["seller_id"]
          },
        ]
      }
      login_history: {
        Row: {
          created_at: string | null
          device_info: Json | null
          email: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          location: Json | null
          login_method: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          email: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location?: Json | null
          login_method?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          email?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          location?: Json | null
          login_method?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          image_url: string | null
          is_read: boolean | null
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          id: string
          order_id: string | null
          product_id: string | null
          product_snapshot: Json
          quantity: number
          refunded_amount: number | null
          returned_quantity: number | null
          tax_amount: number | null
          total_price: number
          unit_price: number
          variant: Json | null
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_snapshot: Json
          quantity: number
          refunded_amount?: number | null
          returned_quantity?: number | null
          tax_amount?: number | null
          total_price: number
          unit_price: number
          variant?: Json | null
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_snapshot?: Json
          quantity?: number
          refunded_amount?: number | null
          returned_quantity?: number | null
          tax_amount?: number | null
          total_price?: number
          unit_price?: number
          variant?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_timeline: {
        Row: {
          actor_id: string | null
          actor_type: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          message: string | null
          order_id: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          message?: string | null
          order_id?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          message?: string | null
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_timeline_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          coupon_discount: number | null
          created_at: string | null
          customer_id: string | null
          customer_notes: string | null
          delivered_at: string | null
          delivery_center_id: string | null
          delivery_charge: number | null
          delivery_commission: number | null
          delivery_partner_id: string | null
          delivery_share: number | null
          discount_amount: number | null
          expected_delivery: string | null
          field_agent_id: string | null
          franchise_share: number | null
          hub_id: string | null
          hub_share: number | null
          id: string
          metadata: Json | null
          order_number: string
          out_for_delivery_at: string | null
          packaging_charge: number | null
          packed_at: string | null
          paid_amount: number | null
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          picked_up_at: string | null
          platform_commission: number | null
          referral_code_used: string | null
          seller_earning: number | null
          seller_id: string | null
          seller_notes: string | null
          shipping_address: Json
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          tracking_history: Json | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          billing_address?: Json | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_center_id?: string | null
          delivery_charge?: number | null
          delivery_commission?: number | null
          delivery_partner_id?: string | null
          delivery_share?: number | null
          discount_amount?: number | null
          expected_delivery?: string | null
          field_agent_id?: string | null
          franchise_share?: number | null
          hub_id?: string | null
          hub_share?: number | null
          id?: string
          metadata?: Json | null
          order_number: string
          out_for_delivery_at?: string | null
          packaging_charge?: number | null
          packed_at?: string | null
          paid_amount?: number | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          platform_commission?: number | null
          referral_code_used?: string | null
          seller_earning?: number | null
          seller_id?: string | null
          seller_notes?: string | null
          shipping_address: Json
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount: number
          tracking_history?: Json | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          billing_address?: Json | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          customer_id?: string | null
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_center_id?: string | null
          delivery_charge?: number | null
          delivery_commission?: number | null
          delivery_partner_id?: string | null
          delivery_share?: number | null
          discount_amount?: number | null
          expected_delivery?: string | null
          field_agent_id?: string | null
          franchise_share?: number | null
          hub_id?: string | null
          hub_share?: number | null
          id?: string
          metadata?: Json | null
          order_number?: string
          out_for_delivery_at?: string | null
          packaging_charge?: number | null
          packed_at?: string | null
          paid_amount?: number | null
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          platform_commission?: number | null
          referral_code_used?: string | null
          seller_earning?: number | null
          seller_id?: string | null
          seller_notes?: string | null
          shipping_address?: Json
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_history?: Json | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_center_id_fkey"
            columns: ["delivery_center_id"]
            isOneToOne: false
            referencedRelation: "delivery_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_partner_id_fkey"
            columns: ["delivery_partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_field_agent_id_fkey"
            columns: ["field_agent_id"]
            isOneToOne: false
            referencedRelation: "field_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_amount: number | null
          status: string | null
          verified_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_amount?: number | null
          status?: string | null
          verified_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_amount?: number | null
          status?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          completed_at: string | null
          created_at: string | null
          gross_amount: number
          id: string
          net_amount: number
          orders_count: number | null
          platform_commission: number | null
          recipient_id: string
          recipient_type: string | null
          reference_id: string | null
          status: string | null
          tds_amount: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          orders_count?: number | null
          platform_commission?: number | null
          recipient_id: string
          recipient_type?: string | null
          reference_id?: string | null
          status?: string | null
          tds_amount?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          orders_count?: number | null
          platform_commission?: number | null
          recipient_id?: string
          recipient_type?: string | null
          reference_id?: string | null
          status?: string | null
          tds_amount?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          dimensions: Json | null
          discount_percent: number | null
          featured_order: number | null
          hsn_code: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_approved: boolean | null
          is_featured: boolean | null
          metadata: Json | null
          min_stock: number | null
          mrp: number
          name: string
          rating: number | null
          search_vector: unknown
          seller_id: string | null
          selling_price: number
          short_description: string | null
          sku: string | null
          slug: string | null
          stock: number | null
          tags: string[] | null
          tax_rate: number | null
          total_reviews: number | null
          total_sold: number | null
          updated_at: string | null
          variant_attributes: Json | null
          variant_combinations: Json | null
          variant_stock: Json | null
          variants: Json | null
          weight_kg: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          discount_percent?: number | null
          featured_order?: number | null
          hsn_code?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          min_stock?: number | null
          mrp: number
          name: string
          rating?: number | null
          search_vector?: unknown
          seller_id?: string | null
          selling_price: number
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          stock?: number | null
          tags?: string[] | null
          tax_rate?: number | null
          total_reviews?: number | null
          total_sold?: number | null
          updated_at?: string | null
          variant_attributes?: Json | null
          variant_combinations?: Json | null
          variant_stock?: Json | null
          variants?: Json | null
          weight_kg?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          dimensions?: Json | null
          discount_percent?: number | null
          featured_order?: number | null
          hsn_code?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          metadata?: Json | null
          min_stock?: number | null
          mrp?: number
          name?: string
          rating?: number | null
          search_vector?: unknown
          seller_id?: string | null
          selling_price?: number
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          stock?: number | null
          tags?: string[] | null
          tax_rate?: number | null
          total_reviews?: number | null
          total_sold?: number | null
          updated_at?: string | null
          variant_attributes?: Json | null
          variant_combinations?: Json | null
          variant_stock?: Json | null
          variants?: Json | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_locked_until: string | null
          address: Json | null
          auth_provider: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          dob: string | null
          email: string | null
          failed_login_attempts: number | null
          fcm_token: string | null
          full_name: string
          gender: string | null
          id: string
          id_card_url: string | null
          joining_letter_url: string | null
          kyc_status: string | null
          last_login_at: string | null
          last_password_change: string | null
          metadata: Json | null
          parent_id: string | null
          phone: string
          referral_code: string | null
          referred_by: string | null
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          account_locked_until?: string | null
          address?: Json | null
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dob?: string | null
          email?: string | null
          failed_login_attempts?: number | null
          fcm_token?: string | null
          full_name: string
          gender?: string | null
          id: string
          id_card_url?: string | null
          joining_letter_url?: string | null
          kyc_status?: string | null
          last_login_at?: string | null
          last_password_change?: string | null
          metadata?: Json | null
          parent_id?: string | null
          phone: string
          referral_code?: string | null
          referred_by?: string | null
          role: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_locked_until?: string | null
          address?: Json | null
          auth_provider?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          dob?: string | null
          email?: string | null
          failed_login_attempts?: number | null
          fcm_token?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          id_card_url?: string | null
          joining_letter_url?: string | null
          kyc_status?: string | null
          last_login_at?: string | null
          last_password_change?: string | null
          metadata?: Json | null
          parent_id?: string | null
          phone?: string
          referral_code?: string | null
          referred_by?: string | null
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      quality_checks: {
        Row: {
          accessories_complete: boolean | null
          approved_refund_amount: number | null
          checklist: Json | null
          completed_at: string | null
          created_at: string | null
          deduction_amount: number | null
          deduction_reason: string | null
          hub_id: string | null
          id: string
          inspected_by: string | null
          inspection_images: string[] | null
          inspection_notes: string | null
          inspection_status: string | null
          inspection_video_url: string | null
          is_authentic: boolean | null
          packaging_condition: string | null
          product_condition: string | null
          qc_decision: string | null
          qc_number: string
          resolution_action: string | null
          resolution_notes: string | null
          restock_decision: string | null
          restocked_quantity: number | null
          return_request_id: string | null
          reverse_pickup_id: string | null
          serial_number_match: boolean | null
          started_at: string | null
          tags_attached: boolean | null
          updated_at: string | null
        }
        Insert: {
          accessories_complete?: boolean | null
          approved_refund_amount?: number | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          deduction_amount?: number | null
          deduction_reason?: string | null
          hub_id?: string | null
          id?: string
          inspected_by?: string | null
          inspection_images?: string[] | null
          inspection_notes?: string | null
          inspection_status?: string | null
          inspection_video_url?: string | null
          is_authentic?: boolean | null
          packaging_condition?: string | null
          product_condition?: string | null
          qc_decision?: string | null
          qc_number: string
          resolution_action?: string | null
          resolution_notes?: string | null
          restock_decision?: string | null
          restocked_quantity?: number | null
          return_request_id?: string | null
          reverse_pickup_id?: string | null
          serial_number_match?: boolean | null
          started_at?: string | null
          tags_attached?: boolean | null
          updated_at?: string | null
        }
        Update: {
          accessories_complete?: boolean | null
          approved_refund_amount?: number | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          deduction_amount?: number | null
          deduction_reason?: string | null
          hub_id?: string | null
          id?: string
          inspected_by?: string | null
          inspection_images?: string[] | null
          inspection_notes?: string | null
          inspection_status?: string | null
          inspection_video_url?: string | null
          is_authentic?: boolean | null
          packaging_condition?: string | null
          product_condition?: string | null
          qc_decision?: string | null
          qc_number?: string
          resolution_action?: string | null
          resolution_notes?: string | null
          restock_decision?: string | null
          restocked_quantity?: number | null
          return_request_id?: string | null
          reverse_pickup_id?: string | null
          serial_number_match?: boolean | null
          started_at?: string | null
          tags_attached?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quality_checks_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_inspected_by_fkey"
            columns: ["inspected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_reverse_pickup_id_fkey"
            columns: ["reverse_pickup_id"]
            isOneToOne: false
            referencedRelation: "reverse_pickups"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_transactions: {
        Row: {
          amount: number
          bank_details: Json | null
          completed_at: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          failure_reason: string | null
          gateway_refund_id: string | null
          gateway_response: Json | null
          id: string
          initiated_at: string | null
          is_auto_refund: boolean | null
          is_partial: boolean | null
          notes: string | null
          order_id: string | null
          payment_gateway: string | null
          payment_id: string | null
          processed_at: string | null
          processed_by: string | null
          refund_method: string
          refund_number: string
          retry_count: number | null
          return_request_id: string | null
          status: string | null
          upi_id: string | null
          wallet_transaction_id: string | null
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          failure_reason?: string | null
          gateway_refund_id?: string | null
          gateway_response?: Json | null
          id?: string
          initiated_at?: string | null
          is_auto_refund?: boolean | null
          is_partial?: boolean | null
          notes?: string | null
          order_id?: string | null
          payment_gateway?: string | null
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          refund_method: string
          refund_number: string
          retry_count?: number | null
          return_request_id?: string | null
          status?: string | null
          upi_id?: string | null
          wallet_transaction_id?: string | null
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          failure_reason?: string | null
          gateway_refund_id?: string | null
          gateway_response?: Json | null
          id?: string
          initiated_at?: string | null
          is_auto_refund?: boolean | null
          is_partial?: boolean | null
          notes?: string | null
          order_id?: string | null
          payment_gateway?: string | null
          payment_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          refund_method?: string
          refund_number?: string
          retry_count?: number | null
          return_request_id?: string | null
          status?: string | null
          upi_id?: string | null
          wallet_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_transactions_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_transactions_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_transactions_wallet_transaction_id_fkey"
            columns: ["wallet_transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      restock_items: {
        Row: {
          added_by: string | null
          condition: string | null
          created_at: string | null
          hub_id: string | null
          id: string
          notes: string | null
          product_id: string | null
          quality_check_id: string | null
          quantity: number
          restock_status: string | null
          restocked_at: string | null
          return_request_id: string | null
          seller_id: string | null
        }
        Insert: {
          added_by?: string | null
          condition?: string | null
          created_at?: string | null
          hub_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quality_check_id?: string | null
          quantity: number
          restock_status?: string | null
          restocked_at?: string | null
          return_request_id?: string | null
          seller_id?: string | null
        }
        Update: {
          added_by?: string | null
          condition?: string | null
          created_at?: string | null
          hub_id?: string | null
          id?: string
          notes?: string | null
          product_id?: string | null
          quality_check_id?: string | null
          quantity?: number
          restock_status?: string | null
          restocked_at?: string | null
          return_request_id?: string | null
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restock_items_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_items_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_items_quality_check_id_fkey"
            columns: ["quality_check_id"]
            isOneToOne: false
            referencedRelation: "quality_checks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_items_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      return_disputes: {
        Row: {
          created_at: string | null
          description: string
          dispute_type: string | null
          evidence_images: string[] | null
          evidence_video_url: string | null
          id: string
          raised_by: string | null
          raised_by_role: string | null
          resolution: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          return_request_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          dispute_type?: string | null
          evidence_images?: string[] | null
          evidence_video_url?: string | null
          id?: string
          raised_by?: string | null
          raised_by_role?: string | null
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          return_request_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          dispute_type?: string | null
          evidence_images?: string[] | null
          evidence_video_url?: string | null
          id?: string
          raised_by?: string | null
          raised_by_role?: string | null
          resolution?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          return_request_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_disputes_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_disputes_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      return_policies: {
        Row: {
          auto_approval_enabled: boolean | null
          auto_approval_max_value: number | null
          category_id: string | null
          conditions: string | null
          created_at: string | null
          description: string | null
          free_reverse_pickup: boolean | null
          id: string
          is_active: boolean | null
          is_exchange_allowed: boolean | null
          is_partial_return_allowed: boolean | null
          is_replacement_allowed: boolean | null
          is_returnable: boolean | null
          name: string
          priority: number | null
          product_id: string | null
          refund_method_priority: string[] | null
          return_window_days: number | null
          reverse_pickup_charge: number | null
          seller_id: string | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          auto_approval_enabled?: boolean | null
          auto_approval_max_value?: number | null
          category_id?: string | null
          conditions?: string | null
          created_at?: string | null
          description?: string | null
          free_reverse_pickup?: boolean | null
          id?: string
          is_active?: boolean | null
          is_exchange_allowed?: boolean | null
          is_partial_return_allowed?: boolean | null
          is_replacement_allowed?: boolean | null
          is_returnable?: boolean | null
          name: string
          priority?: number | null
          product_id?: string | null
          refund_method_priority?: string[] | null
          return_window_days?: number | null
          reverse_pickup_charge?: number | null
          seller_id?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          auto_approval_enabled?: boolean | null
          auto_approval_max_value?: number | null
          category_id?: string | null
          conditions?: string | null
          created_at?: string | null
          description?: string | null
          free_reverse_pickup?: boolean | null
          id?: string
          is_active?: boolean | null
          is_exchange_allowed?: boolean | null
          is_partial_return_allowed?: boolean | null
          is_replacement_allowed?: boolean | null
          is_returnable?: boolean | null
          name?: string
          priority?: number | null
          product_id?: string | null
          refund_method_priority?: string[] | null
          return_window_days?: number | null
          reverse_pickup_charge?: number | null
          seller_id?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_policies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_policies_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_policies_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_policies_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      return_reasons: {
        Row: {
          auto_qc_required: boolean | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          reason_text: string
          requires_images: boolean | null
          requires_video: boolean | null
        }
        Insert: {
          auto_qc_required?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          reason_text: string
          requires_images?: boolean | null
          requires_video?: boolean | null
        }
        Update: {
          auto_qc_required?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          reason_text?: string
          requires_images?: boolean | null
          requires_video?: boolean | null
        }
        Relationships: []
      }
      return_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          auto_approved: boolean | null
          created_at: string | null
          customer_id: string
          customer_images: string[] | null
          customer_notes: string | null
          customer_video_url: string | null
          exchange_product_id: string | null
          exchange_variant: Json | null
          expected_resolution_date: string | null
          id: string
          internal_notes: string | null
          is_sla_breached: boolean | null
          item_snapshot: Json
          new_order_id: string | null
          order_id: string
          order_item_id: string
          pickup_address: Json | null
          price_difference: number | null
          quantity_returning: number
          reason_category: string
          reason_description: string | null
          refund_amount: number | null
          refund_completed_at: string | null
          refund_initiated_at: string | null
          refund_method: string | null
          refund_status: string | null
          refund_transaction_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          replacement_product_id: string | null
          replacement_variant: Json | null
          requested_at: string | null
          resolved_at: string | null
          return_number: string
          return_type: string
          reverse_pickup_id: string | null
          reverse_pickup_required: boolean | null
          seller_id: string
          sla_deadline: string | null
          status: string | null
          tracking_history: Json | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          auto_approved?: boolean | null
          created_at?: string | null
          customer_id: string
          customer_images?: string[] | null
          customer_notes?: string | null
          customer_video_url?: string | null
          exchange_product_id?: string | null
          exchange_variant?: Json | null
          expected_resolution_date?: string | null
          id?: string
          internal_notes?: string | null
          is_sla_breached?: boolean | null
          item_snapshot: Json
          new_order_id?: string | null
          order_id: string
          order_item_id: string
          pickup_address?: Json | null
          price_difference?: number | null
          quantity_returning?: number
          reason_category: string
          reason_description?: string | null
          refund_amount?: number | null
          refund_completed_at?: string | null
          refund_initiated_at?: string | null
          refund_method?: string | null
          refund_status?: string | null
          refund_transaction_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          replacement_product_id?: string | null
          replacement_variant?: Json | null
          requested_at?: string | null
          resolved_at?: string | null
          return_number: string
          return_type: string
          reverse_pickup_id?: string | null
          reverse_pickup_required?: boolean | null
          seller_id: string
          sla_deadline?: string | null
          status?: string | null
          tracking_history?: Json | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          auto_approved?: boolean | null
          created_at?: string | null
          customer_id?: string
          customer_images?: string[] | null
          customer_notes?: string | null
          customer_video_url?: string | null
          exchange_product_id?: string | null
          exchange_variant?: Json | null
          expected_resolution_date?: string | null
          id?: string
          internal_notes?: string | null
          is_sla_breached?: boolean | null
          item_snapshot?: Json
          new_order_id?: string | null
          order_id?: string
          order_item_id?: string
          pickup_address?: Json | null
          price_difference?: number | null
          quantity_returning?: number
          reason_category?: string
          reason_description?: string | null
          refund_amount?: number | null
          refund_completed_at?: string | null
          refund_initiated_at?: string | null
          refund_method?: string | null
          refund_status?: string | null
          refund_transaction_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          replacement_product_id?: string | null
          replacement_variant?: Json | null
          requested_at?: string | null
          resolved_at?: string | null
          return_number?: string
          return_type?: string
          reverse_pickup_id?: string | null
          reverse_pickup_required?: boolean | null
          seller_id?: string
          sla_deadline?: string | null
          status?: string | null
          tracking_history?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_exchange_product_id_fkey"
            columns: ["exchange_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_new_order_id_fkey"
            columns: ["new_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_replacement_product_id_fkey"
            columns: ["replacement_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_requests_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      return_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "return_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      return_shipping: {
        Row: {
          awb_number: string | null
          carrier: string | null
          carrier_service: string | null
          created_at: string | null
          delivered_at: string | null
          estimated_delivery: string | null
          estimated_pickup: string | null
          id: string
          is_customer_paid: boolean | null
          metadata: Json | null
          return_request_id: string | null
          reverse_pickup_id: string | null
          shipping_charge: number | null
          shipping_label_url: string | null
          tracking_number: string | null
        }
        Insert: {
          awb_number?: string | null
          carrier?: string | null
          carrier_service?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          estimated_pickup?: string | null
          id?: string
          is_customer_paid?: boolean | null
          metadata?: Json | null
          return_request_id?: string | null
          reverse_pickup_id?: string | null
          shipping_charge?: number | null
          shipping_label_url?: string | null
          tracking_number?: string | null
        }
        Update: {
          awb_number?: string | null
          carrier?: string | null
          carrier_service?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          estimated_pickup?: string | null
          id?: string
          is_customer_paid?: boolean | null
          metadata?: Json | null
          return_request_id?: string | null
          reverse_pickup_id?: string | null
          shipping_charge?: number | null
          shipping_label_url?: string | null
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_shipping_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_shipping_reverse_pickup_id_fkey"
            columns: ["reverse_pickup_id"]
            isOneToOne: false
            referencedRelation: "reverse_pickups"
            referencedColumns: ["id"]
          },
        ]
      }
      return_status_history: {
        Row: {
          changed_by: string | null
          changed_by_role: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          new_status: string
          notes: string | null
          old_status: string | null
          return_request_id: string | null
        }
        Insert: {
          changed_by?: string | null
          changed_by_role?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status: string
          notes?: string | null
          old_status?: string | null
          return_request_id?: string | null
        }
        Update: {
          changed_by?: string | null
          changed_by_role?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_status?: string
          notes?: string | null
          old_status?: string | null
          return_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_status_history_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reverse_pickups: {
        Row: {
          assigned_at: string | null
          assigned_partner_id: string | null
          created_at: string | null
          customer_id: string | null
          customer_otp: string | null
          delivered_to_hub_at: string | null
          delivery_center_id: string | null
          distance_km: number | null
          expected_weight_kg: number | null
          failure_reason: string | null
          failure_type: string | null
          hub_id: string | null
          id: string
          items: Json
          max_attempts: number | null
          order_id: string | null
          otp_verified: boolean | null
          partner_payout: number | null
          picked_up_at: string | null
          pickup_address: Json
          pickup_geo_point: unknown
          pickup_images: string[] | null
          pickup_notes: string | null
          pickup_number: string
          pickup_pincode: string
          pickup_signature: string | null
          pickup_slot_date: string | null
          pickup_slot_end_time: string | null
          pickup_slot_start_time: string | null
          reschedule_count: number | null
          return_request_id: string | null
          scheduled_at: string | null
          seller_id: string | null
          status: string | null
          total_items: number | null
          tracking_history: Json | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_partner_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_otp?: string | null
          delivered_to_hub_at?: string | null
          delivery_center_id?: string | null
          distance_km?: number | null
          expected_weight_kg?: number | null
          failure_reason?: string | null
          failure_type?: string | null
          hub_id?: string | null
          id?: string
          items: Json
          max_attempts?: number | null
          order_id?: string | null
          otp_verified?: boolean | null
          partner_payout?: number | null
          picked_up_at?: string | null
          pickup_address: Json
          pickup_geo_point?: unknown
          pickup_images?: string[] | null
          pickup_notes?: string | null
          pickup_number: string
          pickup_pincode: string
          pickup_signature?: string | null
          pickup_slot_date?: string | null
          pickup_slot_end_time?: string | null
          pickup_slot_start_time?: string | null
          reschedule_count?: number | null
          return_request_id?: string | null
          scheduled_at?: string | null
          seller_id?: string | null
          status?: string | null
          total_items?: number | null
          tracking_history?: Json | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_partner_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_otp?: string | null
          delivered_to_hub_at?: string | null
          delivery_center_id?: string | null
          distance_km?: number | null
          expected_weight_kg?: number | null
          failure_reason?: string | null
          failure_type?: string | null
          hub_id?: string | null
          id?: string
          items?: Json
          max_attempts?: number | null
          order_id?: string | null
          otp_verified?: boolean | null
          partner_payout?: number | null
          picked_up_at?: string | null
          pickup_address?: Json
          pickup_geo_point?: unknown
          pickup_images?: string[] | null
          pickup_notes?: string | null
          pickup_number?: string
          pickup_pincode?: string
          pickup_signature?: string | null
          pickup_slot_date?: string | null
          pickup_slot_end_time?: string | null
          pickup_slot_start_time?: string | null
          reschedule_count?: number | null
          return_request_id?: string | null
          scheduled_at?: string | null
          seller_id?: string | null
          status?: string | null
          total_items?: number | null
          tracking_history?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reverse_pickups_assigned_partner_id_fkey"
            columns: ["assigned_partner_id"]
            isOneToOne: false
            referencedRelation: "delivery_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reverse_pickups_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reverse_pickups_delivery_center_id_fkey"
            columns: ["delivery_center_id"]
            isOneToOne: false
            referencedRelation: "delivery_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reverse_pickups_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reverse_pickups_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reverse_pickups_return_request_id_fkey"
            columns: ["return_request_id"]
            isOneToOne: false
            referencedRelation: "return_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reverse_pickups_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          customer_id: string | null
          helpful_count: number | null
          id: string
          images: string[] | null
          is_approved: boolean | null
          is_verified: boolean | null
          order_id: string | null
          product_id: string | null
          rating: number
          review_text: string | null
          seller_response: string | null
          seller_response_at: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating: number
          review_text?: string | null
          seller_response?: string | null
          seller_response_at?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_approved?: boolean | null
          is_verified?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating?: number
          review_text?: string | null
          seller_response?: string | null
          seller_response_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          name: string
          permissions: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          permissions?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          permissions?: string[] | null
        }
        Relationships: []
      }
      seller_kyc: {
        Row: {
          aadhar_back_url: string | null
          aadhar_front_url: string | null
          account_holder: string | null
          account_type: string | null
          address_line1: string | null
          address_line2: string | null
          branch: string | null
          business_type: string | null
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          employees: string | null
          fssai_number: string | null
          id: string
          landmark: string | null
          latitude: number | null
          longitude: number | null
          monthly_revenue: string | null
          owner_photo_url: string | null
          payment_method: string | null
          pincode: string | null
          plan_selected: string | null
          seller_id: string | null
          state: string | null
          status: string | null
          storefront_photo_url: string | null
          updated_at: string | null
          years_in_business: string | null
        }
        Insert: {
          aadhar_back_url?: string | null
          aadhar_front_url?: string | null
          account_holder?: string | null
          account_type?: string | null
          address_line1?: string | null
          address_line2?: string | null
          branch?: string | null
          business_type?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          employees?: string | null
          fssai_number?: string | null
          id?: string
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_revenue?: string | null
          owner_photo_url?: string | null
          payment_method?: string | null
          pincode?: string | null
          plan_selected?: string | null
          seller_id?: string | null
          state?: string | null
          status?: string | null
          storefront_photo_url?: string | null
          updated_at?: string | null
          years_in_business?: string | null
        }
        Update: {
          aadhar_back_url?: string | null
          aadhar_front_url?: string | null
          account_holder?: string | null
          account_type?: string | null
          address_line1?: string | null
          address_line2?: string | null
          branch?: string | null
          business_type?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          employees?: string | null
          fssai_number?: string | null
          id?: string
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          monthly_revenue?: string | null
          owner_photo_url?: string | null
          payment_method?: string | null
          pincode?: string | null
          plan_selected?: string | null
          seller_id?: string | null
          state?: string | null
          status?: string | null
          storefront_photo_url?: string | null
          updated_at?: string | null
          years_in_business?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_kyc_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          bank_details: Json | null
          banner_url: string | null
          business_name: string
          business_type: string | null
          category: string[] | null
          commission_rate: number | null
          created_at: string | null
          description: string | null
          documents: Json | null
          fssai_number: string | null
          gst_number: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          metadata: Json | null
          owner_id: string | null
          pan_number: string | null
          pickup_address: Json | null
          pickup_geo_point: unknown
          rating: number | null
          subscription_amount: number | null
          subscription_expiry: string | null
          subscription_start: string | null
          total_orders: number | null
          total_products: number | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          bank_details?: Json | null
          banner_url?: string | null
          business_name: string
          business_type?: string | null
          category?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          fssai_number?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          owner_id?: string | null
          pan_number?: string | null
          pickup_address?: Json | null
          pickup_geo_point?: unknown
          rating?: number | null
          subscription_amount?: number | null
          subscription_expiry?: string | null
          subscription_start?: string | null
          total_orders?: number | null
          total_products?: number | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          bank_details?: Json | null
          banner_url?: string | null
          business_name?: string
          business_type?: string | null
          category?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          fssai_number?: string | null
          gst_number?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          metadata?: Json | null
          owner_id?: string | null
          pan_number?: string | null
          pickup_address?: Json | null
          pickup_geo_point?: unknown
          rating?: number | null
          subscription_amount?: number | null
          subscription_expiry?: string | null
          subscription_start?: string | null
          total_orders?: number | null
          total_products?: number | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sellers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sellers_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sheet_configs: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          owner_id: string | null
          role: string
          sheet_name: string | null
          spreadsheet_id: string | null
          spreadsheet_url: string | null
          sync_interval_minutes: number | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          owner_id?: string | null
          role: string
          sheet_name?: string | null
          spreadsheet_id?: string | null
          spreadsheet_url?: string | null
          sync_interval_minutes?: number | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          owner_id?: string | null
          role?: string
          sheet_name?: string | null
          spreadsheet_id?: string | null
          spreadsheet_url?: string | null
          sync_interval_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sheet_configs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          parent_id: string | null
          password_hash: string | null
          permissions: Json | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          parent_id?: string | null
          password_hash?: string | null
          permissions?: Json | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          parent_id?: string | null
          password_hash?: string | null
          permissions?: Json | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          invite_token: string | null
          invited_at: string | null
          last_login_at: string | null
          phone: string | null
          role_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          last_login_at?: string | null
          phone?: string | null
          role_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          last_login_at?: string | null
          phone?: string | null
          role_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_url: string | null
          metadata: Json | null
          payment_id: string | null
          payment_method: string | null
          seller_id: string | null
          status: string | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          seller_id?: string | null
          status?: string | null
          valid_from: string
          valid_until: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          seller_id?: string | null
          status?: string | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          priority: string | null
          status: string | null
          subject: string | null
          ticket_number: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string | null
          ticket_number: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string | null
          ticket_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          cod_max_amount: number | null
          customer_care_whatsapp: string | null
          delivery_base_fee: number | null
          enable_cod: boolean | null
          enable_online: boolean | null
          enable_wallet: boolean | null
          id: string
          maintenance_mode: boolean | null
          max_order_value: number | null
          min_order_value: number | null
          platform_commission: number | null
          razorpay_key_id: string | null
          razorpay_key_secret: string | null
          stripe_publishable_key: string | null
          stripe_secret_key: string | null
          support_email: string | null
          support_phone: string | null
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          cod_max_amount?: number | null
          customer_care_whatsapp?: string | null
          delivery_base_fee?: number | null
          enable_cod?: boolean | null
          enable_online?: boolean | null
          enable_wallet?: boolean | null
          id?: string
          maintenance_mode?: boolean | null
          max_order_value?: number | null
          min_order_value?: number | null
          platform_commission?: number | null
          razorpay_key_id?: string | null
          razorpay_key_secret?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          support_email?: string | null
          support_phone?: string | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          cod_max_amount?: number | null
          customer_care_whatsapp?: string | null
          delivery_base_fee?: number | null
          enable_cod?: boolean | null
          enable_online?: boolean | null
          enable_wallet?: boolean | null
          id?: string
          maintenance_mode?: boolean | null
          max_order_value?: number | null
          min_order_value?: number | null
          platform_commission?: number | null
          razorpay_key_id?: string | null
          razorpay_key_secret?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          support_email?: string | null
          support_phone?: string | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          id: string
          is_internal_note: boolean | null
          message: string
          sender_id: string | null
          sender_type: string | null
          ticket_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal_note?: boolean | null
          message: string
          sender_id?: string | null
          sender_type?: string | null
          ticket_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal_note?: boolean | null
          message?: string
          sender_id?: string | null
          sender_type?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          category: string | null
          closed_at: string | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          priority: string | null
          raised_by: string | null
          related_id: string | null
          related_to: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          raised_by?: string | null
          related_id?: string | null
          related_to?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          raised_by?: string | null
          related_id?: string | null
          related_to?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          city: string | null
          cod_available: boolean | null
          code: string
          country: string | null
          created_at: string | null
          delivery_charge: number | null
          estimated_delivery_time: number | null
          franchise_id: string | null
          free_delivery_above: number | null
          geo_center: unknown
          geo_polygon: Json | null
          hub_id: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          min_order_value: number | null
          name: string
          online_payment_available: boolean | null
          pincodes: string[] | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          cod_available?: boolean | null
          code: string
          country?: string | null
          created_at?: string | null
          delivery_charge?: number | null
          estimated_delivery_time?: number | null
          franchise_id?: string | null
          free_delivery_above?: number | null
          geo_center?: unknown
          geo_polygon?: Json | null
          hub_id?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          min_order_value?: number | null
          name: string
          online_payment_available?: boolean | null
          pincodes?: string[] | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          cod_available?: boolean | null
          code?: string
          country?: string | null
          created_at?: string | null
          delivery_charge?: number | null
          estimated_delivery_time?: number | null
          franchise_id?: string | null
          free_delivery_above?: number | null
          geo_center?: unknown
          geo_polygon?: Json | null
          hub_id?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          min_order_value?: number | null
          name?: string
          online_payment_available?: boolean | null
          pincodes?: string[] | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zones_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      auto_cancel_stale_pickups: { Args: never; Returns: undefined }
      check_return_eligibility: {
        Args: { p_order_id: string; p_order_item_id: string }
        Returns: {
          days_remaining: number
          is_eligible: boolean
          reason: string
        }[]
      }
      credit_wallet: {
        Args: {
          p_amount: number
          p_category: string
          p_description: string
          p_user_id: string
        }
        Returns: string
      }
      debit_wallet: {
        Args: {
          p_amount: number
          p_category: string
          p_description: string
          p_user_id: string
        }
        Returns: string
      }
      decrement_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_duplicate_returns: {
        Args: { p_customer_id: string }
        Returns: {
          product_id: string
          return_count: number
        }[]
      }
      get_seller_id: { Args: never; Returns: string }
      gettransactionid: { Args: never; Returns: unknown }
      increment_coupon_usage: {
        Args: { p_coupon_id: string }
        Returns: undefined
      }
      increment_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_delivery_partner: { Args: never; Returns: boolean }
      is_seller: { Args: never; Returns: boolean }
      log_login_attempt: {
        Args: {
          p_email: string
          p_failure_reason?: string
          p_ip?: string
          p_method: string
          p_success: boolean
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
