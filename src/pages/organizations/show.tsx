import React from "react";
import { Show } from "@refinedev/mui";
import { useShow } from "@refinedev/core";
import {
  Typography,
  Stack,
} from "@mui/material";
import { BooleanField } from "@refinedev/mui";

export const OrganizationShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1">
          <strong>ID:</strong> {record?.id}
        </Typography>
        <Typography variant="body1">
          <strong>Name:</strong> {record?.name}
        </Typography>
        <Typography variant="body1">
          <strong>Short Name:</strong> {record?.shortName || "N/A"}
        </Typography>
        {record?.parentId && (
          <Typography variant="body1">
            <strong>Parent ID:</strong> {record.parentId}
          </Typography>
        )}
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
    </Show>
  );
}; 