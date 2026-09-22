/**
 * Strict TypeScript representation of the ERBA Supabase schema.
 *
 * Tables:
 *  - profiles          one row per authenticated user
 *  - companies         one (or more) companies owned by a profile
 *  - pain_submissions  regulatory-burden data points reported by a company
 */

export type UUID = string;
/** ISO-8601 string as returned by PostgREST for TIMESTAMPTZ columns. */
export type Timestamptz = string;

export type VerificationStatus =
  | "self_reported"
  | "evidence_supplied"
  | "verified";

export type Profile = {
  id: UUID;
  email: string;
  referral_code: string;
  referred_by: string | null;
  /** Granted only by a privileged SQL or service-role write. */
  is_admin: boolean;
  created_at: Timestamptz;
};

export type Company = {
  id: UUID;
  profile_id: UUID;
  name: string;
  turnover_band: string;
  industry: string;
  is_anonymous: boolean;
  created_at: Timestamptz;
};

export type PainSubmission = {
  id: UUID;
  company_id: UUID;
  regulation_name: string;
  /** NUMERIC columns are serialised as strings by PostgREST unless cast; keep both. */
  estimated_cost_eur: number | string;
  description: string | null;
  verification_status: VerificationStatus;
  created_at: Timestamptz;
};

export type ProfileInsert = Omit<Profile, "created_at" | "is_admin"> &
  Partial<Pick<Profile, "created_at" | "is_admin">>;
export type ProfileUpdate = Partial<Profile>;

export type CompanyInsert = Omit<Company, "id" | "created_at"> &
  Partial<Pick<Company, "id" | "created_at">>;
export type CompanyUpdate = Partial<Company>;

export type PainSubmissionInsert = Omit<
  PainSubmission,
  "id" | "created_at" | "verification_status"
> &
  Partial<Pick<PainSubmission, "id" | "created_at" | "verification_status">>;
export type PainSubmissionUpdate = Partial<PainSubmission>;

export const IMPACT_LEVELS = ["High", "Med", "Low"] as const;
export type ImpactLevel = (typeof IMPACT_LEVELS)[number];

/** Curated regulatory intelligence feed, maintained by ERBA policy staff. */
export type PolicyUpdate = {
  id: UUID;
  title: string;
  summary: string;
  impact_level: ImpactLevel;
  /** DATE column, serialised as YYYY-MM-DD. */
  date_issued: string;
};

export type PolicyUpdateInsert = Omit<PolicyUpdate, "id"> &
  Partial<Pick<PolicyUpdate, "id">>;
export type PolicyUpdateUpdate = Partial<PolicyUpdate>;

/** A compliance action item scoped to one company (and tagged with its industry). */
export type ComplianceTask = {
  id: UUID;
  company_id: UUID;
  industry: string;
  task_description: string;
  is_completed: boolean;
};

export type ComplianceTaskInsert = Omit<ComplianceTask, "id" | "is_completed"> &
  Partial<Pick<ComplianceTask, "id" | "is_completed">>;
export type ComplianceTaskUpdate = Partial<ComplianceTask>;

/** Metadata for a compliance certificate or evidence file held by a company. */
export type DocumentVaultItem = {
  id: UUID;
  company_id: UUID;
  file_name: string;
  file_url: string;
  /** Private storage object used by the admin evidence route. */
  storage_path?: string | null;
  pain_submission_id?: UUID | null;
  uploaded_at: Timestamptz;
};

export type DocumentVaultItemInsert = Omit<DocumentVaultItem, "id" | "uploaded_at"> &
  Partial<Pick<DocumentVaultItem, "id" | "uploaded_at">>;
export type DocumentVaultItemUpdate = Partial<DocumentVaultItem>;

/** A post in the Alliance Networking Hub, authored on behalf of a company. */
export type ForumPost = {
  id: UUID;
  company_id: UUID;
  content: string;
  created_at: Timestamptz;
};

export type ForumPostInsert = Omit<ForumPost, "id" | "created_at"> &
  Partial<Pick<ForumPost, "id" | "created_at">>;
export type ForumPostUpdate = Partial<ForumPost>;

/**
 * Database type in the shape expected by `createClient<Database>()`.
 * Enables fully-typed `.from("table")` queries.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      companies: {
        Row: Company;
        Insert: CompanyInsert;
        Update: CompanyUpdate;
        Relationships: [
          {
            foreignKeyName: "companies_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      pain_submissions: {
        Row: PainSubmission;
        Insert: PainSubmissionInsert;
        Update: PainSubmissionUpdate;
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
      policy_updates: {
        Row: PolicyUpdate;
        Insert: PolicyUpdateInsert;
        Update: PolicyUpdateUpdate;
        Relationships: [];
      };
      compliance_tasks: {
        Row: ComplianceTask;
        Insert: ComplianceTaskInsert;
        Update: ComplianceTaskUpdate;
        Relationships: [
          {
            foreignKeyName: "compliance_tasks_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      document_vault: {
        Row: DocumentVaultItem;
        Insert: DocumentVaultItemInsert;
        Update: DocumentVaultItemUpdate;
        Relationships: [
          {
            foreignKeyName: "document_vault_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_posts: {
        Row: ForumPost;
        Insert: ForumPostInsert;
        Update: ForumPostUpdate;
        Relationships: [
          {
            foreignKeyName: "forum_posts_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      referral_count: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
