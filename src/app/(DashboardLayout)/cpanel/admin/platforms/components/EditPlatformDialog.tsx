import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
} from '@mui/material';

type EditPlatformDialogProps = {
  open: boolean;
  platform: { platform_id: number; platform_name: string; description?: string };
  onClose: () => void;
  onSave: (platform: { platform_id: number; platform_name: string; description?: string }) => void;
};

const EditPlatformDialog: React.FC<EditPlatformDialogProps> = ({ open, platform, onClose, onSave }) => {
  const [platformName, setPlatformName] = useState<string>(platform.platform_name);
  const [description, setDescription] = useState<string>(platform.description || '');

  // Update form fields when platform prop changes
  useEffect(() => {
    setPlatformName(platform.platform_name);
    setDescription(platform.description || '');
  }, [platform]);

  const handleSave = () => {
    if (platformName.trim()) {
      onSave({ platform_id: platform.platform_id, platform_name: platformName, description });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Platform</DialogTitle>
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

export default EditPlatformDialog;
