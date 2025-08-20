import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Link,
  Paper,
  Container,
  Stack,
  Fade,
  Avatar,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GoogleIcon from '@mui/icons-material/Google';
import { Security, AdminPanelSettings, Star } from '@mui/icons-material';
import { useGoogleLogin } from '@react-oauth/google';
import { useLogin } from "@refinedev/core";
import "../../styles/modern-theme.css";

const modernTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "transparent",
      paper: "rgba(255, 255, 255, 0.1)",
    },
    primary: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#1d4ed8",
    },
    secondary: {
      main: "#8b5cf6",
      light: "#a78bfa",
      dark: "#7c3aed",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: "2rem",
      letterSpacing: "-0.025em",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.125rem",
    },
    body1: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.8rem",
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "12px 24px",
          transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
          },
        },
        outlined: {
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "white",
          "&:hover": {
            background: "rgba(255, 255, 255, 0.15)",
            borderColor: "rgba(255, 255, 255, 0.3)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3b82f6',
              borderWidth: 2,
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
            },
            '&.Mui-focused': {
              background: "rgba(255, 255, 255, 0.15)",
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: '#60a5fa',
            },
          },
          '& .MuiOutlinedInput-input': {
            color: 'white',
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.5)',
              opacity: 1,
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      },
    },
  },
});

export const Signin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isVisible, setIsVisible] = useState(false);
  const { mutate: login } = useLogin();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google directly
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const userInfo = await userInfoResponse.json();
        
        // Sign in with Google data
        login({
          email: userInfo.email,
          googleId: userInfo.id,
          provider: 'google',
        });
      } catch (error) {
        console.error('Google sign-in error:', error);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      email: formData.email,
      password: formData.password,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      {/* Modern Background with Mesh Gradient */}
      <Box
        sx={{
          minHeight: "100vh",
          background: "url('/assets/backgrounds/mesh-bg.svg') no-repeat center center",
          backgroundSize: "cover",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--gradient-mesh)",
            opacity: 0.8,
          },
        }}
      >
        {/* Animated Background Particles */}
        <Box className="bg-pattern-dots" sx={{ position: "absolute", inset: 0, opacity: 0.3 }} />
        
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, height: "100vh", display: "flex", alignItems: "center" }}>
          <Grid container spacing={0} sx={{ height: "100%" }}>
            {/* Left Side - Brand & Features */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                px: 4,
              }}
            >
              <Fade in={isVisible} timeout={800}>
                <Box>
                  {/* Logo/Brand */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: "var(--gradient-primary)",
                        mr: 2,
                        boxShadow: "var(--shadow-glow)",
                      }}
                    >
                      <AdminPanelSettings sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 800, background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      Admin Panel
                    </Typography>
                  </Box>

                  <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, lineHeight: 1.2 }}>
                    Welcome to the Future of 
                    <Box component="span" sx={{ background: "var(--gradient-primary)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "block" }}>
                      Administration
                    </Box>
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 4, color: "rgba(255, 255, 255, 0.8)", fontSize: "1.1rem", lineHeight: 1.7 }}>
                    Experience cutting-edge admin panel with modern design, powerful features, and seamless user experience.
                  </Typography>

                  {/* Feature List */}
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {[
                      { icon: Security, text: "Enterprise-grade security" },
                      { icon: Star, text: "Modern & intuitive interface" },
                      { icon: AdminPanelSettings, text: "Advanced management tools" },
                    ].map((feature, index) => (
                      <Fade in={isVisible} timeout={1000 + index * 200} key={index}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              background: "rgba(255, 255, 255, 0.1)",
                              backdropFilter: "blur(10px)",
                              mr: 2,
                            }}
                          >
                            <feature.icon sx={{ fontSize: 18, color: "#60a5fa" }} />
                          </Avatar>
                          <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                            {feature.text}
                          </Typography>
                        </Box>
                      </Fade>
                    ))}
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            {/* Right Side - Login Form */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                px: { xs: 2, md: 4 },
              }}
            >
              <Fade in={isVisible} timeout={600}>
                <Paper
                  elevation={0}
                  className="modern-card scale-in"
                  sx={{
                    p: { xs: 3, sm: 4 },
                    width: "100%",
                    maxWidth: 420,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Form Header */}
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                      Sign In
                    </Typography>
                    <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                      Welcome back! Please enter your details.
                    </Typography>
                  </Box>

                  {/* Google Sign In Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    onClick={() => handleGoogleSignIn()}
                    sx={{ mb: 3, height: 48 }}
                  >
                    Continue with Google
                  </Button>

                  {/* Divider */}
                  <Box sx={{ position: "relative", mb: 3 }}>
                    <Box sx={{ height: 1, background: "rgba(255, 255, 255, 0.2)" }} />
                    <Typography
                      variant="body2"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        px: 2,
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "0.8rem",
                      }}
                    >
                      OR
                    </Typography>
                  </Box>

                  {/* Login Form */}
                  <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      <TextField
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleInputChange}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ height: 48, mt: 2 }}
                      >
                        Sign In
                      </Button>
                    </Stack>
                  </Box>

                  {/* Footer */}
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{ mt: 3, color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    Don't have an account?{" "}
                    <Link
                      href="/signup"
                      sx={{
                        color: "#60a5fa",
                        textDecoration: "none",
                        fontWeight: 600,
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Sign up
                    </Link>
                  </Typography>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};