// src/pages/CoursesManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllCourses, createCourse, updateCourse, deleteCourse } from '../services/courseService';

const CoursesManagement = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    credits: '',
    professor: '',
    department: '',
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllCourses();
      setCourses(response.data);
    } catch (err) {
      setError('fetch_courses_error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentCourseId(null);
    setFormData({ name: '', code: '', description: '', credits: '', professor: '', department: '' });
  };

  const getTranslatedError = (msg) => {
    if (msg.includes('A course with this code already exists')) return 'course_code_exists_error';
    if (msg.includes('A course with this name already exists')) return 'course_name_exists_error';
    return 'generic_error';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ text: '', type: '' });

    const courseData = { ...formData, credits: Number(formData.credits) };

    try {
      if (isEditing) {
        await updateCourse(currentCourseId, courseData);
        setFormMessage({ text: 'course_updated_success', type: 'success' });
      } else {
        await createCourse(courseData);
        setFormMessage({ text: 'course_created_success', type: 'success' });
      }
      resetForm();
      fetchCourses();
    } catch (err) {
      const errorKey = err.response?.data?.msg ? getTranslatedError(err.response.data.msg) : 'generic_error';
      setFormMessage({ text: errorKey, type: 'error' });
    }
  };

  const handleEditClick = (course) => {
    setFormMessage({ text: '', type: '' });
    setIsEditing(true);
    setCurrentCourseId(course._id);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits,
      professor: course.professor,
      department: course.department || '',
    });
    window.scrollTo(0, 0);
  };

  const handleDeleteClick = async (courseId) => {
    if (window.confirm(t('delete_course_confirm'))) {
      try {
        await deleteCourse(courseId);
        setFormMessage({ text: 'course_deleted_success', type: 'success' });
        fetchCourses();
      } catch (err) {
        setFormMessage({ text: 'delete_course_error', type: 'error' });
      }
    }
  };

  if (loading) return <div>{t('loading_courses')}</div>;
  if (error) return <div style={{ color: 'red' }}>{t(error)}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>{t('courses_management_title')}</h2>

      <div style={styles.formContainer}>
        <h3>{isEditing ? t('edit_course_title') : t('add_new_course_title')}</h3>
        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}><label htmlFor="name">{t('course_name_label')}</label><input type="text" id="name" value={formData.name} onChange={handleInputChange} style={styles.input} required /></div>
            <div style={styles.formGroup}><label htmlFor="code">{t('course_code_label')}</label><input type="text" id="code" value={formData.code} onChange={handleInputChange} style={styles.input} required /></div>
            <div style={styles.formGroup}><label htmlFor="credits">{t('course_credits_label')}</label><input type="number" id="credits" value={formData.credits} onChange={handleInputChange} style={styles.input} required min="1"/></div>
            <div style={styles.formGroup}><label htmlFor="professor">{t('course_professor_label')}</label><input type="text" id="professor" value={formData.professor} onChange={handleInputChange} style={styles.input} required /></div>
            <div style={styles.formGroup}><label htmlFor="department">{t('course_department_label')}</label><input type="text" id="department" value={formData.department} onChange={handleInputChange} style={styles.input} /></div>
            <div style={styles.formGroup}><label htmlFor="description">{t('course_description_label')}</label><textarea id="description" value={formData.description} onChange={handleInputChange} style={styles.textarea} /></div>
          </div>
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.button}>{isEditing ? t('update_course_button') : t('add_course_button')}</button>
            {isEditing && (<button type="button" onClick={() => { resetForm(); setFormMessage({ text: '', type: '' }); }} style={styles.cancelButton}>{t('cancel_button')}</button>)}
          </div>
        </form>
        {formMessage.text && <p style={{ color: formMessage.type === 'success' ? 'green' : 'red' }}>{t(formMessage.text)}</p>}
      </div>

      <div style={styles.tableContainer}>
        <h3>{t('existing_courses_title')}</h3>
        <table style={styles.table}>
          <thead>
            <tr><th>{t('course_code_label')}</th><th>{t('course_name_label')}</th><th>{t('course_credits_label')}</th><th>{t('course_professor_label')}</th><th>{t('actions_label')}</th></tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id}>
                <td>{course.code}</td><td>{course.name}</td><td>{course.credits}</td><td>{course.professor}</td>
                <td>
                  <button onClick={() => handleEditClick(course)} style={styles.editButton}>{t('edit_button')}</button>
                  <button onClick={() => handleDeleteClick(course._id)} style={styles.deleteButton}>{t('delete_button')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reusing styles for consistency
const styles = {
    container: { padding: '20px', maxWidth: '960px', margin: '40px auto', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    header: { textAlign: 'center', color: '#0056b3', marginBottom: '30px' },
    formContainer: { marginBottom: '40px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    textarea: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontFamily: 'inherit', fontSize: '1rem', gridColumn: '1 / -1' },
    tableContainer: { marginTop: '40px', overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' },
    th: { backgroundColor: '#0056b3', color: 'white', padding: '12px 15px' }, // Note: these are not applied to header for simplicity
    td: { padding: '12px 15px', borderBottom: '1px solid #eee' },
    formGroup: { display: 'flex', flexDirection: 'column', marginBottom: '15px' },
    label: { marginBottom: '5px', fontWeight: 'bold' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '4px' },
    buttonGroup: { display: 'flex', gap: '10px', marginTop: '20px', gridColumn: '1 / -1' },
    button: { padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    cancelButton: { padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    editButton: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
    deleteButton: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' },
};

export default CoursesManagement;