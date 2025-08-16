import React from "react";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import {
  Box,
  TextField,
  MenuItem,
  Stack,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Switch,
} from "@mui/material";

export const ApiKeyCreate: React.FC = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      type: "private",
      allowedOrigins: "",
      allowedAssistants: [],
      transientAssistants: true,
    },
  });

  const watchType = watch("type");

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <Stack spacing={3}>
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
            label="Name"
            name="name"
          />

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              {...register("type")}
              label="Type"
              defaultValue="private"
            >
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="public">Public</MenuItem>
            </Select>
          </FormControl>

          {watchType === "public" && (
            <>
              <TextField
                {...register("allowedOrigins")}
                margin="normal"
                fullWidth
                InputLabelProps={{ shrink: true }}
                type="text"
                label="Allowed Origins"
                name="allowedOrigins"
                placeholder="Enter allowed origins (comma-separated)"
              />

              <FormControlLabel
                control={
                  <Switch
                    {...register("transientAssistants")}
                    defaultChecked={true}
                  />
                }
                label="Enable Transient Assistants"
              />
            </>
          )}
        </Stack>
      </Box>
    </Create>
  );
};
