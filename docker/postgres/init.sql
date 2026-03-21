-- MoodleNext - PostgreSQL Init Script
-- This script runs automatically when the PostgreSQL container starts for the first time

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Trigram similarity for fuzzy search
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- GIN index for common types
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- Cryptographic functions

-- ============================================
-- Performance tuning (4 CPU, 1GB RAM baseline)
-- ============================================
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '768MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET max_parallel_workers_per_gather = 2;
ALTER SYSTEM SET max_parallel_workers = 4;

-- Connection management
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';
ALTER SYSTEM SET statement_timeout = '60s';

-- WAL optimization
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET max_wal_size = '1GB';
ALTER SYSTEM SET min_wal_size = '512MB';

-- JIT compilation for complex queries
ALTER SYSTEM SET jit = 'on';
ALTER SYSTEM SET jit_above_cost = 100000;

-- Autovacuum tuning for high-write tables
ALTER SYSTEM SET autovacuum_max_workers = 4;
ALTER SYSTEM SET autovacuum_naptime = '30s';
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.05;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.02;

-- Logging
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1 second
ALTER SYSTEM SET log_checkpoints = 'on';
ALTER SYSTEM SET log_connections = 'on';
ALTER SYSTEM SET log_disconnections = 'on';
ALTER SYSTEM SET log_lock_waits = 'on';
ALTER SYSTEM SET log_temp_files = 0;                  -- Log all temp file usage

SELECT pg_reload_conf();

-- ============================================
-- Indexes for common query patterns
-- These run after TypeORM creates tables (idempotent)
-- ============================================

-- Users: login lookups, search
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user') THEN
    CREATE INDEX IF NOT EXISTS idx_user_email_lower ON "user" (LOWER(email));
    CREATE INDEX IF NOT EXISTS idx_user_username_lower ON "user" (LOWER(username));
    CREATE INDEX IF NOT EXISTS idx_user_active ON "user" (is_active) WHERE is_active = true;
    CREATE INDEX IF NOT EXISTS idx_user_search_trgm ON "user" USING gin (
      (first_name || ' ' || last_name || ' ' || username || ' ' || email) gin_trgm_ops
    );
  END IF;
END $$;

-- Courses: listing, filtering, search
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course') THEN
    CREATE INDEX IF NOT EXISTS idx_course_visibility ON "course" (visibility) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_course_category ON "course" (category_id) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_course_featured ON "course" (is_featured) WHERE is_featured = true AND deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_course_creator ON "course" (creator_id);
    CREATE INDEX IF NOT EXISTS idx_course_search_trgm ON "course" USING gin (
      (full_name || ' ' || short_name) gin_trgm_ops
    );
  END IF;
END $$;

-- Enrollments: user+course lookups, status filtering
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollment') THEN
    CREATE INDEX IF NOT EXISTS idx_enrollment_user_status ON "enrollment" (user_id, status) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_enrollment_course_status ON "enrollment" (course_id, status) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_enrollment_active ON "enrollment" (course_id) WHERE status = 'active' AND deleted_at IS NULL;
  END IF;
END $$;

-- Activities: course listing, ordering
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity') THEN
    CREATE INDEX IF NOT EXISTS idx_activity_course_section ON "activity" (course_id, section, sort_order) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_activity_due_date ON "activity" (due_date) WHERE due_date IS NOT NULL AND deleted_at IS NULL;
  END IF;
END $$;

-- Grades: user+course lookups, aggregation
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'grade') THEN
    CREATE INDEX IF NOT EXISTS idx_grade_user_course ON "grade" (user_id, course_id) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_grade_activity ON "grade" (activity_id) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_grade_status ON "grade" (status) WHERE deleted_at IS NULL;
  END IF;
END $$;

-- Messages: inbox/sent queries
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message') THEN
    CREATE INDEX IF NOT EXISTS idx_message_recipient_inbox ON "message" (recipient_id, created_at DESC) WHERE recipient_deleted = false;
    CREATE INDEX IF NOT EXISTS idx_message_sender_sent ON "message" (sender_id, created_at DESC) WHERE sender_deleted = false;
    CREATE INDEX IF NOT EXISTS idx_message_unread ON "message" (recipient_id) WHERE status != 'read' AND recipient_deleted = false;
  END IF;
END $$;

-- Calendar: date range queries
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_event') THEN
    CREATE INDEX IF NOT EXISTS idx_calendar_date_range ON "calendar_event" (start_time, end_time) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_calendar_user ON "calendar_event" (user_id, start_time) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_calendar_course ON "calendar_event" (course_id, start_time) WHERE deleted_at IS NULL;
  END IF;
END $$;

-- Categories: tree navigation
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'category') THEN
    CREATE INDEX IF NOT EXISTS idx_category_parent ON "category" (parent_id) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_category_visible ON "category" (is_visible, sort_order) WHERE deleted_at IS NULL;
  END IF;
END $$;

-- Files: context lookups
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'file') THEN
    CREATE INDEX IF NOT EXISTS idx_file_context ON "file" (context, context_id) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_file_uploader ON "file" (uploaded_by, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_file_hash ON "file" (hash) WHERE hash IS NOT NULL;
  END IF;
END $$;
