'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

type EditAdminDialogProps = {
  open: boolean;
  admin: { username: string; email?: string };
  onClose: () => void;
  onSave: (admin: { username: string; email?: string; password?: string }) => void;
};

const EditAdminDialog = ({ open, admin, onClose, onSave }: EditAdminDialogProps) => {
  const [username, setUsername] = useState(admin.username);
  const [email, setEmail] = useState(admin.email || '');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setUsername(admin.username);
    setEmail(admin.email || '');
    setPassword(''); // Reset password field when dialog opens
  }, [admin, open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (username) {
      onSave({ username, email, password: password || undefined });
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Admin</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={username}
            InputProps={{ readOnly: true }} // Disable editing
          />
          <TextField
            margin="dense"
            label="Email (optional)"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            label="New Password (optional)"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={onSave} color="primary">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditAdminDialog;
