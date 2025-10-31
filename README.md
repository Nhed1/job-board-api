## Overview

This Job Board API enables companies to post job opportunities and candidates to discover and apply for positions. The system supports job filtering, user interactions, and job management features.

### Key Features

- **Job Management**: Create, Get and Filter job postings
- **Application Tracking**: Track user interactions with job postings

## Technology Stack

- **Backend Framework**: NestJS
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd job-board-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory and add your Supabase credentials:

   ```properties
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. **Database Setup**

   Run the following SQL commands in your Supabase SQL editor to create the required tables:

   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Jobs table
   CREATE TABLE jobs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT NOT NULL,
     company_name VARCHAR(255) NOT NULL,
     location VARCHAR(255),
     job_type VARCHAR(50) NOT NULL,
     salary_min DECIMAL(10,2),
     salary_max DECIMAL(10,2),
     currency VARCHAR(3) DEFAULT 'USD',
     experience_level VARCHAR(50),
     remote_friendly BOOLEAN DEFAULT false,
     skills_required JSONB,
     posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     application_deadline TIMESTAMP WITH TIME ZONE,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- User job interactions table
   CREATE TABLE user_job_interactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
     interaction_type VARCHAR(50) NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, job_id, interaction_type)
   );

   -- Create indexes for better performance
   CREATE INDEX idx_jobs_company_name ON jobs(company_name);
   CREATE INDEX idx_jobs_location ON jobs(location);
   CREATE INDEX idx_jobs_job_type ON jobs(job_type);
   CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
   CREATE INDEX idx_jobs_remote_friendly ON jobs(remote_friendly);
   CREATE INDEX idx_jobs_is_active ON jobs(is_active);
   CREATE INDEX idx_jobs_posted_date ON jobs(posted_date);
   CREATE INDEX idx_user_job_interactions_user_id ON user_job_interactions(user_id);
   CREATE INDEX idx_user_job_interactions_job_id ON user_job_interactions(job_id);

   -- Enable Row Level Security (optional but recommended)
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_job_interactions ENABLE ROW LEVEL SECURITY;
   ```

5. **Mock the User in DB**

- Create a user with this id: "4c605843-7593-4e3f-b2e3-bfb87917f10a" as frontend will use it

6. **Start the application**

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

The API will be available at `http://localhost:3000`

## Database Schema

### Users Table

| Column     | Type         | Description                   |
| ---------- | ------------ | ----------------------------- |
| id         | UUID         | Primary key, auto-generated   |
| email      | VARCHAR(255) | User's email address (unique) |
| name       | VARCHAR(255) | User's full name              |
| created_at | TIMESTAMP    | Account creation timestamp    |
| updated_at | TIMESTAMP    | Last update timestamp         |

### Jobs Table

| Column               | Type          | Description                                      |
| -------------------- | ------------- | ------------------------------------------------ |
| id                   | UUID          | Primary key, auto-generated                      |
| title                | VARCHAR(255)  | Job title                                        |
| description          | TEXT          | Detailed job description                         |
| company_name         | VARCHAR(255)  | Company posting the job                          |
| location             | VARCHAR(255)  | Job location                                     |
| job_type             | VARCHAR(50)   | Employment type (full-time, part-time, contract) |
| salary_min           | DECIMAL(10,2) | Minimum salary                                   |
| salary_max           | DECIMAL(10,2) | Maximum salary                                   |
| currency             | VARCHAR(3)    | Salary currency (default: USD)                   |
| experience_level     | VARCHAR(50)   | Required experience level                        |
| remote_friendly      | BOOLEAN       | Remote work availability                         |
| skills_required      | JSONB         | Array of required skills                         |
| posted_date          | TIMESTAMP     | Job posting date                                 |
| application_deadline | TIMESTAMP     | Application deadline (optional)                  |
| is_active            | BOOLEAN       | Job status                                       |
| created_at           | TIMESTAMP     | Record creation timestamp                        |
| updated_at           | TIMESTAMP     | Last update timestamp                            |

### User Job Interactions Table

| Column           | Type        | Description                                  |
| ---------------- | ----------- | -------------------------------------------- |
| id               | UUID        | Primary key, auto-generated                  |
| user_id          | UUID        | Foreign key to users table                   |
| job_id           | UUID        | Foreign key to jobs table                    |
| interaction_type | VARCHAR(50) | Type of interaction (applied, saved, viewed) |
| created_at       | TIMESTAMP   | Interaction timestamp                        |

## API Endpoints

- `GET /jobs` - Get all active jobs with optional filtering
- `GET /jobs/:id` - Get job by id
- `POST /jobs/:id/save` - Save a Job
- `GET /jobs/:id/apply` - Apply to a job
- `DELETE /jobs/:id/interactions` - Remove job interaction

## Sample Data

### Job Entry

```json
{
  "id": "0f32e0c7-a45e-4eab-87a7-4b6101d1f82f",
  "title": "Frontend Developer",
  "description": "Build amazing user interfaces with React and TypeScript",
  "company_name": "TechCorp",
  "location": "San Francisco, CA",
  "job_type": "full-time",
  "salary_min": "80000.00",
  "salary_max": "120000.00",
  "currency": "USD",
  "experience_level": "mid",
  "remote_friendly": true,
  "skills_required": ["React", "TypeScript", "JavaScript", "CSS"],
  "posted_date": "2025-10-29T22:39:24.007677Z",
  "application_deadline": null,
  "is_active": true
}
```

### User Entry

```json
{
  "id": "4c605843-7593-4e3f-b2e3-bfb87917f10a",
  "email": "test@example.com",
  "name": "Test User",
  "created_at": "2025-10-29T22:39:24.007677Z",
  "updated_at": "2025-10-29T22:39:24.007677Z"
}
```

### User Interaction Entry

```json
{
  "id": "e401fd31-ece5-4581-bf8d-d29f75539f25",
  "user_id": "4c605843-7593-4e3f-b2e3-bfb87917f10a",
  "job_id": "0f32e0c7-a45e-4eab-87a7-4b6101d1f82f",
  "interaction_type": "applied",
  "created_at": "2025-10-31T10:47:24.390589Z"
}
```

## Development Approach & Trade-offs

### Architecture Decisions

**Supabase Integration**: Supabase Integration: Chosen for rapid development, real-time capabilities, and PostgreSQL compatibility.
Trade-off: While Supabase accelerates development by providing authentication, database management, and real-time subscriptions out-of-the-box, it creates dependency on their platform and pricing model.

**Database Design**: Normalized structure with separate tables for users, jobs, and interactions. This approach ensures data integrity and enables flexible querying but requires joins for complex operations.

### Key Design Patterns

- **DTO Validation**: Ensures data integrity at API boundaries
- **Modular Architecture**: Separate modules

### Performance Considerations

- Database indexing on frequently queried fields
- Pagination for large result sets
- Caching strategy for popular job searches

## Future Improvements

Given more development time, the following enhancements would be valuable:

### Technical Enhancements

- **Rate Limiting**: Add API rate limiting to prevent abuse
- **File Upload**: Support for resume uploads and company logos
- **Authentication**: Add the built-in authentication from supabase
- **Email Notifications**: Automated email alerts for job matches and applications

### Feature Additions

- **Advanced Filtering**: Salary ranges, benefits, company size filters
- **Company Profiles**: Dedicated company pages

### Security Enhancements

- **OAuth Integration**: Support for Google, LinkedIn, GitHub authentication
