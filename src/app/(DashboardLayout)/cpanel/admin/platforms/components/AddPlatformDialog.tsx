'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  Typography,
} from '@mui/material';

type AddPlatformDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarSeverity: React.Dispatch<React.SetStateAction<'success' | 'error'>>;
};

const AddPlatformDialog: React.FC<AddPlatformDialogProps> = ({
  open,
  onClose,
  onSave,
  setSnackbarOpen,
  setSnackbarMessage,
  setSnackbarSeverity,
}) => {
  const [platformName, setPlatformName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const handleSave = () => {
    if (platformName.trim()) {
      const formData = new FormData();
      formData.append('platform_name', platformName);
      formData.append('description', description);
      if (icon) formData.append('icon', icon);
      if (thumbnail) formData.append('thumbnail', thumbnail);
      if (cover) formData.append('cover', cover);

      onSave(formData);
      setSnackbarMessage('Platform added successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Reset form fields and close dialog
      setPlatformName('');
      setDescription('');
      setIcon(null);
      setThumbnail(null);
      setCover(null);
      onClose();
    } else {
      setSnackbarMessage('Platform name is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Platform</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Platform Name"
              variant="outlined"
              fullWidth
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Icon</Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setIcon(e.target.files[0])}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Thumbnail</Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setThumbnail(e.target.files[0])}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Cover</Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setCover(e.target.files[0])}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPlatformDialog;
