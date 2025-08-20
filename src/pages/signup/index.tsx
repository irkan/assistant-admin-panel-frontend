import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Link,
  Paper,
  Avatar,
  Container,
  Stack,
  Fade,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { motion, AnimatePresence } from "framer-motion";
import GoogleIcon from '@mui/icons-material/Google';
import { useGoogleLogin } from '@react-oauth/google';
import { useRegister } from "@refinedev/core";
import { PersonAdd, Security, Star } from "@mui/icons-material";
import "../../styles/modern-theme.css";

const testimonials = [
  {
    author: "Deepgram",
    handle: "@DeepgramAI",
    avatar: "D",
    content: (
      <>
        <Typography variant="body2" sx={{ mb: 2, color: '#374151' }}>
          <Link href="#" color="inherit" underline="none" sx={{ color: '#4ade80' }}>
            @Vapi_AI
          </Link>{" "}
          thank you for making my end to end journey easier by:
        </Typography>
        <Typography variant="body2" component="ol" sx={{ color: '#374151', pl: 2 }}>
          <li style={{ marginBottom: '8px' }}>Optimizing streaming and colocating servers that shave off every possible millisecond of latency</li>
          <li style={{ marginBottom: '8px' }}>Customizing by allowing to connect to WebRTC stream through Web, iOS and Python clients.</li>
          <li>Easy Scaling</li>
        </Typography>
      </>
    ),
  },
  {
    author: "Bob Wisely",
    handle: "Founder, Retexts",
    avatar: "B",
    content: (
      <>
        <Typography variant="body2" sx={{ mb: 2, color: '#374151' }}>
          Building a high-quality production-ready voice agent on{" "}
          <Link href="#" color="inherit" underline="none" sx={{ color: '#4ade80' }}>
            Vapi
          </Link>{" "}
          was incredibly easy for me.
        </Typography>
        <Typography variant="body2" sx={{ color: '#374151' }}>
          I notice new features being released almost daily, and the support provided is exceptional. Keep up the excellent work!
        </Typography>
      </>
    ),
  },
  {
    author: "Sarah Johnson",
    handle: "CTO, TechStart",
    avatar: "S",
    content: (
      <>
        <Typography variant="body2" sx={{ mb: 2, color: '#374151' }}>
          The integration process was seamless and the documentation is top-notch. Our team was able to get up and running in just a few hours.
        </Typography>
        <Typography variant="body2" sx={{ color: '#374151' }}>
          The performance improvements we've seen are remarkable. Highly recommend for any voice AI project.
        </Typography>
      </>
    ),
  },
];

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
    h3: {
      fontWeight: 800,
      letterSpacing: "-0.025em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.015em",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
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
          padding: "12px 24px",
          transition: "all 0.2s ease-in-out",
        },
        contained: {
          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
          "&:hover": {
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
          },
        },
        outlined: {
          borderColor: "rgba(255, 255, 255, 0.3)",
          color: "white",
          "&:hover": {
            borderColor: "rgba(255, 255, 255, 0.5)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.3)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#3b82f6",
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
            },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(255, 255, 255, 0.7)",
            "&.Mui-focused": {
              color: "#3b82f6",
            },
          },
          "& .MuiOutlinedInput-input": {
            color: "white",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
      },
    },
  },
});

const slideVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

