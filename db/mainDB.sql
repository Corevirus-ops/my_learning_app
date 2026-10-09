
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
    progress INT NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100)
);










