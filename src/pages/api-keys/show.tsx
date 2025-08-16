import React from "react";
import { useShow } from "@refinedev/core";
import {
  Show,
  TextFieldComponent as TextField,
} from "@refinedev/mui";
import { Typography, Stack, Chip, Box } from "@mui/material";

export const ApiKeyShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack spacing={3}>
        <TextField label="ID" value={record?.id} />
        
        <TextField label="Name" value={record?.name} />
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Type
          </Typography>
          <Chip 
            label={record?.type?.toUpperCase()} 
            color={record?.type === 'private' ? 'secondary' : 'primary'}
            variant="outlined"
          />
        </Box>
        
        <TextField 
          label="API Key" 
          value={record?.maskedKey || record?.key} 
          multiline
        />
        
        {record?.type === 'public' && (
          <>
            <TextField 
              label="Allowed Origins" 
              value={record?.allowedOrigins?.join(', ') || 'All domains allowed'} 
            />
            
            <TextField 
              label="Allowed Assistants" 
              value={record?.allowedAssistants?.join(', ') || 'All Assistants allowed'} 
            />
            
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Transient Assistants
              </Typography>
              <Chip 
                label={record?.transientAssistants ? 'Allowed' : 'Not Allowed'} 
                color={record?.transientAssistants ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
          </>
        )}
        
        <TextField label="Created At" value={record?.createdAt} />
      </Stack>
    </Show>
  );
};
