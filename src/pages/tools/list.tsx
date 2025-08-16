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
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  MoreVert,
} from "@mui/icons-material";
import toolTypes from "../../data/toolTypes.json";

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
          width: 229,
          maxHeight: 400,
          overflow: "auto",
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
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Integrations
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
    >
      <MenuItem onClick={() => selectedTool && edit("tools", selectedTool.id)}>
        <Edit sx={{ mr: 1 }} />
        Edit
      </MenuItem>
      <MenuItem onClick={handleToolMenuClose} sx={{ color: "error.main" }}>
        <Delete sx={{ mr: 1 }} />
        Delete
      </MenuItem>
    </Menu>
  );

  return (
    <List
      title="Tools"
      headerButtons={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateMenuOpen}
          sx={{
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Create Tool
        </Button>
      }
    >
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: 120 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: "grey.200",
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ height: 20, backgroundColor: "grey.200", mb: 1 }} />
                      <Box sx={{ height: 16, backgroundColor: "grey.100", width: "60%" }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
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
          {filteredTools.map((tool) => {
            const toolConfig = getToolTypeConfig(tool.type);
            return (
              <Grid item xs={12} sm={6} md={4} key={tool.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: theme.shadows[4],
                      transform: "translateY(-2px)",
                    },
                  }}
                  onClick={() => edit("tools", tool.id)}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="flex-start" spacing={2}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          backgroundColor: toolConfig?.backgroundColor || "#6B7280",
                          color: toolConfig?.textColor || "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                          flexShrink: 0,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: toolConfig?.icon || "🔧"
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tool.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
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
                        sx={{ mt: -1 }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Stack>
                    
                    {tool.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {tool.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {renderCreateMenu()}
      {renderToolMenu()}
    </List>
  );
};
