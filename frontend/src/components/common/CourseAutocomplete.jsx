// frontend/src/components/common/CourseAutocomplete.jsx
import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { searchCourses } from '../../services/courseService';

const CourseAutocomplete = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }
    
    setLoading(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const response = await searchCourses(inputValue);
        setOptions(response.data);
      } catch (error) {
        console.error("Failed to search courses", error);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce to avoid spamming the API on every keystroke

    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      onChange={(event, value) => onChange(value)} // Pass selected course back to parent form
      isOptionEqualToValue={(option, value) => option._id === value._id}
      getOptionLabel={(option) => `[${option.code}] ${option.name}`}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label= {t('search_for_a_course')}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
export default CourseAutocomplete;