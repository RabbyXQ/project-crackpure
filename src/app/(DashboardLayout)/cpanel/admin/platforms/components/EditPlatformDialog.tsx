'use client'

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  Input,
  Typography,
} from '@mui/material';
import { Platform } from '../page'; // Adjust this import based on your file structure

type EditPlatformDialogProps = {
  fetchPlatform: () => void;
  open: boolean;
  platform: Platform;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarSeverity: React.Dispatch<React.SetStateAction<'success' | 'error'>>;
};

const EditPlatformDialog: React.FC<EditPlatformDialogProps> = ({
  fetchPlatform,
  open,
  platform,
  onClose,
  onSave,
  setSnackbarOpen,
  setSnackbarMessage,
  setSnackbarSeverity,
}) => {
  const [platformName, setPlatformName] = useState<string>(platform.platform_name);
  const [description, setDescription] = useState<string>(platform.description || '');
  const [icon, setIcon] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  // Update form fields when platform prop changes
  useEffect(() => {
    setPlatformName(platform.platform_name);
    setDescription(platform.description || '');
  }, [platform]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (event.target.files && event.target.files[0]) {
      setter(event.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (platformName.trim()) {
      const formData = new FormData();
      formData.append('platform_id', platform.platform_id.toString());
      formData.append('platform_name', platformName);
      formData.append('description', description);

      if (icon) formData.append('icon', icon);
      if (cover) formData.append('cover', cover);
      if (thumbnail) formData.append('thumbnail', thumbnail);

      try {
        await onSave(formData);
        setSnackbarMessage('Platform updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        onClose();
        fetchPlatform(); // Fetch updated data
      } catch (error) {
        setSnackbarMessage('Error updating platform');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage('Platform name is required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Platform</DialogTitle>
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
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setIcon)}
              fullWidth
            />
            {icon && <Typography>Selected icon: {icon.name}</Typography>}
          </Grid>
          <Grid item xs={12}>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setCover)}
              fullWidth
            />
            {cover && <Typography>Selected cover: {cover.name}</Typography>}
          </Grid>
          <Grid item xs={12}>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setThumbnail)}
              fullWidth
            />
            {thumbnail && <Typography>Selected thumbnail: {thumbnail.name}</Typography>}
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

export default EditPlatformDialog;
