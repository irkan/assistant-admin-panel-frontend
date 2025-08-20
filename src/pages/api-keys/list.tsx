import React, { useState } from "react";
import { useList, useCreate } from "@refinedev/core";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Grid,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormControlLabel,
  Switch,
  Backdrop,
  Chip,
  Divider,
  Container,
  Fade,
  Avatar,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  VisibilityOff as ViewOffIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Key as KeyIcon,
  VpnKey,
  Security,
  Lock,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import "../../styles/modern-theme.css";

interface ApiKey {
  id: string;
  name: string;
  type: 'private' | 'public';
  key: string;
  maskedKey: string;
  allowedOrigins?: string[];
  allowedAssistants?: string[];
  transientAssistants?: boolean;
  createdAt: string;
}

interface Assistant {
  id: string;
  name: string;
}

const CreateApiKeyModal: React.FC<{
  open: boolean;
  onClose: () => void;
  type: 'private' | 'public';
  onSuccess: () => void;
}> = ({ open, onClose, type, onSuccess }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [allowedOrigins, setAllowedOrigins] = useState('');
  const [selectedAssistants, setSelectedAssistants] = useState<string[]>([]);
  const [transientAssistants, setTransientAssistants] = useState(true);
  const { mutate: create, isLoading } = useCreate();

  // Get assistants from backend
  const { data: assistantsData, isLoading: assistantsLoading } = useList<{id: number, name: string}>({
    resource: 'assistants',
    pagination: { mode: 'off' },
  });

  const assistants: Assistant[] = assistantsData?.data?.map((assistant) => ({
    id: assistant.id.toString(),
    name: assistant.name,
  })) || [];

  const handleSubmit = () => {
    const data = {
      name,
      type,
      ...(type === 'public' && {
        allowedOrigins: allowedOrigins.split(',').map(origin => origin.trim()),
        allowedAssistants: selectedAssistants,
        transientAssistants,
      }),
    };

    create({
      resource: 'api-keys',
      values: data,
    }, {
      onSuccess: () => {
        onSuccess();
        handleClose();
      },
    });
  };

  const handleClose = () => {
    setName('');
    setAllowedOrigins('');
    setSelectedAssistants([]);
    setTransientAssistants(true);
    onClose();
  };

  const handleAssistantChange = (event: any) => {
    const value = event.target.value;
    setSelectedAssistants(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <>
      <Backdrop
        open={open}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: theme.zIndex.modal - 1,
        }}
      />
      <Dialog
        open={open}
        onClose={() => {}} // Prevent closing on backdrop click
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fff',
          },
        }}
        disableEscapeKeyDown
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: theme.palette.divider,
          pb: 2,
        }}>
          <Typography variant="h6">
            New {type === 'private' ? 'Private' : 'Public'} API Key
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add a new API Key to restrict access
          </Typography>
          
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Name
              </Typography>
              <TextField
                fullWidth
                placeholder="API Key Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f8f9fa',
                    borderRadius: 1,
                  },
                }}
              />
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                Token Name is a required field
              </Typography>
            </Box>

            {type === 'public' && (
              <>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                    Allowed Origins 
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ℹ️
                    </Typography>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Allowed urls"
                    value={allowedOrigins}
                    onChange={(e) => setAllowedOrigins(e.target.value)}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f8f9fa',
                        borderRadius: 1,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                    Allowed Assistants 
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ℹ️
                    </Typography>
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      multiple
                      value={selectedAssistants}
                      onChange={handleAssistantChange}
                      input={<OutlinedInput />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const assistant = assistants.find(a => a.id === value);
                            return (
                              <Chip key={value} label={assistant?.name} size="small" />
                            );
                          })}
                        </Box>
                      )}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f8f9fa',
                          borderRadius: 1,
                        },
                      }}
                      displayEmpty
                    >
                      <MenuItem disabled value="">
                        Select Assistants
                      </MenuItem>
                      {assistants.map((assistant) => (
                        <MenuItem key={assistant.id} value={assistant.id}>
                          <Checkbox checked={selectedAssistants.indexOf(assistant.id) > -1} />
                          <ListItemText primary={assistant.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={transientAssistants} 
                        onChange={(e) => setTransientAssistants(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#10b981',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#10b981',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        Transient Assistant 
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ℹ️
                        </Typography>
                      </Typography>
                    }
                  />
                </Box>
              </>
            )}
          </Stack>

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            sx={{
              mt: 4,
              py: 1.5,
              backgroundColor: '#10b981',
              '&:hover': {
                backgroundColor: '#059669',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Create {type === 'private' ? 'Private' : 'Public'} Token
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ApiKeyCard: React.FC<{
  apiKey: ApiKey;
  onCopy: (key: string) => void;
  onView: () => void;
  onDelete: () => void;
}> = ({ apiKey, onCopy, onView, onDelete }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const handleToggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fff',
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {apiKey.type === 'private' ? 'Private Key' : 'Public Key'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <KeyIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                  color: 'text.primary',
                  flex: 1,
                }}
              >
                {isVisible ? apiKey.key : apiKey.maskedKey}
              </Typography>
            </Box>

            {apiKey.type === 'public' && (
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Origins:
                  </Typography>
                  <Typography variant="body2">
                    All domains allowed
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Assistants:
                  </Typography>
                  <Typography variant="body2">
                    All Assistants allowed
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Transient Assistants:
                  </Typography>
                  <Typography variant="body2">
                    Allowed
                  </Typography>
                </Box>
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton 
              size="small" 
              onClick={() => onCopy(apiKey.key)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={handleToggleVisibility}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {isVisible ? <ViewOffIcon fontSize="small" /> : <ViewIcon fontSize="small" />}
            </IconButton>
            <IconButton 
              size="small" 
              onClick={onDelete}
              sx={{ 
                color: 'text.secondary',
                '&:hover': { color: 'error.main' },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export const ApiKeyList: React.FC = () => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'private' | 'public'>('private');
  
  // Mock API keys data
  const mockApiKeys: ApiKey[] = [
    {
      id: '1',
      name: 'Private Key 1',
      type: 'private',
      key: '61f03502-9f16-44e1-b3fa-c1a7689cbd89',
      maskedKey: '••••••••••••••••••••••••••••••••',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Public Key 1',
      type: 'public',
      key: 'pk_live_1234567890abcdef1234567890abcdef',
      maskedKey: '••••••••••••••••••••••••••••••••',
      allowedOrigins: ['*'],
      allowedAssistants: ['*'],
      transientAssistants: true,
      createdAt: '2024-01-15',
    },
  ];

  const { data, refetch } = useList<ApiKey>({
    resource: 'api-keys',
    pagination: { mode: 'off' },
  });

  // Use mock data if no real data
  const apiKeys: ApiKey[] = data?.data?.length ? data.data : mockApiKeys;

  const privateKeys: ApiKey[] = apiKeys.filter(key => key.type === 'private');
  const publicKeys: ApiKey[] = apiKeys.filter(key => key.type === 'public');

  const handleCreateClick = (type: 'private' | 'public') => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    // You can add a toast notification here
  };

  const handleView = (apiKey: ApiKey) => {
    // Show full key logic
    console.log('View key:', apiKey);
  };

  const handleDelete = (apiKey: ApiKey) => {
    // Delete key logic
    console.log('Delete key:', apiKey);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/assets/backgrounds/gradient-bg.svg') no-repeat center center",
        backgroundSize: "cover",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(30,41,59,0.95) 100%)",
        },
      }}
    >
      <Box className="bg-pattern-dots" sx={{ position: "absolute", inset: 0, opacity: 0.08 }} />
      
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, pt: 4, pb: 6 }}>
        {/* Header Section */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                <VpnKey sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #ffffff 0%, #f093fb 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 0.5,
                  }}
                >
                  API Keys
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Manage your private and public API keys for secure integrations
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Fade>

        <Grid container spacing={4}>
        {/* Private API Keys Section */}
        <Grid item xs={12}>
          <Fade in timeout={800}>
            <Paper
              className="modern-card-dark"
              sx={{ p: 4, mb: 2 }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
              }}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      }}
                    >
                      <Lock sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                      Private API Keys
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    Use these keys for interacting with our APIs in your backend systems.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateClick('private')}
                  sx={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    textTransform: "none",
                    borderRadius: "12px",
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    boxShadow: "0 4px 16px rgba(16, 185, 129, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(16, 185, 129, 0.4)",
                    },
                  }}
                >
                  Add Key
                </Button>
              </Box>
          
          <Box>
            {privateKeys.map((apiKey) => (
              <ApiKeyCard
                key={apiKey.id}
                apiKey={apiKey}
                onCopy={handleCopy}
                onView={() => handleView(apiKey)}
                onDelete={() => handleDelete(apiKey)}
              />
            ))}
            {privateKeys.length === 0 && (
              <Card sx={{ 
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
                py: 4,
                borderRadius: 2,
              }}>
                <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  No private API keys yet
                </Typography>
              </Card>
            )}
          </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Public API Keys Section */}
        <Grid item xs={12}>
          <Fade in timeout={1000}>
            <Paper
              className="modern-card-dark"
              sx={{ p: 4 }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
              }}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      }}
                    >
                      <Security sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                      Public API Keys
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    Use these keys for interacting with our APIs in your frontend applications.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateClick('public')}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    textTransform: "none",
                    borderRadius: "12px",
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
                    },
                  }}
                >
                  Add Key
                </Button>
              </Box>
              
              <Box>
            {publicKeys.map((apiKey) => (
              <ApiKeyCard
                key={apiKey.id}
                apiKey={apiKey}
                onCopy={handleCopy}
                onView={() => handleView(apiKey)}
                onDelete={() => handleDelete(apiKey)}
              />
            ))}
            {publicKeys.length === 0 && (
              <Card sx={{ 
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
                py: 4,
                borderRadius: 2,
              }}>
                <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  No public API keys yet
                </Typography>
              </Card>
            )}
          </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      <CreateApiKeyModal
        open={modalOpen}
        onClose={handleModalClose}
        type={modalType}
        onSuccess={handleCreateSuccess}
      />
      </Container>
    </Box>
  );
};
