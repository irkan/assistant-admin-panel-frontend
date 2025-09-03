import React, { useState, useEffect } from "react";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useList } from "@refinedev/core";
import {
  Box,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Typography,
  Alert,
} from "@mui/material";

interface ApiKeyFormData {
  name: string;
  allowedAssistants: number[];
  expiresInDays: number;
}

export const ApiKeyCreate: React.FC = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ApiKeyFormData>({
    defaultValues: {
      name: "",
      allowedAssistants: [] as number[],
      expiresInDays: 90,
    },
  });

  const [selectedAssistants, setSelectedAssistants] = useState<number[]>([]);

  // Fetch assistants for the current organization
  const { data: assistantsData } = useList({
    resource: "assistants",
    pagination: { pageSize: 100 },
  });

  const assistants = assistantsData?.data || [];
  const watchExpiresInDays = watch("expiresInDays");

  // Update form value when selected assistants change
  useEffect(() => {
    setValue("allowedAssistants", selectedAssistants as number[]);
  }, [selectedAssistants, setValue]);

  const handleAssistantChange = (event: any) => {
    const value = event.target.value;
    setSelectedAssistants(typeof value === 'string' ? value.split(',').map(Number) : value);
  };

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <Stack spacing={3}>
          <Alert severity="info">
            The API key will only be shown once after creation. Store it in a safe place.
          </Alert>

          <TextField
            {...register("name", {
              required: "This field is required",
            })}
            error={!!(errors as any)?.name}
            helperText={(errors as any)?.name?.message}
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            type="text"
            label="API Key Name"
            name="name"
            placeholder="Example: Production API Key"
          />

          <TextField
            {...register("expiresInDays", {
              required: "This field is required",
              min: { value: 1, message: "Minimum 1 day required" },
              max: { value: 365, message: "Maximum 365 days allowed" },
            })}
            error={!!(errors as any)?.expiresInDays}
            helperText={
              (errors as any)?.expiresInDays?.message ||
              `API key will expire in ${watchExpiresInDays} days`
            }
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            type="number"
            label="Expiration period (days)"
            name="expiresInDays"
            defaultValue={90}
          />

          <FormControl fullWidth>
            <InputLabel>Allowed Assistants</InputLabel>
            <Select
              multiple
              value={selectedAssistants}
              onChange={handleAssistantChange}
              input={<OutlinedInput label="Allowed Assistants" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      All assistants are allowed
                    </Typography>
                  ) : (
                    selected.map((value) => {
                      const assistant = assistants.find(a => a.id === value);
                      return (
                        <Chip
                          key={value}
                          label={assistant?.name || `Assistant ${value}`}
                          size="small"
                        />
                      );
                    })
                  )}
                </Box>
              )}
            >
              <MenuItem value="">
                <Typography color="text.secondary">
                  Allow all assistants
                </Typography>
              </MenuItem>
              {assistants.map((assistant) => (
                <MenuItem key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              If no assistants are selected, all assistants will be allowed
            </Typography>
          </FormControl>
        </Stack>
      </Box>
    </Create>
  );
};
