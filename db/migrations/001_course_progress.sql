ALTER TABLE courses
ADD COLUMN IF NOT EXISTS progress INT NOT NULL DEFAULT 0
CHECK (progress BETWEEN 0 AND 100);

UPDATE courses
SET progress = 100
WHERE completed = TRUE AND progress = 0;