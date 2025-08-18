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
  Alert,
} from '@mui/material';
import { useCreate, useGetIdentity } from '@refinedev/core';

interface OrganizationModalProps {
  open: boolean;
  onClose: (success?: boolean) => void;
}

export const OrganizationModal: React.FC<OrganizationModalProps> = ({
  open,
  onClose,
}) => {
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate: createOrganization } = useCreate();
  const { data: identity } = useGetIdentity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      setError('Organization name is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await createOrganization({
        resource: 'organizations',
        values: {
          name: organizationName.trim(),
          active: true,
        },
      });
      
      // Reload the page to refresh user data with new organization
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to create organization:', error);
      setError(error?.message || 'Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Don't allow closing if loading or if no organization exists
      // User must create an organization to continue
      return;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={true}
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Create Your Organization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Welcome{identity?.name ? `, ${identity.name}` : ''}! To continue, please create your organization.
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              required
              fullWidth
              label="Organization Name"
              placeholder="Enter your organization name (e.g., Kapital Bank)"
              value={organizationName}
              onChange={(e) => {
                setOrganizationName(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
              variant="outlined"
              helperText="A unique short name will be automatically generated (e.g., KB for Kapital Bank)"
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !organizationName.trim()}
            sx={{
              backgroundColor: '#4ade80',
              '&:hover': {
                backgroundColor: '#22c55e'
              },
              px: 4,
              py: 1,
            }}
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
