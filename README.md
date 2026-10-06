# Platformă Integrată pentru Gestionarea Resurselor și Activităților Universitare

## 1. Project Overview

A full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed to digitize and streamline the administrative processes of a university faculty. The platform provides role-based access for administrators, teachers, students, and external representatives to manage academic and logistical operations efficiently, eliminating the dependency on manual spreadsheets.

## 2. Core Features Implemented

### A. Multi-Role Authentication System

* **Roles:** The application supports four distinct user roles with tailored permissions: `admin`, `teacher`, `student`, and `external_representative`.
* **Authentication:** Secure login is handled via custom JSON Web Tokens (JWT) passing through a dedicated validation middleware, with a global error handler that automatically manages session expirations.

### B. Administrative Management & Analytics

Admins have access to comprehensive CRUD interfaces and visual dashboards:

* **Visual Analytics:** An interactive dashboard utilizing MongoDB aggregation pipelines and Recharts to render real-time SVG charts for room availability and resource monitoring.
* **User Management:** Admins can create, view, edit, and delete users. The interface includes conditional fields for assigning students their `yearOfStudy`, `specialization`, and `group`.
* **Room & Course Management:** Management of physical rooms (capacity, multi-select equipment, external booking toggles) and academic courses (credits, specialization, assigned professors).
* **Performance Optimization:** Large datasets are managed via server-side pagination, significantly reducing load times and client-side memory usage.

### C. Intelligent Scheduling System

* **Schedule Creation:** Admins build the faculty timetable by creating `ScheduleEntry` items linking a Course and Room to a day, time, and activity type.
* **Advanced Overlap Detection:** The backend features a robust validation algorithm evaluating incoming API requests to prevent scheduling conflicts:
* **Room Overlap:** Prevents a room from being booked for two different activities simultaneously.
* **Professor Overlap:** Prevents a teacher from being scheduled for two different activities simultaneously.
* **Course Overlap:** Prevents the same course from being scheduled in two different places.
* **Student Group Overlap:** Prevents a specific cohort (defined by year, specialization, and group) from double-booking.



### D. User-Specific Dashboards & Contextual Filtering

* **Student View:** A personalized dashboard featuring a dynamically generated weekly timetable filtered contextually for their specific year, specialization, group, and current semester.
* **Teacher View:** A personalized weekly timetable isolating only the lectures, labs, or seminars they are assigned to teach.
* **External Representative View:** Interfaces to filter available rooms, submit reservation requests, and track approval status.
* **Secretariat Appointments:** A dedicated module for students to book appointments with the secretariat and track request status alongside administrative notes.

### E. Quality of Life & UI Features

* **UI Library:** The frontend is constructed using Material-UI (MUI) components for a responsive, modular design.
* **Theming & i18n:** Persistent Light/Dark mode toggles and an English/Romanian language switcher.
* **Data Tables:** Advanced sorting and filtering capabilities on all administrative views.

## 3. Key Technologies & Architecture

* **Backend:** Node.js, Express.js, MongoDB with Mongoose.
* **Frontend:** React (Vite), React Context API for global state management, Axios, Material-UI, Recharts.
* **Infrastructure:** Full microservice orchestration using Docker Compose (Frontend, Backend, and Database in isolated containers).

## 4. Quick Start Guide

This application is fully containerized. Ensure [Docker](https://www.docker.com/) is installed and running on your machine.

### Build and Start the Application

To build the images and start all services in the background, run:

```bash
docker compose up --build -d

```

* **Frontend (React):** Accessible at `http://localhost:5173`
* **Backend (API):** Accessible at `http://localhost:5000`

### Database Management (Seeding & Destroying)

The project includes an API-driven seeder script (`seeder.js`) that tests backend validation by dynamically generating JWTs and submitting Axios requests to populate the database.

**To seed the database with test data (Users, Courses, Schedule, Appointments):**

```bash
docker compose exec backend node seed/seeder.js

```

**To destroy/clear all data in the database:**

```bash
docker compose exec backend node seed/seeder.js -d

```

### Stop the Application

To safely stop the containers without losing database data:

```bash
docker compose down

```

To stop the application AND completely wipe the MongoDB volume (hard reset):

```bash
docker compose down -v

```
