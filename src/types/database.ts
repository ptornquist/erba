export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TurnoverBand =
  | "under_2m"
  | "from_2m_to_10m"
  | "from_10m_to_50m"
  | "over_50m";

export type VerificationStatus =
  | "self_reported"
  | "evidence_supplied"
  | "verified";

export interface PainSubmission {
  id: string;
  company_id: string;
  regulation_name: string;
  description: string;
  internal_admin_cost_eur: number;
  external_compliance_cost_eur: number;
  estimated_cost_eur: number;
  verification_status: VerificationStatus;
  scm_tool_reference: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          referral_code: string;
          referred_by: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          referral_code: string;
          referred_by?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          referral_code?: string;
          referred_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey";
            columns: ["referred_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["referral_code"];
          },
        ];
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          turnover_band: TurnoverBand;
          industry: string;
          is_anonymous: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          turnover_band: TurnoverBand;
          industry: string;
          is_anonymous?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          turnover_band?: TurnoverBand;
          industry?: string;
          is_anonymous?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "companies_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      pain_submissions: {
        Row: {
          id: string;
          company_id: string;
          regulation_name: string;
          description: string;
          internal_admin_cost_eur: string;
          external_compliance_cost_eur: string;
          estimated_cost_eur: string;
          verification_status: VerificationStatus;
          scm_tool_reference: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          regulation_name: string;
          description: string;
          internal_admin_cost_eur: number | string;
          external_compliance_cost_eur: number | string;
          estimated_cost_eur: number | string;
          verification_status?: VerificationStatus;
          scm_tool_reference?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          regulation_name?: string;
          description?: string;
          internal_admin_cost_eur?: number | string;
          external_compliance_cost_eur?: number | string;
          estimated_cost_eur?: number | string;
          verification_status?: VerificationStatus;
          scm_tool_reference?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pain_submissions_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      document_vault: {
        Row: {
          id: string;
          company_id: string;
          pain_submission_id: string | null;
          file_name: string;
          storage_path: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          pain_submission_id?: string | null;
          file_name: string;
          storage_path: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          pain_submission_id?: string | null;
          file_name?: string;
          storage_path?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_vault_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_vault_pain_submission_id_fkey";
            columns: ["pain_submission_id"];
            isOneToOne: false;
            referencedRelation: "pain_submissions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      turnover_band: TurnoverBand;
      verification_status: VerificationStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<TableName extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][TableName]["Row"];

export type TablesInsert<TableName extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<TableName extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][TableName]["Update"];

export type Enums<EnumName extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][EnumName];

export type User = Tables<"users">;
export type Profile = Tables<"profiles">;
export type Company = Tables<"companies">;

export const Constants = {
  public: {
    Enums: {
      turnover_band: [
        "under_2m",
        "from_2m_to_10m",
        "from_10m_to_50m",
        "over_50m",
      ] as const satisfies readonly TurnoverBand[],
      verification_status: [
        "self_reported",
        "evidence_supplied",
        "verified",
      ] as const satisfies readonly VerificationStatus[],
    },
  },
} as const;
