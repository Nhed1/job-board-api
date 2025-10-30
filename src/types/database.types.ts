export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          company_name: string;
          location: string;
          job_type: Database['public']['Enums']['job_type_enum'];
          salary_min: number | null;
          salary_max: number | null;
          currency: string;
          experience_level:
            | Database['public']['Enums']['experience_level_enum']
            | null;
          remote_friendly: boolean;
          skills_required: Json | null;
          posted_date: string;
          application_deadline: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          company_name: string;
          location: string;
          job_type: Database['public']['Enums']['job_type_enum'];
          salary_min?: number | null;
          salary_max?: number | null;
          currency?: string;
          experience_level?:
            | Database['public']['Enums']['experience_level_enum']
            | null;
          remote_friendly?: boolean;
          skills_required?: Json | null;
          posted_date?: string;
          application_deadline?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          company_name?: string;
          location?: string;
          job_type?: Database['public']['Enums']['job_type_enum'];
          salary_min?: number | null;
          salary_max?: number | null;
          currency?: string;
          experience_level?:
            | Database['public']['Enums']['experience_level_enum']
            | null;
          remote_friendly?: boolean;
          skills_required?: Json | null;
          posted_date?: string;
          application_deadline?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_job_interactions: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          interaction_type: Database['public']['Enums']['interaction_type_enum'];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          interaction_type: Database['public']['Enums']['interaction_type_enum'];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          interaction_type?: Database['public']['Enums']['interaction_type_enum'];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_job_interactions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_job_interactions_job_id_fkey';
            columns: ['job_id'];
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
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
      job_type_enum:
        | 'full_time'
        | 'part_time'
        | 'contract'
        | 'freelance'
        | 'internship';
      experience_level_enum:
        | 'entry'
        | 'junior'
        | 'mid'
        | 'senior'
        | 'lead'
        | 'principal';
      interaction_type_enum: 'view' | 'save' | 'apply' | 'share';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
