import React from "react";
import { useForm } from "@refinedev/react-hook-form";
import { Edit   } from "@refinedev/mui";
import { Box, TextField, FormControlLabel, Switch } from "@mui/material";

export const OrganizationEdit: React.FC = () => {
  const { saveButtonProps, register, formState: { errors } } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("name", {
            required: "This field is required",
          })}
          error={!!errors?.name}
          helperText={errors?.name?.message as string}
          margin="normal"
          fullWidth
          label="Name"
          name="name"
        />
        <TextField
          {...register("shortName")}
          error={!!errors?.shortName}
          helperText={errors?.shortName?.message as string}
          margin="normal"
          fullWidth
          label="Short Name"
          name="shortName"
        />
        <TextField
          {...register("parentId", {
            pattern: {
              value: /^\d*$/,
              message: "Parent ID must be a number",
            },
          })}
          error={!!errors?.parentId}
          helperText={errors?.parentId?.message as string}
          margin="normal"
          fullWidth
          label="Parent ID (optional)"
          name="parentId"
          type="number"
        />
        <FormControlLabel
          control={
            <Switch
              {...register("active")}
              name="active"
            />
          }
          label="Active"
          sx={{ mt: 2 }}
        />
      </Box>
    </Edit>
  );
}; 