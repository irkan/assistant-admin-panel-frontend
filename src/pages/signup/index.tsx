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
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { motion, AnimatePresence } from "framer-motion";
import GoogleIcon from '@mui/icons-material/Google';
import { useGoogleLogin } from '@react-oauth/google';
import { useRegister } from "@refinedev/core";

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

const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#ffffff",
      paper: "#f8fafc",
    },
    primary: {
      main: "#4ade80",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "8px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#d1d5db',
            },
            '&:hover fieldset': {
              borderColor: '#9ca3af',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4ade80',
            },
          },
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
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Grid container sx={{ height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            p: 4,
            minHeight: "100vh"
          }}
        >
          <Box sx={{ maxWidth: 400, width: "100%" }}>
            <Typography 
              variant="h5" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 600,
                color: "#1f2937",
                mb: 1
              }}
            >
              Create your account
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 4 }}
            >
              Enter an email and create a password, getting started is easy!
            </Typography>
            
            {/* Google Sign Up Button */}
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<GoogleIcon />} 
              sx={{ 
                borderColor: '#d1d5db', 
                color: '#374151',
                mb: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb'
                }
              }}
              onClick={() => handleGoogleSignUp()}
            >
              Sign up with Google
            </Button>

            <Typography align="center" variant="body2" color="text.secondary" sx={{ my: 3 }}>
              OR SIGN UP WITH
            </Typography>

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
                  backgroundColor: '#4ade80', 
                  '&:hover': {
                    backgroundColor: '#22c55e'
                  },
                  fontWeight: 600
                }}
              >
                Sign Up
              </Button>
              <Typography variant="body2" align="center" color="text.secondary">
                Already have an account?{" "}
                <Link href="/signin" variant="body2" sx={{ color: '#4ade80', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Right side with SVG background and testimonial slider */}
        <Grid
          item
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            minHeight: "100vh",
            background: "url('/signup-background.svg') no-repeat center center",
            backgroundSize: "cover",
            position: "relative",
          }}
        >
          {/* Overlay for better text readability */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(1px)",
            }}
          />
          
          {/* Testimonial slider with dynamic height */}
          <Box sx={{ width: 400, position: 'relative', zIndex: 1 }}>
             <AnimatePresence mode="wait">
                <motion.div
                    key={currentTestimonial}
                    variants={slideVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.5 }}
                    style={{ position: 'relative', width: '100%' }}
                >
                    <Paper
                      elevation={6}
                      sx={{
                        p: 3,
                        borderRadius: "16px",
                        bgcolor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        minHeight: 'auto', // Dynamic height
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar sx={{ bgcolor: "#4ade80", mr: 2, color: '#ffffff', fontWeight: 'bold' }}>
                          {testimonials[currentTestimonial].avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ color: '#1f2937', fontWeight: 600 }}>
                            {testimonials[currentTestimonial].author}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {testimonials[currentTestimonial].handle}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        {testimonials[currentTestimonial].content}
                      </Box>
                    </Paper>
                </motion.div>
             </AnimatePresence>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};