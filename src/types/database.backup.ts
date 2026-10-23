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
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts_payable: {
        Row: {
          amount: number
          balance: number | null
          created_at: string
          created_by: string | null
          currency: string | null
          due_date: string | null
          folio: string | null
          id: string
          issue_date: string
          notes: string | null
          paid_amount: number
          pdf_url: string | null
          purchase_order_id: string | null
          status: Database["public"]["Enums"]["payable_status"]
          supplier_id: string
          supplier_invoice_date: string | null
          supplier_invoice_number: string | null
          updated_at: string
          updated_by: string | null
          workshop_id: string
        }
        Insert: {
          amount: number
          balance?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          due_date?: string | null
          folio?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          pdf_url?: string | null
          purchase_order_id?: string | null
          status?: Database["public"]["Enums"]["payable_status"]
          supplier_id: string
          supplier_invoice_date?: string | null
          supplier_invoice_number?: string | null
          updated_at?: string
          updated_by?: string | null
          workshop_id: string
        }
        Update: {
          amount?: number
          balance?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          due_date?: string | null
          folio?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          pdf_url?: string | null
          purchase_order_id?: string | null
          status?: Database["public"]["Enums"]["payable_status"]
          supplier_id?: string
          supplier_invoice_date?: string | null
          supplier_invoice_number?: string | null
          updated_at?: string
          updated_by?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          cancelled_at: string | null
          cancelled_reason: string | null
          confirmed_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          customer_notes: string | null
          estimated_duration_min: number | null
          folio: string | null
          id: string
          notes: string | null
          reminder_sent: boolean | null
          scheduled_at: string
          service_type: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
          updated_by: string | null
          vehicle_id: string
          workshop_id: string
        }
        Insert: {
          cancelled_at?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          customer_notes?: string | null
          estimated_duration_min?: number | null
          folio?: string | null
          id?: string
          notes?: string | null
          reminder_sent?: boolean | null
          scheduled_at: string
          service_type?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          updated_by?: string | null
          vehicle_id: string
          workshop_id: string
        }
        Update: {
          cancelled_at?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          customer_notes?: string | null
          estimated_duration_min?: number | null
          folio?: string | null
          id?: string
          notes?: string | null
          reminder_sent?: boolean | null
          scheduled_at?: string
          service_type?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          updated_by?: string | null
          vehicle_id?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "workshop_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "customer_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          workshop_id: string | null
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          workshop_id?: string | null
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          folio: string | null
          id: string
          metadata: Json | null
          mp_invoice_id: string | null
          paid_at: string | null
          pdf_url: string | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
          subscription_id: string
          tax_amount: number | null
          total: number
          updated_at: string
          workshop_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          folio?: string | null
          id?: string
          metadata?: Json | null
          mp_invoice_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          subscription_id: string
          tax_amount?: number | null
          total: number
          updated_at?: string
          workshop_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          folio?: string | null
          id?: string
          metadata?: Json | null
          mp_invoice_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          subscription_id?: string
          tax_amount?: number | null
          total?: number
          updated_at?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          content: string | null
          cover_url: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          excerpt: string | null
          id: string
          is_published: boolean | null
          locale: string | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          locale?: string | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          cover_url?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean | null
          locale?: string | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_aliases: {
        Row: {
          alias_name: string
          alias_slug: string
          brand_id: string
          created_at: string
          id: string
          notes: string | null
        }
        Insert: {
          alias_name: string
          alias_slug: string
          brand_id: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Update: {
          alias_name?: string
          alias_slug?: string
          brand_id?: string
          created_at?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_aliases_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_aliases_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "wmi_quick_lookup"
            referencedColumns: ["brand_id"]
          },
        ]
      }
      brand_gallery: {
        Row: {
          brand_id: string
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
          sort_order: number | null
        }
        Insert: {
          brand_id: string
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
          sort_order?: number | null
        }
        Update: {
          brand_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_gallery_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_gallery_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "wmi_quick_lookup"
            referencedColumns: ["brand_id"]
          },
        ]
      }
      brand_markets: {
        Row: {
          brand_id: string
          country_code: string
          created_at: string
          id: string
          is_available: boolean
          local_name: string | null
          notes: string | null
        }
        Insert: {
          brand_id: string
          country_code: string
          created_at?: string
          id?: string
          is_available?: boolean
          local_name?: string | null
          notes?: string | null
        }
        Update: {
          brand_id?: string
          country_code?: string
          created_at?: string
          id?: string
          is_available?: boolean
          local_name?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_markets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_markets_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "wmi_quick_lookup"
            referencedColumns: ["brand_id"]
          },
        ]
      }
      car_brands: {
        Row: {
          banner_url: string | null
          country: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discontinued_year: number | null
          founded_year: number | null
          global_score: number
          id: string
          is_active: boolean
          logo_placeholder: string | null
          logo_svg_path: string | null
          logo_url_fallback: string | null
          logo_webp_path: string | null
          mx_score: number
          name: string
          slug: string
          updated_at: string
          updated_by: string | null
          vehicle_types: Database["public"]["Enums"]["vehicle_type"][]
          website_url: string | null
        }
        Insert: {
          banner_url?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discontinued_year?: number | null
          founded_year?: number | null
          global_score?: number
          id?: string
          is_active?: boolean
          logo_placeholder?: string | null
          logo_svg_path?: string | null
          logo_url_fallback?: string | null
          logo_webp_path?: string | null
          mx_score?: number
          name: string
          slug: string
          updated_at?: string
          updated_by?: string | null
          vehicle_types?: Database["public"]["Enums"]["vehicle_type"][]
          website_url?: string | null
        }
        Update: {
          banner_url?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discontinued_year?: number | null
          founded_year?: number | null
          global_score?: number
          id?: string
          is_active?: boolean
          logo_placeholder?: string | null
          logo_svg_path?: string | null
          logo_url_fallback?: string | null
          logo_webp_path?: string | null
          mx_score?: number
          name?: string
          slug?: string
          updated_at?: string
          updated_by?: string | null
          vehicle_types?: Database["public"]["Enums"]["vehicle_type"][]
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_brands_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_brands_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      car_model_years: {
        Row: {
          created_at: string
          created_by: string | null
          doors: number | null
          drive_type: string | null
          engine_cc: number | null
          engine_description: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          global_score: number
          horsepower: number | null
          id: string
          image_url: string | null
          is_active: boolean
          model_id: string
          payload_kg: number | null
          seats: number | null
          torque_nm: number | null
          towing_capacity_kg: number | null
          transmission: Database["public"]["Enums"]["transmission_type"] | null
          trim_name: string | null
          updated_at: string
          updated_by: string | null
          weight_kg: number | null
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          doors?: number | null
          drive_type?: string | null
          engine_cc?: number | null
          engine_description?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          global_score?: number
          horsepower?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          model_id: string
          payload_kg?: number | null
          seats?: number | null
          torque_nm?: number | null
          towing_capacity_kg?: number | null
          transmission?: Database["public"]["Enums"]["transmission_type"] | null
          trim_name?: string | null
          updated_at?: string
          updated_by?: string | null
          weight_kg?: number | null
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          doors?: number | null
          drive_type?: string | null
          engine_cc?: number | null
          engine_description?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          global_score?: number
          horsepower?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          model_id?: string
          payload_kg?: number | null
          seats?: number | null
          torque_nm?: number | null
          towing_capacity_kg?: number | null
          transmission?: Database["public"]["Enums"]["transmission_type"] | null
          trim_name?: string | null
          updated_at?: string
          updated_by?: string | null
          weight_kg?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "car_model_years_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_model_years_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "car_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_model_years_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      car_models: {
        Row: {
          body_type: string | null
          brand_id: string
          category: string | null
          created_at: string
          created_by: string | null
          generation: string | null
          global_score: number
          id: string
          is_active: boolean
          mx_score: number
          name: string
          slug: string
          updated_at: string
          updated_by: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          year_end: number | null
          year_start: number
        }
        Insert: {
          body_type?: string | null
          brand_id: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          generation?: string | null
          global_score?: number
          id?: string
          is_active?: boolean
          mx_score?: number
          name: string
          slug: string
          updated_at?: string
          updated_by?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          year_end?: number | null
          year_start: number
        }
        Update: {
          body_type?: string | null
          brand_id?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          generation?: string | null
          global_score?: number
          id?: string
          is_active?: boolean
          mx_score?: number
          name?: string
          slug?: string
          updated_at?: string
          updated_by?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          year_end?: number | null
          year_start?: number
        }
        Relationships: [
          {
            foreignKeyName: "car_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "wmi_quick_lookup"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "car_models_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_models_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      car_years: {
        Row: {
          created_at: string | null
          created_by: string | null
          engine_config: string | null
          fuel_type: string | null
          id: string
          model_id: string | null
          transmission: string | null
          updated_at: string | null
          updated_by: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          engine_config?: string | null
          fuel_type?: string | null
          id?: string
          model_id?: string | null
          transmission?: string | null
          updated_at?: string | null
          updated_by?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          engine_config?: string | null
          fuel_type?: string | null
          id?: string
          model_id?: string | null
          transmission?: string | null
          updated_at?: string | null
          updated_by?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "car_years_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_years_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_messages: {
        Row: {
          body: string
          channel: string
          created_at: string
          created_by: string | null
          customer_id: string
          direction: string
          id: string
          read_at: string | null
          sent_at: string
          status: string | null
          subject: string | null
          work_order_id: string | null
          workshop_id: string
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          direction?: string
          id?: string
          read_at?: string | null
          sent_at?: string
          status?: string | null
          subject?: string | null
          work_order_id?: string | null
          workshop_id: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          direction?: string
          id?: string
          read_at?: string | null
          sent_at?: string
          status?: string | null
          subject?: string | null
          work_order_id?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_messages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_messages_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_messages_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_messages_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_messages_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_vehicles: {
        Row: {
          brand_id: string | null
          brand_name: string | null
          color: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          engine: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"] | null
          id: string
          image_url: string | null
          is_active: boolean
          mileage_km: number | null
          model_id: string | null
          model_name: string | null
          model_year_id: string | null
          notes: string | null
          plate: string | null
          transmission: Database["public"]["Enums"]["transmission_type"] | null
          updated_at: string
          updated_by: string | null
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
          vin: string | null
          workshop_id: string
          year: number | null
        }
        Insert: {
          brand_id?: string | null
          brand_name?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          engine?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          mileage_km?: number | null
          model_id?: string | null
          model_name?: string | null
          model_year_id?: string | null
          notes?: string | null
          plate?: string | null
          transmission?: Database["public"]["Enums"]["transmission_type"] | null
          updated_at?: string
          updated_by?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          vin?: string | null
          workshop_id: string
          year?: number | null
        }
        Update: {
          brand_id?: string | null
          brand_name?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          engine?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          mileage_km?: number | null
          model_id?: string | null
          model_name?: string | null
          model_year_id?: string | null
          notes?: string | null
          plate?: string | null
          transmission?: Database["public"]["Enums"]["transmission_type"] | null
          updated_at?: string
          updated_by?: string | null
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          vin?: string | null
          workshop_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_vehicles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "wmi_quick_lookup"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "customer_vehicles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "car_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_model_year_id_fkey"
            columns: ["model_year_id"]
            isOneToOne: false
            referencedRelation: "car_model_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_vehicles_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          last_visit_at: string | null
          notes: string | null
          phone: string | null
          phone_alt: string | null
          state: string | null
          tax_address: string | null
          tax_id: string | null
          tax_name: string | null
          total_spent: number
          updated_at: string
          updated_by: string | null
          user_id: string | null
          visit_count: number
          workshop_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          last_visit_at?: string | null
          notes?: string | null
          phone?: string | null
          phone_alt?: string | null
          state?: string | null
          tax_address?: string | null
          tax_id?: string | null
          tax_name?: string | null
          total_spent?: number
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
          visit_count?: number
          workshop_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          last_visit_at?: string | null
          notes?: string | null
          phone?: string | null
          phone_alt?: string | null
          state?: string | null
          tax_address?: string | null
          tax_id?: string | null
          tax_name?: string | null
          total_spent?: number
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
          visit_count?: number
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      folio_sequences: {
        Row: {
          id: string
          last_number: number
          prefix: string
          workshop_id: string
          year: number
        }
        Insert: {
          id?: string
          last_number?: number
          prefix: string
          workshop_id: string
          year: number
        }
        Update: {
          id?: string
          last_number?: number
          prefix?: string
          workshop_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "folio_sequences_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folio_sequences_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_items: {
        Row: {
          category: string
          created_at: string
          id: string
          inspection_id: string
          item_name: string
          notes: string | null
          sort_order: number | null
          status: Database["public"]["Enums"]["inspection_item_status"]
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          inspection_id: string
          item_name: string
          notes?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["inspection_item_status"]
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          inspection_id?: string
          item_name?: string
          notes?: string | null
          sort_order?: number | null
          status?: Database["public"]["Enums"]["inspection_item_status"]
        }
        Relationships: [
          {
            foreignKeyName: "inspection_items_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "vehicle_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_template_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_required: boolean | null
          item_name: string
          sort_order: number | null
          template_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          item_name: string
          sort_order?: number | null
          template_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          item_name?: string
          sort_order?: number | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "inspection_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
          updated_by: string | null
          vehicle_types: Database["public"]["Enums"]["vehicle_type"][] | null
          workshop_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
          updated_by?: string | null
          vehicle_types?: Database["public"]["Enums"]["vehicle_type"][] | null
          workshop_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          updated_by?: string | null
          vehicle_types?: Database["public"]["Enums"]["vehicle_type"][] | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspection_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_templates_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_templates_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes: string | null
          part_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          stock_after: number | null
          stock_before: number | null
          unit_cost: number | null
          workshop_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          part_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          stock_after?: number | null
          stock_before?: number | null
          unit_cost?: number | null
          workshop_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          notes?: string | null
          part_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          stock_after?: number | null
          stock_before?: number | null
          unit_cost?: number | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance: number | null
          created_at: string
          created_by: string | null
          customer_id: string
          discount_amount: number
          due_date: string | null
          fiscal_folio: string | null
          fiscal_series: string | null
          folio: string | null
          id: string
          issue_date: string
          notes: string | null
          paid_amount: number
          pdf_url: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
          updated_by: string | null
          work_order_id: string | null
          workshop_id: string
          xml_url: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          discount_amount?: number
          due_date?: string | null
          fiscal_folio?: string | null
          fiscal_series?: string | null
          folio?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          updated_by?: string | null
          work_order_id?: string | null
          workshop_id: string
          xml_url?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          discount_amount?: number
          due_date?: string | null
          fiscal_folio?: string | null
          fiscal_series?: string | null
          folio?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number
          pdf_url?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          updated_by?: string | null
          work_order_id?: string | null
          workshop_id?: string
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_events: {
        Row: {
          appointment_id: string | null
          balance_after: number
          created_at: string | null
          description: string | null
          event_type: string | null
          id: string
          points_delta: number
          user_id: string | null
        }
        Insert: {
          appointment_id?: string | null
          balance_after: number
          created_at?: string | null
          description?: string | null
          event_type?: string | null
          id?: string
          points_delta: number
          user_id?: string | null
        }
        Update: {
          appointment_id?: string | null
          balance_after?: number
          created_at?: string | null
          description?: string | null
          event_type?: string | null
          id?: string
          points_delta?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      model_year_gallery: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          model_year_id: string
          sort_order: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          model_year_id: string
          sort_order?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          model_year_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "model_year_gallery_model_year_id_fkey"
            columns: ["model_year_id"]
            isOneToOne: false
            referencedRelation: "car_model_years"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channels_enabled:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          created_at: string
          id: string
          is_enabled: boolean | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          channels_enabled?:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          channels_enabled?:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_id: string | null
          action_type: string | null
          action_url: string | null
          body: string
          channel_status: Json | null
          channels: Database["public"]["Enums"]["notification_channel"][]
          created_at: string
          created_by: string | null
          customer_id: string | null
          id: string
          image_url: string | null
          is_read: boolean
          metadata: Json | null
          read_at: string | null
          scheduled_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: string | null
          workshop_id: string | null
        }
        Insert: {
          action_id?: string | null
          action_type?: string | null
          action_url?: string | null
          body: string
          channel_status?: Json | null
          channels?: Database["public"]["Enums"]["notification_channel"][]
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean
          metadata?: Json | null
          read_at?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string | null
          workshop_id?: string | null
        }
        Update: {
          action_id?: string | null
          action_type?: string | null
          action_url?: string | null
          body?: string
          channel_status?: Json | null
          channels?: Database["public"]["Enums"]["notification_channel"][]
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean
          metadata?: Json | null
          read_at?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          brand: string | null
          category_id: string | null
          cost_price: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          lead_time_days: number | null
          location: string | null
          name: string
          part_number: string | null
          sale_price: number | null
          sku: string | null
          stock_max: number | null
          stock_min: number | null
          stock_qty: number | null
          supplier_id: string | null
          supplier_part_number: string | null
          tax_rate: number | null
          unit: string | null
          updated_at: string
          updated_by: string | null
          workshop_id: string
        }
        Insert: {
          brand?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          lead_time_days?: number | null
          location?: string | null
          name: string
          part_number?: string | null
          sale_price?: number | null
          sku?: string | null
          stock_max?: number | null
          stock_min?: number | null
          stock_qty?: number | null
          supplier_id?: string | null
          supplier_part_number?: string | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          workshop_id: string
        }
        Update: {
          brand?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          lead_time_days?: number | null
          location?: string | null
          name?: string
          part_number?: string | null
          sale_price?: number | null
          sku?: string | null
          stock_max?: number | null
          stock_min?: number | null
          stock_qty?: number | null
          supplier_id?: string | null
          supplier_part_number?: string | null
          tax_rate?: number | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "parts_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
          workshop_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
          workshop_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parts_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_categories_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_categories_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string
          folio: string | null
          id: string
          invoice_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_at: string
          reference: string | null
          work_order_id: string | null
          workshop_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          customer_id: string
          folio?: string | null
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string
          reference?: string | null
          work_order_id?: string | null
          workshop_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string
          folio?: string | null
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string
          reference?: string | null
          work_order_id?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_brand_tiers: {
        Row: {
          brand_id: string
          country_code: string
          created_at: string
          id: string
          is_pinned: boolean
          sort_order: number
          tier: number
          updated_at: string
        }
        Insert: {
          brand_id: string
          country_code: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          sort_order?: number
          tier?: number
          updated_at?: string
        }
        Update: {
          brand_id?: string
          country_code?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          sort_order?: number
          tier?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_brand_tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_brand_tiers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "wmi_quick_lookup"
            referencedColumns: ["brand_id"]
          },
        ]
      }
      postal_codes: {
        Row: {
          asentamiento: string
          ciudad: string | null
          cp: string
          estado: string
          id: number
          municipio: string
        }
        Insert: {
          asentamiento: string
          ciudad?: string | null
          cp: string
          estado: string
          id?: number
          municipio: string
        }
        Update: {
          asentamiento?: string
          ciudad?: string | null
          cp?: string
          estado?: string
          id?: number
          municipio?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          full_name: string | null
          id: string
          loyalty_points: number
          notifications_enabled: boolean | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          full_name?: string | null
          id: string
          loyalty_points?: number
          notifications_enabled?: boolean | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          full_name?: string | null
          id?: string
          loyalty_points?: number
          notifications_enabled?: boolean | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          discount_type: string | null
          discount_value: number | null
          id: string
          is_active: boolean | null
          title: string
          trigger_type: string | null
          trigger_value: Json | null
          updated_at: string | null
          updated_by: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          trigger_type?: string | null
          trigger_value?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          trigger_type?: string | null
          trigger_value?: Json | null
          updated_at?: string | null
          updated_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          description: string
          id: string
          notes: string | null
          part_id: string | null
          part_number: string | null
          purchase_order_id: string
          quantity_ordered: number
          quantity_received: number | null
          sort_order: number | null
          tax_rate: number | null
          total: number
          unit: string | null
          unit_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          notes?: string | null
          part_id?: string | null
          part_number?: string | null
          purchase_order_id: string
          quantity_ordered?: number
          quantity_received?: number | null
          sort_order?: number | null
          tax_rate?: number | null
          total?: number
          unit?: string | null
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          notes?: string | null
          part_id?: string | null
          part_number?: string | null
          purchase_order_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          sort_order?: number | null
          tax_rate?: number | null
          total?: number
          unit?: string | null
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string | null
          expected_date: string | null
          folio: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          order_date: string
          payment_terms: number | null
          pdf_url: string | null
          received_by: string | null
          received_date: string | null
          shipping_cost: number | null
          status: Database["public"]["Enums"]["purchase_order_status"]
          subtotal: number | null
          supplier_id: string
          supplier_invoice_date: string | null
          supplier_invoice_number: string | null
          tax_amount: number | null
          total: number | null
          updated_at: string
          updated_by: string | null
          workshop_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          expected_date?: string | null
          folio?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date?: string
          payment_terms?: number | null
          pdf_url?: string | null
          received_by?: string | null
          received_date?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          subtotal?: number | null
          supplier_id: string
          supplier_invoice_date?: string | null
          supplier_invoice_number?: string | null
          tax_amount?: number | null
          total?: number | null
          updated_at?: string
          updated_by?: string | null
          workshop_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          expected_date?: string | null
          folio?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          order_date?: string
          payment_terms?: number | null
          pdf_url?: string | null
          received_by?: string | null
          received_date?: string | null
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["purchase_order_status"]
          subtotal?: number | null
          supplier_id?: string
          supplier_invoice_date?: string | null
          supplier_invoice_number?: string | null
          tax_amount?: number | null
          total?: number | null
          updated_at?: string
          updated_by?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "workshop_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string
          discount_pct: number | null
          id: string
          item_type: string
          notes: string | null
          quantity: number
          quote_id: string
          sort_order: number | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_pct?: number | null
          id?: string
          item_type: string
          notes?: string | null
          quantity?: number
          quote_id: string
          sort_order?: number | null
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_pct?: number | null
          id?: string
          item_type?: string
          notes?: string | null
          quantity?: number
          quote_id?: string
          sort_order?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          approved_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          discount_amount: number
          folio: string | null
          id: string
          notes: string | null
          rejected_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
          updated_by: string | null
          valid_until: string | null
          vehicle_id: string | null
          work_order_id: string | null
          workshop_id: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          discount_amount?: number
          folio?: string | null
          id?: string
          notes?: string | null
          rejected_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
          vehicle_id?: string | null
          work_order_id?: string | null
          workshop_id: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          discount_amount?: number
          folio?: string | null
          id?: string
          notes?: string | null
          rejected_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
          vehicle_id?: string | null
          work_order_id?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "customer_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_catalog: {
        Row: {
          base_price: number | null
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
          updated_by: string | null
          vehicle_types: Database["public"]["Enums"]["vehicle_type"][] | null
          workshop_id: string | null
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
          updated_by?: string | null
          vehicle_types?: Database["public"]["Enums"]["vehicle_type"][] | null
          workshop_id?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
          updated_by?: string | null
          vehicle_types?: Database["public"]["Enums"]["vehicle_type"][] | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_catalog_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_catalog_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_catalog_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_catalog_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_prices: {
        Row: {
          base_price: number
          created_at: string | null
          id: string
          notes: string | null
          parts_included: boolean | null
          service_id: string | null
          updated_at: string | null
          updated_by: string | null
          year_id: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          id?: string
          notes?: string | null
          parts_included?: boolean | null
          service_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          year_id?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          parts_included?: boolean | null
          service_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
          year_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_prices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_prices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_prices_year_id_fkey"
            columns: ["year_id"]
            isOneToOne: false
            referencedRelation: "car_years"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          features: Json
          id: string
          included_modules: Database["public"]["Enums"]["module_type"][]
          is_active: boolean
          max_storage_gb: number | null
          max_users: number | null
          max_vehicles: number | null
          max_work_orders_month: number | null
          name: string
          price_annual: number | null
          price_monthly: number
          price_quarterly: number | null
          slug: string
          sort_order: number | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json
          id?: string
          included_modules?: Database["public"]["Enums"]["module_type"][]
          is_active?: boolean
          max_storage_gb?: number | null
          max_users?: number | null
          max_vehicles?: number | null
          max_work_orders_month?: number | null
          name: string
          price_annual?: number | null
          price_monthly?: number
          price_quarterly?: number | null
          slug: string
          sort_order?: number | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          features?: Json
          id?: string
          included_modules?: Database["public"]["Enums"]["module_type"][]
          is_active?: boolean
          max_storage_gb?: number | null
          max_users?: number | null
          max_vehicles?: number | null
          max_work_orders_month?: number | null
          name?: string
          price_annual?: number | null
          price_monthly?: number
          price_quarterly?: number | null
          slug?: string
          sort_order?: number | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          cancel_at_period_end: boolean | null
          cancel_reason: string | null
          cancelled_at: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          current_period_end: string
          current_period_start: string
          id: string
          metadata: Json | null
          mp_subscription_id: string | null
          plan_id: string
          price: number
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          updated_by: string | null
          workshop_id: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancel_at_period_end?: boolean | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          current_period_end: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          mp_subscription_id?: string | null
          plan_id: string
          price: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          updated_by?: string | null
          workshop_id: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          cancel_at_period_end?: boolean | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: string
          metadata?: Json | null
          mp_subscription_id?: string | null
          plan_id?: string
          price?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          updated_by?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: true
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: true
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          folio: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          paid_at: string
          payable_id: string | null
          reference: string | null
          supplier_id: string
          workshop_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          folio?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string
          payable_id?: string | null
          reference?: string | null
          supplier_id: string
          workshop_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          folio?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          paid_at?: string
          payable_id?: string | null
          reference?: string | null
          supplier_id?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_payable_id_fkey"
            columns: ["payable_id"]
            isOneToOne: false
            referencedRelation: "accounts_payable"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_payments_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          created_by: string | null
          credit_limit: number | null
          currency: string | null
          current_balance: number | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          payment_terms: number | null
          phone: string | null
          phone_alt: string | null
          state: string | null
          tax_id: string | null
          trade_name: string | null
          updated_at: string
          updated_by: string | null
          website_url: string | null
          workshop_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          currency?: string | null
          current_balance?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          phone_alt?: string | null
          state?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
          workshop_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          currency?: string | null
          current_balance?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          payment_terms?: number | null
          phone?: string | null
          phone_alt?: string | null
          state?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cars: {
        Row: {
          brand_name: string | null
          color: string | null
          created_at: string
          deleted_at: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"] | null
          id: string
          image_url: string | null
          is_active: boolean
          is_favorite: boolean | null
          last_service_date: string | null
          mileage: number | null
          model_name: string | null
          model_year_id: string | null
          nickname: string | null
          plate: string | null
          transmission: Database["public"]["Enums"]["transmission_type"] | null
          updated_at: string
          user_id: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
          vin: string | null
          year_manual: number | null
        }
        Insert: {
          brand_name?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_favorite?: boolean | null
          last_service_date?: string | null
          mileage?: number | null
          model_name?: string | null
          model_year_id?: string | null
          nickname?: string | null
          plate?: string | null
          transmission?: Database["public"]["Enums"]["transmission_type"] | null
          updated_at?: string
          user_id: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vin?: string | null
          year_manual?: number | null
        }
        Update: {
          brand_name?: string | null
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_favorite?: boolean | null
          last_service_date?: string | null
          mileage?: number | null
          model_name?: string | null
          model_year_id?: string | null
          nickname?: string | null
          plate?: string | null
          transmission?: Database["public"]["Enums"]["transmission_type"] | null
          updated_at?: string
          user_id?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vin?: string | null
          year_manual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cars_model_year_id_fkey"
            columns: ["model_year_id"]
            isOneToOne: false
            referencedRelation: "car_model_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_documents: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          downloads_count: number
          file_size_kb: number | null
          file_url: string | null
          id: string
          is_active: boolean
          language: string
          model_year_id: string
          pages: number | null
          published_at: string | null
          storage_path: string | null
          title: string
          updated_at: string
          updated_by: string | null
          version: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          downloads_count?: number
          file_size_kb?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          language?: string
          model_year_id: string
          pages?: number | null
          published_at?: string | null
          storage_path?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          downloads_count?: number
          file_size_kb?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          language?: string
          model_year_id?: string
          pages?: number | null
          published_at?: string | null
          storage_path?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_model_year_id_fkey"
            columns: ["model_year_id"]
            isOneToOne: false
            referencedRelation: "car_model_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          inspector_id: string | null
          notes: string | null
          sent_at: string | null
          sent_to_customer: boolean | null
          template_id: string | null
          updated_at: string
          work_order_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          inspector_id?: string | null
          notes?: string | null
          sent_at?: string | null
          sent_to_customer?: boolean | null
          template_id?: string | null
          updated_at?: string
          work_order_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          inspector_id?: string | null
          notes?: string | null
          sent_at?: string | null
          sent_to_customer?: boolean | null
          template_id?: string | null
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "workshop_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "inspection_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_popularity: {
        Row: {
          country_code: string | null
          entity_id: string
          entity_type: string
          id: string
          last_event: string | null
          score_30d: number
          score_7d: number
          score_total: number
          updated_at: string
          workshop_id: string | null
        }
        Insert: {
          country_code?: string | null
          entity_id: string
          entity_type: string
          id?: string
          last_event?: string | null
          score_30d?: number
          score_7d?: number
          score_total?: number
          updated_at?: string
          workshop_id?: string | null
        }
        Update: {
          country_code?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          last_event?: string | null
          score_30d?: number
          score_7d?: number
          score_total?: number
          updated_at?: string
          workshop_id?: string | null
        }
        Relationships: []
      }
      vehicle_search_events: {
        Row: {
          brand_id: string | null
          country_code: string | null
          created_at: string
          event_type: Database["public"]["Enums"]["popularity_event"]
          id: string
          model_id: string | null
          model_year_id: string | null
          workshop_id: string | null
        }
        Insert: {
          brand_id?: string | null
          country_code?: string | null
          created_at?: string
          event_type: Database["public"]["Enums"]["popularity_event"]
          id?: string
          model_id?: string | null
          model_year_id?: string | null
          workshop_id?: string | null
        }
        Update: {
          brand_id?: string | null
          country_code?: string | null
          created_at?: string
          event_type?: Database["public"]["Enums"]["popularity_event"]
          id?: string
          model_id?: string | null
          model_year_id?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_search_events_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "car_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_search_events_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "wmi_quick_lookup"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "vehicle_search_events_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "car_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_search_events_model_year_id_fkey"
            columns: ["model_year_id"]
            isOneToOne: false
            referencedRelation: "car_model_years"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_parts: {
        Row: {
          brand: string | null
          created_at: string
          description: string
          discount_pct: number | null
          id: string
          notes: string | null
          part_id: string | null
          part_number: string | null
          quantity: number
          sort_order: number | null
          total: number
          unit: string | null
          unit_cost: number
          unit_price: number
          updated_at: string
          work_order_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          description: string
          discount_pct?: number | null
          id?: string
          notes?: string | null
          part_id?: string | null
          part_number?: string | null
          quantity?: number
          sort_order?: number | null
          total?: number
          unit?: string | null
          unit_cost?: number
          unit_price?: number
          updated_at?: string
          work_order_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          description?: string
          discount_pct?: number | null
          id?: string
          notes?: string | null
          part_id?: string | null
          part_number?: string | null
          quantity?: number
          sort_order?: number | null
          total?: number
          unit?: string | null
          unit_cost?: number
          unit_price?: number
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_parts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_parts_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_photos: {
        Row: {
          caption: string | null
          id: string
          inspection_item_id: string | null
          photo_url: string | null
          storage_path: string
          taken_at: string
          taken_by: string | null
          work_order_id: string
        }
        Insert: {
          caption?: string | null
          id?: string
          inspection_item_id?: string | null
          photo_url?: string | null
          storage_path: string
          taken_at?: string
          taken_by?: string | null
          work_order_id: string
        }
        Update: {
          caption?: string | null
          id?: string
          inspection_item_id?: string | null
          photo_url?: string | null
          storage_path?: string
          taken_at?: string
          taken_by?: string | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_photos_inspection_item_id_fkey"
            columns: ["inspection_item_id"]
            isOneToOne: false
            referencedRelation: "inspection_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_photos_taken_by_fkey"
            columns: ["taken_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_photos_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_services: {
        Row: {
          actual_hours: number | null
          created_at: string
          description: string
          discount_pct: number | null
          estimated_hours: number | null
          id: string
          notes: string | null
          quantity: number
          service_id: string | null
          sort_order: number | null
          technician_id: string | null
          total: number
          unit_price: number
          updated_at: string
          work_order_id: string
        }
        Insert: {
          actual_hours?: number | null
          created_at?: string
          description: string
          discount_pct?: number | null
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          quantity?: number
          service_id?: string | null
          sort_order?: number | null
          technician_id?: string | null
          total?: number
          unit_price?: number
          updated_at?: string
          work_order_id: string
        }
        Update: {
          actual_hours?: number | null
          created_at?: string
          description?: string
          discount_pct?: number | null
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          quantity?: number
          service_id?: string | null
          sort_order?: number | null
          technician_id?: string | null
          total?: number
          unit_price?: number
          updated_at?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_services_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "workshop_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_services_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_status_log: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          notes: string | null
          status_from: Database["public"]["Enums"]["work_order_status"] | null
          status_to: Database["public"]["Enums"]["work_order_status"]
          total_snapshot: number | null
          work_order_id: string
          workshop_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          status_from?: Database["public"]["Enums"]["work_order_status"] | null
          status_to: Database["public"]["Enums"]["work_order_status"]
          total_snapshot?: number | null
          work_order_id: string
          workshop_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          status_from?: Database["public"]["Enums"]["work_order_status"] | null
          status_to?: Database["public"]["Enums"]["work_order_status"]
          total_snapshot?: number | null
          work_order_id?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_status_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_status_log_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_status_log_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_status_log_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          advisor_id: string | null
          appointment_id: string | null
          approval_channel: string | null
          approved_at: string | null
          approved_by_customer: boolean | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_complaint: string | null
          customer_id: string
          delivered_at: string | null
          diagnosis: string | null
          discount_amount: number
          folio: string | null
          id: string
          internal_notes: string | null
          mileage_in: number | null
          mileage_out: number | null
          paid_amount: number
          promised_at: string | null
          received_at: string | null
          requires_approval: boolean | null
          status: Database["public"]["Enums"]["work_order_status"]
          subtotal: number
          tax_amount: number
          tax_rate: number
          technician_id: string | null
          technician_notes: string | null
          total: number
          updated_at: string
          updated_by: string | null
          vehicle_id: string
          workshop_id: string
        }
        Insert: {
          advisor_id?: string | null
          appointment_id?: string | null
          approval_channel?: string | null
          approved_at?: string | null
          approved_by_customer?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_complaint?: string | null
          customer_id: string
          delivered_at?: string | null
          diagnosis?: string | null
          discount_amount?: number
          folio?: string | null
          id?: string
          internal_notes?: string | null
          mileage_in?: number | null
          mileage_out?: number | null
          paid_amount?: number
          promised_at?: string | null
          received_at?: string | null
          requires_approval?: boolean | null
          status?: Database["public"]["Enums"]["work_order_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          technician_id?: string | null
          technician_notes?: string | null
          total?: number
          updated_at?: string
          updated_by?: string | null
          vehicle_id: string
          workshop_id: string
        }
        Update: {
          advisor_id?: string | null
          appointment_id?: string | null
          approval_channel?: string | null
          approved_at?: string | null
          approved_by_customer?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_complaint?: string | null
          customer_id?: string
          delivered_at?: string | null
          diagnosis?: string | null
          discount_amount?: number
          folio?: string | null
          id?: string
          internal_notes?: string | null
          mileage_in?: number | null
          mileage_out?: number | null
          paid_amount?: number
          promised_at?: string | null
          received_at?: string | null
          requires_approval?: boolean | null
          status?: Database["public"]["Enums"]["work_order_status"]
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          technician_id?: string | null
          technician_notes?: string | null
          total?: number
          updated_at?: string
          updated_by?: string | null
          vehicle_id?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "workshop_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "workshop_staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "customer_vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_modules: {
        Row: {
          activated_at: string
          amount_mxn: number | null
          config: Json
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          module_type: Database["public"]["Enums"]["module_type"]
          payment_gateway: string | null
          payment_ref: string | null
          updated_at: string
          workshop_id: string
        }
        Insert: {
          activated_at?: string
          amount_mxn?: number | null
          config?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          module_type: Database["public"]["Enums"]["module_type"]
          payment_gateway?: string | null
          payment_ref?: string | null
          updated_at?: string
          workshop_id: string
        }
        Update: {
          activated_at?: string
          amount_mxn?: number | null
          config?: Json
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          module_type?: Database["public"]["Enums"]["module_type"]
          payment_gateway?: string | null
          payment_ref?: string | null
          updated_at?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_modules_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_modules_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          rating: number
          work_order_id: string | null
          workshop_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          rating: number
          work_order_id?: string | null
          workshop_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          rating?: number
          work_order_id?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_reviews_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_reviews_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_reviews_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_settings: {
        Row: {
          appointment_buffer_min: number | null
          appointment_duration_default: number | null
          cfdi_use_default: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          extra: Json | null
          id: string
          invoice_series: string | null
          low_stock_threshold_days: number | null
          max_daily_appointments: number | null
          notify_low_stock: boolean | null
          notify_new_appointment: boolean | null
          notify_ot_completed: boolean | null
          primary_color: string | null
          require_approval_above: number | null
          secondary_color: string | null
          tax_id: string | null
          tax_rate_default: number | null
          tax_regime: string | null
          timezone: string | null
          updated_at: string
          updated_by: string | null
          wa_number: string | null
          wa_template_confirmed: string | null
          wa_template_ready: string | null
          wa_template_reminder: string | null
          workshop_id: string
        }
        Insert: {
          appointment_buffer_min?: number | null
          appointment_duration_default?: number | null
          cfdi_use_default?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          extra?: Json | null
          id?: string
          invoice_series?: string | null
          low_stock_threshold_days?: number | null
          max_daily_appointments?: number | null
          notify_low_stock?: boolean | null
          notify_new_appointment?: boolean | null
          notify_ot_completed?: boolean | null
          primary_color?: string | null
          require_approval_above?: number | null
          secondary_color?: string | null
          tax_id?: string | null
          tax_rate_default?: number | null
          tax_regime?: string | null
          timezone?: string | null
          updated_at?: string
          updated_by?: string | null
          wa_number?: string | null
          wa_template_confirmed?: string | null
          wa_template_ready?: string | null
          wa_template_reminder?: string | null
          workshop_id: string
        }
        Update: {
          appointment_buffer_min?: number | null
          appointment_duration_default?: number | null
          cfdi_use_default?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          extra?: Json | null
          id?: string
          invoice_series?: string | null
          low_stock_threshold_days?: number | null
          max_daily_appointments?: number | null
          notify_low_stock?: boolean | null
          notify_new_appointment?: boolean | null
          notify_ot_completed?: boolean | null
          primary_color?: string | null
          require_approval_above?: number | null
          secondary_color?: string | null
          tax_id?: string | null
          tax_rate_default?: number | null
          tax_regime?: string | null
          timezone?: string | null
          updated_at?: string
          updated_by?: string | null
          wa_number?: string | null
          wa_template_confirmed?: string | null
          wa_template_ready?: string | null
          wa_template_reminder?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_settings_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: true
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_settings_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: true
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_staff: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string
          hourly_rate: number | null
          id: string
          is_active: boolean
          last_name: string
          phone: string | null
          role: string
          specialty: string[] | null
          updated_at: string
          updated_by: string | null
          user_id: string | null
          workshop_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          last_name: string
          phone?: string | null
          role: string
          specialty?: string[] | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
          workshop_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean
          last_name?: string
          phone?: string | null
          role?: string
          specialty?: string[] | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_staff_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_staff_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_staff_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_staff_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops_public"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          accepts_vehicles: Database["public"]["Enums"]["vehicle_type"][]
          address: string | null
          city: string | null
          country_code: string
          cover_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          logo_url: string | null
          manager_first_name: string | null
          manager_last_name: string | null
          name: string
          opening_hours: Json | null
          owner_id: string | null
          phone: string | null
          phone_wa: string | null
          postal_code: string | null
          rating: number
          schedule: Json | null
          slug: string
          state: string | null
          tax_id: string | null
          tax_name: string | null
          total_reviews: number
          updated_at: string
          updated_by: string | null
          website_url: string | null
          workshop_type: string | null
        }
        Insert: {
          accepts_vehicles?: Database["public"]["Enums"]["vehicle_type"][]
          address?: string | null
          city?: string | null
          country_code?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          manager_first_name?: string | null
          manager_last_name?: string | null
          name: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          phone_wa?: string | null
          postal_code?: string | null
          rating?: number
          schedule?: Json | null
          slug: string
          state?: string | null
          tax_id?: string | null
          tax_name?: string | null
          total_reviews?: number
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
          workshop_type?: string | null
        }
        Update: {
          accepts_vehicles?: Database["public"]["Enums"]["vehicle_type"][]
          address?: string | null
          city?: string | null
          country_code?: string
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          manager_first_name?: string | null
          manager_last_name?: string | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          phone_wa?: string | null
          postal_code?: string | null
          rating?: number
          schedule?: Json | null
          slug?: string
          state?: string | null
          tax_id?: string | null
          tax_name?: string | null
          total_reviews?: number
          updated_at?: string
          updated_by?: string | null
          website_url?: string | null
          workshop_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshops_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshops_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshops_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      wmi_quick_lookup: {
        Row: {
          brand_id: string | null
          brand_slug: string | null
          logo_svg_path: string | null
          logo_url_fallback: string | null
          logo_webp_path: string | null
          make_name: string | null
          manufacturer_name: string | null
          vehicle_type: string | null
          wmi: string | null
        }
        Relationships: []
      }
      workshops_public: {
        Row: {
          accepts_vehicles: Database["public"]["Enums"]["vehicle_type"][] | null
          address: string | null
          city: string | null
          id: string | null
          lat: number | null
          lng: number | null
          logo_url: string | null
          name: string | null
          opening_hours: Json | null
          phone_wa: string | null
          rating: number | null
          schedule: Json | null
          slug: string | null
          total_reviews: number | null
        }
        Insert: {
          accepts_vehicles?:
            | Database["public"]["Enums"]["vehicle_type"][]
            | null
          address?: string | null
          city?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string | null
          opening_hours?: Json | null
          phone_wa?: string | null
          rating?: number | null
          schedule?: Json | null
          slug?: string | null
          total_reviews?: number | null
        }
        Update: {
          accepts_vehicles?:
            | Database["public"]["Enums"]["vehicle_type"][]
            | null
          address?: string | null
          city?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          logo_url?: string | null
          name?: string | null
          opening_hours?: Json | null
          phone_wa?: string | null
          rating?: number | null
          schedule?: Json | null
          slug?: string | null
          total_reviews?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      decode_vin_full: { Args: { p_vin: string }; Returns: Json }
      get_brands_for_workshop: {
        Args: {
          p_vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          p_workshop_id: string
        }
        Returns: {
          brand_id: string
          is_pinned: boolean
          logo_placeholder: string
          logo_svg_path: string
          logo_url_fallback: string
          logo_webp_path: string
          name: string
          score_30d: number
          slug: string
          sort_order: number
        }[]
      }
      get_models_for_brand: {
        Args: {
          p_brand_id: string
          p_vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
          p_workshop_id?: string
        }
        Returns: {
          category: string
          model_id: string
          name: string
          score_30d: number
          slug: string
          year_end: number
          year_start: number
        }[]
      }
      get_my_role: { Args: never; Returns: string }
      get_years_for_model: {
        Args: { p_model_id: string }
        Returns: {
          variant_count: number
          year: number
        }[]
      }
      next_folio: {
        Args: { p_digits?: number; p_prefix: string; p_workshop_id: string }
        Returns: string
      }
      provision_tenant: {
        Args: {
          p_address?: string
          p_city?: string
          p_name: string
          p_owner_first_name: string
          p_owner_id: string
          p_owner_last_name: string
          p_owner_role?: string
          p_phone?: string
          p_plan_slug?: string
          p_postal_code?: string
          p_slug: string
          p_state?: string
        }
        Returns: string
      }
      track_vehicle_event: {
        Args: {
          p_brand_id?: string
          p_event_type: Database["public"]["Enums"]["popularity_event"]
          p_model_id?: string
          p_model_year_id?: string
          p_workshop_id?: string
        }
        Returns: undefined
      }
      workshop_has_feature: {
        Args: { p_feature: string; p_workshop_id: string }
        Returns: boolean
      }
      workshop_has_module: {
        Args: {
          p_module: Database["public"]["Enums"]["module_type"]
          p_workshop_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "checked_in"
        | "no_show"
        | "completed"
        | "cancelled"
      billing_cycle: "monthly" | "quarterly" | "annual"
      document_type:
        | "owners_manual"
        | "repair_manual"
        | "parts_catalog"
        | "wiring_diagram"
        | "service_bulletin"
        | "warranty_guide"
      fuel_type:
        | "gasoline"
        | "diesel"
        | "hybrid"
        | "electric"
        | "hydrogen"
        | "lpg"
        | "cng"
      inspection_item_status: "ok" | "warning" | "critical" | "not_checked"
      inventory_movement_type:
        | "purchase"
        | "sale"
        | "adjustment"
        | "return"
        | "transfer"
      invoice_status:
        | "draft"
        | "sent"
        | "paid"
        | "partial"
        | "overdue"
        | "cancelled"
      module_type:
        | "catalog_cars"
        | "catalog_motos"
        | "catalog_trucks"
        | "manuals"
        | "marketplace"
        | "field_services"
        | "advanced_erp"
        | "fleet"
      notification_channel: "push" | "email" | "whatsapp" | "sms" | "in_app"
      notification_status: "pending" | "sent" | "delivered" | "read" | "failed"
      notification_type:
        | "work_order_created"
        | "work_order_status_changed"
        | "work_order_ready"
        | "work_order_delivered"
        | "approval_required"
        | "appointment_confirmed"
        | "appointment_reminder"
        | "appointment_cancelled"
        | "payment_received"
        | "invoice_sent"
        | "invoice_overdue"
        | "low_stock_alert"
        | "purchase_order_received"
        | "loyalty_points_earned"
        | "promo_available"
        | "plan_expiring"
        | "plan_expired"
        | "new_review"
        | "general"
      payable_status: "pending" | "partial" | "paid" | "overdue" | "cancelled"
      payment_method:
        | "cash"
        | "card_credit"
        | "card_debit"
        | "transfer"
        | "check"
        | "financing"
      popularity_event:
        | "catalog_view"
        | "search_select"
        | "ot_created"
        | "product_sold"
      purchase_order_status:
        | "draft"
        | "sent"
        | "confirmed"
        | "partial"
        | "received"
        | "cancelled"
      quote_status:
        | "draft"
        | "sent"
        | "approved"
        | "rejected"
        | "expired"
        | "converted"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "cancelled"
        | "expired"
        | "paused"
      transmission_type:
        | "manual"
        | "automatic"
        | "cvt"
        | "dct"
        | "semi_automatic"
        | "sequential"
      vehicle_type:
        | "car"
        | "motorcycle"
        | "pickup"
        | "truck"
        | "van"
        | "suv"
        | "bus"
      work_order_status:
        | "draft"
        | "received"
        | "diagnosing"
        | "waiting_approval"
        | "approved"
        | "in_progress"
        | "waiting_parts"
        | "completed"
        | "delivered"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      appointment_status: [
        "scheduled",
        "confirmed",
        "checked_in",
        "no_show",
        "completed",
        "cancelled",
      ],
      billing_cycle: ["monthly", "quarterly", "annual"],
      document_type: [
        "owners_manual",
        "repair_manual",
        "parts_catalog",
        "wiring_diagram",
        "service_bulletin",
        "warranty_guide",
      ],
      fuel_type: [
        "gasoline",
        "diesel",
        "hybrid",
        "electric",
        "hydrogen",
        "lpg",
        "cng",
      ],
      inspection_item_status: ["ok", "warning", "critical", "not_checked"],
      inventory_movement_type: [
        "purchase",
        "sale",
        "adjustment",
        "return",
        "transfer",
      ],
      invoice_status: [
        "draft",
        "sent",
        "paid",
        "partial",
        "overdue",
        "cancelled",
      ],
      module_type: [
        "catalog_cars",
        "catalog_motos",
        "catalog_trucks",
        "manuals",
        "marketplace",
        "field_services",
        "advanced_erp",
        "fleet",
      ],
      notification_channel: ["push", "email", "whatsapp", "sms", "in_app"],
      notification_status: ["pending", "sent", "delivered", "read", "failed"],
      notification_type: [
        "work_order_created",
        "work_order_status_changed",
        "work_order_ready",
        "work_order_delivered",
        "approval_required",
        "appointment_confirmed",
        "appointment_reminder",
        "appointment_cancelled",
        "payment_received",
        "invoice_sent",
        "invoice_overdue",
        "low_stock_alert",
        "purchase_order_received",
        "loyalty_points_earned",
        "promo_available",
        "plan_expiring",
        "plan_expired",
        "new_review",
        "general",
      ],
      payable_status: ["pending", "partial", "paid", "overdue", "cancelled"],
      payment_method: [
        "cash",
        "card_credit",
        "card_debit",
        "transfer",
        "check",
        "financing",
      ],
      popularity_event: [
        "catalog_view",
        "search_select",
        "ot_created",
        "product_sold",
      ],
      purchase_order_status: [
        "draft",
        "sent",
        "confirmed",
        "partial",
        "received",
        "cancelled",
      ],
      quote_status: [
        "draft",
        "sent",
        "approved",
        "rejected",
        "expired",
        "converted",
      ],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "cancelled",
        "expired",
        "paused",
      ],
      transmission_type: [
        "manual",
        "automatic",
        "cvt",
        "dct",
        "semi_automatic",
        "sequential",
      ],
      vehicle_type: [
        "car",
        "motorcycle",
        "pickup",
        "truck",
        "van",
        "suv",
        "bus",
      ],
      work_order_status: [
        "draft",
        "received",
        "diagnosing",
        "waiting_approval",
        "approved",
        "in_progress",
        "waiting_parts",
        "completed",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
