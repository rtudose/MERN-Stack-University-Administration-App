// src/components/BackButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

const BackButton = ({ to }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="text"
      startIcon={<ArrowBackIcon />}
      onClick={handleClick}
      sx={{ mb: 2, alignSelf: 'flex-start' }}
    >
      {t('back_button')}
    </Button>
  );
};

export default BackButton;