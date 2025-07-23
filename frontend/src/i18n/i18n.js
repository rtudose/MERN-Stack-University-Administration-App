// src/i18n/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
      "password_label": "Password",
      "role_label": "Role",
      "role_label_student": "Student",
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

      // Add/Edit Room Form
      "add_new_room_title": "Add New Room",
      "edit_room_title": "Edit Room",
      "room_name_label": "Room Name",
      "room_capacity_label": "Capacity",
      "room_location_label": "Location",
      "add_room_button": "Add Room",
      "update_room_button": "Update Room",
      
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
      "password_label": "Parolă",
      "role_label": "Rol",
      "role_label_student": "Student",
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

      // Add/Edit Room Form
      "add_new_room_title": "Adaugă Sală Nouă",
      "edit_room_title": "Modifică Sala",
      "room_name_label": "Nume Sală",
      "room_capacity_label": "Capacitate",
      "room_location_label": "Locație",
      "add_room_button": "Adaugă Sală",
      "update_room_button": "Actualizează Sala",

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
      "appointment_time_invalid": "Orele programării trebuie să fie între {{start}} și {{end}}."
    }
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "ro", // This sets the default language to Romanian
    fallbackLng: "en", // Fallback to English if translation is missing

    interpolation: {
      escapeValue: false // react already escapes by default
    }
  });

export default i18n;