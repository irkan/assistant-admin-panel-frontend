import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Container,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Fade,
  useTheme,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Search,
  VolumeUp,
  RecordVoiceOver,
  FilterList,
  NavigateBefore,
  NavigateNext,
  ContentCopy,
} from "@mui/icons-material";
import "../../styles/modern-theme.css";

interface Voice {
  id: string;
  provider: string;
  providerId: string;
  slug: string;
  name: string;
  gender: string;
  accent?: string;
  previewUrl: string;
  description?: string;
  isPublic: boolean;
  isFeatured: boolean;
  imageUrl?: string;
  bestFor?: string;
  createdAt: string;
  updatedAt?: string;
}

interface VoicePagination {
  limit: number;
  offset: number;
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface VoiceResponse {
  success: boolean;
  data: Voice[];
  pagination: VoicePagination;
}

export const VoiceLibraryList: React.FC = () => {
  const theme = useTheme();
  const [allVoices, setAllVoices] = useState<Voice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedAccent, setSelectedAccent] = useState("");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [featuredVoices, setFeaturedVoices] = useState<Voice[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

  // Fetch featured voices
  useEffect(() => {
    const fetchFeaturedVoices = async () => {
      try {
        setFeaturedLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/voices/featured`);
        const result = await response.json();
        if (result.success) {
          setFeaturedVoices(result.data);
        }
      } catch (error) {
        console.error('Error fetching featured voices:', error);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedVoices();
  }, []);

  // Auto-scroll featured voices carousel
  useEffect(() => {
    if (featuredVoices.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex(prev => 
          (prev + 1) % Math.min(featuredVoices.length, 5)
        );
      }, 4000); // 4 seconds auto-scroll
      return () => clearInterval(interval);
    }
  }, [featuredVoices.length]);

  // Fetch voices function with remote search and filters
  const fetchVoices = async (page: number, reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const params = new URLSearchParams({
        limit: '100',
        page: page.toString(),
      });

      // Add search parameter for remote search
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      // Add filter parameters for remote filtering
      if (selectedProvider) {
        params.append('provider', selectedProvider);
      }
      if (selectedGender) {
        params.append('gender', selectedGender);
      }
      if (selectedAccent) {
        params.append('accent', selectedAccent);
      }

      console.log('🔍 Remote search with params:', Object.fromEntries(params));
      
      const response = await fetch(`${API_BASE_URL}/api/voices?${params}`);
      const result: VoiceResponse = await response.json();
      
      if (result.success) {
        if (reset) {
          setAllVoices(result.data);
          console.log(`📊 Remote search returned ${result.data.length} voices (total: ${result.pagination.total})`);
        } else {
          setAllVoices(prev => [...prev, ...result.data]);
          console.log(`📊 Loaded ${result.data.length} more voices (total loaded: ${allVoices.length + result.data.length})`);
        }
        setHasMore(result.pagination.hasNext);
      }
    } catch (error) {
      console.error('❌ Error fetching voices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect - wait 800ms after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) { // Don't trigger on initial mount
        setCurrentPage(1);
        setAllVoices([]);
        fetchVoices(1, true);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Filter changes - immediate search
  useEffect(() => {
    setCurrentPage(1);
    setAllVoices([]);
    fetchVoices(1, true);
  }, [selectedProvider, selectedGender, selectedAccent]);

  // Initial load
  useEffect(() => {
    fetchVoices(1, true);
  }, []);

  // Handle voice playback
  const handlePlayVoice = (voiceId: string, previewUrl: string) => {
    if (audioRef.current) {
      if (playingVoiceId === voiceId) {
        audioRef.current.pause();
        setPlayingVoiceId(null);
      } else {
        audioRef.current.pause(); // Stop current audio
        audioRef.current.src = previewUrl;
        audioRef.current.play();
        setPlayingVoiceId(voiceId);
      }
    } else {
      audioRef.current = new Audio(previewUrl);
      audioRef.current.play();
      setPlayingVoiceId(voiceId);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setPlayingVoiceId(null);
      };
    }
  }, [playingVoiceId]);

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchVoices(nextPage, false);
    }
  };

  // Handle copy voice ID
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    // Optional: show toast notification
  };

  // Get provider badge color
  const getProviderBadgeColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "11labs": return "linear-gradient(45deg, #FF5722 30%, #FFC107 90%)";
      case "playht": return "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)";
      case "neets": return "linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)";
      default: return "linear-gradient(45deg, #9E9E9E 30%, #BDBDBD 90%)";
    }
  };

  const VoiceCard = ({ voice }: { voice: Voice }) => (
    <Card
      sx={{
        height: "100%",
        background: theme.palette.mode === "dark" 
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${theme.palette.mode === "dark" 
          ? "rgba(255, 255, 255, 0.1)" 
          : "rgba(0, 0, 0, 0.1)"}`,
        borderRadius: "16px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: theme.palette.mode === "dark"
            ? "0 20px 40px rgba(0, 0, 0, 0.4)"
            : "0 20px 40px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar 
              src={voice.imageUrl} 
              sx={{ 
                width: 40, 
                height: 40,
                background: getProviderBadgeColor(voice.provider)
              }}
            >
              <RecordVoiceOver />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                {voice.name}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {voice.providerId}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={() => handleCopyId(voice.id)}
            sx={{ 
              color: theme.palette.text.secondary,
              "&:hover": { color: theme.palette.primary.main }
            }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1} mb={2}>
          <Chip
            label={voice.provider}
            size="small"
            sx={{
              background: getProviderBadgeColor(voice.provider),
              color: "white",
              fontWeight: 600,
            }}
          />
          <Chip
            label={voice.gender}
            size="small"
            variant="outlined"
            sx={{ borderColor: theme.palette.primary.main }}
          />
          {voice.accent && (
            <Chip
              label={voice.accent}
              size="small"
              variant="outlined"
              sx={{ borderColor: theme.palette.secondary.main }}
            />
          )}
        </Stack>

        {voice.description && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {voice.description}
          </Typography>
        )}

        {voice.bestFor && (
          <Box mb={2}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Best for:
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
              {voice.bestFor}
            </Typography>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          startIcon={playingVoiceId === voice.id ? <Pause /> : <PlayArrow />}
          onClick={() => handlePlayVoice(voice.id, voice.previewUrl)}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            color: "white",
            fontWeight: 600,
            borderRadius: "12px",
            textTransform: "none",
            "&:hover": {
              opacity: 0.9,
            },
          }}
        >
          {playingVoiceId === voice.id ? "Pause" : "Play Preview"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: 4,
        background: `radial-gradient(circle at 10% 20%, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        backgroundImage: `url('/assets/backgrounds/geometric-bg.svg'), radial-gradient(circle at 10% 20%, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
        backgroundSize: 'cover',
        backgroundBlendMode: 'overlay',
        minHeight: '100vh',
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={2} mb={4}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
            <VolumeUp sx={{ fontSize: 32, color: theme.palette.common.white }} />
          </Avatar>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Voice Library
          </Typography>
        </Stack>

        {/* Featured Voices Carousel */}
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, color: theme.palette.text.primary }}>
          Featured Voices
        </Typography>
        {featuredLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ position: 'relative', mb: 6 }}>
            <Box
              sx={{
                display: 'flex',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: '16px',
                height: '280px',
              }}
            >
              {featuredVoices.slice(0, 5).map((voice, index) => (
                <Box
                  key={voice.id}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: index === currentFeaturedIndex ? 1 : 0,
                    transform: `translateX(${(index - currentFeaturedIndex) * 100}%)`,
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: `linear-gradient(135deg, ${getProviderBadgeColor(voice.provider)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 4,
                    backgroundImage: voice.imageUrl ? `url(${voice.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'overlay',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
                      zIndex: 1,
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 2, color: 'white', maxWidth: '60%' }}>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {voice.name}
                    </Typography>
                    <Chip
                      label={voice.provider.toUpperCase()}
                      sx={{
                        background: getProviderBadgeColor(voice.provider),
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Best for:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                      {voice.bestFor}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={playingVoiceId === voice.id ? <Pause /> : <PlayArrow />}
                      onClick={() => handlePlayVoice(voice.id, voice.previewUrl)}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                        px: 3,
                        py: 1.5,
                        fontWeight: 600,
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                        },
                      }}
                    >
                      {playingVoiceId === voice.id ? 'Pause Preview' : 'Play Preview'}
                    </Button>
                  </Box>
                  
                  {/* Navigation Arrows */}
                  <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <IconButton
                      onClick={() => setCurrentFeaturedIndex(prev => 
                        prev === 0 ? Math.min(featuredVoices.length - 1, 4) : prev - 1
                      )}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                        },
                      }}
                    >
                      <NavigateBefore />
                    </IconButton>
                    <IconButton
                      onClick={() => setCurrentFeaturedIndex(prev => 
                        (prev + 1) % Math.min(featuredVoices.length, 5)
                      )}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.3)',
                        },
                      }}
                    >
                      <NavigateNext />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
            
            {/* Dots Indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
              {featuredVoices.slice(0, 5).map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentFeaturedIndex(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: index === currentFeaturedIndex 
                      ? theme.palette.primary.main 
                      : 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.2)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Filters */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
            <TextField
              placeholder="Search voices by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentPage(1);
                  setAllVoices([]);
                  fetchVoices(1, true);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: theme.palette.mode === "dark" 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.palette.mode === "dark" 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)'}`,
                  '& fieldset': { border: 'none' },
                },
              }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Provider</InputLabel>
              <Select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                label="Provider"
                sx={{
                  borderRadius: '12px',
                  background: theme.palette.mode === "dark" 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="11labs">11Labs</MenuItem>
                <MenuItem value="playht">PlayHT</MenuItem>
                <MenuItem value="neets">NEETS</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                label="Gender"
                sx={{
                  borderRadius: '12px',
                  background: theme.palette.mode === "dark" 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="neutral">Neutral</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Accent</InputLabel>
              <Select
                value={selectedAccent}
                onChange={(e) => setSelectedAccent(e.target.value)}
                label="Accent"
                sx={{
                  borderRadius: '12px',
                  background: theme.palette.mode === "dark" 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
              >
                <MenuItem value="">All Accents</MenuItem>
                <MenuItem value="english-italian">English-Italian</MenuItem>
                <MenuItem value="african">African</MenuItem>
                <MenuItem value="indian">Indian</MenuItem>
                <MenuItem value="flemish">Flemish</MenuItem>
                <MenuItem value="colombian">Colombian</MenuItem>
                <MenuItem value="american-southern">American Southern</MenuItem>
                <MenuItem value="russian">Russian</MenuItem>
                <MenuItem value="turkish">Turkish</MenuItem>
                <MenuItem value="japanese">Japanese</MenuItem>
                <MenuItem value="belgian">Belgian</MenuItem>
                <MenuItem value="es-mexican">Mexican Spanish</MenuItem>
                <MenuItem value="en-indian">English-Indian</MenuItem>
                <MenuItem value="czech">Czech</MenuItem>
                <MenuItem value="new zealand">New Zealand</MenuItem>
                <MenuItem value="malaysian">Malaysian</MenuItem>
                <MenuItem value="brazilian">Brazilian</MenuItem>
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="australian">Australian</MenuItem>
                <MenuItem value="british">British</MenuItem>
                <MenuItem value="american">American</MenuItem>
                <MenuItem value="german">German</MenuItem>
                <MenuItem value="french">French</MenuItem>
                <MenuItem value="polish">Polish</MenuItem>
                <MenuItem value="arabic">Arabic</MenuItem>
                <MenuItem value="latin american">Latin American</MenuItem>
                <MenuItem value="chinese">Chinese</MenuItem>
                <MenuItem value="hungarian">Hungarian</MenuItem>
                <MenuItem value="canadian">Canadian</MenuItem>
                <MenuItem value="swedish">Swedish</MenuItem>
                <MenuItem value="hindi">Hindi</MenuItem>
                <MenuItem value="scottish">Scottish</MenuItem>
                <MenuItem value="egyptian">Egyptian</MenuItem>
                <MenuItem value="irish">Irish</MenuItem>
                <MenuItem value="danish">Danish</MenuItem>
                <MenuItem value="portuguese">Portuguese</MenuItem>
                <MenuItem value="filipino">Filipino</MenuItem>
                <MenuItem value="moroccan">Moroccan</MenuItem>
                <MenuItem value="south african">South African</MenuItem>
                <MenuItem value="italian">Italian</MenuItem>
                <MenuItem value="swiss">Swiss</MenuItem>
                <MenuItem value="nigerian">Nigerian</MenuItem>
                <MenuItem value="mexican">Mexican</MenuItem>
                <MenuItem value="spanish">Spanish</MenuItem>
                <MenuItem value="romanian">Romanian</MenuItem>
                <MenuItem value="singaporean">Singaporean</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* All Voices */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>
            {searchTerm ? `Search Results (${allVoices.length})` : `All Voices (${allVoices.length})`}
          </Typography>
          {searchTerm && (
            <Chip
              label={`Searching: "${searchTerm}"`}
              onDelete={() => setSearchTerm('')}
              sx={{
                background: theme.palette.primary.main,
                color: 'white',
                '& .MuiChip-deleteIcon': {
                  color: 'white',
                },
              }}
            />
          )}
        </Box>
        
        {searchTerm && allVoices.length === 0 && !loading && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              background: theme.palette.mode === "dark" 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)',
              borderRadius: '16px',
              mb: 4,
            }}
          >
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
              No voices found for "{searchTerm}"
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
              Try adjusting your search terms or filters
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedProvider('');
                setSelectedGender('');
                setSelectedAccent('');
              }}
              sx={{ borderRadius: '12px' }}
            >
              Clear All Filters
            </Button>
          </Box>
        )}
        
        <Grid container spacing={3}>
          {allVoices.map((voice, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={voice.id}>
              <Fade in={true} style={{ transitionDelay: `${(index % 12) * 50}ms` }}>
                <div>
                  <VoiceCard voice={voice} />
                </div>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Load More Button */}
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Button
              variant="contained"
              onClick={handleLoadMore}
              disabled={loading}
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '12px',
                padding: '12px 48px',
                fontSize: '1.1rem',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Loading...
                </>
              ) : (
                'Load More Voices'
              )}
            </Button>
          </Box>
        )}

        {!hasMore && allVoices.length > 0 && (
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center', 
              mt: 4, 
              color: theme.palette.text.secondary,
              fontStyle: 'italic'
            }}
          >
            🎉 You've seen all available voices!
          </Typography>
        )}
      </Container>
    </Box>
  );
};