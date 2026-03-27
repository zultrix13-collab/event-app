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
          // Event app extensions
          role: string | null;
          phone: string | null;
          country: string | null;
          organization: string | null;
          is_approved: boolean | null;
          approved_by: string | null;
          approved_at: string | null;
          is_active: boolean | null;
          last_login_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          // Event app extensions
          role?: string | null;
          phone?: string | null;
          country?: string | null;
          organization?: string | null;
          is_approved?: boolean | null;
          approved_by?: string | null;
          approved_at?: string | null;
          is_active?: boolean | null;
          last_login_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          // Event app extensions
          role?: string | null;
          phone?: string | null;
          country?: string | null;
          organization?: string | null;
          is_approved?: boolean | null;
          approved_by?: string | null;
          approved_at?: string | null;
          is_active?: boolean | null;
          last_login_at?: string | null;
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
      integration_connections: {
        Row: {
          id: string;
          organization_id: string;
          provider_user_id: string | null;
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
          provider_user_id?: string | null;
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
          provider_user_id?: string | null;
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
      integration_resources: {
        Row: {
          id: string;
          organization_id: string;
          integration_connection_id: string;
          resource_external_id: string;
          name: string;
          category: string | null;
          page_access_token_encrypted: string | null;
          is_selectable: boolean;
          is_active: boolean;
          status: "active" | "deselected" | "revoked" | "error";
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          integration_connection_id: string;
          resource_external_id: string;
          name: string;
          category?: string | null;
          page_access_token_encrypted?: string | null;
          is_selectable?: boolean;
          is_active?: boolean;
          status?: "active" | "deselected" | "revoked" | "error";
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          integration_connection_id?: string;
          resource_external_id?: string;
          name?: string;
          category?: string | null;
          page_access_token_encrypted?: string | null;
          is_selectable?: boolean;
          is_active?: boolean;
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
            columns: ["integration_connection_id"];
            isOneToOne: false;
            referencedRelation: "integration_connections";
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
            referencedRelation: "integration_resources";
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
            referencedRelation: "integration_resources";
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
            referencedRelation: "integration_resources";
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
            referencedRelation: "integration_resources";
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
            referencedRelation: "integration_resources";
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
            referencedRelation: "integration_resources";
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
      vip_applications: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          organization: string | null;
          position: string | null;
          reason: string | null;
          status: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          email: string;
          organization?: string | null;
          position?: string | null;
          reason?: string | null;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          email?: string;
          organization?: string | null;
          position?: string | null;
          reason?: string | null;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      digital_ids: {
        Row: {
          id: string;
          user_id: string;
          qr_payload: string;
          nfc_payload: string | null;
          issued_at: string;
          expires_at: string;
          is_revoked: boolean;
          hmac_signature: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          qr_payload: string;
          nfc_payload?: string | null;
          issued_at?: string;
          expires_at: string;
          is_revoked?: boolean;
          hmac_signature: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          qr_payload?: string;
          nfc_payload?: string | null;
          issued_at?: string;
          expires_at?: string;
          is_revoked?: boolean;
          hmac_signature?: string;
        };
        Relationships: [];
      };
      otp_attempts: {
        Row: {
          id: string;
          email: string;
          attempt_count: number;
          last_attempt_at: string;
          blocked_until: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          attempt_count?: number;
          last_attempt_at?: string;
          blocked_until?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          attempt_count?: number;
          last_attempt_at?: string;
          blocked_until?: string | null;
        };
        Relationships: [];
      };
      venues: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          description: string | null;
          capacity: number;
          location: string | null;
          floor: number | null;
          map_coordinates: Json | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          description?: string | null;
          capacity?: number;
          location?: string | null;
          floor?: number | null;
          map_coordinates?: Json | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          description?: string | null;
          capacity?: number;
          location?: string | null;
          floor?: number | null;
          map_coordinates?: Json | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      speakers: {
        Row: {
          id: string;
          full_name: string;
          full_name_en: string | null;
          title: string | null;
          title_en: string | null;
          organization: string | null;
          organization_en: string | null;
          bio: string | null;
          bio_en: string | null;
          avatar_url: string | null;
          country: string | null;
          social_links: Json | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          full_name_en?: string | null;
          title?: string | null;
          title_en?: string | null;
          organization?: string | null;
          organization_en?: string | null;
          bio?: string | null;
          bio_en?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          social_links?: Json | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          full_name_en?: string | null;
          title?: string | null;
          title_en?: string | null;
          organization?: string | null;
          organization_en?: string | null;
          bio?: string | null;
          bio_en?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          social_links?: Json | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      event_sessions: {
        Row: {
          id: string;
          title: string;
          title_en: string | null;
          description: string | null;
          description_en: string | null;
          session_type: 'general' | 'keynote' | 'workshop' | 'panel' | 'exhibition' | 'networking' | 'other';
          venue_id: string | null;
          starts_at: string;
          ends_at: string;
          capacity: number;
          registered_count: number;
          is_registration_open: boolean;
          zone: 'green' | 'blue' | 'both';
          tags: string[] | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          title_en?: string | null;
          description?: string | null;
          description_en?: string | null;
          session_type?: 'general' | 'keynote' | 'workshop' | 'panel' | 'exhibition' | 'networking' | 'other';
          venue_id?: string | null;
          starts_at: string;
          ends_at: string;
          capacity?: number;
          registered_count?: number;
          is_registration_open?: boolean;
          zone?: 'green' | 'blue' | 'both';
          tags?: string[] | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          title_en?: string | null;
          description?: string | null;
          description_en?: string | null;
          session_type?: 'general' | 'keynote' | 'workshop' | 'panel' | 'exhibition' | 'networking' | 'other';
          venue_id?: string | null;
          starts_at?: string;
          ends_at?: string;
          capacity?: number;
          registered_count?: number;
          is_registration_open?: boolean;
          zone?: 'green' | 'blue' | 'both';
          tags?: string[] | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_sessions_venue_id_fkey";
            columns: ["venue_id"];
            isOneToOne: false;
            referencedRelation: "venues";
            referencedColumns: ["id"];
          }
        ];
      };
      session_speakers: {
        Row: {
          session_id: string;
          speaker_id: string;
          role: string;
          sort_order: number;
        };
        Insert: {
          session_id: string;
          speaker_id: string;
          role?: string;
          sort_order?: number;
        };
        Update: {
          session_id?: string;
          speaker_id?: string;
          role?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "session_speakers_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "event_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_speakers_speaker_id_fkey";
            columns: ["speaker_id"];
            isOneToOne: false;
            referencedRelation: "speakers";
            referencedColumns: ["id"];
          }
        ];
      };
      seat_registrations: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          status: 'confirmed' | 'waitlisted' | 'cancelled';
          registered_at: string;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          status?: 'confirmed' | 'waitlisted' | 'cancelled';
          registered_at?: string;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          status?: 'confirmed' | 'waitlisted' | 'cancelled';
          registered_at?: string;
          cancelled_at?: string | null;
        };
        Relationships: [];
      };
      attendance: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          checked_in_at: string;
          check_in_method: 'qr' | 'nfc' | 'manual';
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          checked_in_at?: string;
          check_in_method?: 'qr' | 'nfc' | 'manual';
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          checked_in_at?: string;
          check_in_method?: 'qr' | 'nfc' | 'manual';
        };
        Relationships: [];
      };
      session_surveys: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          rating: number | null;
          feedback: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          rating?: number | null;
          feedback?: string | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string | null;
          rating?: number | null;
          feedback?: string | null;
          submitted_at?: string;
        };
        Relationships: [];
      };
      user_agenda: {
        Row: {
          user_id: string;
          session_id: string;
          added_at: string;
        };
        Insert: {
          user_id: string;
          session_id: string;
          added_at?: string;
        };
        Update: {
          user_id?: string;
          session_id?: string;
          added_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          title_en: string | null;
          body: string;
          body_en: string | null;
          notification_type: 'general' | 'programme' | 'emergency' | 'system';
          target_roles: string[] | null;
          target_countries: string[] | null;
          sent_by: string | null;
          sent_at: string;
          is_emergency: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          title_en?: string | null;
          body: string;
          body_en?: string | null;
          notification_type?: 'general' | 'programme' | 'emergency' | 'system';
          target_roles?: string[] | null;
          target_countries?: string[] | null;
          sent_by?: string | null;
          sent_at?: string;
          is_emergency?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          title_en?: string | null;
          body?: string;
          body_en?: string | null;
          notification_type?: 'general' | 'programme' | 'emergency' | 'system';
          target_roles?: string[] | null;
          target_countries?: string[] | null;
          sent_by?: string | null;
          sent_at?: string;
          is_emergency?: boolean;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          description: string | null;
          description_en: string | null;
          price: number;
          currency: string;
          image_url: string | null;
          category: 'merchandise' | 'food' | 'ticket' | 'other';
          stock_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          description?: string | null;
          description_en?: string | null;
          price: number;
          currency?: string;
          image_url?: string | null;
          category?: 'merchandise' | 'food' | 'ticket' | 'other';
          stock_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: 'pending' | 'paid' | 'cancelled' | 'refunded';
          total_amount: number;
          currency: string;
          payment_method: string | null;
          payment_ref: string | null;
          notes: string | null;
          created_at: string;
          paid_at: string | null;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: 'pending' | 'paid' | 'cancelled' | 'refunded';
          total_amount: number;
          currency?: string;
          payment_method?: string | null;
          payment_ref?: string | null;
          notes?: string | null;
          created_at?: string;
          paid_at?: string | null;
          cancelled_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string | null;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
        Relationships: [];
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          currency: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          currency?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['wallets']['Insert']>;
        Relationships: [];
      };
      wallet_transactions: {
        Row: {
          id: string;
          wallet_id: string;
          user_id: string | null;
          type: 'topup' | 'purchase' | 'refund' | 'transfer';
          amount: number;
          balance_before: number;
          balance_after: number;
          reference_id: string | null;
          idempotency_key: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          user_id?: string | null;
          type: 'topup' | 'purchase' | 'refund' | 'transfer';
          amount: number;
          balance_before: number;
          balance_after: number;
          reference_id?: string | null;
          idempotency_key?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['wallet_transactions']['Insert']>;
        Relationships: [];
      };
      transport_bookings: {
        Row: {
          id: string;
          user_id: string | null;
          type: 'taxi' | 'rental' | 'shuttle' | 'airport_transfer';
          pickup_location: string | null;
          dropoff_location: string | null;
          pickup_time: string | null;
          flight_number: string | null;
          passenger_count: number;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          provider_ref: string | null;
          notes: string | null;
          order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          type?: 'taxi' | 'rental' | 'shuttle' | 'airport_transfer';
          pickup_location?: string | null;
          dropoff_location?: string | null;
          pickup_time?: string | null;
          flight_number?: string | null;
          passenger_count?: number;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          provider_ref?: string | null;
          notes?: string | null;
          order_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['transport_bookings']['Insert']>;
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          description: string | null;
          cuisine_type: string | null;
          location: string | null;
          opening_hours: Json | null;
          image_url: string | null;
          qr_table_prefix: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          description?: string | null;
          cuisine_type?: string | null;
          location?: string | null;
          opening_hours?: Json | null;
          image_url?: string | null;
          qr_table_prefix?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
        Relationships: [];
      };
      restaurant_bookings: {
        Row: {
          id: string;
          user_id: string | null;
          restaurant_name: string;
          table_qr_code: string | null;
          booking_time: string;
          party_size: number;
          status: 'pending' | 'confirmed' | 'cancelled';
          special_requests: string | null;
          order_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          restaurant_name: string;
          table_qr_code?: string | null;
          booking_time: string;
          party_size?: number;
          status?: 'pending' | 'confirmed' | 'cancelled';
          special_requests?: string | null;
          order_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['restaurant_bookings']['Insert']>;
        Relationships: [];
      };
      hotels: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          description: string | null;
          address: string | null;
          stars: number | null;
          image_url: string | null;
          booking_url: string | null;
          phone: string | null;
          distance_km: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          description?: string | null;
          address?: string | null;
          stars?: number | null;
          image_url?: string | null;
          booking_url?: string | null;
          phone?: string | null;
          distance_km?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['hotels']['Insert']>;
        Relationships: [];
      };
      lost_found_items: {
        Row: {
          id: string;
          reporter_id: string | null;
          type: 'lost' | 'found';
          item_name: string;
          description: string | null;
          image_url: string | null;
          last_seen_location: string | null;
          contact_info: string | null;
          status: 'open' | 'resolved' | 'closed';
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id?: string | null;
          type: 'lost' | 'found';
          item_name: string;
          description?: string | null;
          image_url?: string | null;
          last_seen_location?: string | null;
          contact_info?: string | null;
          status?: 'open' | 'resolved' | 'closed';
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['lost_found_items']['Insert']>;
        Relationships: [];
      };
      qpay_invoices: {
        Row: {
          id: string;
          order_id: string | null;
          user_id: string | null;
          invoice_id: string | null;
          qr_text: string | null;
          qr_image: string | null;
          amount: number;
          status: 'pending' | 'paid' | 'expired' | 'cancelled';
          expires_at: string | null;
          paid_at: string | null;
          callback_data: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          user_id?: string | null;
          invoice_id?: string | null;
          qr_text?: string | null;
          qr_image?: string | null;
          amount: number;
          status?: 'pending' | 'paid' | 'expired' | 'cancelled';
          expires_at?: string | null;
          paid_at?: string | null;
          callback_data?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['qpay_invoices']['Insert']>;
        Relationships: [];
      };
      kb_documents: {
        Row: {
          id: string;
          title: string;
          title_en: string | null;
          content: string;
          content_en: string | null;
          category: 'programme' | 'faq' | 'venue' | 'service' | 'general' | 'emergency';
          source_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          title_en?: string | null;
          content: string;
          content_en?: string | null;
          category?: 'programme' | 'faq' | 'venue' | 'service' | 'general' | 'emergency';
          source_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['kb_documents']['Insert']>;
        Relationships: [];
      };
      kb_chunks: {
        Row: {
          id: string;
          document_id: string;
          chunk_index: number;
          content: string;
          content_en: string | null;
          embedding: number[] | null;
          token_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          chunk_index: number;
          content: string;
          content_en?: string | null;
          embedding?: number[] | null;
          token_count?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['kb_chunks']['Insert']>;
        Relationships: [{ foreignKeyName: 'kb_chunks_document_id_fkey'; columns: ['document_id']; referencedRelation: 'kb_documents'; referencedColumns: ['id'] }];
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          session_token: string;
          language: 'mn' | 'en';
          started_at: string;
          last_message_at: string;
          is_escalated: boolean;
          escalated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_token?: string;
          language?: 'mn' | 'en';
          started_at?: string;
          last_message_at?: string;
          is_escalated?: boolean;
          escalated_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['chat_sessions']['Insert']>;
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          language: string;
          retrieved_chunk_ids: string[] | null;
          tokens_used: number | null;
          response_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          language?: string;
          retrieved_chunk_ids?: string[] | null;
          tokens_used?: number | null;
          response_time_ms?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>;
        Relationships: [{ foreignKeyName: 'chat_messages_session_id_fkey'; columns: ['session_id']; referencedRelation: 'chat_sessions'; referencedColumns: ['id'] }];
      };
      operator_handoffs: {
        Row: {
          id: string;
          session_id: string;
          user_id: string | null;
          reason: string | null;
          status: 'waiting' | 'assigned' | 'resolved';
          assigned_to: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          reason?: string | null;
          status?: 'waiting' | 'assigned' | 'resolved';
          assigned_to?: string | null;
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['operator_handoffs']['Insert']>;
        Relationships: [{ foreignKeyName: 'operator_handoffs_session_id_fkey'; columns: ['session_id']; referencedRelation: 'chat_sessions'; referencedColumns: ['id'] }];
      };
      // ── Map / Indoor Navigation (Sprint 4-B) ─────────────────────
      map_pois: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          description: string | null;
          description_en: string | null;
          category: 'venue' | 'hotel' | 'restaurant' | 'transport' | 'attraction' | 'medical' | 'other';
          latitude: number;
          longitude: number;
          address: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          description?: string | null;
          description_en?: string | null;
          category?: 'venue' | 'hotel' | 'restaurant' | 'transport' | 'attraction' | 'medical' | 'other';
          latitude: number;
          longitude: number;
          address?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          description?: string | null;
          description_en?: string | null;
          category?: 'venue' | 'hotel' | 'restaurant' | 'transport' | 'attraction' | 'medical' | 'other';
          latitude?: number;
          longitude?: number;
          address?: string | null;
          image_url?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      floor_plans: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          floor_number: number;
          svg_url: string | null;
          svg_content: string | null;
          width_meters: number | null;
          height_meters: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          floor_number?: number;
          svg_url?: string | null;
          svg_content?: string | null;
          width_meters?: number | null;
          height_meters?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_en?: string | null;
          floor_number?: number;
          svg_url?: string | null;
          svg_content?: string | null;
          width_meters?: number | null;
          height_meters?: number | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      indoor_zones: {
        Row: {
          id: string;
          floor_plan_id: string;
          name: string;
          name_en: string | null;
          zone_type: 'room' | 'hall' | 'registration' | 'restaurant' | 'medical' | 'toilet' | 'exit' | 'shop' | 'stage';
          x_percent: number;
          y_percent: number;
          width_percent: number;
          height_percent: number;
          color: string;
          qr_code: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          floor_plan_id: string;
          name: string;
          name_en?: string | null;
          zone_type?: 'room' | 'hall' | 'registration' | 'restaurant' | 'medical' | 'toilet' | 'exit' | 'shop' | 'stage';
          x_percent: number;
          y_percent: number;
          width_percent?: number;
          height_percent?: number;
          color?: string;
          qr_code?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          floor_plan_id?: string;
          name?: string;
          name_en?: string | null;
          zone_type?: 'room' | 'hall' | 'registration' | 'restaurant' | 'medical' | 'toilet' | 'exit' | 'shop' | 'stage';
          x_percent?: number;
          y_percent?: number;
          width_percent?: number;
          height_percent?: number;
          color?: string;
          qr_code?: string | null;
          is_active?: boolean;
        };
        Relationships: [{ foreignKeyName: 'indoor_zones_floor_plan_id_fkey'; columns: ['floor_plan_id']; referencedRelation: 'floor_plans'; referencedColumns: ['id'] }];
      };
      qr_checkpoints: {
        Row: {
          id: string;
          zone_id: string;
          qr_code: string;
          label: string | null;
          label_en: string | null;
          scanned_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          zone_id: string;
          qr_code: string;
          label?: string | null;
          label_en?: string | null;
          scanned_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          zone_id?: string;
          qr_code?: string;
          label?: string | null;
          label_en?: string | null;
          scanned_count?: number;
        };
        Relationships: [{ foreignKeyName: 'qr_checkpoints_zone_id_fkey'; columns: ['zone_id']; referencedRelation: 'indoor_zones'; referencedColumns: ['id'] }];
      };
      user_locations: {
        Row: {
          id: string;
          user_id: string;
          zone_id: string | null;
          checkpoint_id: string | null;
          located_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          zone_id?: string | null;
          checkpoint_id?: string | null;
          located_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          zone_id?: string | null;
          checkpoint_id?: string | null;
          located_at?: string;
        };
        Relationships: [
          { foreignKeyName: 'user_locations_user_id_fkey'; columns: ['user_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'user_locations_zone_id_fkey'; columns: ['zone_id']; referencedRelation: 'indoor_zones'; referencedColumns: ['id'] },
          { foreignKeyName: 'user_locations_checkpoint_id_fkey'; columns: ['checkpoint_id']; referencedRelation: 'qr_checkpoints'; referencedColumns: ['id'] }
        ];
      };
      // ── Sprint 5: Green + Admin ────────────────────────────────────
      step_logs: {
        Row: {
          id: string;
          user_id: string;
          steps: number;
          date: string;
          co2_saved_grams: number;
          source: 'healthkit' | 'health_connect' | 'manual';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          steps: number;
          date?: string;
          co2_saved_grams?: number;
          source?: 'healthkit' | 'health_connect' | 'manual';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['step_logs']['Insert']>;
        Relationships: [
          { foreignKeyName: 'step_logs_user_id_fkey'; columns: ['user_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] }
        ];
      };
      badges: {
        Row: {
          id: string;
          name: string;
          name_en: string | null;
          description: string | null;
          description_en: string | null;
          icon: string;
          requirement_steps: number;
          badge_type: 'steps' | 'co2' | 'attendance' | 'special';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_en?: string | null;
          description?: string | null;
          description_en?: string | null;
          icon: string;
          requirement_steps?: number;
          badge_type?: 'steps' | 'co2' | 'attendance' | 'special';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['badges']['Insert']>;
        Relationships: [];
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_badges']['Insert']>;
        Relationships: [
          { foreignKeyName: 'user_badges_user_id_fkey'; columns: ['user_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'user_badges_badge_id_fkey'; columns: ['badge_id']; referencedRelation: 'badges'; referencedColumns: ['id'] }
        ];
      };
      complaints: {
        Row: {
          id: string;
          user_id: string | null;
          subject: string;
          description: string;
          category: 'general' | 'service' | 'technical' | 'safety' | 'other';
          status: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority: 'low' | 'normal' | 'high' | 'urgent';
          assigned_to: string | null;
          resolved_at: string | null;
          sla_deadline: string | null;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          subject: string;
          description: string;
          category?: 'general' | 'service' | 'technical' | 'safety' | 'other';
          status?: 'open' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          assigned_to?: string | null;
          resolved_at?: string | null;
          sla_deadline?: string | null;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['complaints']['Insert']>;
        Relationships: [
          { foreignKeyName: 'complaints_user_id_fkey'; columns: ['user_id']; referencedRelation: 'profiles'; referencedColumns: ['id'] }
        ];
      };
    };
    Views: {
      leaderboard: {
        Row: {
          user_id: string;
          full_name: string | null;
          country: string | null;
          organization: string | null;
          total_steps: number;
          total_co2_saved: number;
          badge_count: number;
        };
        Relationships: [];
      };
    };
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
      increment_otp_attempts: {
        Args: { p_email: string };
        Returns: void;
      };
      increment_session_count: {
        Args: { p_session_id: string };
        Returns: void;
      };
      decrement_session_count: {
        Args: { p_session_id: string };
        Returns: void;
      };
      search_kb_chunks: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
        };
        Returns: {
          id: string;
          document_id: string;
          content: string;
          content_en: string | null;
          similarity: number;
        }[];
      };
      search_kb_keyword: {
        Args: {
          query_text: string;
          match_count?: number;
        };
        Returns: {
          id: string;
          document_id: string;
          content: string;
          content_en: string | null;
          rank: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// ============================================================
// Sprint 2: Programme + Notifications types (extended)
// ============================================================

export type VenueRow = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  capacity: number;
  location: string | null;
  floor: number | null;
  map_coordinates: Json | null;
  is_active: boolean;
  created_at: string;
};

export type SpeakerRow = {
  id: string;
  full_name: string;
  full_name_en: string | null;
  title: string | null;
  title_en: string | null;
  organization: string | null;
  organization_en: string | null;
  bio: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  country: string | null;
  social_links: Json | null;
  is_active: boolean;
  created_at: string;
};

export type EventSessionRow = {
  id: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  session_type: 'general' | 'keynote' | 'workshop' | 'panel' | 'exhibition' | 'networking' | 'other';
  venue_id: string | null;
  starts_at: string;
  ends_at: string;
  capacity: number;
  registered_count: number;
  is_registration_open: boolean;
  zone: 'green' | 'blue' | 'both';
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type SessionSpeakerRow = {
  session_id: string;
  speaker_id: string;
  role: string;
  sort_order: number;
};

export type SeatRegistrationRow = {
  id: string;
  session_id: string;
  user_id: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  registered_at: string;
  cancelled_at: string | null;
};

export type AttendanceRow = {
  id: string;
  session_id: string;
  user_id: string;
  checked_in_at: string;
  check_in_method: 'qr' | 'nfc' | 'manual';
};

export type SessionSurveyRow = {
  id: string;
  session_id: string;
  user_id: string | null;
  rating: number | null;
  feedback: string | null;
  submitted_at: string;
};

export type UserAgendaRow = {
  user_id: string;
  session_id: string;
  added_at: string;
};

export type NotificationRow = {
  id: string;
  title: string;
  title_en: string | null;
  body: string;
  body_en: string | null;
  notification_type: 'general' | 'programme' | 'emergency' | 'system';
  target_roles: string[] | null;
  target_countries: string[] | null;
  sent_by: string | null;
  sent_at: string;
  is_emergency: boolean;
};

// ============================================================
// Sprint 3: Services + Payment types
// ============================================================

export type ProductRow = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  category: 'merchandise' | 'food' | 'ticket' | 'other';
  stock_count: number;
  is_active: boolean;
  created_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string | null;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  total_amount: number;
  currency: string;
  payment_method: string | null;
  payment_ref: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  cancelled_at: string | null;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type WalletRow = {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  updated_at: string;
};

export type WalletTransactionRow = {
  id: string;
  wallet_id: string;
  user_id: string | null;
  type: 'topup' | 'purchase' | 'refund' | 'transfer';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_id: string | null;
  idempotency_key: string | null;
  description: string | null;
  created_at: string;
};

export type TransportBookingRow = {
  id: string;
  user_id: string | null;
  type: 'taxi' | 'rental' | 'shuttle' | 'airport_transfer';
  pickup_location: string | null;
  dropoff_location: string | null;
  pickup_time: string | null;
  flight_number: string | null;
  passenger_count: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  provider_ref: string | null;
  notes: string | null;
  order_id: string | null;
  created_at: string;
};

export type RestaurantBookingRow = {
  id: string;
  user_id: string | null;
  restaurant_name: string;
  table_qr_code: string | null;
  booking_time: string;
  party_size: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  special_requests: string | null;
  order_id: string | null;
  created_at: string;
};

export type RestaurantRow = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  cuisine_type: string | null;
  location: string | null;
  opening_hours: Json | null;
  image_url: string | null;
  qr_table_prefix: string | null;
  is_active: boolean;
  created_at: string;
};

export type HotelRow = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  address: string | null;
  stars: number | null;
  image_url: string | null;
  booking_url: string | null;
  phone: string | null;
  distance_km: number | null;
  is_active: boolean;
  created_at: string;
};

export type LostFoundItemRow = {
  id: string;
  reporter_id: string | null;
  type: 'lost' | 'found';
  item_name: string;
  description: string | null;
  image_url: string | null;
  last_seen_location: string | null;
  contact_info: string | null;
  status: 'open' | 'resolved' | 'closed';
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type QPayInvoiceRow = {
  id: string;
  order_id: string | null;
  user_id: string | null;
  invoice_id: string | null;
  qr_text: string | null;
  qr_image: string | null;
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  expires_at: string | null;
  paid_at: string | null;
  callback_data: Json | null;
  created_at: string;
};

// RPC function return types
export type WalletDebitResult = {
  success: boolean;
  error?: string;
  transaction_id?: string;
  new_balance?: number;
  idempotent?: boolean;
};

export type WalletCreditResult = {
  success: boolean;
  error?: string;
  transaction_id?: string;
  new_balance?: number;
  idempotent?: boolean;
};

// ── AI / RAG Types (Sprint 4-A) ────────────────────────────────

export type KbDocumentRow = {
  id: string;
  title: string;
  title_en: string | null;
  content: string;
  content_en: string | null;
  category: 'programme' | 'faq' | 'venue' | 'service' | 'general' | 'emergency';
  source_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type KbChunkRow = {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  content_en: string | null;
  embedding: number[] | null;
  token_count: number | null;
  created_at: string;
};

export type ChatSessionRow = {
  id: string;
  user_id: string | null;
  session_token: string;
  language: 'mn' | 'en';
  started_at: string;
  last_message_at: string;
  is_escalated: boolean;
  escalated_at: string | null;
};

export type ChatMessageRow = {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  language: string;
  retrieved_chunk_ids: string[] | null;
  tokens_used: number | null;
  response_time_ms: number | null;
  created_at: string;
};

export type OperatorHandoffRow = {
  id: string;
  session_id: string;
  user_id: string | null;
  reason: string | null;
  status: 'waiting' | 'assigned' | 'resolved';
  assigned_to: string | null;
  created_at: string;
  resolved_at: string | null;
};

// RPC search result types
export type SearchKbChunksResult = {
  id: string;
  document_id: string;
  content: string;
  content_en: string | null;
  similarity: number;
};

export type SearchKbKeywordResult = {
  id: string;
  document_id: string;
  content: string;
  content_en: string | null;
  rank: number;
};

// ── Map / Indoor Navigation Types (Sprint 4-B) ────────────────────────────────

export type MapPoiRow = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  category: 'venue' | 'hotel' | 'restaurant' | 'transport' | 'attraction' | 'medical' | 'other';
  latitude: number;
  longitude: number;
  address: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type FloorPlanRow = {
  id: string;
  name: string;
  name_en: string | null;
  floor_number: number;
  svg_url: string | null;
  svg_content: string | null;
  width_meters: number | null;
  height_meters: number | null;
  is_active: boolean;
  created_at: string;
};

export type IndoorZoneRow = {
  id: string;
  floor_plan_id: string;
  name: string;
  name_en: string | null;
  zone_type: 'room' | 'hall' | 'registration' | 'restaurant' | 'medical' | 'toilet' | 'exit' | 'shop' | 'stage';
  x_percent: number;
  y_percent: number;
  width_percent: number;
  height_percent: number;
  color: string;
  qr_code: string | null;
  is_active: boolean;
  created_at: string;
};

export type QrCheckpointRow = {
  id: string;
  zone_id: string;
  qr_code: string;
  label: string | null;
  label_en: string | null;
  scanned_count: number;
  created_at: string;
};

export type UserLocationRow = {
  id: string;
  user_id: string;
  zone_id: string | null;
  checkpoint_id: string | null;
  located_at: string;
};

// ── Sprint 5: Green + Admin Types ────────────────────────────────────

export type StepLogRow = {
  id: string;
  user_id: string;
  steps: number;
  date: string;
  co2_saved_grams: number;
  source: 'healthkit' | 'health_connect' | 'manual';
  created_at: string;
  updated_at: string;
};

export type BadgeRow = {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  icon: string;
  requirement_steps: number;
  badge_type: 'steps' | 'co2' | 'attendance' | 'special';
  created_at: string;
};

export type UserBadgeRow = {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
};

export type ComplaintRow = {
  id: string;
  user_id: string | null;
  subject: string;
  description: string;
  category: 'general' | 'service' | 'technical' | 'safety' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_to: string | null;
  resolved_at: string | null;
  sla_deadline: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LeaderboardRow = {
  user_id: string;
  full_name: string | null;
  country: string | null;
  organization: string | null;
  total_steps: number;
  total_co2_saved: number;
  badge_count: number;
};
