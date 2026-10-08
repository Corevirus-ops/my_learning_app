# My Learning App

A learning-assistant web app built with the **PERN** stack (PostgreSQL, Express, React, Node.js). It aggregates courses from platforms like Codecademy and Coursera, tracks progress, detects overlapping content, and recommends what to learn next based on gaps.

## Features

- **Course catalog**: Reference courses from Codecademy, Coursera, and others.
- **Time tracking**: Total time per course, the sum across all courses, and time spent so far.
- **Progress tracking**: Completion percentage per course and overall.
- **Overlap detection**: Compare topics/syllabi across courses to flag redundant content.
- **Learning history**: Breakdown of completed and in-progress courses by topic, provider, and time.
- **Gap analysis**: Suggests what to learn next based on missing topics and prerequisites.

## Tech Stack

| Layer    | Technology       |
|----------|------------------|
| Database | PostgreSQL       |
| Backend  | Node.js, Express |
| Frontend | React            |

## Project Structure

    my_learning_app/
    │   ├── routes/
    │   ├── app/           # React frontend
    │   ├── controllers/
    │   ├── services/      # overlap + gap analysis
    │   └── db/            # schema, migrations
    └── README.md