export const Signup = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [formData, setFormData] = useState({ name: '', surname: '', email: '', password: '' });
  const { mutate: register } = useRegister();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 10000); // Change every 10 seconds
    return () => clearInterval(timer);
  }, []);

  const handleGoogleSignUp = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const userInfo = await userInfoResponse.json();
        
        // Register with Google data
        register({
          email: userInfo.email,
          name: userInfo.given_name,
          surname: userInfo.family_name,
          googleId: userInfo.id,
          provider: 'google',
        });
      } catch (error) {
        console.error('Google sign-up error:', error);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({
      name: formData.name,
      surname: formData.surname,
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
        <Box className="bg-pattern-dots" sx={{ position: "absolute", inset: 0, opacity: 0.3 }} />
        
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
          <Grid container sx={{ minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
            {/* Left Side - Brand & Features */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                p: 4,
                minHeight: "100vh",
              }}
            >
              <Fade in timeout={800}>
                <Box sx={{ mb: 6 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                        boxShadow: "var(--shadow-glow)",
                      }}
                    >
                      <PersonAdd sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{
                          background: "linear-gradient(135deg, #ffffff 0%, #a78bfa 100%)",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          mb: 0.5,
                        }}
                      >
                        Join Admin Panel
                      </Typography>
                      <Typography variant="body1" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        Create your account and start managing assistants
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Features */}
                  <Stack spacing={3}>
                    {[
                      { icon: <Security />, title: "Secure & Private", desc: "Your data is protected with enterprise-grade security" },
                      { icon: <Star />, title: "Easy Management", desc: "Intuitive interface for managing AI assistants" },
                      { icon: <PersonAdd />, title: "Quick Setup", desc: "Get started in minutes with our guided setup" },
                    ].map((feature, index) => (
                      <Fade key={index} in timeout={1200 + index * 200}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              background: "rgba(255, 255, 255, 0.1)",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            {feature.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ color: "white", fontWeight: 600 }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                              {feature.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      </Fade>
                    ))}
                  </Stack>
                </Box>
              </Fade>
            </Grid>

            {/* Right Side - Signup Form */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 4,
                minHeight: "100vh",
              }}
            >
              <Fade in timeout={1000}>
                <Paper
                  className="modern-card scale-in"
                  sx={{
                    maxWidth: 450,
                    width: "100%",
                    p: 4,
                    background: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "20px",
                    boxShadow: "0 32px 64px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: "white",
                      mb: 1,
                      textAlign: "center",
                    }}
                  >
                    Create Account
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 4, textAlign: "center" }}
                  >
                    Join our platform and start building amazing AI assistants
                  </Typography>
            
                  {/* Google Sign Up Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    sx={{
                      mb: 3,
                      py: 1.5,
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      color: "white",
                      "&:hover": {
                        borderColor: "rgba(255, 255, 255, 0.5)",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      },
                    }}
                    onClick={() => handleGoogleSignUp()}
                  >
                    Continue with Google
                  </Button>

                  <Box sx={{ position: "relative", my: 3 }}>
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: "1px",
                        background: "rgba(255, 255, 255, 0.2)",
                      }}
                    />
                    <Typography
                      align="center"
                      variant="body2"
                      sx={{
                        background: "rgba(30, 41, 59, 0.9)",
                        px: 2,
                        color: "rgba(255, 255, 255, 0.7)",
                        position: "relative",
                        display: "inline-block",
                        left: "50%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      OR
                    </Typography>
                  </Box>

                  <Box component="form" noValidate onSubmit={handleSubmit}>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="name"
                      label="Your first name"
                      name="name"
                      autoComplete="given-name"
                      autoFocus
                      variant="outlined"
                      value={formData.name}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="surname"
                      label="Your last name"
                      name="surname"
                      autoComplete="family-name"
                      variant="outlined"
                      value={formData.surname}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Your email address"
                      name="email"
                      autoComplete="email"
                      variant="outlined"
                      value={formData.email}
                      onChange={handleInputChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="Your password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      variant="outlined"
                      value={formData.password}
                      onChange={handleInputChange}
                      sx={{ mb: 3 }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{
                        mt: 2,
                        mb: 3,
                        py: 1.5,
                        fontWeight: 600,
                      }}
                    >
                      Create Account
                    </Button>
                    <Typography variant="body2" align="center" color="text.secondary">
                      Already have an account?{" "}
                      <Link
                        href="/signin"
                        variant="body2"
                        sx={{
                          color: "#3b82f6",
                          textDecoration: "none",
                          fontWeight: 600,
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Sign in
                      </Link>
                    </Typography>
                  </Box>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};