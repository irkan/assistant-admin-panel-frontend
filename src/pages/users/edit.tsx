import React from "react";
import { Edit    } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { Box, TextField, FormControlLabel, Switch } from "@mui/material";

export const UserEdit: React.FC = () => {
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
          {...register("surname", {
            required: "This field is required",
          })}
          error={!!errors?.surname}
          helperText={errors?.surname?.message as string}
          margin="normal"
          fullWidth
          label="Surname"
          name="surname"
        />
        <TextField
          {...register("email", {
            required: "This field is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          error={!!errors?.email}
          helperText={errors?.email?.message as string}
          margin="normal"
          fullWidth
          label="Email"
          name="email"
          type="email"
        />
        <TextField
          {...register("password", {
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          error={!!errors?.password}
          helperText={errors?.password?.message as string}
          margin="normal"
          fullWidth
          label="Password (leave blank to keep current)"
          name="password"
          type="password"
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