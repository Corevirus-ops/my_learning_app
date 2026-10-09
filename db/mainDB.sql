
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    facebook_id VARCHAR(100) UNIQUE,
    google_id VARCHAR(100) UNIQUE
);


-- Courses contains courses the user provides to track their own learning. Users provide course links to the courses they are tracking.
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hours_to_complete INT,
    completed BOOLEAN DEFAULT FALSE,
    user_id INT NOT NULL REFERENCES users(id),
    course_link VARCHAR(255),
    labels TEXT[],
    progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learning_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(id) ON DELETE SET NULL,
    course_title VARCHAR(100) NOT NULL,
    activity_type VARCHAR(32) NOT NULL CHECK (activity_type IN ('course_added', 'course_updated', 'progress_updated', 'course_completed', 'course_deleted')),
    progress INT CHECK (progress BETWEEN 0 AND 100),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX learning_activity_user_date_idx ON learning_activity (user_id, created_at DESC);

CREATE TABLE user_settings (
    user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    weekly_active_goal SMALLINT NOT NULL DEFAULT 5 CHECK (weekly_active_goal BETWEEN 1 AND 7),
    timezone TEXT NOT NULL DEFAULT 'UTC',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);










