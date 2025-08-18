import React, { useState, useEffect } from "react";
import { List } from "@refinedev/mui";
import { useList, useUpdate } from "@refinedev/core";
import { CreateAssistantModal } from "../../components";
import toolTypesData from "../../data/toolTypes.json";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  alpha,
  useTheme,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize,
  Switch,
  FormControlLabel,
  Chip,
  Slider,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Menu,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Add,
  Search,
  Circle,
  Edit,
  Delete,
  ContentCopy,
  Settings,
  MoreVert,
  PlayCircle,
  PauseCircle,
  VolumeUp,
  AccessTime,
  Schedule,
  History,
  Phone,
  FileCopy,
  Close,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import providersData from "../../data/providers.json";

interface Agent {
  id: number;
  name: string;
  organizationId: number;
  organization?: {
    id: number;
    name: string;
    shortName?: string;
  };
  voiceModel?: string;
  active: boolean;
  status?: string; // draft, published
  createdAt: string;
  updatedAt?: string;
  details?: {
    agentId: string;
    firstMessage?: string;
    systemPrompt?: string;
    interactionMode?: string;
    provider?: string;
    model?: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const AssistantList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [selectedProvider, setSelectedProvider] = useState("azure-openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-2024-11-20");
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("zephyr");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [silenceTimeout, setSilenceTimeout] = useState(30);
  const [maximumDuration, setMaximumDuration] = useState(600);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [firstMessage, setFirstMessage] = useState("");
  const [interactionMode, setInteractionMode] = useState("assistant_speak_first");

  const { data, isLoading, refetch } = useList<Agent>({
    resource: "assistants",
    pagination: {
      mode: "server",
      pageSize: 100,
    },
  });

  const { mutate: updateAssistant } = useUpdate();

  const agents = (data?.data || []) as Agent[];

  // Filter agents based on search
  const filteredAgents = agents.filter((agent) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      agent.name?.toLowerCase().includes(searchLower) ||
      agent.id?.toString().includes(searchLower)
    );
  });

  // Select first agent by default
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setTabValue(0); // Reset to Model tab
    // Set form values from selected agent
    setFirstMessage(agent.details?.firstMessage || "Hello.");
    setInteractionMode(agent.details?.interactionMode || "assistant_speak_first");
    setSelectedTools([]); // Reset tools for blank template
  };

    const handlePublish = () => {
    if (!selectedAgent) return;
    
    setIsPublishing(true);
    
    // Prepare all form data for publishing
    const publishData = {
      name: selectedAgent.name,
      organizationId: selectedAgent.organizationId || selectedAgent.organization?.id, // Fallback to organization.id
      active: selectedAgent.active,
      details: {
        firstMessage: firstMessage,
        userPrompt: userPrompt,
        systemPrompt: selectedAgent.details?.systemPrompt || "This is a blank template with minimal defaults, you can change the model, temperature, and messages.",
        interactionMode: interactionMode,
        provider: selectedProvider,
        model: selectedModel,
        selectedVoice: selectedVoice,
        temperature: temperature,
        silenceTimeout: silenceTimeout,
        maximumDuration: maximumDuration,
      },
      tools: selectedTools
    };

    console.log('Publishing data:', publishData); // Debug log

    // Use custom fetch to call the publish endpoint
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/assistants/${selectedAgent.id}/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('refine-auth')}`
      },
      body: JSON.stringify(publishData)
    })
    .then(response => response.json())
    .then(data => {
      setIsPublishing(false);
      if (data.success) {
        refetch();
        // Update local state
        setSelectedAgent({ ...selectedAgent, status: 'published' });
      } else {
        console.error('Publish failed:', data.message);
      }
    })
    .catch(error => {
      setIsPublishing(false);
      console.error('Publish error:', error);
    });
  };

  // Get models for selected provider
  const getModelsForProvider = (providerId: string) => {
    const provider = providersData.providers.find(p => p.id === providerId);
    return provider?.models || [];
  };

  // Get voices for selected provider
  const getVoicesForProvider = (providerId: string) => {
    const provider = providersData.providers.find(p => p.id === providerId);
    return provider?.voices || [];
  };

  // Get all available tools from toolTypes data
  const getAllTools = () => {
    const allTools = [];
    for (const categoryKey in toolTypesData.categories) {
      const category = (toolTypesData.categories as any)[categoryKey];
      if (category.tools) {
        allTools.push(...category.tools);
      }
    }
    return allTools;
  };

  // Handle tool selection change
  const handleToolChange = (event: any) => {
    const value = event.target.value;
    setSelectedTools(typeof value === 'string' ? value.split(',') : value);
  };

  // Play voice sample
  const playVoice = async (voiceId: string, sampleUrl: string) => {
    if (playingVoice === voiceId) {
      // Stop current playing
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voiceId);
    
    try {
      const audio = new Audio(sampleUrl);
      audio.onended = () => setPlayingVoice(null);
      audio.onerror = () => setPlayingVoice(null);
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingVoice(null);
    }
  };

  return (
    <List
      title="Assistants"
      headerButtons={<></>}
      breadcrumb={false}
      wrapperProps={{
        sx: { padding: 0 }
      }}
      contentProps={{
        sx: { padding: 0 }
      }}
    >
      <Box sx={{ height: "calc(100vh - 128px)", display: "flex", overflow: "hidden" }}>
      {/* Left Sidebar */}
      <Box
        sx={{
          width: 320,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Header with Create Button */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Button
            fullWidth
          variant="contained"
          startIcon={<Add />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              py: 1,
              mb: 2,
              backgroundColor: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#047857',
              }
            }}
          >
            Create Assistant
        </Button>

          {/* Search Field */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search Assistants"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
            }}
          />
        </Box>

        {/* Agent List */}
        <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
          {filteredAgents.map((agent) => (
            <Card
              key={agent.id}
              onClick={() => handleAgentSelect(agent)}
              sx={{
                mb: 1,
                cursor: "pointer",
                border: `1px solid ${
                  selectedAgent?.id === agent.id
                    ? theme.palette.primary.main
                    : "transparent"
                }`,
                backgroundColor:
                  selectedAgent?.id === agent.id
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                },
              }}
            >
              <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {agent.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {agent.details?.model || "Elliot"}
                    </Typography>
                  </Box>
                  <Circle
                    sx={{
                      fontSize: 12,
                      color: agent.status === 'published' 
                        ? theme.palette.success.main
                        : '#ff9800', // Orange for draft
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Right Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selectedAgent ? (
          <>
            {/* Agent Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {selectedAgent.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedAgent.details?.agentId || `8b4bfa09-eb6e-416b-ab60-a3673512b225#llm-model`}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopy />}
                    sx={{ textTransform: "none" }}
                  >
                    Test
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: "none" }}
                  >
                    Chat
                  </Button>
                  {selectedAgent?.status !== 'published' && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handlePublish}
                      disabled={isPublishing}
                      sx={{ 
                        textTransform: "none",
                        backgroundColor: theme.palette.success.main,
                        '&:hover': {
                          backgroundColor: theme.palette.success.dark,
                        }
                      }}
                    >
                      {isPublishing ? "Publishing..." : "Publish"}
                    </Button>
                  )}
                  <IconButton 
                    size="small"
                    onClick={(event) => setMenuAnchorEl(event.currentTarget)}
                  >
                    <MoreVert />
                  </IconButton>
                </Stack>
                
                {/* Assistant Actions Menu */}
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={() => setMenuAnchorEl(null)}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 160,
                    }
                  }}
                >
                  <MenuItem onClick={() => {
                    setMenuAnchorEl(null);
                    setVersionHistoryOpen(true);
                  }}>
                    <History sx={{ mr: 1, fontSize: 18 }} />
                    Version History
                  </MenuItem>
                  <MenuItem onClick={() => {
                    setMenuAnchorEl(null);
                    // Handle Call Logs
                  }}>
                    <Phone sx={{ mr: 1, fontSize: 18 }} />
                    Call Logs
                  </MenuItem>
                  <MenuItem onClick={() => {
                    setMenuAnchorEl(null);
                    // Handle Duplicate
                  }}>
                    <FileCopy sx={{ mr: 1, fontSize: 18 }} />
                    Duplicate
                  </MenuItem>
                  <MenuItem 
                    onClick={() => {
                      setMenuAnchorEl(null);
                      setDeleteModalOpen(true);
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <Delete sx={{ mr: 1, fontSize: 18 }} />
                    Delete
                  </MenuItem>
                </Menu>
              </Stack>

              {/* Tags */}
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Chip label="deepgram" size="small" color="success" />
                <Chip label="azure" size="small" color="warning" />
                <Chip label="openai" size="small" color="info" />
                <Chip label="gemini" size="small" color="error" />
                <Chip label="web" size="small" />
              </Stack>

              {/* Cost and Latency Bars */}
              <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Cost
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ~$0.09 /min
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      height: 4,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "60%",
                        background: `linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #3b82f6 100%)`,
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Latency
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ~600 ms
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      height: 4,
                      borderRadius: 1,
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "70%",
                        background: `linear-gradient(90deg, #f59e0b 0%, #3b82f6 50%, #8b5cf6 100%)`,
                      }}
                    />
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Model" sx={{ textTransform: "none" }} />
                <Tab label="Voice" sx={{ textTransform: "none" }} />
                <Tab label="Tools" sx={{ textTransform: "none" }} />
                <Tab label="Advanced" sx={{ textTransform: "none" }} />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ flex: 1, overflow: "auto" }}>
              <TabPanel value={tabValue} index={0}>
                {/* Model Tab Content */}
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Settings sx={{ fontSize: 20 }} />
                      Model
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure the behavior of the assistant.
                    </Typography>
                  </Box>

                  <Divider />

                  <FormControl fullWidth>
                    <InputLabel>First Message Mode</InputLabel>
                    <Select
                      value={interactionMode}
                      label="First Message Mode"
                      onChange={(e) => setInteractionMode(e.target.value)}
                    >
                      <MenuItem value="assistant_speak_first">Assistant speaks first</MenuItem>
                      <MenuItem value="user_speak_first">User speaks first</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      First Message
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Enter the first message..."
                      value={firstMessage}
                      onChange={(e) => setFirstMessage(e.target.value)}
                      variant="outlined"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      User Prompt
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Enter user prompt..."
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      variant="outlined"
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2">
                        System Prompt
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<Add />}
                        sx={{ textTransform: "none" }}
                      >
                        Generate
                      </Button>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={8}
                      placeholder="Enter system prompt..."
                      value={selectedAgent?.details?.systemPrompt || `# Sorğular və Ray Toplama Agentinin Təlimatı

## Kimlik və Məqsəd

Siz Aylasınız, Azərbaycan Beynəlxalq Bankının ray toplayan səsli assistentisiniz. Əsas məqsədiniz maraqlı sorğular aparmaq, müştəri fikirlərinı toplamaq və bazar araşdırma məlumatlarını əldə etməkdir - bu zaman isə yüksək tamamlanma faizini və keyfiyyətli cavabları təmin etməkdir. Sorğu zamanı Azərbaycan Beynəlxalq Bankı sözünü qısa formada Bank ilə ifadə et.

## Səs və Şəxsiyyət`}
                      variant="outlined"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Temperature
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Slider
                          value={temperature}
                          onChange={(_, newValue) => setTemperature(newValue as number)}
                          min={0}
                          max={1}
                          step={0.1}
                          marks={[
                            { value: 0, label: '0' },
                            { value: 0.5, label: '0.5' },
                            { value: 1, label: '1' },
                          ]}
                          valueLabelDisplay="auto"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 40 }}>
                        {temperature.toFixed(1)}
                      </Typography>
                    </Stack>
                  </Box>

                </Stack>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Voice Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure the voice provider and model for the assistant.
                    </Typography>
                  </Box>

                  <Divider />

                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Provider</InputLabel>
                      <Select
                        value={selectedProvider}
                        label="Provider"
                        onChange={(e) => {
                          setSelectedProvider(e.target.value);
                          // Reset model selection when provider changes
                          const models = getModelsForProvider(e.target.value);
                          if (models.length > 0) {
                            setSelectedModel(models[0].id);
                          }
                        }}
                      >
                        {providersData.providers.map((provider) => (
                          <MenuItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Model</InputLabel>
                      <Select
                        value={selectedModel}
                        label="Model"
                        onChange={(e) => setSelectedModel(e.target.value)}
                      >
                        {getModelsForProvider(selectedProvider).map((model) => (
                          <MenuItem key={model.id} value={model.id}>
                            <Box>
                              <Typography variant="body2">
                                {model.name}
                                {(model as any).isNew && (
                                  <Chip 
                                    label="NEW" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ ml: 1, fontSize: '0.6rem', height: 16 }}
                                  />
                                )}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {model.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  {/* Voice Selection for Google Provider */}
                  {selectedProvider === "google" && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <VolumeUp sx={{ fontSize: 18 }} />
                          Voice Selection
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Choose a voice for your Gemini model. Click play to preview each voice.
                        </Typography>

                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 2,
                            maxHeight: 400,
                            overflowY: "auto",
                            pr: 1,
                          }}
                        >
                          {getVoicesForProvider(selectedProvider).map((voice) => (
                            <Card
                              key={voice.id}
                              onClick={() => setSelectedVoice(voice.id)}
                              sx={{
                                cursor: "pointer",
                                border: `2px solid ${
                                  selectedVoice === voice.id
                                    ? theme.palette.primary.main
                                    : "transparent"
                                }`,
                                backgroundColor:
                                  selectedVoice === voice.id
                                    ? alpha(theme.palette.primary.main, 0.08)
                                    : "transparent",
                                transition: "all 0.2s",
                                "&:hover": {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                  borderColor: alpha(theme.palette.primary.main, 0.3),
                                },
                              }}
                            >
                              <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playVoice(voice.id, voice.sampleUrl);
                                    }}
                                    sx={{
                                      color: playingVoice === voice.id 
                                        ? theme.palette.error.main 
                                        : theme.palette.primary.main,
                                    }}
                                  >
                                    {playingVoice === voice.id ? (
                                      <PauseCircle />
                                    ) : (
                                      <PlayCircle />
                                    )}
                                  </IconButton>
                                  
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={500}>
                                      {voice.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {voice.description}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      </Box>
                    </>
                  )}
                </Stack>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Tools
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tools enable voicebots to perform actions during calls. Add tools from the Tools Library to connect with Make.com or GHL workflows, or create custom tools with your backend.
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Tools Selection Dropdown */}
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      🛠️ TOOLS
                    </Typography>
                    <Box sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' ? '#1e293b' : '#f1f5f9',
                      borderRadius: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                    }}>
                      <Typography variant="body2" color="primary" sx={{ mb: 2, fontSize: '0.75rem' }}>
                        Note: Tools have different Request and Response format as compared to Functions. Check our{' '}
                        <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                          tools guide
                        </Box>{' '}
                        for more details
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        {selectedTools.map(toolId => {
                          const allTools = getAllTools();
                          const tool = allTools.find(t => t.id === toolId);
                          if (!tool) return null;
                          
                          return (
                            <Chip
                              key={toolId}
                              label={tool.name.replace('_', ' ')}
                              variant="filled"
                              sx={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                '& .MuiChip-deleteIcon': {
                                  color: 'white',
                                },
                              }}
                              onDelete={() => {
                                setSelectedTools(prev => prev.filter(id => id !== toolId));
                              }}
                            />
                          );
                        })}
                      </Box>

                      <FormControl fullWidth>
                        <Select
                          multiple
                          value={selectedTools}
                          onChange={handleToolChange}
                          input={<OutlinedInput />}
                          renderValue={() => ''}
                          displayEmpty
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff',
                            },
                          }}
                        >
                          <MenuItem disabled value="">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Search sx={{ fontSize: 16 }} />
                              <Typography>Search...</Typography>
                            </Box>
                          </MenuItem>
                          
                          <MenuItem value="">
                            <Checkbox checked={false} />
                            <ListItemText primary="(Select All)" />
                          </MenuItem>

                          {getAllTools().map((tool) => (
                            <MenuItem key={tool.id} value={tool.id}>
                              <Checkbox 
                                checked={selectedTools.indexOf(tool.id) > -1}
                                sx={{
                                  '&.Mui-checked': {
                                    color: '#10b981',
                                  },
                                }}
                              />
                              <ListItemText 
                                primary={
                                  <Box>
                                    <Typography variant="body2">
                                      {tool.name.replace('_', ' ')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {tool.id}
                                    </Typography>
                                  </Box>
                                } 
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Enable Function Calling Toggle */}
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Enable function calling"
                  />
                </Stack>
              </TabPanel>

              <TabPanel value={tabValue} index={3}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Call Timeout Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure when the assistant should end a call based on silence or duration.
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTime sx={{ fontSize: 18 }} />
                      Silence Timeout
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      How long to wait before a call is automatically ended due to inactivity.
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 60 }}>
                        10 (sec)
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Slider
                          value={silenceTimeout}
                          onChange={(_, newValue) => setSilenceTimeout(newValue as number)}
                          min={10}
                          max={3600}
                          step={10}
                          marks={[
                            { value: 10, label: '10' },
                            { value: 300, label: '300' },
                            { value: 1800, label: '1800' },
                            { value: 3600, label: '3600' },
                          ]}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}s`}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 80 }}>
                        3600 (sec)
                      </Typography>
                      <Box sx={{
                        border: 1,
                        borderColor: theme.palette.divider,
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        minWidth: 60,
                        textAlign: "center",
                        backgroundColor: theme.palette.background.paper
                      }}>
                        <Typography variant="body2" fontWeight={500}>
                          {silenceTimeout}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Schedule sx={{ fontSize: 18 }} />
                      Maximum Duration
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      The maximum number of seconds a call will last.
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 60 }}>
                        10 (sec)
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Slider
                          value={maximumDuration}
                          onChange={(_, newValue) => setMaximumDuration(newValue as number)}
                          min={10}
                          max={43200}
                          step={10}
                          marks={[
                            { value: 10, label: '10' },
                            { value: 1800, label: '1800' },
                            { value: 7200, label: '7200' },
                            { value: 21600, label: '21600' },
                            { value: 43200, label: '43200' },
                          ]}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}s`}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ minWidth: 80 }}>
                        43200 (sec)
                      </Typography>
                      <Box sx={{
                        border: 1,
                        borderColor: theme.palette.divider,
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                        minWidth: 60,
                        textAlign: "center",
                        backgroundColor: theme.palette.background.paper
                      }}>
                        <Typography variant="body2" fontWeight={500}>
                          {maximumDuration}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </TabPanel>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.text.secondary,
            }}
          >
            <Typography>Select an agent to view details</Typography>
          </Box>
        )}
      </Box>
    </Box>
    
    {/* Delete Assistant Modal */}
    <Dialog
      open={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minWidth: 400,
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', pt: 3, pb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          width: 48,
          height: 48,
          backgroundColor: '#f59e0b',
          borderRadius: '50%',
          mx: 'auto',
          mb: 2
        }}>
          <Typography sx={{ fontSize: 24 }}>⚠️</Typography>
        </Box>
        
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Delete Assistant
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to delete this Assistant? You can't undo this action afterwards.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => setDeleteModalOpen(false)}
          sx={{ 
            textTransform: 'none',
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setDeleteModalOpen(false);
            // Handle delete logic here
            console.log('Delete assistant:', selectedAgent?.id);
          }}
          sx={{ 
            textTransform: 'none',
            backgroundColor: '#ef4444',
            '&:hover': {
              backgroundColor: '#dc2626',
            },
            px: 3,
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
    
    {/* Version History Drawer */}
    <Drawer
      anchor="right"
      open={versionHistoryOpen}
      onClose={() => setVersionHistoryOpen(false)}
      PaperProps={{
        sx: {
          width: 400,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fff',
        }
      }}
      ModalProps={{
        BackdropProps: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
          }
        }
      }}
    >
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f8f9fa',
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <History sx={{ mr: 2, fontSize: 20 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Version History
          </Typography>
          <IconButton
            edge="end"
            onClick={() => setVersionHistoryOpen(false)}
            sx={{ color: theme.palette.text.primary }}
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        {/* Version Item */}
        <Box
          sx={{
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: 2,
            p: 2,
            mb: 2,
            backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f8f9fa',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Version 46b5a932
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              🕐 Aug 15, 2025 12:46 PM
            </Typography>
          </Stack>
        </Box>
      </Box>
      
      {/* Keyboard Shortcuts - Fixed at bottom of drawer */}
      <Box 
        sx={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fff',
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? '#2d2d2d' : '#f1f5f9',
            borderRadius: 1,
            p: 2,
            fontSize: '0.875rem',
            color: 'text.secondary',
          }}
        >
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                ↓ Down / j:
              </Typography>
              <Typography variant="caption">
                Next version
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                ↑ Up / k:
              </Typography>
              <Typography variant="caption">
                Previous version
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                ↵ Enter:
              </Typography>
              <Typography variant="caption">
                View diff
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Drawer>
    
    {/* Create Assistant Modal */}
    <CreateAssistantModal
      open={createModalOpen}
      onClose={() => {
        setCreateModalOpen(false);
        refetch(); // Refresh the list after creating
        }}
      />
    </List>
  );
}; 