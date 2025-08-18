import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Link,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import GoogleIcon from '@mui/icons-material/Google';
import { useGoogleLogin } from '@react-oauth/google';
import { useLogin } from "@refinedev/core";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#ffffff",
      paper: "#ffffff",
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

export const Signin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { mutate: login } = useLogin();

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
              Sign in to your account
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 4 }}
            >
              Welcome back! Please sign in to continue.
            </Typography>
            
            {/* Google Sign In Button */}
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
              onClick={() => handleGoogleSignIn()}
            >
              Sign in with Google
            </Button>

            <Typography align="center" variant="body2" color="text.secondary" sx={{ my: 3 }}>
              OR SIGN IN WITH
            </Typography>

            <Box component="form" noValidate onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Your email address"
                name="email"
                autoComplete="email"
                autoFocus
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
                Sign In
              </Button>
              <Typography variant="body2" align="center" color="text.secondary">
                Don't have an account?{" "}
                <Link href="/signup" variant="body2" sx={{ color: '#4ade80', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Right side - can be empty or add some branding */}
        <Grid
          item
          md={6}
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
          }}
        >
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
              Welcome Back!
            </Typography>
            <Typography variant="h6" sx={{ color: '#6b7280' }}>
              Sign in to access your admin panel
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};