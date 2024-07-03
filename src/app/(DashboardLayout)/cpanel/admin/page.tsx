// components/AdminList.tsx
'use client'

import { useEffect, useState } from 'react';

type Admin = {
  username: string;
  email?: string;
};

const AdminList = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('/api/admin');
        const data = await response.json();
        setAdmins(data.admins || []);
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Admin List</h2>
      <ul>
        {admins.map((admin) => (
          <li key={admin.username}>
            {admin.username} - {admin.email || 'No email'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminList;
