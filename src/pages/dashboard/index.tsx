import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Paper,
  Container,
  Stack,
  Fade,
  Avatar,
  IconButton,
  LinearProgress,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Business,
  SmartToy,
  Dashboard as DashboardIcon,
  TrendingUp,
  Analytics,
  Speed,
  Timeline,
  Assessment,
  ArrowForward,
  AutoAwesome,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useGetIdentity, useList } from "@refinedev/core";
import { OrganizationModal } from "../../components/OrganizationModal";
import "../../styles/modern-theme.css";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: identity } = useGetIdentity();
  const [showOrganizationModal, setShowOrganizationModal] = useState(false);
  
  // Get organizations data
  const { data: organizationsData, isLoading: orgsLoading } = useList({
    resource: "organizations",
    pagination: { pageSize: 1 },
  });

  // Get assistants data
  const { data: assistantsData, isLoading: assistantsLoading } = useList({
    resource: "assistants",
    pagination: { pageSize: 1 },
  });

  useEffect(() => {
    // Show modal if user has no organizations and data is loaded
    if (!orgsLoading && organizationsData && organizationsData.total === 0) {
      setShowOrganizationModal(true);
    }
  }, [orgsLoading, organizationsData]);

  const stats = [
    {
      title: "Total Organizations",
      value: orgsLoading ? "..." : (organizationsData?.total || 0).toString(),
      icon: Business,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      path: "/organizations",
      subtitle: "Active workspaces",
      trend: "+12%",
    },
    {
      title: "AI Assistants",
      value: assistantsLoading ? "..." : (assistantsData?.total || 0).toString(),
      icon: SmartToy,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      path: "/assistants",
      subtitle: "Deployed agents",
      trend: "+24%",
    },
    {
      title: "Performance",
      value: "98.5%",
      icon: Speed,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      path: "/analytics",
      subtitle: "System uptime",
      trend: "+0.2%",
    },
    {
      title: "Analytics",
      value: "2.4K",
      icon: Analytics,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      path: "/reports",
      subtitle: "Monthly requests",
      trend: "+18%",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "url('/assets/backgrounds/geometric-bg.svg') no-repeat center center",
        backgroundSize: "cover",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)",
          zIndex: 0,
        },
      }}
    >
      <Box className="bg-pattern-grid" sx={{ position: "absolute", inset: 0, opacity: 0.1, zIndex: 1 }} />
      
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, pt: 4, pb: 6 }}>
        {/* Header Section */}
        <Fade in timeout={600}>
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: "var(--gradient-primary)",
                  boxShadow: "var(--shadow-glow)",
                }}
              >
                <DashboardIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 0.5,
                  }}
                >
                  Dashboard Overview
                </Typography>
                <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Welcome back! Here's what's happening with your admin panel today.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Fade>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={stat.title}>
              <Fade in timeout={800 + index * 200}>
                <Card
                  className="modern-card-dark"
                  sx={{
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: stat.gradient,
                    },
                  }}
                  onClick={() => navigate(stat.path)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                            {stat.title}
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                            {stat.subtitle}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            background: stat.gradient,
                            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <stat.icon sx={{ fontSize: 24 }} />
                        </Avatar>
                      </Stack>
                      
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Chip
                          label={stat.trend}
                          size="small"
                          sx={{
                            background: "rgba(16, 185, 129, 0.1)",
                            color: "#10b981",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                          icon={<TrendingUp sx={{ fontSize: 14 }} />}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            color: "rgba(255, 255, 255, 0.6)",
                            "&:hover": { color: "white" },
                          }}
                        >
                          <ArrowForward sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Fade in timeout={1200}>
              <Paper
                className="modern-card-dark"
                sx={{ p: 4, height: "100%" }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                      Quick Actions
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                      Streamline your workflow with these common tasks
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {[
                      { 
                        title: "Create Organization", 
                        subtitle: "Set up a new workspace",
                        icon: Business, 
                        path: "/organizations/create",
                        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      },
                      { 
                        title: "Deploy Assistant", 
                        subtitle: "Launch AI assistant",
                        icon: SmartToy, 
                        path: "/assistants/create",
                        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      },
                      { 
                        title: "View Analytics", 
                        subtitle: "Check performance metrics",
                        icon: Assessment, 
                        path: "/analytics",
                        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      },
                    ].map((action, index) => (
                      <Grid item xs={12} sm={4} key={action.title}>
                        <Card
                          className="modern-card"
                          sx={{
                            cursor: "pointer",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.08)",
                              transform: "translateY(-4px)",
                            },
                          }}
                          onClick={() => navigate(action.path)}
                        >
                          <CardContent sx={{ p: 3, textAlign: "center" }}>
                            <Avatar
                              sx={{
                                width: 56,
                                height: 56,
                                background: action.gradient,
                                mx: "auto",
                                mb: 2,
                                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              <action.icon sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1 }}>
                              {action.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                              {action.subtitle}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Paper>
            </Fade>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Fade in timeout={1400}>
              <Paper
                className="modern-card-dark"
                sx={{ p: 4, height: "100%" }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                      System Status
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Real-time performance metrics
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    {[
                      { label: "API Response Time", value: 89, color: "#10b981" },
                      { label: "Database Performance", value: 94, color: "#3b82f6" },
                      { label: "System Resources", value: 76, color: "#f59e0b" },
                    ].map((metric) => (
                      <Box key={metric.label}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                            {metric.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: metric.color, fontWeight: 600 }}>
                            {metric.value}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={metric.value}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: metric.color,
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>

                  <Box
                    sx={{
                      p: 2,
                      background: "rgba(16, 185, 129, 0.1)",
                      borderRadius: 2,
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AutoAwesome sx={{ fontSize: 18, color: "#10b981" }} />
                      <Typography variant="body2" sx={{ color: "#10b981", fontWeight: 600 }}>
                        All systems operational
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* Organization Modal */}
      <OrganizationModal
        open={showOrganizationModal}
        onClose={(success) => {
          if (success) {
            setShowOrganizationModal(false);
          }
        }}
      />
    </Box>
  );
}; 