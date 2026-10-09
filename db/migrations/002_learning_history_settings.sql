ALTER TABLE courses
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE courses
SET updated_at = created_at
WHERE updated_at IS NULL;

ALTER TABLE courses
ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN updated_at SET NOT NULL;

CREATE TABLE IF NOT EXISTS learning_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE SET NULL,
    course_title VARCHAR(100) NOT NULL,
    activity_type VARCHAR(32) NOT NULL CHECK (activity_type IN ('course_added', 'course_updated', 'progress_updated', 'course_completed', 'course_deleted')),
    progress INT CHECK (progress BETWEEN 0 AND 100),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS learning_activity_user_date_idx ON learning_activity (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    weekly_active_goal SMALLINT NOT NULL DEFAULT 5 CHECK (weekly_active_goal BETWEEN 1 AND 7),
    timezone TEXT NOT NULL DEFAULT 'UTC',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);