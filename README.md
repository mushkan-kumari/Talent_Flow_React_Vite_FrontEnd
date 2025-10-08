# TalentFlow – Mini Hiring Platform (Front End Only)

TalentFlow is a front-end React application designed as a mini hiring platform for HR teams.

It allows users to manage jobs, candidates, and assessments, without an actual backend , which is stimulated through a "API" layer and local persistence.

 ## Project Overview

TalentFlow simulates a complete recruitment flow, including:

- Job Management: Create, edit, archive, reorder, and deep-link to jobs

- Candidate Management: Search, filter, and move candidates across stages using a Kanban board

- Assessment Builder: Create job-specific quizzes and preview them live

All data operations (create, update, delete) are handled through a mock REST API (using MirageJS) and persisted locally using IndexedDB via Dexie.

## Core Features
### Jobs

- Paginated and filterable jobs list (search by title, status, tags)
- Create / Edit job in a modal or separate route
- Validation: title required, unique slug enforced
- Archive / Unarchive jobs
- Reorder jobs with drag-and-drop
- Deep-link support → /jobs/:jobId

### Candidates

- Virtualized list for 1000+ candidates
- Client-side search (name/email/job applied)
- Candidate profile popup
- Kanban board for stage transitions via drag-and-drop
- Notes section

### Assessments

- Assessment builder per job
- Supports multiple question types:
    - Single choice / Multi choice
    - Short text / Long text
    - Numeric range / File upload (stub)
- Live preview pane showing fillable form
- Validation (required fields, numeric range, max length)
- Persist builder locally

### Data Simulation & Persistence

API simulated using MirageJS 

All data is stored in IndexedDB for persistence across refreshes

On page reload, data is taken from local storage or IndexedDB

## Tech Stack
- Frontend:	React (with Vite)
- Styling:	Tailwind CSS
- API Simulation:	MirageJS
- Persistence:	IndexedDB via Dexie
- UI Utilities:	React Hook Form, React DnD, React Virtualized

## Seed Data

- 25 jobs (mix of active and archived)
- 1000 candidates randomly assigned to jobs and stages
- 3 sample assessments, each with 10+ questions

