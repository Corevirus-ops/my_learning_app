
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    facebook_id VARCHAR(100) UNIQUE,
    google_id VARCHAR(100) UNIQUE
);


CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    course_link VARCHAR(255)
);

-- Courses can have many labels, each representing what the course provides like javascript knowledge or ruby etc.
CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_labels (
    course_id INT NOT NULL REFERENCES courses(id),
    label_id INT NOT NULL REFERENCES labels(id),
    PRIMARY KEY (course_id, label_id)
);

-- Users can have many labels, each representing their skills or interests.
CREATE TABLE user_labels (
    user_id INT NOT NULL REFERENCES users(id),
    label_id INT NOT NULL REFERENCES labels(id),
    PRIMARY KEY (user_id, label_id)
);







