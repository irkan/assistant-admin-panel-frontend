import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Paper,
} from "@mui/material";
import {
  Business,
  SmartToy,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";
import { useGetIdentity, useList } from "@refinedev/core";
import { OrganizationModal } from "../../components/OrganizationModal";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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
      title: "Organizations",
      value: orgsLoading ? "..." : (organizationsData?.total || 0).toString(),
      icon: <Business sx={{ fontSize: 40 }} />,
      color: "#388e3c",
      path: "/organizations",
    },
    {
      title: "Assistants",
      value: assistantsLoading ? "..." : (assistantsData?.total || 0).toString(),
      icon: <SmartToy sx={{ fontSize: 40 }} />,
      color: "#f57c00",
      path: "/assistants",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        <DashboardIcon sx={{ mr: 1, verticalAlign: "middle" }} />
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                },
              }}
              onClick={() => navigate(stat.path)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography variant="h4" component="div" sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Business />}
              onClick={() => navigate("/organizations/create")}
            >
              Add Organization
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<SmartToy />}
              onClick={() => navigate("/assistants/create")}
            >
              Add Assistant
            </Button>
          </Grid>
        </Grid>
      </Paper>

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