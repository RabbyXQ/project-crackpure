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
import EditAdminDialog from './components/EditAdminDialog';
import AddAdminDialog from './components/AddAdminDialog';

type Admin = {
  username: string;
  email?: string;
};

const AdminList = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Fetch admins on mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('/api/admin');
        if (!response.ok) {
          throw new Error('Failed to fetch admins');
        }
        const data = await response.json();
        setAdmins(data.admins || []);
        setFilteredAdmins(data.admins || []); // Initialize filteredAdmins
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Filter admins based on search query
  useEffect(() => {
    setFilteredAdmins(
      admins.filter((admin) =>
        admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (admin.email && admin.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
    setCurrentPage(1); // Reset to first page on search query change
  }, [searchQuery, admins]);

  // Handle adding a new admin
  const handleAdd = async (admin: { username: string; email?: string; password: string }) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin),
      });

      if (!response.ok) {
        throw new Error('Failed to add admin');
      }

      // Use `admin` directly here
      setAdmins((prevAdmins) => [...prevAdmins, admin]);
      setFilteredAdmins((prevFilteredAdmins) => [...prevFilteredAdmins, admin]);
      setAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  // Handle updating an admin
  const handleUpdate = async (admin: { username: string; email?: string; password?: string }) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(admin),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin');
      }

      setAdmins((prevAdmins) =>
        prevAdmins.map((a) =>
          a.username === admin.username ? { ...a, email: admin.email } : a
        )
      );
      setFilteredAdmins((prevFilteredAdmins) =>
        prevFilteredAdmins.map((a) =>
          a.username === admin.username ? { ...a, email: admin.email } : a
        )
      );
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating admin:', error);
    }
  };

  // Handle deleting an admin
  const handleDelete = async (username: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }

      setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.username !== username));
      setFilteredAdmins((prevFilteredAdmins) =>
        prevFilteredAdmins.filter((admin) => admin.username !== username)
      );
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  if (loading) return <CircularProgress />;

  return (
    <BaseCard title="Admin List">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Total Admins: {filteredAdmins.length}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<IconPlus />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Admin
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
        {paginatedAdmins.map((admin) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={admin.username}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" component="div">
                  {admin.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {admin.email || 'No email'}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  color="primary"
                  onClick={() => {
                    setSelectedAdmin(admin);
                    setEditDialogOpen(true);
                  }}
                >
                  <IconEdit />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(admin.username)}>
                  <IconTrash />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Stack direction="row" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(filteredAdmins.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </Stack>
      {selectedAdmin && (
        <EditAdminDialog
          open={editDialogOpen}
          admin={selectedAdmin}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleUpdate}
        />
      )}
      <AddAdminDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleAdd}
      />
    </BaseCard>
  );
};

export default AdminList;
