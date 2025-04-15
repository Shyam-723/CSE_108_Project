import React from 'react';
import { Button } from '@mui/material';
import { useColorMode } from '../shared-theme/AppTheme'; // Adjust path if needed

const ColorModeSelect = ({ sx }) => {
  const { toggleColorMode } = useColorMode();

  return (
    <Button
      onClick={toggleColorMode}
      color="secondary"
      variant="contained"
      sx={sx}
    >
      Toggle Mode
    </Button>
  );
};

export default ColorModeSelect;
