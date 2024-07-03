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
  Input,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Category } from '../page'; // Adjust this import based on your file structure

type EditCategoryDialogProps = {
  fetchCategory: () => void;
  open: boolean;
  category: Category;
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

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  fetchCategory,
  open,
  category,
  onClose,
  onSave,
  setSnackbarOpen,
  setSnackbarMessage,
  setSnackbarSeverity,
}) => {
  const [categoryName, setCategoryName] = useState<string>(category.cat_name);
  const [description, setDescription] = useState<string>(category.cat_description || '');
  const [icon, setIcon] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [type, setType] = useState<string>(category.type || '');
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<number>(category.platform_id || 0);

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

  useEffect(() => {
    // Update form fields when category prop changes
    setCategoryName(category.cat_name);
    setDescription(category.cat_description || '');
    setType(category.type || '');
    setSelectedPlatform(category.platform_id || 0);
  }, [category]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (event.target.files && event.target.files[0]) {
      setter(event.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (categoryName.trim() && type && selectedPlatform) {
      const formData = new FormData();
      formData.append('cat_id', category.cat_id.toString()); // Assuming 'cat_id' is the unique identifier
      formData.append('cat_name', categoryName);
      formData.append('cat_description', description);
      formData.append('type', type);
      formData.append('platform_id', selectedPlatform.toString()); // Include platform_id

      if (icon) formData.append('icon', icon);
      if (cover) formData.append('cover', cover);
      if (thumbnail) formData.append('cat_thumb', thumbnail);

      try {
        await onSave(formData);
        setSnackbarMessage('Category updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        onClose();
        fetchCategory(); // Fetch updated data
      } catch (error) {
        setSnackbarMessage('Error updating category');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage('Category name, type, and platform are required');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Category</DialogTitle>
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

export default EditCategoryDialog;
