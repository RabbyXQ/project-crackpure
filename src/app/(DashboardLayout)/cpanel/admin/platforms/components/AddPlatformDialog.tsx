import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  Typography,
} from '@mui/material';

type AddPlatformDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (platform: { platform_name: string; description?: string }) => void;
};

const AddPlatformDialog: React.FC<AddPlatformDialogProps> = ({ open, onClose, onSave }) => {
  const [platformName, setPlatformName] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSave = () => {
    if (platformName.trim()) {
      onSave({ platform_name: platformName, description });
      setPlatformName('');
      setDescription('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Platform</DialogTitle>
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

export default AddPlatformDialog;
