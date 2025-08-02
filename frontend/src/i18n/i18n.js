// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Define your translations
const resources = {
  en: {
    translation: {
      // General & Common
      "app_title": "Faculty Admin Platform",
      "loading": "Loading...",
      "server_error": "A server error occurred. Please try again later.",
      "not_authorized_error": "You are not authorized to perform this action.",
      "invalid_token_error": "Your session has expired. Please log in again.",
      "actions_label": "Actions",
      "edit_button": "Edit",
      "delete_button": "Delete",
      "cancel_button": "Cancel",
      "success_indicator": "successfully", // Generic indicator for styling success messages

      // Navbar
      "dashboard_link": "Dashboard",
      "rooms_link": "Rooms",
      "logged_in_as": "Logged in as",
      "role_admin": "Admin",
      "role_student": "Student",
      "logout_button": "Logout",

      // Login Page
      "login_header": "Login",
      "email_label": "Email",
      "password_label": "Password",
      "login_button": "Login",
      "login_success": "Login successful!",
      "login_empty_fields_error": "Please fill in all fields.",
      "login_failed_generic": "Login failed. Please try again.",
      "invalid_credentials_error": "Invalid credentials",
      "user_not_found_error": "User not found",
      
      // Admin Dashboard
      "admin_dashboard_title": "Admin Dashboard",
      "admin_dashboard_welcome": "Welcome, {{role}}!",
      "manage_rooms_button": "Manage Rooms",
      "manage_users_button": "Manage Users",
      "manage_courses_button": "Manage Courses",

      // User Dashboard
      "user_dashboard_title": "User Dashboard",
      "welcome_user": "Welcome, {{username}}!",
      "view_my_courses_button": "View My Courses",
      "book_a_room_button": "Book a Room",

      // Room Management Page
      "rooms_management_title": "Room Management",
      "loading_rooms": "Loading rooms...",
      "rooms_fetch_error": "Failed to fetch rooms. Please try again.",
      "available_rooms": "Available Rooms",
      "no_rooms_found": "No rooms found.",
      "room_name": "Room Name",
      "room_capacity": "Capacity",
      "room_location": "Location",

      // User Management Page
      "users_management_title": "User Management",
      "loading_users": "Loading users...",
      "fetch_users_error": "Failed to fetch users.",
      "add_new_user_title": "Add New User",
      "edit_user_title": "Edit User",
      "username_label": "Username",
      "role_label": "Role",
      "role_label_student": "Student",
      "course_year_label": "Year of Study",
      "course_semester_label": "Semester",
      "course_specialization_label": "Specialization",
      "user_group_label": "Group",
      "role_label_admin": "Admin",
      "role_label_external_representative": "External Representative",
      "add_user_button": "Add User",
      "update_user_button": "Update User",
      "existing_users_title": "Existing Users",
      "form_error_all_fields": "Please fill out all required fields.",
      "email_invalid_error": "Please enter a valid email address.",
      "password_minlength_error": "Password must be at least 6 characters.",
      "user_created_success": "User created successfully!",
      "user_updated_success": "User updated successfully!",
      "delete_user_confirm": "Are you sure you want to delete this user?",
      "user_deleted_success": "User deleted successfully.",
      "delete_user_error": "Failed to delete user.",
      "generic_error": "An unknown error occurred.",
      "user_exists_error": "A user with this email already exists.",
      "username_exists_error": "A user with this username already exists.",
      "cannot_remove_last_admin": "Cannot remove the last administrator.",
      "cannot_delete_self": "You cannot delete your own account.",

      // Course Management Page
      "courses_management_title": "Course Management",
      "loading_courses": "Loading courses...",
      "fetch_courses_error": "Failed to fetch courses.",
      "add_new_course_title": "Add New Course",
      "edit_course_title": "Edit Course",
      "course_name_label": "Course Name",
      "course_code_label": "Course Code",
      "course_credits_label": "Credits",
      "course_professor_label": "Professor",
      "course_department_label": "Department",
      "course_description_label": "Description",
      "add_course_button": "Add Course",
      "update_course_button": "Update Course",
      "existing_courses_title": "Existing Courses",
      "course_created_success": "Course created successfully!",
      "course_updated_success": "Course updated successfully!",
      "delete_course_confirm": "Are you sure you want to delete this course?",
      "course_deleted_success": "Course deleted successfully!",
      "delete_course_error": "Failed to delete course.",
      "course_code_exists_error": "A course with this code already exists.",
      "course_name_exists_error": "A course with this name already exists.",
      "course_form_error_required": "Please fill out all required fields (Name, Code, Credits, Professor).",
      "course_credits_min_error": "Credits must be a positive number.",
      "course_credits_integer_error": "Credits must be a whole number.",
      "course_form_error_all_fields": "Please ensure all fields are filled out correctly.",

      // Add/Edit Room Form
      "add_new_room_title": "Add New Room",
      "edit_room_title": "Edit Room",
      "room_name_label": "Room Name",
      "room_capacity_label": "Capacity",
      "room_location_label": "Location",
      "add_room_button": "Add Room",
      "update_room_button": "Update Room",
      
      // Room Booking Page
      "book_a_room_title": "Book a Room",
      "equipment_label": "Equipment",
      "book_now_button": "Book Now",
      "book_room_for_title": "Book Room:",
      "date_label": "Date",
      "start_time_label": "Start Time",
      "end_time_label": "End Time",
      "purpose_label": "Purpose of Reservation",
      "attendees_label": "Number of Attendees",
      "submit_booking_button": "Submit Request",
      "reservation_success": "Your booking request has been submitted and is pending approval.",
      "reservation_error_required": "Please fill out all required fields.",
      "reservation_error_time_format": "Please use a valid HH:MM format for time.",
      "reservation_error_endtime": "End time must be after the start time.",
      "reservation_error_capacity": "Number of attendees exceeds room capacity.",
      "attendees_integer_error": "Number of attendees must be a whole number.",
      "reservation_error_past_time": "You cannot book a room for a time that has already passed today.",
      "filter_rooms_title": "Filter Rooms",
      "filter_by_capacity_label": "Minimum Capacity",
      "filter_by_equipment_label": "Required Equipment",
      "status_label": "Status",
      "status_available": "Available",
      "status_under_maintenance": "Under Maintenance",
      "status_unavailable": "Unavailable",
      "available_for_external_label": "Available for External Booking",
      "equipment_Projector": "Projector",
      "equipment_Whiteboard": "Whiteboard",
      "equipment_Conference_Phone": "Conference Phone",
      "equipment_Video_Conferencing": "Video Conferencing",
      "equipment_Smartboard": "Smartboard",

      // Reservations Management Page
      "manage_reservations_button": "Manage Reservations",
      "reservations_management_title": "Reservations Management",
      "loading_reservations": "Loading reservations...",
      "fetch_reservations_error": "Failed to fetch reservations.",
      "reserved_by_label": "Reserved By",
      "time_slot_label": "Time",
      "status_pending": "Pending",
      "status_approved": "Approved",
      "status_rejected": "Rejected",
      "status_cancelled": "Cancelled",
      "reservation_status_updated": "Reservation status updated successfully.",

      // My Reservations Page
      "my_reservations_button": "My Reservations",
      "my_reservations_title": "My Reservations",
      "no_reservations_found": "You have not made any reservations yet.",

      // My Schedule Page
      "my_schedule_button": "My Schedule",
      "my_schedule_title": "My Schedule",
      "loading_schedule": "Loading your schedule...",
      "no_classes_today": "No classes scheduled.",

      //Schedule Management Page
      "manage_schedule_button": "Manage Schedule",
      "schedule_management_title": "Schedule Management",
      "fetch_schedule_error": "Failed to fetch schedule data.",
      "add_schedule_entry_title": "Add New Schedule Entry",
      "course_label": "Course",
      "room_label": "Room",
      "day_of_week_label": "Day of Week",
      "type_label": "Activity Type",
      "group_label": "Group",
      "group_helper_text": "e.g., A, B, C. Leave blank for lectures.",
      "academic_year_label": "Academic Year",
      "semester_label": "Semester",
      "add_entry_button": "Add Entry",
      "delete_schedule_entry_confirm": "Are you sure you want to delete this schedule entry?",
      "schedule_entry_created_success": "Schedule entry created successfully.",
      "schedule_entry_deleted_success": "Schedule entry deleted successfully.",
      "day_Monday": "Monday",
      "day_Tuesday": "Tuesday",
      "day_Wednesday": "Wednesday",
      "day_Thursday": "Thursday",
      "day_Friday": "Friday",
      "type_Lecture": "Lecture",
      "type_Lab": "Lab",
      "type_Seminar": "Seminar",
      "type_Practice": "Practice",
      "semester_1": "1",
      "semester_2": "2",
      "course_details_label": "Course Details",
      "room_details_label": "Room Details",
      "all_groups": "All",
      "professor_overlap_error": "Professor {{professorName}} is already booked from {{startTime}} to {{endTime}} on {{dayOfWeek}}.",
      "room_overlap_error": "Overlap detected! Room {{roomName}} is already booked for '{{courseName}}' from {{startTime}} to {{endTime}} on {{dayOfWeek}}.",

      // Form Messages & Errors
      "add_room_empty_fields_error": "Please fill in all fields.",
      "capacity_invalid_error": "Capacity must be a positive whole number.", // More generic
      "room_exists_error": "A room with this name already exists.",
      "invalid_room_data": "Invalid room data provided.",
      "room_location_required_error": "Room location is required.",
      
      // Success/Error Toasts
      "room_added_success": "Room '{{roomName}}' was added successfully!",
      "add_room_generic_error": "Failed to add room. Please try again.",
      "room_updated_success": "Room '{{roomName}}' was updated successfully!",
      "update_room_generic_error": "Failed to update room. Please try again.",
      "delete_room_confirm": "Are you sure you want to delete this room?",
      "room_deleted_success": "Room was deleted successfully!",
      "delete_room_generic_error": "Failed to delete room. Please try again.",

      // Other Backend Messages
      "course_not_found": "Course not found",
      "room_not_found": "Room not found",
      "overlap_detected_room_booked": "Overlap detected! Room {{roomName}} is already booked for '{{courseName}}' from {{startTime}} to {{endTime}} on {{dayOfWeek}}.",
      "appointment_time_invalid": "Appointment times must be between {{start}} and {{end}}.",

      // Back Button
      "back_button": "Back",

      // Boolean variables
      "boolean_yes": "Yes",
      "boolean_no": "No",
    }
  },
  ro: {
    translation: {
      // General & Common
      "app_title": "Platformă Administrativă Facultate",
      "loading": "Se încarcă...",
      "server_error": "A apărut o eroare de server. Vă rugăm să încercați mai târziu.",
      "not_authorized_error": "Nu sunteți autorizat să efectuați această acțiune.",
      "invalid_token_error": "Sesiunea dumneavoastră a expirat. Vă rugăm să vă autentificați din nou.",
      "actions_label": "Acțiuni",
      "edit_button": "Modifică",
      "delete_button": "Șterge",
      "cancel_button": "Anulează",
      "success_indicator": "cu succes", // Generic indicator for styling success messages

      // Navbar
      "dashboard_link": "Panou de Bord",
      "rooms_link": "Săli",
      "logged_in_as": "Autentificat ca",
      "role_admin": "Administrator",
      "role_student": "Student",
      "logout_button": "Deconectare",

      // Login Page
      "login_header": "Autentificare",
      "email_label": "Email",
      "password_label": "Parolă",
      "login_button": "Autentificare",
      "login_success": "Autentificare reușită!",
      "login_empty_fields_error": "Vă rugăm să completați toate câmpurile.",
      "login_failed_generic": "Autentificare eșuată. Vă rugăm să încercați din nou.",
      "invalid_credentials_error": "Email sau parolă invalidă.",
      "user_not_found_error": "Utilizatorul nu a fost găsit",

      // Admin Dashboard
      "admin_dashboard_title": "Panou de Administrare",
      "admin_dashboard_welcome": "Bun venit, {{role}}!",
      "manage_rooms_button": "Administrează Sălile",
      "manage_users_button": "Administrează Utilizatorii",
      "manage_courses_button": "Administrează Cursurile",

      // User Dashboard
      "user_dashboard_title": "Tablou de Bord Utilizator",
      "welcome_user": "Bun venit, {{username}}!",
      "view_my_courses_button": "Vezi cursurile mele",
      "book_a_room_button": "Rezervă o Sală",

      // Room Management Page
      "rooms_management_title": "Administrare Săli",
      "loading_rooms": "Se încarcă sălile...",
      "rooms_fetch_error": "Eroare la preluarea sălilor. Vă rugăm să încercați din nou.",
      "available_rooms": "Săli Disponibile",
      "no_rooms_found": "Nu s-au găsit săli.",
      "room_name": "Nume Sală",
      "room_capacity": "Capacitate",
      "room_location": "Locație",

      // User Management Page
      "users_management_title": "Administrare Utilizatori",
      "loading_users": "Se încarcă utilizatorii...",
      "fetch_users_error": "Eroare la preluarea utilizatorilor.",
      "add_new_user_title": "Adaugă Utilizator Nou",
      "edit_user_title": "Modifică Utilizator",
      "username_label": "Nume Utilizator",
      "role_label": "Rol",
      "role_label_student": "Student",
      "course_year_label": "An de Studiu",
      "course_semester_label": "Semestru",
      "course_specialization_label": "Specializare",
      "user_group_label": "Grupă",
      "role_label_admin": "Administrator",
      "role_label_external_representative": "Reprezentant Extern",
      "add_user_button": "Adaugă Utilizator",
      "update_user_button": "Actualizează Utilizator",
      "existing_users_title": "Utilizatori Existenți",
      "form_error_all_fields": "Vă rugăm completați toate câmpurile obligatorii.",
      "email_invalid_error": "Vă rugăm să introduceți o adresă de email validă.",
      "password_minlength_error": "Parola trebuie să conțină cel puțin 6 caractere.",
      "user_created_success": "Utilizator creat cu succes!",
      "user_updated_success": "Utilizator actualizat cu succes!",
      "delete_user_confirm": "Sunteți sigur că doriți să ștergeți acest utilizator?",
      "user_deleted_success": "Utilizator șters cu succes.",
      "delete_user_error": "Eroare la ștergerea utilizatorului.",
      "generic_error": "A apărut o eroare necunoscută.",
      "user_exists_error": "Un utilizator cu acest email există deja.",
      "username_exists_error": "Un utilizator cu acest nume de utilizator există deja.",
      "cannot_remove_last_admin": "Nu se poate elimina ultimul administrator.",
      "cannot_delete_self": "Nu vă puteți șterge propriul cont.",

      // Course Management Page
      "courses_management_title": "Administrare Cursuri",
      "loading_courses": "Se încarcă cursurile...",
      "fetch_courses_error": "Eroare la preluarea cursurilor.",
      "add_new_course_title": "Adaugă Curs Nou",
      "edit_course_title": "Modifică Curs",
      "course_name_label": "Nume Curs",
      "course_code_label": "Cod Curs",
      "course_credits_label": "Credite",
      "course_professor_label": "Profesor",
      "course_department_label": "Departament",
      "course_description_label": "Descriere",
      "add_course_button": "Adaugă Curs",
      "update_course_button": "Actualizează Curs",
      "existing_courses_title": "Cursuri Existente",
      "course_created_success": "Curs creat cu succes!",
      "course_updated_success": "Curs actualizat cu succes!",
      "delete_course_confirm": "Sunteți sigur că doriți să ștergeți acest curs?",
      "course_deleted_success": "Curs șters cu succes!",
      "delete_course_error": "Eroare la ștergerea cursului.",
      "course_code_exists_error": "Un curs cu acest cod există deja.",
      "course_name_exists_error": "Un curs cu acest nume există deja.",
      "course_form_error_required": "Vă rugăm completați toate câmpurile obligatorii (Nume, Cod, Credite, Profesor).",
      "course_credits_min_error": "Numărul de credite trebuie să fie un număr pozitiv.",
      "course_credits_integer_error": "Numărul de credite trebuie să fie un număr întreg.",
      "course_form_error_all_fields": "Vă rugăm să vă asigurați că toate câmpurile sunt completate corect.",

      // Add/Edit Room Form
      "add_new_room_title": "Adaugă Sală Nouă",
      "edit_room_title": "Modifică Sala",
      "room_name_label": "Nume Sală",
      "room_capacity_label": "Capacitate",
      "room_location_label": "Locație",
      "add_room_button": "Adaugă Sală",
      "update_room_button": "Actualizează Sala",

      // Room Booking Page
      "book_a_room_title": "Rezervă o Sală",
      "equipment_label": "Echipament",
      "book_now_button": "Rezervă Acum",
      "book_room_for_title": "Rezervă Sala:",
      "date_label": "Data",
      "start_time_label": "Ora de Început",
      "end_time_label": "Ora de Sfârșit",
      "purpose_label": "Scopul Rezervării",
      "attendees_label": "Număr de Participanți",
      "submit_booking_button": "Trimite Cererea",
      "reservation_success": "Cererea dumneavoastră de rezervare a fost trimisă și așteaptă aprobare.",
      "reservation_error_required": "Vă rugăm să completați toate câmpurile obligatorii.",
      "reservation_error_time_format": "Vă rugăm să folosiți un format valid HH:MM pentru oră.",
      "reservation_error_endtime": "Ora de sfârșit trebuie să fie după ora de început.",
      "reservation_error_capacity": "Numărul de participanți depășește capacitatea sălii.",
      "attendees_integer_error": "Numărul de participanți trebuie să fie un număr întreg.",
      "reservation_error_past_time": "Nu puteți rezerva o sală la o oră care a trecut deja astăzi.",
      "filter_rooms_title": "Filtrează Sălile",
      "filter_by_capacity_label": "Capacitate Minimă",
      "filter_by_equipment_label": "Echipament Necesar",
      "status_label": "Stare",
      "status_available": "Disponibilă",
      "status_under_maintenance": "În Mentenanță",
      "status_unavailable": "Indisponibilă",
      "available_for_external_label": "Disponibilă pentru Rezervări Externe",
      "equipment_Projector": "Proiector",
      "equipment_Whiteboard": "Tablă albă",
      "equipment_Conference_Phone": "Telefon de conferință",
      "equipment_Video_Conferencing": "Videoconferință",
      "equipment_Smartboard": "Tablă inteligentă",

      // Reservations Management Page
      "manage_reservations_button": "Administrează Rezervări",
      "reservations_management_title": "Administrare Rezervări",
      "loading_reservations": "Se încarcă rezervările...",
      "fetch_reservations_error": "Eroare la preluarea rezervărilor.",
      "reserved_by_label": "Rezervat de",
      "time_slot_label": "Interval Orar",
      "status_pending": "În Așteptare",
      "status_approved": "Aprobată",
      "status_rejected": "Respinsă",
      "status_cancelled": "Anulată",
      "reservation_status_updated": "Starea rezervării a fost actualizată cu succes.",

      // My Reservations Page
      "my_reservations_button": "Rezervările Mele",
      "my_reservations_title": "Rezervările Mele",
      "no_reservations_found": "Nu ați făcut nicio rezervare încă.",

      // My Schedules Page
      "my_schedule_button": "Orarul Meu",
      "my_schedule_title": "Orarul Meu",
      "loading_schedule": "Se încarcă orarul...",
      "no_classes_today": "Niciun curs programat.",

      //Schedule Management Page
      "manage_schedule_button": "Administrează Orar",
      "schedule_management_title": "Administrare Orar",
      "fetch_schedule_error": "Eroare la preluarea orarului.",
      "add_schedule_entry_title": "Adaugă Intrare Nouă în Orar",
      "course_label": "Curs",
      "room_label": "Sală",
      "day_of_week_label": "Ziua Săptămânii",
      "type_label": "Tip Activitate",
      "group_label": "Grupă",
      "group_helper_text": "ex: A, B, C. Lăsați gol pentru cursuri.",
      "academic_year_label": "An Academic",
      "semester_label": "Semestru",
      "add_entry_button": "Adaugă Intrare",
      "delete_schedule_entry_confirm": "Sunteți sigur că doriți să ștergeți această intrare din orar?",
      "schedule_entry_created_success": "Intrare în orar creată cu succes.",
      "schedule_entry_deleted_success": "Intrare din orar ștearsă cu succes.",
      "day_Monday": "Luni",
      "day_Tuesday": "Marți",
      "day_Wednesday": "Miercuri",
      "day_Thursday": "Joi",
      "day_Friday": "Vineri",
      "type_Lecture": "Curs",
      "type_Lab": "Laborator",
      "type_Seminar": "Seminar",
      "type_Practice": "Practică",
      "semester_1": "1",
      "semester_2": "2",
      "course_details_label": "Detalii Curs",
      "room_details_label": "Detalii Sală",
      "all_groups": "Toate",
      "professor_overlap_error": "Profesorul {{professorName}} este deja ocupat de la {{startTime}} la {{endTime}} în ziua de {{dayOfWeek}}.",
      "room_overlap_error": "Suprapunere detectată! Sala {{roomName}} este deja rezervată pentru '{{courseName}}' de la {{startTime}} la {{endTime}} în ziua de {{dayOfWeek}}.",

      // Form Messages & Errors
      "add_room_empty_fields_error": "Vă rugăm să completați toate câmpurile.",
      "capacity_invalid_error": "Capacitatea trebuie să fie un număr întreg pozitiv.", // More generic
      "room_exists_error": "O sală cu acest nume există deja.",
      "invalid_room_data": "Datele sălii sunt invalide.",
      "room_location_required_error": "Locația sălii este obligatorie.",

      // Success/Error Toasts
      "room_added_success": "Sala '{{roomName}}' a fost adăugată cu succes!",
      "add_room_generic_error": "Eroare la adăugarea sălii. Vă rugăm să încercați din nou.",
      "room_updated_success": "Sala '{{roomName}}' a fost actualizată cu succes!",
      "update_room_generic_error": "Eroare la actualizarea sălii. Vă rugăm să încercați din nou.",
      "delete_room_confirm": "Sunteți sigur că doriți să ștergeți această sală?",
      "room_deleted_success": "Sala a fost ștearsă cu succes!",
      "delete_room_generic_error": "Eroare la ștergerea sălii. Vă rugăm să încercați din nou.",
      
      // Other Backend Messages
      "course_not_found": "Cursul nu a fost găsit",
      "room_not_found": "Sala nu a fost găsită",
      "overlap_detected_room_booked": "Suprapunere detectată! Sala {{roomName}} este deja rezervată pentru '{{courseName}}' de la {{startTime}} la {{endTime}} în ziua de {{dayOfWeek}}.",
      "appointment_time_invalid": "Orele programării trebuie să fie între {{start}} și {{end}}.",

      // Back Button
      "back_button": "Înapoi",

      //Boolean variables
      "boolean_yes": "Da",
      "boolean_no": "Nu",
    }
  }
};

i18n
  .use(LanguageDetector) // Use the language detector
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en", // Fallback to English if a translation is missing
    interpolation: {
      escapeValue: false
    },
    // Configuration for the language detector
    detection: {
      order: ['localStorage', 'navigator'], // Check localStorage first, then the browser's language
      caches: ['localStorage'], // Cache the user's choice in localStorage
    }
  });

export default i18n;