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
} from '@mui/material';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import BaseCard from '@/app/(DashboardLayout)/components/shared/BaseCard';
import EditPlatformDialog from './components/EditPlatformDialog';
import AddPlatformDialog from './components/AddPlatformDialog';

type Platform = {
  platform_id: number;
  platform_name: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  cover?: string;
};

const PlatformList = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [filteredPlatforms, setFilteredPlatforms] = useState<Platform[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/platform');
      if (!response.ok) {
        throw new Error('Failed to fetch platforms');
      }
      const data = await response.json();
      const platformsData = Array.isArray(data.platforms) ? data.platforms : [];
      setPlatforms(platformsData);
      setFilteredPlatforms(platformsData);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      setSnackbarMessage('Failed to fetch platforms');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredPlatforms(
      platforms.filter((platform) => {
        if (!platform) return false;

        const platformNameMatches = platform.platform_name
          ? platform.platform_name.toLowerCase().includes(query)
          : false;

        const descriptionMatches = platform.description
          ? platform.description.toLowerCase().includes(query)
          : false;

        return platformNameMatches || descriptionMatches;
      })
    );
    setCurrentPage(1);
  }, [searchQuery, platforms]);

  const handleAdd = async (formData: FormData) => {
    try {
      const response = await fetch('/api/platform', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add platform');
      }

      const data = await response.json();
      if (data.platform && typeof data.platform.platform_id === 'number') {
        setPlatforms((prevPlatforms) => [...prevPlatforms, data.platform]);
        setFilteredPlatforms((prevFilteredPlatforms) => [...prevFilteredPlatforms, data.platform]);
        setAddDialogOpen(false);
        setSnackbarMessage('Platform added successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
      // Re-fetch platforms to update the list if necessary
      fetchPlatforms();

    } catch (error) {
      console.error('Error adding platform:', error);
      setSnackbarMessage('Error adding platform');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    try {
      const response = await fetch('/api/platform', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update platform');
      }

      const data = await response.json();
      if (data.platform) {
        setPlatforms((prevPlatforms) =>
          prevPlatforms.map((p) =>
            p.platform_id === data.platform.platform_id ? data.platform : p
          )
        );
        setFilteredPlatforms((prevFilteredPlatforms) =>
          prevFilteredPlatforms.map((p) =>
            p.platform_id === data.platform.platform_id ? data.platform : p
          )
        );
        setEditDialogOpen(false);
        setSnackbarMessage('Platform updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating platform:', error);
      setSnackbarMessage('Error updating platform');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDelete = async (platform_id: number) => {
    try {
      const response = await fetch('/api/platform', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete platform');
      }

      setPlatforms((prevPlatforms) => prevPlatforms.filter((platform) => platform.platform_id !== platform_id));
      setFilteredPlatforms((prevFilteredPlatforms) =>
        prevFilteredPlatforms.filter((platform) => platform.platform_id !== platform_id)
      );
      setSnackbarMessage('Platform deleted successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting platform:', error);
      setSnackbarMessage('Error deleting platform');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlatforms = filteredPlatforms.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (loading) return <CircularProgress />;

  return (
    <>
      <BaseCard title="Platform List">
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Total Platforms: {filteredPlatforms.length}</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Platform
          </Button>
        </Stack>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          margin="dense"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <Grid container spacing={2}>
          {paginatedPlatforms.length > 0 ? (
            paginatedPlatforms.map((platform) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={platform.platform_id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {platform.platform_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {platform.description || 'No description'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setSelectedPlatform(platform);
                        setEditDialogOpen(true);
                      }}
                    >
                      <IconEdit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(platform.platform_id)}>
                      <IconTrash />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" align="center">
                No platforms available
              </Typography>
            </Grid>
          )}
        </Grid>
        <Stack direction="row" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filteredPlatforms.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Stack>
        {selectedPlatform && (
          <EditPlatformDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            platform={selectedPlatform}
            onSave={handleUpdate}
            setSnackbarOpen={setSnackbarOpen}
            setSnackbarMessage={setSnackbarMessage}
            setSnackbarSeverity={setSnackbarSeverity}
          />
        )}
        <AddPlatformDialog
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

export default PlatformList;
