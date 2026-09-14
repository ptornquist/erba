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

export type Profile = {
  id: UUID;
  email: string;
  referral_code: string;
  referred_by: string | null;
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
  created_at: Timestamptz;
};

export type ProfileInsert = Omit<Profile, "created_at"> &
  Partial<Pick<Profile, "created_at">>;
export type ProfileUpdate = Partial<Profile>;

export type CompanyInsert = Omit<Company, "id" | "created_at"> &
  Partial<Pick<Company, "id" | "created_at">>;
export type CompanyUpdate = Partial<Company>;

export type PainSubmissionInsert = Omit<PainSubmission, "id" | "created_at"> &
  Partial<Pick<PainSubmission, "id" | "created_at">>;
export type PainSubmissionUpdate = Partial<PainSubmission>;

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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
