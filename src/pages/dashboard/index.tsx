import React from "react";
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
  People,
  Business,
  SmartToy,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router";

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Organizations",
      value: "0",
      icon: <Business sx={{ fontSize: 40 }} />,
      color: "#388e3c",
      path: "/organizations",
    },
    {
      title: "Agents",
      value: "0",
      icon: <SmartToy sx={{ fontSize: 40 }} />,
      color: "#f57c00",
      path: "/agents",
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
              onClick={() => navigate("/agents/create")}
            >
              Add Agent
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}; 