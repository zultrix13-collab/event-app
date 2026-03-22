export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: "active" | "suspended" | "canceled";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: "active" | "suspended" | "canceled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status?: "active" | "suspended" | "canceled";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "owner";
          status: "active" | "inactive";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: "owner";
          status?: "active" | "inactive";
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: "owner";
          status?: "active" | "inactive";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      plans: {
        Row: {
          id: string;
          code: string;
          name: string;
          price_monthly: number;
          currency: string;
          max_pages: number;
          syncs_per_day: number;
          monthly_ai_reports: number;
          report_retention_days: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          price_monthly: number;
          currency: string;
          max_pages: number;
          syncs_per_day: number;
          monthly_ai_reports: number;
          report_retention_days: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          price_monthly?: number;
          currency?: string;
          max_pages?: number;
          syncs_per_day?: number;
          monthly_ai_reports?: number;
          report_retention_days?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          plan_id: string;
          status:
            | "bootstrap_pending_billing"
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "expired"
            | "suspended";
          current_period_start: string;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          trial_ends_at: string | null;
          last_billed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          plan_id: string;
          status:
            | "bootstrap_pending_billing"
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "expired"
            | "suspended";
          current_period_start?: string;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_ends_at?: string | null;
          last_billed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          plan_id?: string;
          status?:
            | "bootstrap_pending_billing"
            | "trialing"
            | "active"
            | "past_due"
            | "canceled"
            | "expired"
            | "suspended";
          current_period_start?: string;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          trial_ends_at?: string | null;
          last_billed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          }
        ];
      };
      usage_counters: {
        Row: {
          id: string;
          organization_id: string;
          period_key: string;
          metric_key: "pages_connected" | "ai_reports_generated" | "manual_syncs_used";
          value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          period_key: string;
          metric_key: "pages_connected" | "ai_reports_generated" | "manual_syncs_used";
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          period_key?: string;
          metric_key?: "pages_connected" | "ai_reports_generated" | "manual_syncs_used";
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_counters_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      meta_connections: {
        Row: {
          id: string;
          organization_id: string;
          meta_user_id: string | null;
          access_token_encrypted: string | null;
          refresh_token_encrypted: string | null;
          token_expires_at: string | null;
          granted_scopes: string[];
          status: "pending" | "active" | "expired" | "revoked" | "error";
          last_validated_at: string | null;
          last_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          meta_user_id?: string | null;
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          token_expires_at?: string | null;
          granted_scopes?: string[];
          status?: "pending" | "active" | "expired" | "revoked" | "error";
          last_validated_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          meta_user_id?: string | null;
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          token_expires_at?: string | null;
          granted_scopes?: string[];
          status?: "pending" | "active" | "expired" | "revoked" | "error";
          last_validated_at?: string | null;
          last_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meta_connections_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      meta_pages: {
        Row: {
          id: string;
          organization_id: string;
          meta_connection_id: string;
          meta_page_id: string;
          name: string;
          category: string | null;
          page_access_token_encrypted: string | null;
          is_selectable: boolean;
          is_selected: boolean;
          status: "active" | "deselected" | "revoked" | "error";
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          meta_connection_id: string;
          meta_page_id: string;
          name: string;
          category?: string | null;
          page_access_token_encrypted?: string | null;
          is_selectable?: boolean;
          is_selected?: boolean;
          status?: "active" | "deselected" | "revoked" | "error";
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          meta_connection_id?: string;
          meta_page_id?: string;
          name?: string;
          category?: string | null;
          page_access_token_encrypted?: string | null;
          is_selectable?: boolean;
          is_selected?: boolean;
          status?: "active" | "deselected" | "revoked" | "error";
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meta_pages_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meta_pages_meta_connection_id_fkey";
            columns: ["meta_connection_id"];
            isOneToOne: false;
            referencedRelation: "meta_connections";
            referencedColumns: ["id"];
          }
        ];
      };
      meta_sync_jobs: {
        Row: {
          id: string;
          organization_id: string;
          meta_page_id: string;
          job_type: "initial_sync" | "scheduled_sync" | "manual_sync";
          status: "queued" | "running" | "succeeded" | "failed" | "canceled";
          attempt_count: number;
          idempotency_key: string;
          scheduled_at: string;
          started_at: string | null;
          finished_at: string | null;
          error_message: string | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          meta_page_id: string;
          job_type: "initial_sync" | "scheduled_sync" | "manual_sync";
          status?: "queued" | "running" | "succeeded" | "failed" | "canceled";
          attempt_count?: number;
          idempotency_key: string;
          scheduled_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
          error_message?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          meta_page_id?: string;
          job_type?: "initial_sync" | "scheduled_sync" | "manual_sync";
          status?: "queued" | "running" | "succeeded" | "failed" | "canceled";
          attempt_count?: number;
          idempotency_key?: string;
          scheduled_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
          error_message?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meta_sync_jobs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meta_sync_jobs_meta_page_id_fkey";
            columns: ["meta_page_id"];
            isOneToOne: false;
            referencedRelation: "meta_pages";
            referencedColumns: ["id"];
          }
        ];
      };
      page_daily_metrics: {
        Row: {
          id: string;
          organization_id: string;
          meta_page_id: string;
          metric_date: string;
          followers_count: number | null;
          follower_delta: number | null;
          reach: number | null;
          impressions: number | null;
          engaged_users: number | null;
          post_count: number | null;
          engagement_rate: number | null;
          raw_metrics: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          meta_page_id: string;
          metric_date: string;
          followers_count?: number | null;
          follower_delta?: number | null;
          reach?: number | null;
          impressions?: number | null;
          engaged_users?: number | null;
          post_count?: number | null;
          engagement_rate?: number | null;
          raw_metrics?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          meta_page_id?: string;
          metric_date?: string;
          followers_count?: number | null;
          follower_delta?: number | null;
          reach?: number | null;
          impressions?: number | null;
          engaged_users?: number | null;
          post_count?: number | null;
          engagement_rate?: number | null;
          raw_metrics?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_daily_metrics_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "page_daily_metrics_meta_page_id_fkey";
            columns: ["meta_page_id"];
            isOneToOne: false;
            referencedRelation: "meta_pages";
            referencedColumns: ["id"];
          }
        ];
      };
      page_post_metrics: {
        Row: {
          id: string;
          organization_id: string;
          meta_page_id: string;
          meta_post_id: string;
          post_created_at: string;
          message_excerpt: string | null;
          post_type: string | null;
          reach: number | null;
          impressions: number | null;
          engagements: number | null;
          reactions: number | null;
          comments: number | null;
          shares: number | null;
          clicks: number | null;
          raw_metrics: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          meta_page_id: string;
          meta_post_id: string;
          post_created_at: string;
          message_excerpt?: string | null;
          post_type?: string | null;
          reach?: number | null;
          impressions?: number | null;
          engagements?: number | null;
          reactions?: number | null;
          comments?: number | null;
          shares?: number | null;
          clicks?: number | null;
          raw_metrics?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          meta_page_id?: string;
          meta_post_id?: string;
          post_created_at?: string;
          message_excerpt?: string | null;
          post_type?: string | null;
          reach?: number | null;
          impressions?: number | null;
          engagements?: number | null;
          reactions?: number | null;
          comments?: number | null;
          shares?: number | null;
          clicks?: number | null;
          raw_metrics?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_post_metrics_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "page_post_metrics_meta_page_id_fkey";
            columns: ["meta_page_id"];
            isOneToOne: false;
            referencedRelation: "meta_pages";
            referencedColumns: ["id"];
          }
        ];
      };
      analysis_jobs: {
        Row: {
          id: string;
          organization_id: string;
          meta_page_id: string;
          source_sync_job_id: string | null;
          status: "queued" | "running" | "succeeded" | "failed";
          attempt_count: number;
          idempotency_key: string;
          scheduled_at: string;
          started_at: string | null;
          finished_at: string | null;
          error_message: string | null;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          meta_page_id: string;
          source_sync_job_id?: string | null;
          status?: "queued" | "running" | "succeeded" | "failed";
          attempt_count?: number;
          idempotency_key: string;
          scheduled_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
          error_message?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          meta_page_id?: string;
          source_sync_job_id?: string | null;
          status?: "queued" | "running" | "succeeded" | "failed";
          attempt_count?: number;
          idempotency_key?: string;
          scheduled_at?: string;
          started_at?: string | null;
          finished_at?: string | null;
          error_message?: string | null;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_jobs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_jobs_meta_page_id_fkey";
            columns: ["meta_page_id"];
            isOneToOne: false;
            referencedRelation: "meta_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_jobs_source_sync_job_id_fkey";
            columns: ["source_sync_job_id"];
            isOneToOne: false;
            referencedRelation: "meta_sync_jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      analysis_reports: {
        Row: {
          id: string;
          organization_id: string;
          meta_page_id: string;
          analysis_job_id: string | null;
          report_type: "daily_summary" | "weekly_summary" | "manual_analysis";
          status: "ready" | "failed" | "superseded";
          summary: string;
          findings_json: Json;
          recommendations_json: Json;
          model_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          meta_page_id: string;
          analysis_job_id?: string | null;
          report_type: "daily_summary" | "weekly_summary" | "manual_analysis";
          status?: "ready" | "failed" | "superseded";
          summary?: string;
          findings_json?: Json;
          recommendations_json?: Json;
          model_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          meta_page_id?: string;
          analysis_job_id?: string | null;
          report_type?: "daily_summary" | "weekly_summary" | "manual_analysis";
          status?: "ready" | "failed" | "superseded";
          summary?: string;
          findings_json?: Json;
          recommendations_json?: Json;
          model_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_reports_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_reports_meta_page_id_fkey";
            columns: ["meta_page_id"];
            isOneToOne: false;
            referencedRelation: "meta_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_reports_analysis_job_id_fkey";
            columns: ["analysis_job_id"];
            isOneToOne: false;
            referencedRelation: "analysis_jobs";
            referencedColumns: ["id"];
          }
        ];
      };
      recommendations: {
        Row: {
          id: string;
          organization_id: string;
          meta_page_id: string;
          analysis_report_id: string;
          priority: "high" | "medium" | "low";
          category: "content" | "timing" | "engagement" | "growth";
          title: string;
          description: string;
          action_items: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          meta_page_id: string;
          analysis_report_id: string;
          priority: "high" | "medium" | "low";
          category: "content" | "timing" | "engagement" | "growth";
          title: string;
          description: string;
          action_items?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          meta_page_id?: string;
          analysis_report_id?: string;
          priority?: "high" | "medium" | "low";
          category?: "content" | "timing" | "engagement" | "growth";
          title?: string;
          description?: string;
          action_items?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recommendations_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recommendations_meta_page_id_fkey";
            columns: ["meta_page_id"];
            isOneToOne: false;
            referencedRelation: "meta_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recommendations_analysis_report_id_fkey";
            columns: ["analysis_report_id"];
            isOneToOne: false;
            referencedRelation: "analysis_reports";
            referencedColumns: ["id"];
          }
        ];
      };
      invoices: {
        Row: {
          id: string;
          organization_id: string;
          subscription_id: string;
          target_plan_id: string;
          amount: number;
          currency: string;
          status: "pending" | "paid" | "expired" | "failed" | "canceled";
          provider: "qpay";
          provider_invoice_id: string | null;
          provider_payment_url: string | null;
          qpay_sender_invoice_no: string;
          webhook_verify_token: string;
          issued_at: string;
          due_at: string;
          paid_at: string | null;
          idempotency_key: string | null;
          provider_last_error: string | null;
          metadata: Json;
          verification_attempt_count: number;
          last_verification_at: string | null;
          last_verification_outcome: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          subscription_id: string;
          target_plan_id: string;
          amount: number;
          currency: string;
          status?: "pending" | "paid" | "expired" | "failed" | "canceled";
          provider?: "qpay";
          provider_invoice_id?: string | null;
          provider_payment_url?: string | null;
          qpay_sender_invoice_no: string;
          webhook_verify_token: string;
          issued_at?: string;
          due_at: string;
          paid_at?: string | null;
          idempotency_key?: string | null;
          provider_last_error?: string | null;
          metadata?: Json;
          verification_attempt_count?: number;
          last_verification_at?: string | null;
          last_verification_outcome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          subscription_id?: string;
          target_plan_id?: string;
          amount?: number;
          currency?: string;
          status?: "pending" | "paid" | "expired" | "failed" | "canceled";
          provider?: "qpay";
          provider_invoice_id?: string | null;
          provider_payment_url?: string | null;
          qpay_sender_invoice_no?: string;
          webhook_verify_token?: string;
          issued_at?: string;
          due_at?: string;
          paid_at?: string | null;
          idempotency_key?: string | null;
          provider_last_error?: string | null;
          metadata?: Json;
          verification_attempt_count?: number;
          last_verification_at?: string | null;
          last_verification_outcome?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_target_plan_id_fkey";
            columns: ["target_plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          }
        ];
      };
      payment_transactions: {
        Row: {
          id: string;
          invoice_id: string;
          organization_id: string;
          provider: string;
          provider_txn_id: string | null;
          status: "pending" | "initiated" | "paid" | "failed" | "reversed";
          amount: number;
          currency: string;
          raw_payload: Json;
          verification_payload: Json;
          processed_at: string | null;
          last_verification_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          organization_id: string;
          provider?: string;
          provider_txn_id?: string | null;
          status: "pending" | "initiated" | "paid" | "failed" | "reversed";
          amount: number;
          currency: string;
          raw_payload?: Json;
          verification_payload?: Json;
          processed_at?: string | null;
          last_verification_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          organization_id?: string;
          provider?: string;
          provider_txn_id?: string | null;
          status?: "pending" | "initiated" | "paid" | "failed" | "reversed";
          amount?: number;
          currency?: string;
          raw_payload?: Json;
          verification_payload?: Json;
          processed_at?: string | null;
          last_verification_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payment_transactions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      billing_events: {
        Row: {
          id: string;
          organization_id: string | null;
          invoice_id: string | null;
          event_type: string;
          provider_event_id: string | null;
          payload: Json;
          processed_at: string | null;
          processing_error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          invoice_id?: string | null;
          event_type: string;
          provider_event_id?: string | null;
          payload?: Json;
          processed_at?: string | null;
          processing_error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          invoice_id?: string | null;
          event_type?: string;
          provider_event_id?: string | null;
          payload?: Json;
          processed_at?: string | null;
          processing_error?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_events_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          }
        ];
      };
      system_admins: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          role: "super_admin" | "operator" | "viewer";
          status: "active" | "suspended";
          granted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          role: "super_admin" | "operator" | "viewer";
          status?: "active" | "suspended";
          granted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          role?: "super_admin" | "operator" | "viewer";
          status?: "active" | "suspended";
          granted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      operator_audit_events: {
        Row: {
          id: string;
          actor_email: string;
          action_type: string;
          organization_id: string | null;
          resource_type: string;
          resource_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_email: string;
          action_type: string;
          organization_id?: string | null;
          resource_type: string;
          resource_id: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_email?: string;
          action_type?: string;
          organization_id?: string | null;
          resource_type?: string;
          resource_id?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "operator_audit_events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      bootstrap_organization_subscription: {
        Args: {
          target_org_id: string;
          target_plan_code?: string;
        };
        Returns: string;
      };
      create_organization_with_starter: {
        Args: {
          target_name: string;
          target_slug: string;
        };
        Returns: {
          organization_id: string;
          organization_member_id: string;
          subscription_id: string;
        }[];
      };
      set_meta_page_selected: {
        Args: {
          target_org_id: string;
          target_meta_page_id: string;
          target_selected: boolean;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
