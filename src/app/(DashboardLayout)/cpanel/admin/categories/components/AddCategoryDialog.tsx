'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

type AddCategoryDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => void;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarSeverity: React.Dispatch<React.SetStateAction<'success' | 'error'>>;
};

type Platform = {
  platform_id: number;
  platform_name: string;
};

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  open,
  onClose,
  onSave,
  setSnackbarOpen,
  setSnackbarMessage,
  setSnackbarSeverity,
}) => {
  const [categoryName, setCategoryName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [icon, setIcon] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [type, setType] = useState<string>('');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<number | ''>('');

  useEffect(() => {
    // Fetch platforms when the dialog opens
    if (open) {
      const fetchPlatforms = async () => {
        try {
          const response = await fetch('/api/platform');
          if (!response.ok) {
            throw new Error('Failed to fetch platforms');
          }
          const data = await response.json();
          setPlatforms(data.platforms || []);
        } catch (error) {
          console.error('Error fetching platforms:', error);
          setSnackbarMessage('Failed to fetch platforms');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      };

      fetchPlatforms();
    }
  }, [open]);

  const handleSave = () => {
    if (categoryName.trim() && type && selectedPlatform !== '') {
      const formData = new FormData();
      formData.append('cat_name', categoryName);
      formData.append('cat_description', description);
      formData.append('type', type);
      formData.append('platform_id', selectedPlatform.toString());
      if (icon) formData.append('icon', icon);
      if (thumbnail) formData.append('cat_thumb', thumbnail);
      if (cover) formData.append('cover', cover);

      onSave(formData);
      setSnackbarMessage('Category added successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Reset form fields and close dialog
      setCategoryName('');
      setDescription('');
      setIcon(null);
      setThumbnail(null);
      setCover(null);
      setType('');
      setSelectedPlatform('');
      onClose();
    } else {
      setSnackbarMessage('Category name, type, and platform are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Category</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Category Name"
              variant="outlined"
              fullWidth
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
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
            <FormControl fullWidth>
              <InputLabel id="category-type-label">Type</InputLabel>
              <Select
                labelId="category-type-label"
                value={type}
                onChange={(e) => setType(e.target.value as string)}
                label="Type"
                required
              >
                <MenuItem value="App">App</MenuItem>
                <MenuItem value="Game">Game</MenuItem>
                {/* Add more options as needed */}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="category-platform-label">Platform</InputLabel>
              <Select
                labelId="category-platform-label"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as number)}
                label="Platform"
                required
              >
                {platforms.map((platform) => (
                  <MenuItem key={platform.platform_id} value={platform.platform_id}>
                    {platform.platform_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default AddCategoryDialog;
