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

export const ApiKeyCreate: React.FC = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      allowedAssistants: [],
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
    setValue("allowedAssistants", selectedAssistants);
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
            API anahtarı yaradıldıqdan sonra yalnız bir dəfə göstəriləcək. Onu təhlükəsiz yerdə saxlayın.
          </Alert>

          <TextField
            {...register("name", {
              required: "Bu sahə tələb olunur",
            })}
            error={!!(errors as any)?.name}
            helperText={(errors as any)?.name?.message}
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            type="text"
            label="API Key Adı"
            name="name"
            placeholder="Məsələn: Production API Key"
          />

          <TextField
            {...register("expiresInDays", {
              required: "Bu sahə tələb olunur",
              min: { value: 1, message: "Minimum 1 gün olmalıdır" },
              max: { value: 365, message: "Maksimum 365 gün ola bilər" },
            })}
            error={!!(errors as any)?.expiresInDays}
            helperText={
              (errors as any)?.expiresInDays?.message ||
              `API key ${watchExpiresInDays} gün sonra expire olacaq`
            }
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            type="number"
            label="Bitme müddəti (gün)"
            name="expiresInDays"
            defaultValue={90}
          />

          <FormControl fullWidth>
            <InputLabel>İcazə verilən Assistantlar</InputLabel>
            <Select
              multiple
              value={selectedAssistants}
              onChange={handleAssistantChange}
              input={<OutlinedInput label="İcazə verilən Assistantlar" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Bütün assistantlara icazə verilir
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
                  Bütün assistantlara icazə ver
                </Typography>
              </MenuItem>
              {assistants.map((assistant) => (
                <MenuItem key={assistant.id} value={assistant.id}>
                  {assistant.name}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Heç bir assistant seçilməzsə, bütün assistantlara icazə verilir
            </Typography>
          </FormControl>
        </Stack>
      </Box>
    </Create>
  );
};
