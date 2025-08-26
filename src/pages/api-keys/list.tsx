import React, { useState } from "react";
import { useList, useCreate, useDelete } from "@refinedev/core";

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
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import "../../styles/modern-theme.css";

interface ApiKey {
  id: string;
  name: string;
  maskedKey?: string;
  keyPrefix?: string;
  fullKey?: string; // For storing the full key when fetched
  allowedAssistants?: number[];
  expiresAt?: string;
  isExpired?: boolean;
  lastUsedAt?: string | null;
  createdAt: string;
  active: boolean;
}

const CreateApiKeyModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSuccess: (data?: any) => void;
}> = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [selectedAssistants, setSelectedAssistants] = useState<number[]>([]);
  const [expiresInDays, setExpiresInDays] = useState(90);
  const { mutate: create, isLoading } = useCreate();

  // Get assistants from backend
  const { data: assistantsData } = useList<{id: number, name: string}>({
    resource: 'assistants',
    pagination: { pageSize: 100 },
  });

  const assistants = assistantsData?.data || [];

  const handleSubmit = () => {
    const data = {
      name,
      allowedAssistants: selectedAssistants,
      expiresInDays,
    };

    create({
      resource: 'api-keys',
      values: data,
    }, {
      onSuccess: (response) => {
        onSuccess(response?.data);
        handleClose();
      },
    });
  };

  const handleClose = () => {
    setName('');
    setSelectedAssistants([]);
    setExpiresInDays(90);
    onClose();
  };

  const handleAssistantChange = (event: any) => {
    const value = event.target.value;
    setSelectedAssistants(typeof value === 'string' ? value.split(',').map(Number) : value);
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
            Yeni API Key
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            API key yaradın və assistantlarınıza giriş tənzimləyin
          </Typography>
          
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                API Key Adı
              </Typography>
              <TextField
                fullWidth
                placeholder="Məsələn: Production API Key"
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
              {!name.trim() && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  API key adı tələb olunur
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Bitme müddəti (gün)
              </Typography>
              <TextField
                fullWidth
                type="number"
                placeholder="90"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                variant="outlined"
                inputProps={{ min: 1, max: 365 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f8f9fa',
                    borderRadius: 1,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                1-365 gün arasında ola bilər (default: 90 gün)
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                İcazə verilən Assistantlar
              </Typography>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={selectedAssistants}
                  onChange={handleAssistantChange}
                  input={<OutlinedInput />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                          Bütün assistantlara icazə verilir
                        </Typography>
                      ) : (
                        selected.map((value) => {
                          const assistant = assistants.find(a => a.id === value);
                          return (
                            <Chip key={value} label={assistant?.name || `Assistant ${value}`} size="small" />
                          );
                        })
                      )}
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
                  <MenuItem value="" disabled>
                    <Typography color="text.secondary">
                      Assistantları seçin (boş buraxsanız hamısına icazə verilir)
                    </Typography>
                  </MenuItem>
                  {assistants.map((assistant) => (
                    <MenuItem key={assistant.id} value={assistant.id}>
                      <Checkbox checked={selectedAssistants.indexOf(assistant.id) > -1} />
                      <ListItemText primary={assistant.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Heç bir assistant seçilməzsə, bütün assistantlara icazə verilir
              </Typography>
            </Box>
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
            API Key Yarat
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ApiKeyCard: React.FC<{
  apiKey: ApiKey;
  onCopy: (key: string) => void;
  onView: (apiKey: ApiKey) => void;
  onDelete: (apiKey: ApiKey) => void;
  fullKey?: string;
  isLoading?: boolean;
}> = ({ apiKey, onCopy, onView, onDelete, fullKey, isLoading = false }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const handleToggleVisibility = () => {
    if (!isVisible && !fullKey) {
      // Fetch the full key when showing for the first time
      onView(apiKey);
    }
    setIsVisible(!isVisible);
  };

  // Use fullKey if available and visible, otherwise show masked version
  const displayKey = isVisible && fullKey 
    ? fullKey 
    : (apiKey.keyPrefix ? `${apiKey.keyPrefix}••••••••••••••••••••••••••••••••` : 'ak_••••••••••••••••••••••••••••••••');

  // For copying, use fullKey if available, otherwise use maskedKey
  const keyToCopy = fullKey || apiKey.maskedKey || '';

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
              {apiKey.name}
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
                {isLoading && isVisible ? 'Yüklənir...' : displayKey}
              </Typography>
            </Box>

            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                  Status:
                </Typography>
                <Chip 
                  label={apiKey.active ? 'Aktiv' : 'Deaktiv'} 
                  color={apiKey.active ? 'success' : 'error'} 
                  size="small" 
                />
              </Box>
              
              {apiKey.allowedAssistants && apiKey.allowedAssistants.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Assistantlar:
                  </Typography>
                  <Typography variant="body2">
                    {apiKey.allowedAssistants.length} assistant seçili
                  </Typography>
                </Box>
              )}
              
              {apiKey.expiresAt && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Bitmə tarixi:
                  </Typography>
                  <Typography variant="body2" color={apiKey.isExpired ? 'error.main' : 'text.primary'}>
                    {new Date(apiKey.expiresAt).toLocaleDateString('az-AZ')}
                    {apiKey.isExpired && ' (Vaxtı bitib)'}
                  </Typography>
                </Box>
              )}
              
              {apiKey.lastUsedAt && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                    Son istifadə:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(apiKey.lastUsedAt).toLocaleDateString('az-AZ')}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton 
              size="small" 
              onClick={() => onCopy(keyToCopy)}
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
              onClick={() => onDelete(apiKey)}
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
  const [fullKeys, setFullKeys] = useState<Record<string, string>>({});
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{id: string, rawKey: string} | null>(null);
  const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});
  
  const { data, refetch } = useList<ApiKey>({
    resource: 'api-keys',
    pagination: { mode: 'off' },
  });

  const { mutate: deleteApiKey } = useDelete();

  const apiKeys: ApiKey[] = data?.data || [];

  const handleCreateClick = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Clear newly created key after some time to allow user to copy it
    setTimeout(() => {
      setNewlyCreatedKey(null);
    }, 30000); // Clear after 30 seconds
  };

  const handleCreateSuccess = (data?: any) => {
    refetch();
    // Store the raw key if it's provided in the response
    if (data?.rawKey && data?.id) {
      setNewlyCreatedKey({ id: data.id.toString(), rawKey: data.rawKey });
      setFullKeys(prev => ({ ...prev, [data.id.toString()]: data.rawKey }));
    }
  };

  const handleCopy = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      // TODO: Add toast notification here
      console.log('API key copied to clipboard');
    } catch (error) {
      console.error('Failed to copy API key:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = key;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  const handleView = async (apiKey: ApiKey) => {
    // If we already have the full key, don't fetch again
    if (fullKeys[apiKey.id]) {
      return;
    }
    
    // Set loading state
    setLoadingKeys(prev => ({ ...prev, [apiKey.id]: true }));
    
    try {
      // Fetch the full key from backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/api-keys/${apiKey.id}/full`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('refine-auth')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.fullKey) {
          setFullKeys(prev => ({ ...prev, [apiKey.id]: data.data.fullKey }));
        } else {
          // Fallback to maskedKey if no fullKey in response
          if (apiKey.maskedKey) {
            setFullKeys(prev => ({ ...prev, [apiKey.id]: apiKey.maskedKey || '' }));
          }
        }
      } else {
        console.error('Failed to fetch full API key:', response.statusText);
        // Fallback to maskedKey if fetch fails
        if (apiKey.maskedKey) {
          setFullKeys(prev => ({ ...prev, [apiKey.id]: apiKey.maskedKey || '' }));
        }
      }
    } catch (error) {
      console.error('Error fetching full API key:', error);
      // Fallback to maskedKey on error
      if (apiKey.maskedKey) {
        setFullKeys(prev => ({ ...prev, [apiKey.id]: apiKey.maskedKey || '' }));
      }
    } finally {
      // Clear loading state
      setLoadingKeys(prev => ({ ...prev, [apiKey.id]: false }));
    }
  };

  const handleDelete = (apiKey: ApiKey) => {
    if (window.confirm(`"${apiKey.name}" API key-ini silmək istədiyinizə əminsiniz?`)) {
      deleteApiKey({
        resource: 'api-keys',
        id: apiKey.id,
      }, {
        onSuccess: () => {
          refetch();
          // Remove from both fullKeys and loadingKeys state if they exist
          setFullKeys(prev => {
            const updated = { ...prev };
            delete updated[apiKey.id];
            return updated;
          });
          setLoadingKeys(prev => {
            const updated = { ...prev };
            delete updated[apiKey.id];
            return updated;
          });
          console.log('API key deleted successfully');
        },
        onError: (error) => {
          console.error('Failed to delete API key:', error);
        }
      });
    }
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
          {/* API Keys Section */}
          <Grid item xs={12}>
            <Fade in timeout={800}>
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
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        }}
                      >
                        <VpnKey sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "white" }}>
                        API Keys
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                      API key-lərinizi idarə edin və assistantlarınıza təhlükəsiz giriş təmin edin.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
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
                    Yeni Key
                  </Button>
                </Box>
            
                <Box>
                  {apiKeys.map((apiKey) => (
                    <ApiKeyCard
                      key={apiKey.id}
                      apiKey={apiKey}
                      onCopy={handleCopy}
                      onView={handleView}
                      onDelete={handleDelete}
                      fullKey={fullKeys[apiKey.id]}
                      isLoading={loadingKeys[apiKey.id] || false}
                    />
                  ))}
                  {apiKeys.length === 0 && (
                    <Card sx={{ 
                      border: '2px dashed rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      textAlign: 'center',
                      py: 4,
                      borderRadius: 2,
                    }}>
                      <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                        Heç bir API key yoxdur. Yeni key yaradın.
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
          onSuccess={handleCreateSuccess}
        />
      </Container>
    </Box>
  );
};
