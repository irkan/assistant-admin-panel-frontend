import React, { useEffect, useState } from "react";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useList, useShow } from "@refinedev/core";
import { Box, TextField, FormControlLabel, Switch, MenuItem } from "@mui/material";

interface Organization {
  id: number;
  name: string;
  shortName?: string;
}

export const AgentEdit: React.FC = () => {
  const { saveButtonProps, register, formState: { errors }, setValue, watch } = useForm();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current agent data
  const { queryResult } = useShow();
  const { data: agentData } = queryResult;

  // Fetch organizations for the select dropdown
  const { data: organizationsData } = useList({
    resource: "organizations",
    pagination: { mode: "off" },
    filters: [
      {
        field: "active",
        operator: "eq",
        value: true,
      },
    ],
  });

  useEffect(() => {
    if (organizationsData?.data) {
      setOrganizations(organizationsData.data as Organization[]);
      setLoading(false);
    }
  }, [organizationsData]);

  // Set the organization ID when agent data loads
  useEffect(() => {
    if (agentData?.data?.organization?.id) {
      setValue("organizationId", agentData.data.organization.id);
    }
  }, [agentData, setValue]);

  const selectedOrganizationId = watch("organizationId");

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
          {...register("organizationId", {
            required: "Organization is required",
          })}
          error={!!errors?.organizationId}
          helperText={errors?.organizationId?.message as string}
          margin="normal"
          fullWidth
          label="Organization"
          name="organizationId"
          select
          disabled={loading}
          value={selectedOrganizationId || ""}
          onChange={(e) => setValue("organizationId", e.target.value)}
        >
          <MenuItem value="">
            <em>Select an organization</em>
          </MenuItem>
          {organizations.map((org) => (
            <MenuItem key={org.id} value={org.id}>
              {org.name} {org.shortName && `(${org.shortName})`}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...register("details.firstMessage")}
          error={!!(errors?.details as any)?.firstMessage}
          helperText={(errors?.details as any)?.firstMessage?.message as string}
          margin="normal"
          fullWidth
          label="First Message"
          name="details.firstMessage"
          multiline
          rows={3}
        />
        <TextField
          {...register("details.systemPrompt")}
          error={!!(errors?.details as any)?.systemPrompt}
          helperText={(errors?.details as any)?.systemPrompt?.message as string}
          margin="normal"
          fullWidth
          label="System Prompt"
          name="details.systemPrompt"
          multiline
          rows={4}
        />
        <TextField
          {...register("details.interactionMode")}
          error={!!(errors?.details as any)?.interactionMode}
          helperText={(errors?.details as any)?.interactionMode?.message as string}
          margin="normal"
          fullWidth
          label="Interaction Mode"
          name="details.interactionMode"
          select
        >
          <MenuItem value="agent_speak_first">Agent Speaks First</MenuItem>
          <MenuItem value="user_speak_first">User Speaks First</MenuItem>
        </TextField>
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