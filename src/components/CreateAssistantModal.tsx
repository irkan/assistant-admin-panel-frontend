import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  alpha,
  useTheme,
  Backdrop,
} from "@mui/material";
import {
  Close,
  Add,
  FavoriteBorder,
  Person,
  School,
  Schedule,
  Info,
  Star,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useCreate } from "@refinedev/core";

interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  quickstart?: boolean;
  systemPrompt?: string;
  firstMessage?: string;
  provider?: string;
  model?: string;
}

const templates: Template[] = [
  {
    id: "blank",
    title: "Blank Template",
    description: "This blank slate template with minimal configurations. It's a starting point for creating your custom assistant.",
    icon: <Add />,
  },
  {
    id: "customer-support",
    title: "Customer Support Specialist",
    description: "A comprehensive template for resolving product issues, answering questions, and ensuring satisfying customer experiences with technical knowledge and empathy.",
    icon: <FavoriteBorder />,
    quickstart: true,
    systemPrompt: "You are a helpful customer support assistant. Be friendly, professional, and solution-oriented.",
    firstMessage: "Hello! I'm here to help you with any questions or issues you may have. How can I assist you today?",
    provider: "azure-openai",
    model: "gpt-4o-2024-11-20",
  },
  {
    id: "lead-qualification",
    title: "Lead Qualification Specialist",
    description: "A consultative template designed to identify qualified prospects, understand business challenges, and connect them with appropriate sales representatives.",
    icon: <Person />,
    quickstart: true,
    systemPrompt: "You are a lead qualification specialist. Your goal is to understand the customer's needs and qualify them as potential leads.",
    firstMessage: "Hello! I'd love to learn more about your business needs. Can you tell me what brings you here today?",
    provider: "azure-openai",
    model: "gpt-4o-2024-11-20",
  },
  {
    id: "appointment-scheduler",
    title: "Appointment Scheduler",
    description: "A specialized template for efficiently booking, confirming, rescheduling, or canceling appointments while providing clear service information.",
    icon: <Schedule />,
    quickstart: true,
    systemPrompt: "You are an appointment scheduling assistant. Help users book, reschedule, or cancel appointments efficiently.",
    firstMessage: "Hello! I can help you schedule an appointment. When would you like to come in?",
    provider: "azure-openai",
    model: "gpt-4o-2024-11-20",
  },
  {
    id: "info-collector",
    title: "Info Collector",
    description: "A methodical template for gathering accurate and complete information from customers while ensuring data quality and regulatory compliance.",
    icon: <Info />,
    quickstart: true,
    systemPrompt: "You are an information collection assistant. Gather required information accurately and completely.",
    firstMessage: "Hello! I need to collect some information from you. Let's start with your basic details.",
    provider: "azure-openai",
    model: "gpt-4o-2024-11-20",
  },
];

interface CreateAssistantModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateAssistantModal: React.FC<CreateAssistantModalProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [assistantName, setAssistantName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { mutate: createAssistant } = useCreate();

  const handleCreate = () => {
    if (!assistantName || !selectedTemplate) return;

    const assistantData: any = {
      name: assistantName,
      active: true,
      organizationId: 1, // Default organization
      voiceModel: selectedTemplate.model || "GPT-4o 2024-11-20",
      details: {
        firstMessage: selectedTemplate.firstMessage || "Hello.",
        systemPrompt: selectedTemplate.systemPrompt || "This is a blank template with minimal defaults, you can change the model, temperature, and messages.",
        interactionMode: "assistant-speaks-first",
        provider: selectedTemplate.provider || "azure-openai",
        model: selectedTemplate.model || "gpt-4o-2024-11-20",
      },
    };

    createAssistant(
      {
        resource: "assistants",
        values: assistantData,
      },
      {
        onSuccess: (data) => {
          onClose();
          // Navigate to the new assistant
          navigate(`/assistants/edit/${data.data.id}`);
        },
      }
    );
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  return (
    <Dialog
        open={open}
        onClose={() => {}} // Disable onClose to prevent ESC key closing
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "#fff",
            backgroundImage: "none",
            maxHeight: "90vh",
            overflow: "visible",
            maxWidth: 600,
            margin: "20px",
            marginLeft: "40px", // Position on the left side
          },
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 2,
          "& .MuiDialog-container": {
            alignItems: "center",
            justifyContent: "flex-start",
            paddingLeft: 2,
          },
          "& .MuiBackdrop-root": {
            backgroundColor: theme.palette.mode === "dark" 
              ? "rgba(0, 0, 0, 0.4)" 
              : "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)", // Safari support
          },
        }}
        BackdropProps={{
          onClick: (e) => e.stopPropagation(), // Prevent closing when clicking backdrop
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${theme.palette.divider}`,
            pb: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Add />
            <Typography variant="h6">Create Assistant</Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {/* Template Selection Header */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Choose a template
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Here's a few templates to get you started, or you can create your own template and use it to create a new assistant.
              </Typography>
            </Box>

            {/* Assistant Name Input */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Assistant Name{" "}
                <Typography component="span" variant="caption" color="warning.main">
                  (This can be adjusted at any time after creation.)
                </Typography>
              </Typography>
              <TextField
                fullWidth
                placeholder="New Assistant"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  },
                }}
              />
            </Box>

            {/* Blank Template */}
            <Card
              onClick={() => handleTemplateSelect(templates[0])}
              sx={{
                cursor: "pointer",
                border: `2px solid ${
                  selectedTemplate?.id === "blank"
                    ? theme.palette.primary.main
                    : "transparent"
                }`,
                backgroundColor:
                  selectedTemplate?.id === "blank"
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }}
                  >
                    <Add />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Blank Template
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This blank slate template with minimal configurations. It's a starting point for creating your custom assistant.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Quickstart Templates */}
            <Box>
              <Typography
                variant="overline"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 2,
                  color: theme.palette.text.secondary,
                }}
              >
                QUICKSTART
              </Typography>

              <Grid container spacing={2}>
                {templates
                  .filter((t) => t.quickstart)
                  .map((template) => (
                    <Grid item xs={12} sm={6} key={template.id}>
                      <Card
                        onClick={() => handleTemplateSelect(template)}
                        sx={{
                          cursor: "pointer",
                          height: "100%",
                          border: `2px solid ${
                            selectedTemplate?.id === template.id
                              ? theme.palette.primary.main
                              : "transparent"
                          }`,
                          backgroundColor:
                            selectedTemplate?.id === template.id
                              ? alpha(theme.palette.primary.main, 0.08)
                              : "transparent",
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          },
                        }}
                      >
                        <CardContent>
                          <Stack spacing={1}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              }}
                            >
                              {template.icon}
                            </Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {template.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {template.description}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            px: 3,
            py: 2,
          }}
        >
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!assistantName || !selectedTemplate}
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? '#10b981' : '#059669',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? '#059669' : '#047857',
              }
            }}
          >
            Create Assistant
          </Button>
        </DialogActions>
      </Dialog>
  );
};
