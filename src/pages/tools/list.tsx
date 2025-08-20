import React, { useState } from "react";
import { List, CreateButton } from "@refinedev/mui";
import { useList, useNavigation } from "@refinedev/core";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Menu,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  alpha,
  useTheme,
  Container,
  Fade,
  Avatar,
  Skeleton,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  MoreVert,
  Build,
  Code,
  Integration,
} from "@mui/icons-material";
import toolTypes from "../../data/toolTypes.json";
import "../../styles/modern-theme.css";

interface Tool {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const ToolList = () => {
  const theme = useTheme();
  const { create, edit } = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);
  const [toolMenuAnchor, setToolMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const { data, isLoading } = useList<Tool>({
    resource: "tools",
    pagination: {
      mode: "server",
      pageSize: 100,
    },
  });

  const tools = data?.data || [];
  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuAnchor(null);
  };

  const handleCreateTool = (toolTypeId: string) => {
    create("tools", "create", { type: toolTypeId });
    handleCreateMenuClose();
  };

  const handleToolMenuOpen = (event: React.MouseEvent<HTMLElement>, tool: Tool) => {
    event.stopPropagation();
    setSelectedTool(tool);
    setToolMenuAnchor(event.currentTarget);
  };

  const handleToolMenuClose = () => {
    setToolMenuAnchor(null);
    setSelectedTool(null);
  };

  const getToolTypeConfig = (typeId: string) => {
    const allTools = [
      ...toolTypes.categories.core.tools,
      ...toolTypes.categories.integrations.tools,
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
      {toolTypes.categories.core.tools.map((tool) => (
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
      {toolTypes.categories.integrations.tools.map((tool) => (
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
      <MenuItem
        onClick={() => selectedTool && edit("tools", selectedTool.id)}
        sx={{
          color: theme.palette.text.primary,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <Edit sx={{ mr: 2, fontSize: 18 }} />
        Edit Tool
      </MenuItem>
      <MenuItem
        onClick={handleToolMenuClose}
        sx={{
          color: "#ef4444",
          "&:hover": {
            backgroundColor: "rgba(239, 68, 68, 0.1)",
          },
        }}
      >
        <Delete sx={{ mr: 2, fontSize: 18 }} />
        Delete Tool
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
        },
      }}
    >
      <Box className="bg-pattern-dots" sx={{ position: "absolute", inset: 0, opacity: 0.1 }} />
      
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, pt: 4, pb: 6 }}>
        {/* Header Section */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 6 }}>
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
                  Tools Library
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Manage and configure your powerful integration tools
                </Typography>
              </Box>
            </Stack>
            
            {/* Action Bar */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 4 }}>
              <TextField
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "rgba(255, 255, 255, 0.6)" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  maxWidth: 400,
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
              
              <Button
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
            </Stack>
          </Box>
        </Fade>

        <List
          title=""
          headerButtons={<></>}
          breadcrumb={false}
          wrapperProps={{ sx: { padding: 0, background: "transparent" } }}
          contentProps={{ sx: { padding: 0, background: "transparent" } }}
        >

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Fade in timeout={800 + index * 100}>
                <Card className="modern-card-dark" sx={{ height: 140 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="flex-start" spacing={2}>
                      <Skeleton variant="rounded" width={48} height={48} sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" sx={{ bgcolor: "rgba(255,255,255,0.1)", mb: 1 }} />
                        <Skeleton variant="text" width="60%" sx={{ bgcolor: "rgba(255,255,255,0.08)" }} />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      ) : filteredTools.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <Typography variant="h6" gutterBottom>
            No tools found
          </Typography>
          <Typography variant="body2">
            {searchTerm ? "Try adjusting your search" : "Create your first tool to get started"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredTools.map((tool, index) => {
            const toolConfig = getToolTypeConfig(tool.type);
            return (
              <Grid item xs={12} sm={6} md={4} key={tool.id}>
                <Fade in timeout={800 + index * 100}>
                  <Card
                    className="modern-card-dark"
                    sx={{
                      cursor: "pointer",
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
                    }}
                    onClick={() => edit("tools", tool.id)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="flex-start" spacing={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: toolConfig?.backgroundColor || "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            color: toolConfig?.textColor || "#FFFFFF",
                            fontSize: "20px",
                            flexShrink: 0,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: toolConfig?.icon || "🔧"
                          }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              mb: 0.5,
                            }}
                          >
                            {tool.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: theme.palette.text.secondary,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {toolConfig?.name || tool.type}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleToolMenuOpen(e, tool)}
                          sx={{
                            mt: -1,
                            color: theme.palette.text.secondary,
                            "&:hover": {
                              color: theme.palette.text.primary,
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Stack>
                      
                      {tool.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            mt: 2,
                            color: "rgba(255, 255, 255, 0.7)",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.5,
                          }}
                        >
                          {tool.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      )}

      {renderCreateMenu()}
      {renderToolMenu()}
        </List>
      </Container>
    </Box>
  );
};
