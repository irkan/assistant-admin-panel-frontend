import React, { useState, useEffect } from "react";
import { List } from "@refinedev/mui";
import { useList, useUpdate, useDelete } from "@refinedev/core";
import { CreateAssistantModal, AvatarTab } from "../../components";
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
  Avatar,
  Grid,
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
  SmartToy,
  Person,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import providersData from "../../data/providers.json";
import "../../styles/modern-theme.css";

interface Agent {
  id: number;
  uuid?: string; // Add UUID field
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
    userPrompt?: string;
    systemPrompt?: string;
    interactionMode?: string;
    provider?: string;
    model?: string;
    selectedVoice?: string;
    temperature?: number;
    silenceTimeout?: number;
    maximumDuration?: number;
    avatarName?: string;
  };
  tools?: Array<{
    id: number;
    toolId: string;
    toolName: string;
  }>;
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

  // Modern gradient backgrounds for cards
  const cardBackgrounds = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    "linear-gradient(135deg, #667db6 0%, #0082c8 100%)",
    "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    "linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)",
    "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)"
  ];

  const getCardBackground = (index: number) => {
    return cardBackgrounds[index % cardBackgrounds.length];
  };
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [selectedProvider, setSelectedProvider] = useState("google");
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash-001");
  const [userPrompt, setUserPrompt] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("zephyr");
  const [selectedAvatar, setSelectedAvatar] = useState("Ayla");
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [silenceTimeout, setSilenceTimeout] = useState(30);
  const [maximumDuration, setMaximumDuration] = useState(600);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [firstMessage, setFirstMessage] = useState("");
  const [interactionMode, setInteractionMode] = useState("assistant_speak_first");
  const [originalData, setOriginalData] = useState<any>(null); // Track original data for change detection
  const [hasChanges, setHasChanges] = useState(false);
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const [toolsLoading, setToolsLoading] = useState(false);

  const { data, isLoading, refetch } = useList<Agent>({
    resource: "assistants",
    pagination: {
      mode: "server",
      pageSize: 100,
    },
  });

  const { mutate: deleteAgent } = useDelete();

  const { mutate: updateAssistant } = useUpdate();

  // Refresh form when selectedAgent changes
  useEffect(() => {
    if (selectedAgent) {
      // Set all form values from selected agent details
      setFirstMessage(selectedAgent.details?.firstMessage || "Hello.");
      setUserPrompt(selectedAgent.details?.userPrompt || "");
      setInteractionMode(selectedAgent.details?.interactionMode || "assistant_speak_first");
      
      // Set provider and model (always Google now)
      setSelectedProvider("google");
      setSelectedModel(selectedAgent.details?.model || "gemini-2.0-flash-001");
      
      // Set voice settings
      setSelectedVoice(selectedAgent.details?.selectedVoice || "zephyr");
      
      // Set avatar
      setSelectedAvatar(selectedAgent.details?.avatarName || "Ayla");
      
      // Set advanced settings with proper defaults
      setTemperature(selectedAgent.details?.temperature ?? 0.7);
      setSilenceTimeout(selectedAgent.details?.silenceTimeout ?? 30);
      setMaximumDuration(selectedAgent.details?.maximumDuration ?? 600);
      
      // Set tools from agent data or empty array
      setSelectedTools(selectedAgent.tools?.map(tool => parseInt(tool.toolId)) || []);
      
      // Store original data for change detection
      setOriginalData({
        firstMessage: selectedAgent.details?.firstMessage || "Hello.",
        userPrompt: selectedAgent.details?.userPrompt || "",
        interactionMode: selectedAgent.details?.interactionMode || "assistant_speak_first",
        provider: selectedAgent.details?.provider || "azure-openai",
        model: selectedAgent.details?.model || "gpt-4o-2024-11-20",
        selectedVoice: selectedAgent.details?.selectedVoice || "zephyr",
        avatarName: selectedAgent.details?.avatarName || "Ayla",
        temperature: selectedAgent.details?.temperature ?? 0.7,
        silenceTimeout: selectedAgent.details?.silenceTimeout ?? 30,
        maximumDuration: selectedAgent.details?.maximumDuration ?? 600,
        tools: selectedAgent.tools?.map(tool => tool.toolId) || []
      });
      
      // Reset change detection
      setHasChanges(false);
    }
  }, [selectedAgent]);

  const agents = (data?.data || []) as Agent[];

  // Function to detect changes
  const detectChanges = () => {
    if (!originalData) return false;
    
    const currentData = {
      firstMessage,
      userPrompt,
      interactionMode,
      provider: "google",
      model: selectedModel,
      selectedVoice,
      avatarName: selectedAvatar,
      temperature,
      silenceTimeout,
      maximumDuration,
      tools: selectedTools
    };
    
    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  };

  // Watch for changes in form values
  useEffect(() => {
    if (originalData) {
      const changesDetected = detectChanges();
      setHasChanges(changesDetected);
    }
  }, [firstMessage, userPrompt, interactionMode, selectedProvider, selectedModel, selectedVoice, selectedAvatar, temperature, silenceTimeout, maximumDuration, selectedTools, originalData]);

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
    
    // Set all form values from selected agent details
    setFirstMessage(agent.details?.firstMessage || "Hello.");
    setUserPrompt(agent.details?.userPrompt || "");
    setInteractionMode(agent.details?.interactionMode || "assistant_speak_first");
    
    // Set provider and model (always Google now)
    setSelectedProvider("google");
    setSelectedModel(agent.details?.model || "gemini-2.0-flash-001");
    
    // Set voice settings
    setSelectedVoice(agent.details?.selectedVoice || "zephyr");
    
    // Set avatar
    setSelectedAvatar(agent.details?.avatarName || "Ayla");
    
    // Set advanced settings with proper defaults
    setTemperature(agent.details?.temperature ?? 0.7);
    setSilenceTimeout(agent.details?.silenceTimeout ?? 30);
    setMaximumDuration(agent.details?.maximumDuration ?? 600);
    
    // Set tools from agent data or empty array
    setSelectedTools(agent.tools?.map(tool => parseInt(tool.toolId)) || []);
    
    // Fetch tools for this agent's organization
    const organizationId = agent.organizationId || agent.organization?.id;
    if (organizationId) {
      fetchTools(organizationId);
    }
  };

  // Auto-select first agent when page loads
  useEffect(() => {
    if (filteredAgents.length > 0 && !selectedAgent) {
      handleAgentSelect(filteredAgents[0]);
    }
  }, [filteredAgents, selectedAgent]);

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
        provider: "google",
        model: selectedModel,
        selectedVoice: selectedVoice,
        avatarName: selectedAvatar,
        temperature: temperature,
        silenceTimeout: silenceTimeout,
        maximumDuration: maximumDuration,
      },
      tools: selectedTools
    };

    console.log('Publishing data:', publishData);

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
        // Reset change detection after successful publish
        setHasChanges(false);
        // Update original data to current values
        setOriginalData({
          firstMessage,
          userPrompt,
          interactionMode,
          provider: "google",
          model: selectedModel,
          selectedVoice,
          temperature,
          silenceTimeout,
          maximumDuration,
          tools: selectedTools
        });
      } else {
        console.error('Publish failed:', data.message);
      }
    })
    .catch(error => {
      setIsPublishing(false);
      console.error('Publish error:', error);
    });
  };

  // Handle delete assistant
  const handleDelete = () => {
    if (!selectedAgent) return;

    deleteAgent({
      resource: "assistants",
      id: selectedAgent.id,
    }, {
      onSuccess: () => {
        console.log('Assistant deleted successfully');
        setDeleteModalOpen(false);
        setSelectedAgent(null); // Clear selection
        refetch(); // Refresh the list
      },
      onError: (error) => {
        console.error('Delete failed:', error);
        setDeleteModalOpen(false);
      }
    });
  };

  // Handle duplicate assistant
  const handleDuplicate = async () => {
    if (!selectedAgent) return;

    try {
      setIsPublishing(true);
      
      // Generate new UUID (fallback for older browsers)
      const newUuid = crypto?.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      
      // Prepare duplicate data with new name and UUID
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 100);
      
      const duplicateData = {
        name: `${selectedAgent.name} Copy ${timestamp.toString().slice(-6)}${randomSuffix}`,
        organizationId: selectedAgent.organizationId || selectedAgent.organization?.id,
        active: selectedAgent.active,
        details: {
          firstMessage: selectedAgent.details?.firstMessage || firstMessage,
          userPrompt: selectedAgent.details?.userPrompt || userPrompt,
          systemPrompt: selectedAgent.details?.systemPrompt || "This is a blank template with minimal defaults, you can change the model, temperature, and messages.",
          interactionMode: selectedAgent.details?.interactionMode || interactionMode,
          provider: selectedAgent.details?.provider || "google",
          model: selectedAgent.details?.model || selectedModel,
          selectedVoice: selectedAgent.details?.selectedVoice || selectedVoice,
          temperature: selectedAgent.details?.temperature || temperature,
          silenceTimeout: selectedAgent.details?.silenceTimeout || silenceTimeout,
          maximumDuration: selectedAgent.details?.maximumDuration || maximumDuration,
        },
        tools: selectedAgent.tools || selectedTools || []
      };

      console.log('Duplicating assistant:', duplicateData);

      // Create new assistant
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/assistants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('refine-auth')}`
        },
        body: JSON.stringify(duplicateData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Assistant duplicated successfully');
        // Immediately publish the duplicated assistant
        const publishResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/assistants/${result.data.id}/publish`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('refine-auth')}`
          },
          body: JSON.stringify(duplicateData)
        });

        const publishResult = await publishResponse.json();
        
        if (publishResult.success) {
          console.log('Duplicated assistant published successfully');
          refetch(); // Refresh the list
        } else {
          console.error('Failed to publish duplicated assistant:', publishResult.message);
        }
      } else {
        console.error('Duplicate failed:', result.message);
      }
    } catch (error) {
      console.error('Duplicate error:', error);
    } finally {
      setIsPublishing(false);
    }
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

  // Get voice name by voice ID
  const getVoiceNameById = (voiceId: string) => {
    for (const provider of providersData.providers) {
      if (provider.voices) {
        const voice = provider.voices.find(v => v.id === voiceId);
        if (voice) {
          return voice.name;
        }
      }
    }
    return voiceId; // fallback to ID if name not found
  };

  // Fetch tools from API based on organization
  const fetchTools = async (organizationId: number) => {
    if (!organizationId) return;
    
    setToolsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/tools?organizationId=${organizationId}&status=published&active=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('refine-auth')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAvailableTools(result.data || []);
      } else {
        console.error('Failed to fetch tools:', result.message);
        setAvailableTools([]);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
      setAvailableTools([]);
    } finally {
      setToolsLoading(false);
    }
  };

  // Get all available tools (for backward compatibility)
  const getAllTools = () => {
    return availableTools;
  };

  // Handle tool selection change (not used anymore, but keeping for compatibility)
  const handleToolChange = (event: any) => {
    const value = event.target.value;
    console.log('🔧 Tool selection changed via Select:', value);
    // We handle selection via MenuItem onClick now
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
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/assets/backgrounds/geometric-bg.svg') no-repeat center center",
        backgroundSize: "cover",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
          zIndex: 0,
        },
      }}
    >
      <Box className="bg-pattern-grid" sx={{ position: "absolute", inset: 0, opacity: 0.1, zIndex: 1 }} />
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <List
          title={
            <Box sx={{ mb: 6, pt: 4 }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    background: "var(--gradient-primary)",
                    boxShadow: "var(--shadow-glow)",
                  }}
                >
                  <SmartToy sx={{ fontSize: 24 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 0.5,
                    }}
                  >
                    Assistant Overview
                  </Typography>
                  <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    Welcome back! Here's what's happening with your assistants today.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          }
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
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              textTransform: "none",
              borderRadius: "12px",
              fontWeight: 600,
              px: 3,
              py: 1.5,
              mb: 2,
              boxShadow: "0 4px 16px rgba(79, 172, 254, 0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #3b9bfe 0%, #00d9fe 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 24px rgba(79, 172, 254, 0.4)",
              },
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
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused": {
                  borderColor: "#4facfe",
                  boxShadow: "0 0 0 3px rgba(79, 172, 254, 0.1)",
                },
              },
              "& .MuiInputBase-input": {
                color: theme.palette.text.primary,
                "&::placeholder": {
                  color: theme.palette.text.secondary,
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Agent List */}
        <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
          {filteredAgents.map((agent, index) => (
            <Card
              key={agent.id}
              onClick={() => handleAgentSelect(agent)}
              sx={{
                mb: 1,
                cursor: "pointer",
                border: `1px solid ${
                  selectedAgent?.id === agent.id
                    ? theme.palette.primary.main
                    : "rgba(255,255,255,0.12)"
                }`,
                background:
                  selectedAgent?.id === agent.id
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`
                    : `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: getCardBackground(index),
                },
                backdropFilter: "blur(6px)",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  borderColor: alpha(theme.palette.primary.main, 0.35),
                  transform: "translateY(-2px)",
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
                      {agent.uuid || `assistant-${agent.id}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {agent.details?.selectedVoice ? getVoiceNameById(agent.details.selectedVoice) : "Zephyr"}
                    </Typography>
                  </Box>
                  <Circle
                    sx={{
                      fontSize: 12,
                      color: 
                        // If this is the selected agent and has changes, show orange
                        (selectedAgent?.id === agent.id && hasChanges) 
                        ? '#ff9800' 
                        // Otherwise show based on status
                        : agent.status === 'published' 
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
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
                backdropFilter: "blur(12px)",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "linear-gradient(90deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)",
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    {selectedAgent.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedAgent.uuid || `assistant-${selectedAgent.id}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                    Voice: {selectedAgent.details?.selectedVoice ? getVoiceNameById(selectedAgent.details.selectedVoice) : "Zephyr"}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopy />}
                    sx={{ 
                      textTransform: "none",
                      borderRadius: "8px",
                      fontWeight: 500,
                      px: 2,
                      py: 0.5,
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.primary,
                      "&:hover": {
                        borderColor: "#4facfe",
                        backgroundColor: "rgba(79, 172, 254, 0.1)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Test
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ 
                      textTransform: "none",
                      borderRadius: "8px",
                      fontWeight: 500,
                      px: 2,
                      py: 0.5,
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.primary,
                      "&:hover": {
                        borderColor: "#f093fb",
                        backgroundColor: "rgba(240, 147, 251, 0.1)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Chat
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    sx={{ 
                      background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      textTransform: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      boxShadow: "0 4px 16px rgba(67, 233, 123, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #32d965 0%, #2de6c7 100%)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 20px rgba(67, 233, 123, 0.4)",
                      },
                      "&:disabled": {
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.5)",
                      }
                    }}
                  >
                    {isPublishing ? "Publishing..." : "Publish"}
                  </Button>
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
                    handleDuplicate();
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
                <Tab label="Avatar" sx={{ textTransform: "none" }} />
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
                        value="google"
                        label="Provider"
                        disabled={true}
                        sx={{
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "12px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: `1px solid ${theme.palette.divider}`,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#4facfe",
                            boxShadow: "0 0 0 3px rgba(79, 172, 254, 0.1)",
                          },
                          "& .MuiSelect-select": {
                            color: theme.palette.text.secondary,
                          },
                          "& .MuiInputLabel-root": {
                            color: theme.palette.text.secondary,
                          }
                        }}
                      >
                        <MenuItem value="google">
                          Google
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Model</InputLabel>
                      <Select
                        value={selectedModel}
                        label="Model"
                        onChange={(e) => setSelectedModel(e.target.value)}
                        sx={{
                          background: "rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(10px)",
                          borderRadius: "12px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: `1px solid ${theme.palette.divider}`,
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.primary.main,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#4facfe",
                            boxShadow: "0 0 0 3px rgba(79, 172, 254, 0.1)",
                          },
                          "& .MuiSelect-select": {
                            color: theme.palette.text.primary,
                          },
                          "& .MuiInputLabel-root": {
                            color: theme.palette.text.secondary,
                          }
                        }}
                      >
                        {getModelsForProvider("google").map((model) => (
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
                          {getVoicesForProvider("google").map((voice) => (
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
                {/* Avatar Tab with Avatar Selection and Gemini Image Generation */}
                {selectedAgent && (
                  <AvatarTab 
                    assistantId={selectedAgent.id} 
                    assistantName={selectedAgent.name}
                    selectedAvatar={selectedAvatar}
                    onAvatarChange={setSelectedAvatar}
                  />
                )}
                {!selectedAgent && (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Please select an assistant to manage avatar and backgrounds.
                    </Typography>
                  </Box>
                )}
              </TabPanel>


              <TabPanel value={tabValue} index={3}>
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
                          renderValue={(selected) => {
                            console.log('🔧 Selected tools:', selected);
                            return `${selected.length} tool(s) selected`;
                          }}
                          displayEmpty
                          disabled={toolsLoading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#fff',
                            },
                          }}
                        >
                          {toolsLoading ? (
                            <MenuItem disabled value="">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 16, height: 16, border: '2px solid #ccc', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <Typography>Loading tools...</Typography>
                              </Box>
                            </MenuItem>
                          ) : availableTools.length === 0 ? (
                            <MenuItem disabled value="">
                              <Typography color="text.secondary">No tools available for this organization</Typography>
                            </MenuItem>
                          ) : (
                            <>
                              <MenuItem disabled value="">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Search sx={{ fontSize: 16 }} />
                                  <Typography>Search tools...</Typography>
                                </Box>
                              </MenuItem>
                              
                              <MenuItem value="">
                                <Checkbox checked={false} />
                                <ListItemText primary="(Select All)" />
                              </MenuItem>

                              {getAllTools().map((tool) => {
                                const isSelected = selectedTools.includes(tool.id);
                                console.log('🔧 Tool ID:', tool.id, 'Type:', typeof tool.id, 'Selected:', isSelected);
                                return (
                                  <MenuItem 
                                    key={tool.id} 
                                    value={tool.id}
                                    onClick={() => {
                                      console.log('🔧 MenuItem clicked for tool:', tool.id);
                                      const newSelected = isSelected 
                                        ? selectedTools.filter(id => id !== tool.id)
                                        : [...selectedTools, tool.id];
                                      setSelectedTools(newSelected);
                                      console.log('🔧 New selected tools:', newSelected);
                                    }}
                                  >
                                    <Checkbox 
                                      checked={isSelected}
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
                                            {tool.name}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {tool.type} • {tool.status}
                                          </Typography>
                                        </Box>
                                      } 
                                    />
                                  </MenuItem>
                                );
                              })}
                            </>
                          )}
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

              <TabPanel value={tabValue} index={4}>
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
        
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
          "{selectedAgent?.name}"
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
          onClick={handleDelete}
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
      </Box>
    </Box>
  );
}; 