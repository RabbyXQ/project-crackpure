// 'use client';
import { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from "@mui/material";
import BaseCard from '@/app/(DashboardLayout)/components/shared/BaseCard';

// Define the type for your admin data
type Admin = {
  username: string;
  email?: string;
};

const AdminList = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the list of admins from the API
    const fetchAdmins = async () => {
      try {
        const response = await fetch('/api/admin');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAdmins(data.admins);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={12}>
        <BaseCard title="Admin List">
          {error && <Typography color="error">Error: {error}</Typography>}
          <Grid container spacing={2}>
            {admins.map((admin) => (
              <Grid item xs={12} sm={6} md={4} key={admin.username}>
                <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
                  <Typography variant="h6">{admin.username}</Typography>
                  <Typography variant="body2">{admin.email || 'No email'}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </BaseCard>
      </Grid>
    </Grid>
  );
};

export default AdminList;
