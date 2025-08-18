import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useCreate } from '@refinedev/core';

interface OrganizationSetupModalProps {
  open: boolean;
  onClose: (success?: boolean) => void;
}

export const OrganizationSetupModal: React.FC<OrganizationSetupModalProps> = ({
  open,
  onClose,
}) => {
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const { mutate: createOrganization } = useCreate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      return;
    }

    setLoading(true);
    
    try {
      await createOrganization({
        resource: 'organizations',
        values: {
          name: organizationName.trim(),
          active: true,
        },
      });
      
      onClose(true);
    } catch (error) {
      console.error('Failed to create organization:', error);
      // Handle error - could show a snackbar or error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => !loading && onClose(false)}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Setup Your Organization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          To get started, please create your organization.
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              required
              fullWidth
              label="Organization Name"
              placeholder="Enter your organization name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              disabled={loading}
              variant="outlined"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => onClose(false)} 
            disabled={loading}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !organizationName.trim()}
            sx={{
              backgroundColor: '#4ade80',
              '&:hover': {
                backgroundColor: '#22c55e'
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
