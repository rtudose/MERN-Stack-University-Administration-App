// src/components/BackButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

const BackButton = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Button
      variant="text"
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate(-1)} // This programmatically clicks the browser's back button
      sx={{ mb: 2, alignSelf: 'flex-start' }} // Margin bottom and align to the left
    >
      {t('back_button')}
    </Button>
  );
};

export default BackButton;