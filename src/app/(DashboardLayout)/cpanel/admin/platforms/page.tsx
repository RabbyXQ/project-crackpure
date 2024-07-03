'use client';

import { useState, useEffect } from 'react';
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

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/platform');
      if (!response.ok) {
        throw new Error('Failed to fetch platforms');
      }
      const data = await response.json();
      // Ensure data.platforms is an array
      const platformsData = Array.isArray(data.platforms) ? data.platforms : [];
      setPlatforms(platformsData);
      setFilteredPlatforms(platformsData); // Initialize filteredPlatforms
    } catch (error) {
      console.error('Error fetching platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch platforms on mount
  useEffect(() => {
    fetchPlatforms();
  }, []);

  // Filter platforms based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredPlatforms(
      platforms.filter((platform) => {
        if (!platform) return false; // Ensure platform is defined

        const platformNameMatches = platform.platform_name
          ? platform.platform_name.toLowerCase().includes(query)
          : false;

        const descriptionMatches = platform.description
          ? platform.description.toLowerCase().includes(query)
          : false;

        return platformNameMatches || descriptionMatches;
      })
    );
    setCurrentPage(1); // Reset to first page on search query change
  }, [searchQuery, platforms]);

  // Handle adding a new platform
  const handleAdd = async (formData: FormData) => {
    try {
      const response = await fetch('/api/platform', {
        method: 'POST',
        body: formData, // Send FormData directly
      });

      if (!response.ok) {
        throw new Error('Failed to add platform');
      }

      const data = await response.json();
      // Ensure data.platform is defined and has the expected structure
      if (data.platform && typeof data.platform.platform_id === 'number') {
        setPlatforms((prevPlatforms) => [...prevPlatforms, data.platform]);
        setFilteredPlatforms((prevFilteredPlatforms) => [...prevFilteredPlatforms, data.platform]);
        setAddDialogOpen(false); // Close dialog after saving
      }
      fetchPlatforms();

    } catch (error) {
      console.error('Error adding platform:', error);
    }
  };

  // Handle updating a platform
  const handleUpdate = async (platform: { platform_id: number; platform_name: string; description?: string }) => {
    try {
      const response = await fetch('/api/platform', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platform),
      });

      if (!response.ok) {
        throw new Error('Failed to update platform');
      }

      setPlatforms((prevPlatforms) =>
        prevPlatforms.map((p) =>
          p.platform_id === platform.platform_id ? { ...p, platform_name: platform.platform_name, description: platform.description } : p
        )
      );
      setFilteredPlatforms((prevFilteredPlatforms) =>
        prevFilteredPlatforms.map((p) =>
          p.platform_id === platform.platform_id ? { ...p, platform_name: platform.platform_name, description: platform.description } : p
        )
      );
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating platform:', error);
    }
  };

  // Handle deleting a platform
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
    } catch (error) {
      console.error('Error deleting platform:', error);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlatforms = filteredPlatforms.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (loading) return <CircularProgress />;

  return (
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
        size="small" // Compact size
        margin="dense" // Reduced margin
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
          platform={selectedPlatform}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleUpdate}
        />
      )}
      <AddPlatformDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAdd} // Ensure onSave closes the dialog
      />
    </BaseCard>
  );
};

export default PlatformList;
