import React from "react";
import { useShow } from "@refinedev/core";
import {
  Show,
  TextFieldComponent,
} from "@refinedev/mui";
import { Typography, Stack, Chip, Box } from "@mui/material";

export const ApiKeyShow: React.FC = () => {
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack spacing={3}>
        <TextFieldComponent value={record?.id} />
        
        <TextFieldComponent value={record?.name} />
        
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
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            API Key
          </Typography>
          <TextFieldComponent value={record?.maskedKey || record?.key} />
        </Box>
        
        {record?.type === 'public' && (
          <>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Allowed Origins
              </Typography>
              <TextFieldComponent value={record?.allowedOrigins?.join(', ') || 'All domains allowed'} />
            </Box>
            
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Allowed Assistants
              </Typography>
              <TextFieldComponent value={record?.allowedAssistants?.join(', ') || 'All Assistants allowed'} />
            </Box>
            
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
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Created At
          </Typography>
          <TextFieldComponent value={record?.createdAt} />
        </Box>
      </Stack>
    </Show>
  );
};
