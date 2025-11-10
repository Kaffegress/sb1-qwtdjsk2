export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string
          title: string
          status: 'status1' | 'status2' | 'status3' | 'status4'
          created_at: string
          f1_locked_at: string | null
          owner_id: string
          problem: string | null
          user_ctx: string | null
          min_solution: string | null
          current_solution: string | null
          resource_assessment: string | null
          kpi_name: string | null
          kpi_baseline: string | null
          kpi_target: string | null
          first_measure_due: string | null
          risk_note: string | null
          pii_flag: boolean
          rbac_note: string | null
          artefact_url: string | null
          timebox_from: string | null
          timebox_to: string | null
          good_enough_demo: boolean
          good_enough_measure: boolean
          good_enough_log: boolean
          stopp_reason: string | null
          ryg_status: 'red' | 'yellow' | 'green' | null
          tags: string[]
        }
        Insert: {
          id?: string
          title: string
          status?: 'status1' | 'status2' | 'status3' | 'status4'
          created_at?: string
          f1_locked_at?: string | null
          owner_id: string
          problem?: string | null
          user_ctx?: string | null
          min_solution?: string | null
          current_solution?: string | null
          resource_assessment?: string | null
          kpi_name?: string | null
          kpi_baseline?: string | null
          kpi_target?: string | null
          first_measure_due?: string | null
          risk_note?: string | null
          pii_flag?: boolean
          rbac_note?: string | null
          artefact_url?: string | null
          timebox_from?: string | null
          timebox_to?: string | null
          good_enough_demo?: boolean
          good_enough_measure?: boolean
          good_enough_log?: boolean
          stopp_reason?: string | null
          ryg_status?: 'red' | 'yellow' | 'green' | null
          tags?: string[]
        }
        Update: {
          id?: string
          title?: string
          status?: 'status1' | 'status2' | 'status3' | 'status4'
          created_at?: string
          f1_locked_at?: string | null
          owner_id?: string
          problem?: string | null
          user_ctx?: string | null
          min_solution?: string | null
          current_solution?: string | null
          resource_assessment?: string | null
          kpi_name?: string | null
          kpi_baseline?: string | null
          kpi_target?: string | null
          first_measure_due?: string | null
          risk_note?: string | null
          pii_flag?: boolean
          rbac_note?: string | null
          artefact_url?: string | null
          timebox_from?: string | null
          timebox_to?: string | null
          good_enough_demo?: boolean
          good_enough_measure?: boolean
          good_enough_log?: boolean
          stopp_reason?: string | null
          ryg_status?: 'red' | 'yellow' | 'green' | null
          tags?: string[]
        }
      }
      comments: {
        Row: {
          id: string
          item_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          item_id: string
          user_id: string
          action: string
          old_value: Json | null
          new_value: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id: string
          action: string
          old_value?: Json | null
          new_value?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string
          action?: string
          old_value?: Json | null
          new_value?: Json | null
          created_at?: string
        }
      }
    }
  }
}
