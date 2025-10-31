import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Database } from '../../database.types';
import { FilterJobsDto } from './dto/filter-jobs.dto';

type Job = Database['public']['Tables']['jobs']['Row'];
type UserJobInteraction =
  Database['public']['Tables']['user_job_interactions']['Row'];

export interface JobWithInteraction extends Job {
  userInteraction?: {
    hasApplied: boolean;
    hasSaved: boolean;
  };
}

export interface PaginatedJobsResponse {
  data: JobWithInteraction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class JobsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(filters: FilterJobsDto): Promise<PaginatedJobsResponse> {
    const supabase = this.supabaseService.getClient();
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`,
      );
    }

    if (filters.jobType) {
      query = query.eq('job_type', filters.jobType);
    }

    if (filters.experienceLevel) {
      query = query.eq('experience_level', filters.experienceLevel);
    }

    if (filters.remoteFriendly !== undefined) {
      query = query.eq('remote_friendly', filters.remoteFriendly);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.minSalary !== undefined) {
      query = query.gte('salary_min', filters.minSalary);
    }

    if (filters.maxSalary !== undefined) {
      query = query.lte('salary_max', filters.maxSalary);
    }

    const { data, error, count } = await query
      .order('posted_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    let jobsWithInteraction: JobWithInteraction[] = data || [];

    if (filters.userId && data && data.length > 0) {
      const jobIds = data.map((job) => job.id);

      const { data: interactions, error: interactionsError } = await supabase
        .from('user_job_interactions')
        .select('job_id, interaction_type')
        .eq('user_id', filters.userId)
        .in('job_id', jobIds);

      if (interactionsError) {
        throw new Error(
          `Failed to fetch user interactions: ${interactionsError.message}`,
        );
      }

      const interactionMap = new Map<
        string,
        { hasApplied: boolean; hasSaved: boolean }
      >();

      interactions?.forEach((interaction) => {
        if (!interactionMap.has(interaction.job_id)) {
          interactionMap.set(interaction.job_id, {
            hasApplied: false,
            hasSaved: false,
          });
        }
        const current = interactionMap.get(interaction.job_id)!;
        if (interaction.interaction_type === 'applied') {
          current.hasApplied = true;
        } else if (interaction.interaction_type === 'favorite') {
          current.hasSaved = true;
        }
      });

      jobsWithInteraction = data.map((job) => ({
        ...job,
        userInteraction: interactionMap.get(job.id) || {
          hasApplied: false,
          hasSaved: false,
        },
      }));
    }

    return {
      data: jobsWithInteraction,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(
    id: string,
    userId?: string,
  ): Promise<JobWithInteraction | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    let jobWithInteraction: JobWithInteraction = data;

    if (userId && data) {
      const { data: interactions, error: interactionsError } = await supabase
        .from('user_job_interactions')
        .select('interaction_type')
        .eq('user_id', userId)
        .eq('job_id', id);

      if (interactionsError) {
        throw new Error(
          `Failed to fetch user interactions: ${interactionsError.message}`,
        );
      }

      const userInteraction = {
        hasApplied: false,
        hasSaved: false,
      };

      interactions?.forEach((interaction) => {
        if (interaction.interaction_type === 'applied') {
          userInteraction.hasApplied = true;
        } else if (interaction.interaction_type === 'favorite') {
          userInteraction.hasSaved = true;
        }
      });

      jobWithInteraction = {
        ...data,
        userInteraction,
      };
    }

    return jobWithInteraction;
  }

  async saveJob(jobId: string, userId: string): Promise<UserJobInteraction> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('user_job_interactions')
      .insert({
        user_id: userId,
        job_id: jobId,
        interaction_type: 'favorite',
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate constraint error
      if (error.code === '23505') {
        throw new Error('Job already saved');
      }
      throw new Error(`Failed to save job: ${error.message}`);
    }

    return data;
  }

  async applyToJob(jobId: string, userId: string): Promise<UserJobInteraction> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('user_job_interactions')
      .insert({
        user_id: userId,
        job_id: jobId,
        interaction_type: 'applied',
      })
      .select()
      .single();

    if (error) {
      // Handle duplicate constraint error
      if (error.code === '23505') {
        throw new Error('Already applied to this job');
      }
      throw new Error(`Failed to apply to job: ${error.message}`);
    }

    return data;
  }
}
