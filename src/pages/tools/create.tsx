import React from "react";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useSearchParams } from "react-router";
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
} from "@mui/material";
import toolTypes from "../../data/toolTypes.json";

export const ToolCreate = () => {
  const [searchParams] = useSearchParams();
  const selectedType = searchParams.get("type");

  const {
    saveButtonProps,
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      type: selectedType || "custom_tool",
      name: "",
      description: "",
      async: false,
      strict: false,
    },
  });

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
    <Create saveButtonProps={saveButtonProps}>
      <Stack spacing={3}>
        {/* Tool Type Selection */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tool Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Configure your tool settings and parameters.
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
                      defaultChecked={false}
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
                      defaultChecked={false}
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

        {/* Tool Preview */}
        {toolConfig && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.default",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    backgroundColor: toolConfig.backgroundColor,
                    color: toolConfig.textColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                  dangerouslySetInnerHTML={{ __html: toolConfig.icon }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
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
      </Stack>
    </Create>
  );
};
