1. Project Overview
   
  A full-stack MERN (MongoDB, Express.js, React, Node.js) web application designed to digitize and streamline the administrative processes of a university faculty. The platform provides role-based access for administrators, teachers, students, and external representatives to manage academic and logistical operations efficiently.

2. Core Features Implemented
   
  A. Multi-Role Authentication System
  
    Roles: The application supports four distinct user roles with tailored permissions: admin, teacher, student, and external_representative.
    
    Authentication: Secure login is handled via JSON Web Tokens (JWT), with a global error handler that automatically manages session expirations.

  B. Administrative Management Panels
  
    Admins have access to comprehensive CRUD (Create, Read, Update, Delete) interfaces for:
    
      User Management: Admins can create, view, edit, and delete all users. The interface includes conditional fields for assigning students their yearOfStudy, specialization, and group.
      
      Room Management: Management of physical rooms, including details like capacity, location, status (available, under_maintenance), multi-select equipment, and a toggle for isAvailableForExternal booking.
      
      Course Management: Management of academic courses with fields for name, code, credits, yearOfStudy, semester, specialization, and assignment of different professors for lecture, seminar, and lab activities.

  C. Intelligent Scheduling System
  
    Schedule Creation: Admins can build the faculty timetable by creating ScheduleEntry items that link a specific Course and Room to a day, time, and activity type.
    
    Advanced Overlap Detection: The backend features a robust, four-layer validation algorithm to prevent scheduling conflicts:
    
    Room Overlap: Prevents a room from being booked for two different activities at the same time.
    
    Professor Overlap: Prevents a teacher from being scheduled for two different activities at the same time.
    
    Course Overlap: Prevents the same course from being scheduled in two different places simultaneously.
    
    Student Group Overlap: Prevents a specific cohort of students (defined by year, specialization, and group) from being scheduled for two different activities at once.

  D. User-Specific Dashboards & Views
  
    Student View: Students have a personalized dashboard and can view their "My Schedule" page, which automatically displays a weekly timetable of courses filtered for their specific year, specialization, group, and the current semester.
    
    Teacher View: Teachers have a personalized dashboard and can view their "My Schedule" page, which automatically displays a weekly timetable of only the lectures, labs, or seminars they are assigned to teach.
    
    External Representative View: External representatives can view and filter rooms available for booking and submit reservation requests for specific dates and times. They also have a "My Reservations" page to track the status of their requests (pending, approved, rejected).
    
    Student Secretariat Appointments: Students can book appointments with the secretariat by selecting a date and an available time slot. They also have a "My Appointments" page to view the status of their requests and any notes from the administration.
    
    Admin Reservation/Appointment Management: Admins have dedicated pages to view all room reservations and secretariat appointments, with the ability to approve, reject (with notes), or mark them as complete.

  E. Quality of Life & UI Features
  
    UI Library: The entire frontend is built with Material-UI (MUI) for a professional, consistent, and responsive design.
    
    Light/Dark Mode: A theme toggle allows users to switch between light and dark modes, with their preference saved locally.
    
    Internationalization (i18n): The application supports both English and Romanian, with a language switcher in the navbar.
    
    Data Tables: All admin management pages feature tables with advanced sorting capabilities.

3. Key Technologies & Architecture
   
  Backend: Node.js, Express.js, MongoDB with Mongoose for data modeling and validation.
  
  Frontend: React (with Vite), React Router v6 for routing, Axios for API calls.
  
  Development Environment: A docker-compose.yml file is configured to run the MongoDB database in a container for a consistent and portable development setup.
  
  Database Seeding: A comprehensive seeder script (seeder.js) populates the database with a rich set of interconnected sample data for users, rooms, courses, and a full schedule, enabling efficient testing.
