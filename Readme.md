# My Learning App

A personal learning tracker for saving courses and learning resources from sites such as Codecademy and Coursera. Users add their own links, organize them with skill labels, track planned hours and completion progress, and review their learning activity.

## Current Capabilities

- Register and sign in with a username/email and password.
- Create, edit, and delete course records with a title, description, link, planned hours, progress, and skill labels.
- Update hours and progress inline; edits are batched and saved after two seconds without further changes.
- Search loaded courses locally by title, description, link, and skill labels. Skill entry includes autocomplete suggestions and accepts custom labels.
- View an overview of planned hours, progress, completed courses, active courses, and focus skills.
- Review course activity history and filter activity types.
- View skill insights derived from course labels, progress, and recent updates.
- Set a weekly active-day goal and timezone. The sidebar streak is calculated from recorded course activity in that timezone.
- Receive top-bar notifications for recent course activity.

Course links and details are entered by the user; the app does not import course catalogs or course content from external providers.

## Data Scope

Planned hours are estimates, not a record of time actually spent studying. Activity history and streaks are recorded when courses are added, changed, completed, or deleted through the app. Historical activity from before the activity migration cannot be reconstructed.

## Stack

| Layer | Technology |
| --- | --- |
| Database | PostgreSQL |
| Backend | Node.js, Express 5 |
| Frontend | React 19, Vite, Redux Toolkit |
| Tests | Node `node:test`, Supertest; Vitest, React Testing Library |

## Project Layout

my_learning_app/
  app/                 React frontend, pages, components, hooks, tests
  controllers/         PostgreSQL pool and authentication helpers
  db/                  Initial schema and SQL migrations
  routes/              Authentication, course, and learning APIs
  test/                Backend API tests
  server.js            Express application entry point

## Requirements

- Node.js compatible with Vite 8
- PostgreSQL






