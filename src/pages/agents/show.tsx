import React from "react";
import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import {
  Typography,
  Stack,
  Paper,
  Box,
} from "@mui/material";
import { BooleanField } from "@refinedev/mui";

export const AgentShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Stack gap={1}>
            <Typography variant="body1">
              <strong>ID:</strong> {record?.id}
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong> {record?.name}
            </Typography>
            <Typography variant="body1">
              <strong>Organization ID:</strong> {record?.organizationId}
            </Typography>
            <Typography variant="body1">
              <strong>Active:</strong> <BooleanField value={record?.active} />
            </Typography>
            <Typography variant="body1">
              <strong>Created At:</strong>{" "}
              {record?.createdAt
                ? new Date(record.createdAt).toLocaleString()
                : ""}
            </Typography>
            <Typography variant="body1">
              <strong>Updated At:</strong>{" "}
              {record?.updatedAt
                ? new Date(record.updatedAt).toLocaleString()
                : "Never"}
            </Typography>
          </Stack>
        </Paper>

        {record?.details && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Agent Details
            </Typography>
            <Stack gap={1}>
              <Typography variant="body1">
                <strong>Agent ID:</strong> {record.details.agentId}
              </Typography>
              <Typography variant="body1">
                <strong>First Message:</strong>{" "}
                {record.details.firstMessage || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>System Prompt:</strong>{" "}
                {record.details.systemPrompt || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Interaction Mode:</strong>{" "}
                {record.details.interactionMode || "N/A"}
              </Typography>
              <Typography variant="body1">
                <strong>Details Created At:</strong>{" "}
                {record.details.createdAt
                  ? new Date(record.details.createdAt).toLocaleString()
                  : ""}
              </Typography>
              <Typography variant="body1">
                <strong>Details Updated At:</strong>{" "}
                {record.details.updatedAt
                  ? new Date(record.details.updatedAt).toLocaleString()
                  : "Never"}
              </Typography>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Show>
  );
}; 