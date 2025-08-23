import React, { useState, useEffect } from "react";
import { List } from "@refinedev/mui";
import { useList, useUpdate, useDelete, useCreate } from "@refinedev/core";
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
  Switch,
  FormControlLabel,
  Chip,
  Menu,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Fade,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Search,
  Circle,
  Edit,
  Delete,
  ContentCopy,
  MoreVert,
  Build,
  Code,
  Integration,
  Publish,
  Settings,
  Close,
  SmartToy,
} from "@mui/icons-material";
import "../../styles/modern-theme.css";

interface Tool {
  id: string;
  name: string;
  type: string;
  description?: string;
  parameters?: any;
  status?: "draft" | "published";
  createdAt: string;
  updatedAt: string;
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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const ToolList = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);
  const [toolMenuAnchor, setToolMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuSelectedTool, setMenuSelectedTool] = useState<Tool | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Get user's organization
  const { data: organizationsData } = useList({
    resource: "organizations",
    pagination: { pageSize: 1 },
  });
  
  const currentOrganization = organizationsData?.data?.[0];
  
  // Form fields
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [toolParameters, setToolParameters] = useState("");
  const [toolStatus, setToolStatus] = useState<"draft" | "published">("draft");

  const { data, isLoading, refetch } = useList<Tool>({
    resource: "tools",
    pagination: {
      mode: "server",
      pageSize: 100,
    },
    filters: currentOrganization ? [
      {
        field: "organizationId",
        operator: "eq",
        value: currentOrganization.id,
      },
    ] : [],
  });

  const { mutate: updateTool } = useUpdate();
  const { mutate: deleteTool } = useDelete();
  const { mutate: createTool } = useCreate();

  const tools = data?.data || [];
  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool);
    setToolName(tool.name);
    setToolDescription(tool.description || "");
    setToolParameters(JSON.stringify(tool.parameters || {}, null, 2));
    setToolStatus(tool.status || "draft");
    setTabValue(0);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuAnchor(null);
  };

  const handleCreateTool = (toolTypeId: string) => {
    const toolConfig = getToolTypeConfig(toolTypeId);
    const newTool = {
      name: `New ${toolConfig?.name || toolTypeId}`,
      type: toolTypeId,
      description: "",
      parameters: {},
      status: "draft" as const,
      organizationId: currentOrganization?.id || 1, // Use current user's organization
    };
    
    console.log('🔧 Creating tool with organizationId:', currentOrganization?.id);
    
    createTool({
      resource: "tools",
      values: newTool,
    }, {
      onSuccess: (data) => {
        refetch();
        setSelectedTool(data.data);
        setToolName(data.data.name);
        setToolDescription(data.data.description || "");
        setToolParameters(JSON.stringify(data.data.parameters || {}, null, 2));
        setToolStatus(data.data.status || "draft");
      },
      onError: (error) => {
        console.error("Error creating tool:", error);
      }
    });
    
    handleCreateMenuClose();
  };

  const handleToolMenuOpen = (event: React.MouseEvent<HTMLElement>, tool: Tool) => {
    event.stopPropagation();
    setMenuSelectedTool(tool);
    setToolMenuAnchor(event.currentTarget);
  };

  const handleToolMenuClose = () => {
    setToolMenuAnchor(null);
    setMenuSelectedTool(null);
  };

  const handleDuplicate = () => {
    if (menuSelectedTool) {
      const timestamp = new Date().toLocaleString();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      
      const duplicatedTool = {
        name: `Copy ${timestamp} ${randomSuffix} ${menuSelectedTool.name}`,
        type: menuSelectedTool.type,
        description: menuSelectedTool.description,
        parameters: menuSelectedTool.parameters,
        status: "published" as const,
      };
      
      createTool({
        resource: "tools",
        values: duplicatedTool,
      }, {
        onSuccess: () => {
          refetch();
        }
      });
    }
    handleToolMenuClose();
  };

  const handleDelete = () => {
    if (menuSelectedTool) {
      deleteTool({
        resource: "tools",
        id: menuSelectedTool.id,
      }, {
        onSuccess: () => {
          refetch();
          if (selectedTool?.id === menuSelectedTool.id) {
            setSelectedTool(null);
          }
        }
      });
    }
    setDeleteModalOpen(false);
    handleToolMenuClose();
  };

  const handlePublish = () => {
    if (selectedTool) {
      setIsPublishing(true);
      
      let parsedParameters = {};
      try {
        parsedParameters = JSON.parse(toolParameters);
      } catch (e) {
        console.error("Invalid JSON in parameters");
      }
      
      updateTool({
        resource: "tools",
        id: selectedTool.id,
        values: {
          name: toolName,
          type: selectedTool.type, // Include the existing type
          description: toolDescription,
          parameters: parsedParameters,
          status: "published",
        },
      }, {
        onSuccess: () => {
          setIsPublishing(false);
          setToolStatus("published");
          refetch();
        },
        onError: (error) => {
          setIsPublishing(false);
          console.error("Error publishing tool:", error);
        }
      });
    }
  };

  const getToolTypeConfig = (typeId: string) => {
    const allTools = [
      ...toolTypesData.categories.core.tools,
      ...toolTypesData.categories.integrations.tools,
    ];
    return allTools.find(tool => tool.id === typeId);
  };

  const renderCreateMenu = () => (
    <Menu
      anchorEl={createMenuAnchor}
      open={Boolean(createMenuAnchor)}
      onClose={handleCreateMenuClose}
      PaperProps={{
        sx: {
          width: 280,
          maxHeight: 500,
          overflow: "auto",
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          mt: 1,
        },
      }}
    >
      {/* Core Tools */}
      {toolTypesData.categories.core.tools.map((tool) => (
        <MenuItem
          key={tool.id}
          onClick={() => handleCreateTool(tool.id)}
          sx={{
            px: 2,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              backgroundColor: tool.backgroundColor,
              color: tool.textColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
            dangerouslySetInnerHTML={{ __html: tool.icon }}
          />
          <Typography variant="body2">{tool.name}</Typography>
        </MenuItem>
      ))}

      {/* Integrations Header */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.6)", fontWeight: 600, fontSize: "0.75rem" }}>
          INTEGRATIONS
        </Typography>
      </Box>

      {/* Integration Tools */}
      {toolTypesData.categories.integrations.tools.map((tool) => (
        <MenuItem
          key={tool.id}
          onClick={() => handleCreateTool(tool.id)}
          sx={{
            px: 2,
            py: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              backgroundColor: tool.backgroundColor,
              color: tool.textColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
            dangerouslySetInnerHTML={{ __html: tool.icon }}
          />
          <Typography variant="body2">{tool.name}</Typography>
        </MenuItem>
      ))}
    </Menu>
  );

  const renderToolMenu = () => (
    <Menu
      anchorEl={toolMenuAnchor}
      open={Boolean(toolMenuAnchor)}
      onClose={handleToolMenuClose}
      PaperProps={{
        sx: {
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          mt: 1,
        },
      }}
    >
      <MenuItem onClick={handleDuplicate}>
        <ContentCopy sx={{ mr: 2, fontSize: 18 }} />
        Duplicate
      </MenuItem>
      <MenuItem
        onClick={() => {
          setDeleteModalOpen(true);
          handleToolMenuClose();
        }}
        sx={{ color: "error.main" }}
      >
        <Delete sx={{ mr: 2, fontSize: 18 }} />
        Delete
      </MenuItem>
    </Menu>
  );

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
                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    boxShadow: "var(--shadow-glow)",
                  }}
                >
                  <Build sx={{ fontSize: 24 }} />
                </Avatar>
                <Box>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #ffffff 0%, #00f2fe 100%)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 0.5,
                    }}
                  >
                    Tools Overview
                  </Typography>
                  <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    Manage and configure your powerful integration tools
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
                  onClick={handleCreateMenuOpen}
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
                  Create Tool
                </Button>

                {/* Search Field */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search Tools"
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

              {/* Tool List */}
              <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
                {isLoading ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : filteredTools.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    <Typography variant="body2">
                      {searchTerm ? "No tools found" : "No tools created yet"}
                    </Typography>
                  </Box>
                ) : (
                  filteredTools.map((tool, index) => {
                    const toolConfig = getToolTypeConfig(tool.type);
                    return (
                      <Fade in timeout={800 + index * 100} key={tool.id}>
                        <Card
                          onClick={() => handleToolSelect(tool)}
                          sx={{
                            mb: 1,
                            cursor: "pointer",
                            border: `1px solid ${
                              selectedTool?.id === tool.id
                                ? theme.palette.primary.main
                                : "rgba(255,255,255,0.12)"
                            }`,
                            background:
                              selectedTool?.id === tool.id
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
                              height: 4,
                              background: toolConfig?.backgroundColor || "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            },
                            "&:hover": {
                              borderColor: theme.palette.primary.main,
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Stack direction="row" alignItems="flex-start" spacing={2}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 2,
                                  background: toolConfig?.backgroundColor || "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                  color: toolConfig?.textColor || "#FFFFFF",
                                  fontSize: "18px",
                                  flexShrink: 0,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: toolConfig?.icon || "🔧"
                                }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 600,
                                      color: theme.palette.text.primary,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      flex: 1,
                                    }}
                                  >
                                    {tool.name}
                                  </Typography>
                                  <Circle
                                    sx={{
                                      fontSize: 8,
                                      color: tool.status === "published" ? "#10b981" : "#f59e0b",
                                    }}
                                  />
                                </Stack>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme.palette.text.secondary,
                                    display: "block",
                                    mt: 0.5,
                                  }}
                                >
                                  {toolConfig?.name || tool.type}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={(e) => handleToolMenuOpen(e, tool)}
                                sx={{
                                  color: theme.palette.text.secondary,
                                  "&:hover": {
                                    color: theme.palette.text.primary,
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                  },
                                }}
                              >
                                <MoreVert sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Fade>
                    );
                  })
                )}
              </Box>
            </Box>

            {/* Right Content Area */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {selectedTool ? (
                <>
                  {/* Tool Header */}
                  <Box
                    sx={{
                      p: 3,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      background: theme.palette.background.default,
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              background: getToolTypeConfig(selectedTool.type)?.backgroundColor || "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                              color: getToolTypeConfig(selectedTool.type)?.textColor || "#FFFFFF",
                              fontSize: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: getToolTypeConfig(selectedTool.type)?.icon || "🔧"
                            }}
                          />
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {selectedTool.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {getToolTypeConfig(selectedTool.type)?.name || selectedTool.type}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                      
                      <Stack direction="row" spacing={2}>
                        <Chip
                          label={toolStatus === "published" ? "Published" : "Draft"}
                          color={toolStatus === "published" ? "success" : "warning"}
                          size="small"
                        />
                        <Button
                          variant="contained"
                          startIcon={isPublishing ? <CircularProgress size={16} color="inherit" /> : <Publish />}
                          onClick={handlePublish}
                          disabled={isPublishing}
                          sx={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            textTransform: "none",
                            borderRadius: "8px",
                            fontWeight: 600,
                            "&:hover": {
                              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                            },
                          }}
                        >
                          {isPublishing ? "Publishing..." : "Publish"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                      <Tab label="Configuration" sx={{ textTransform: "none" }} />
                      <Tab label="Parameters" sx={{ textTransform: "none" }} />
                      <Tab label="Advanced" sx={{ textTransform: "none" }} />
                    </Tabs>
                  </Box>

                  {/* Tab Content */}
                  <Box sx={{ flex: 1, overflow: "auto" }}>
                    <TabPanel value={tabValue} index={0}>
                      {/* Configuration Tab */}
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Settings sx={{ fontSize: 20 }} />
                            Basic Configuration
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Configure the basic settings for your tool.
                          </Typography>
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Tool Name
                          </Typography>
                          <TextField
                            fullWidth
                            value={toolName}
                            onChange={(e) => setToolName(e.target.value)}
                            placeholder="Enter tool name..."
                            variant="outlined"
                          />
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Description
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={toolDescription}
                            onChange={(e) => setToolDescription(e.target.value)}
                            placeholder="Enter tool description..."
                            variant="outlined"
                          />
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Tool Type
                          </Typography>
                          <TextField
                            fullWidth
                            value={getToolTypeConfig(selectedTool.type)?.name || selectedTool.type}
                            InputProps={{
                              readOnly: true,
                              sx: {
                                backgroundColor: alpha(theme.palette.action.selected, 0.1),
                                cursor: "not-allowed",
                                "& .MuiInputBase-input": {
                                  cursor: "not-allowed",
                                },
                              },
                            }}
                            variant="outlined"
                            helperText="Tool type cannot be changed after creation"
                          />
                        </Box>
                      </Stack>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                      {/* Parameters Tab */}
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Code sx={{ fontSize: 20 }} />
                            Parameters Configuration
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Define the parameters and configuration for your tool.
                          </Typography>
                        </Box>

                        <Divider />

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Parameters (JSON)
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={12}
                            value={toolParameters}
                            onChange={(e) => setToolParameters(e.target.value)}
                            placeholder="Enter tool parameters in JSON format..."
                            variant="outlined"
                            sx={{
                              "& .MuiInputBase-input": {
                                fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                                fontSize: "14px",
                              },
                            }}
                          />
                        </Box>
                      </Stack>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                      {/* Advanced Tab */}
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Settings sx={{ fontSize: 20 }} />
                            Advanced Settings
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Advanced configuration options for your tool.
                          </Typography>
                        </Box>

                        <Divider />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={toolStatus === "published"}
                              onChange={(e) => setToolStatus(e.target.checked ? "published" : "draft")}
                            />
                          }
                          label="Published Status"
                        />

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Created At
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(selectedTool.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Last Updated
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(selectedTool.updatedAt).toLocaleDateString()}
                          </Typography>
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
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 4,
                  }}
                >
                  <Build sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Select a Tool
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a tool from the left sidebar to view and edit its configuration.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {renderCreateMenu()}
          {renderToolMenu()}

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: '16px',
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              }
            }}
          >
            <DialogTitle sx={{ fontWeight: 600 }}>
              Delete Tool
            </DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete "{menuSelectedTool?.name}"? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setDeleteModalOpen(false)}
                sx={{ 
                  textTransform: 'none',
                  borderRadius: '8px',
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
        </List>
      </Box>
    </Box>
  );
};