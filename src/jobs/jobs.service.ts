import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Database } from '../types/database.types';
import { FilterJobsDto } from './dto/filter-jobs.dto';

type Job = Database['public']['Tables']['jobs']['Row'];
type UserJobInteraction =
  Database['public']['Tables']['user_job_interactions']['Row'];

export interface PaginatedJobsResponse {
  data: Job[];
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

    return {
      data: data || [],
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<Job | null> {
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

    return data;
  }

  async saveJob(jobId: string, userId: string): Promise<UserJobInteraction> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('user_job_interactions')
      .insert({
        user_id: userId,
        job_id: jobId,
        interaction_type: 'save',
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
        interaction_type: 'apply',
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
