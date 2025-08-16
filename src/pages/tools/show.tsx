import React from "react";
import { Show, EditButton, DeleteButton } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import dayjs from "dayjs";
import toolTypes from "../../data/toolTypes.json";

interface Tool {
  id: string;
  name: string;
  type: string;
  description?: string;
  async: boolean;
  strict: boolean;
  serverUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const ToolShow = () => {
  const { queryResult } = useShow<Tool>();
  const { data, isLoading } = queryResult;
  const record = data?.data;

  const getToolTypeConfig = (typeId: string) => {
    const allTools = [
      ...toolTypes.categories.core.tools,
      ...toolTypes.categories.integrations.tools,
    ];
    return allTools.find(tool => tool.id === typeId);
  };

  const toolConfig = record ? getToolTypeConfig(record.type) : null;

  return (
    <Show
      isLoading={isLoading}
      headerButtons={
        <Stack direction="row" spacing={1}>
          <EditButton />
          <DeleteButton />
        </Stack>
      }
    >
      {record && (
        <Stack spacing={3}>
          {/* Tool Header */}
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 2,
                    backgroundColor: toolConfig?.backgroundColor || "#6B7280",
                    color: toolConfig?.textColor || "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: toolConfig?.icon || "🔧"
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={600} gutterBottom>
                    {record.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {record.description || "No description provided"}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Chip
                      label={toolConfig?.name || record.type}
                      sx={{
                        backgroundColor: toolConfig?.backgroundColor || "#6B7280",
                        color: toolConfig?.textColor || "#FFFFFF",
                      }}
                    />
                    {record.async && (
                      <Chip label="Async" variant="outlined" color="info" />
                    )}
                    {record.strict && (
                      <Chip label="Strict" variant="outlined" color="warning" />
                    )}
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Tool Type
                      </Typography>
                      <Typography variant="body1">
                        {toolConfig?.name || record.type}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
                        {record.id}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Async Execution
                      </Typography>
                      <Chip
                        label={record.async ? "Enabled" : "Disabled"}
                        size="small"
                        color={record.async ? "success" : "default"}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Strict Validation
                      </Typography>
                      <Chip
                        label={record.strict ? "Enabled" : "Disabled"}
                        size="small"
                        color={record.strict ? "warning" : "default"}
                      />
                    </Grid>

                    {record.serverUrl && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Server URL
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                          {record.serverUrl}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Metadata */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Metadata
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Created At
                      </Typography>
                      <Typography variant="body2">
                        {dayjs(record.createdAt).format("MMM DD, YYYY HH:mm")}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Updated At
                      </Typography>
                      <Typography variant="body2">
                        {dayjs(record.updatedAt).format("MMM DD, YYYY HH:mm")}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Parameters Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Parameters
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Define the parameters your tool accepts.
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 3,
                  textAlign: "center",
                  backgroundColor: "background.default",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No parameters configured. Click "Add Parameter" to add your first parameter.
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Messages Section */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Messages
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Configure messages to be spoken during different stages of tool execution.
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Request Start
                    </Typography>
                    <Chip
                      label="Default (server will use default message)"
                      size="small"
                      color="success"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Show>
  );
};
