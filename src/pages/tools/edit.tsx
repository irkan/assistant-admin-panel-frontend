import React from "react";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import {
  Box,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
} from "@mui/material";
import toolTypes from "../../data/toolTypes.json";

export const ToolEdit = () => {
  const {
    saveButtonProps,
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const watchedType = watch("type");

  const getToolTypeConfig = (typeId: string) => {
    const allTools = [
      ...toolTypes.categories.core.tools,
      ...toolTypes.categories.integrations.tools,
    ];
    return allTools.find(tool => tool.id === typeId);
  };

  const toolConfig = getToolTypeConfig(watchedType);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Stack spacing={3}>
        {/* Tool Type Header */}
        {toolConfig && (
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    backgroundColor: toolConfig.backgroundColor,
                    color: toolConfig.textColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                  dangerouslySetInnerHTML={{ __html: toolConfig.icon }}
                />
                <Box>
                  <Typography variant="h6">
                    {toolConfig.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {toolConfig.description}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Basic Configuration */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Configuration
            </Typography>

            <Stack spacing={3}>
              <TextField
                {...register("name", {
                  required: "Tool name is required",
                })}
                error={!!(errors as any)?.name}
                helperText={(errors as any)?.name?.message}
                label="Tool Name"
                placeholder="Enter tool name"
                fullWidth
              />

              <TextField
                {...register("type", {
                  required: "Tool type is required",
                })}
                select
                error={!!(errors as any)?.type}
                helperText={(errors as any)?.type?.message}
                label="Tool Type"
                fullWidth
                disabled
              >
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: "text.secondary" }}>
                  Core Tools
                </Typography>
                {toolTypes.categories.core.tools.map((tool) => (
                  <MenuItem key={tool.id} value={tool.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 0.5,
                          backgroundColor: tool.backgroundColor,
                          color: tool.textColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                        dangerouslySetInnerHTML={{ __html: tool.icon }}
                      />
                      <Typography variant="body2">{tool.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
                
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ px: 2, py: 1, color: "text.secondary" }}>
                  Integrations
                </Typography>
                {toolTypes.categories.integrations.tools.map((tool) => (
                  <MenuItem key={tool.id} value={tool.id}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 0.5,
                          backgroundColor: tool.backgroundColor,
                          color: tool.textColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                        dangerouslySetInnerHTML={{ __html: tool.icon }}
                      />
                      <Typography variant="body2">{tool.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                {...register("description")}
                label="Description"
                placeholder="Describe the tool in a few sentences"
                multiline
                rows={3}
                fullWidth
                inputProps={{ maxLength: 1000 }}
                helperText="0/1000"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Tool Options */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Options
            </Typography>

            <Stack spacing={2}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      {...register("async")}
                    />
                  }
                  label="Async"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Tool executes asynchronously
                </Typography>
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      {...register("strict")}
                    />
                  }
                  label="Strict"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Enforces strict parameter validation
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Parameters Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Parameters</Typography>
              <Typography variant="body2" color="text.secondary">
                Define the parameters your tool accepts
              </Typography>
            </Box>
            
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

        {/* Server Settings (for tools that need it) */}
        {(watchedType === "api_request_tool" || watchedType === "custom_tool") && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Server Settings
              </Typography>

              <Stack spacing={3}>
                <TextField
                  {...register("serverUrl")}
                  label="Server URL"
                  placeholder="https://api.example.com/function"
                  fullWidth
                />

                <TextField
                  {...register("secretToken")}
                  label="Secret Token"
                  placeholder="••••••••••••••••••••••••"
                  type="password"
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Messages Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6">Messages</Typography>
              <Typography variant="body2" color="text.secondary">
                Configure messages to be spoken during different stages of tool execution
              </Typography>
            </Box>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Request Start
                </Typography>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={<input type="radio" name="requestStart" value="default" defaultChecked />}
                    label="Default (server will use default message)"
                  />
                  <FormControlLabel
                    control={<input type="radio" name="requestStart" value="none" />}
                    label="None (no message will be spoken)"
                  />
                  <FormControlLabel
                    control={<input type="radio" name="requestStart" value="custom" />}
                    label="Custom"
                  />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Edit>
  );
};
