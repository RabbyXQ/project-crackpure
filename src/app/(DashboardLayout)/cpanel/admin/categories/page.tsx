'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  TextField,
  Pagination,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import BaseCard from '@/app/(DashboardLayout)/components/shared/BaseCard';
import EditCategoryDialog from './components/EditCategoryDialog';
import AddCategoryDialog from './components/AddCategoryDialog';

type Category = {
  cat_id: number;
  type: string;
  platform_id: number;
  cat_name: string;
  cat_description?: string;
  icon?: string;
  cat_thumb?: string;
  cover?: string;
};

type Platform = {
  platform_id: number;
  platform_name: string;
};

const coverStyle = (coverImageUrl: string) => ({
  backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  filter: 'blur(8px)',
  height: '200px',
  width: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: -1,
  borderRadius: '8px',
});

const iconStyle = {
  borderRadius: '50%',
  width: '50px',
  height: '50px',
  objectFit: 'cover',
};

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<number | ''>(''); // State for platform filter
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/category');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      const categoriesData = Array.isArray(data.categories) ? data.categories : [];
      setCategories(categoriesData);
      setFilteredCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbarMessage('Failed to fetch categories');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchCategories();
    fetchPlatforms();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = categories.filter((category) => {
      if (!category) return false;

      const nameMatches = category.cat_name
        ? category.cat_name.toLowerCase().includes(query)
        : false;

      const descriptionMatches = category.cat_description
        ? category.cat_description.toLowerCase().includes(query)
        : false;

      const typeMatches = selectedType ? category.type === selectedType : true;
      const platformMatches = selectedPlatform ? category.platform_id === selectedPlatform : true;

      return (nameMatches || descriptionMatches) && typeMatches && platformMatches;
    });
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchQuery, categories, selectedType, selectedPlatform]);

  const handleAdd = async (formData: FormData) => {
    try {
      const response = await fetch('/api/category', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      const data = await response.json();
      if (data.category && typeof data.category.cat_id === 'number') {
        setCategories((prevCategories) => [...prevCategories, data.category]);
        setFilteredCategories((prevFilteredCategories) => [...prevFilteredCategories, data.category]);
        setAddDialogOpen(false);
        setSnackbarMessage('Category added successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      // Re-fetch categories to update the list if necessary
      fetchCategories();

    } catch (error) {
      console.error('Error adding category:', error);
      setSnackbarMessage('Error adding category');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    try {
      const response = await fetch('/api/category', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      const data = await response.json();
      if (data.category) {
        setCategories((prevCategories) =>
          prevCategories.map((c) =>
            c.cat_id === data.category.cat_id ? data.category : c
          )
        );
        setFilteredCategories((prevFilteredCategories) =>
          prevFilteredCategories.map((c) =>
            c.cat_id === data.category.cat_id ? data.category : c
          )
        );
        setEditDialogOpen(false);
        setSnackbarMessage('Category updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setSnackbarMessage('Error updating category');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (cat_id: number) => {
    try {
      const response = await fetch('/api/category', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cat_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategories((prevCategories) => prevCategories.filter((category) => category.cat_id !== cat_id));
      setFilteredCategories((prevFilteredCategories) =>
        prevFilteredCategories.filter((category) => category.cat_id !== cat_id)
      );
      setSnackbarMessage('Category deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting category:', error);
      setSnackbarMessage('Error deleting category');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedType(event.target.value as string);
  };

  const handlePlatformChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedPlatform(event.target.value as number);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <BaseCard title="Category List">
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Total Categories: {filteredCategories.length}</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Category
          </Button>
        </Stack>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            margin="dense"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="category-type-label">Type</InputLabel>
            <Select
              labelId="category-type-label"
              value={selectedType}
              onChange={handleTypeChange}
              label="Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="App">App</MenuItem>
              <MenuItem value="Game">Game</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="category-platform-label">Platform</InputLabel>
            <Select
              labelId="category-platform-label"
              value={selectedPlatform}
              onChange={handlePlatformChange}
              label="Platform"
            >
              <MenuItem value="">All</MenuItem>
              {platforms.map((platform) => (
                <MenuItem key={platform.platform_id} value={platform.platform_id}>
                  {platform.platform_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Grid container spacing={2}>
          {paginatedCategories.length > 0 ? (
            paginatedCategories.map((category) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={category.cat_id}>
                <Card variant="outlined" sx={{ position: 'relative', borderRadius: '8px' }}>
                  <div
                    style={coverStyle(category.cover || '')} // Default to empty string if cover is null
                  />
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    {category.icon && (
                      <img
                        src={category.icon}
                        alt={category.cat_name}
                        style={iconStyle}
                      />
                    )}
                    <Typography variant="h6" component="div">
                      {category.cat_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {category.cat_description || 'No description'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setSelectedCategory(category);
                        setEditDialogOpen(true);
                      }}
                    >
                      <IconEdit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(category.cat_id)}>
                      <IconTrash />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">
                No categories available
              </Typography>
            </Grid>
          )}
        </Grid>
        <Stack direction="row" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filteredCategories.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Stack>
        {selectedCategory && (
          <EditCategoryDialog
            fetchCategory={fetchCategories}
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            category={selectedCategory}
            onSave={handleUpdate}
            setSnackbarOpen={setSnackbarOpen}
            setSnackbarMessage={setSnackbarMessage}
            setSnackbarSeverity={setSnackbarSeverity}
          />
        )}
        <AddCategoryDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSave={handleAdd}
          setSnackbarOpen={setSnackbarOpen}
          setSnackbarMessage={setSnackbarMessage}
          setSnackbarSeverity={setSnackbarSeverity}
        />
      </BaseCard>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: (theme) => theme.zIndex.snackbar + 1 }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CategoryList;
