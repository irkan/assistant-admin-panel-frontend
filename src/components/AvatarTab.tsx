import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useGeminiImageGeneration } from '../hooks/useGeminiImageGeneration';

interface AvatarTabProps {
  assistantId: number;
  assistantName: string;
  selectedAvatar?: string;
  onAvatarChange?: (avatar: string) => void;
}

interface SavedImage {
  id: number;
  imageData: string;
  mimeType: string;
  prompt: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export const AvatarTab: React.FC<AvatarTabProps> = ({ 
  assistantId, 
  assistantName, 
  selectedAvatar = "Ayla",
  onAvatarChange 
}) => {
  const {
    isGenerating,
    generatedImage,
    error,
    isSaving,
    generateImage,
    saveImage,
    getGenerationInfo,
    clearImage
  } = useGeminiImageGeneration();

  const [prompt, setPrompt] = useState('');
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [generationInfo, setGenerationInfo] = useState<any>(null);
  const [loadingSavedImages, setLoadingSavedImages] = useState(false);
  const [expandedAvatar, setExpandedAvatar] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedSavedImage, setExpandedSavedImage] = useState<SavedImage | null>(null);

  // Template backgrounds
  const templateBackgrounds = [
    { id: 'bg1', name: 'Template 1', path: '/assets/template/bg1.png' },
    { id: 'bg2', name: 'Template 2', path: '/assets/template/bg2.jpeg' },
    { id: 'bg3', name: 'Template 3', path: '/assets/template/bg3.jpeg' },
    { id: 'bg4', name: 'Template 4', path: '/assets/template/bg4.jpeg' }
  ];

  // Load generation info and saved images on component mount
  useEffect(() => {
    loadGenerationInfo();
    loadSavedImages();
  }, [assistantId]);

  const loadGenerationInfo = async () => {
    const info = await getGenerationInfo();
    setGenerationInfo(info);
  };

  const loadSavedImages = async () => {
    setLoadingSavedImages(true);
    try {
      const token = localStorage.getItem('refine-auth');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/gemini/avatar-images/${assistantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedImages(data.data || []);
      }
    } catch (error) {
      console.error('Error loading saved images:', error);
    } finally {
      setLoadingSavedImages(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }

    await generateImage(prompt.trim());
  };

  const handleSaveImage = async () => {
    if (!generatedImage) return;

    const success = await saveImage(assistantId, generatedImage);
    if (success) {
      setShowPreview(false);
      clearImage();
      loadSavedImages();
      setPrompt('');
    }
  };

  const handleActivateImage = async (imageId: number) => {
    try {
      const token = localStorage.getItem('refine-auth');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/gemini/avatar-images/${imageId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadSavedImages();
      }
    } catch (error) {
      console.error('Error activating image:', error);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this avatar image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('refine-auth');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/gemini/avatar-images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadSavedImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const openPreview = () => {
    if (generatedImage) {
      setShowPreview(true);
    }
  };

  // Convert image URL to base64 with optimization
  const convertImageToBase64 = async (imageUrl: string): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Optimize canvas size for 16:9 ratio (max 1024x576 to reduce size)
        const maxWidth = 1024;
        const maxHeight = 576;
        let { width, height } = img;
        
        // Calculate aspect ratio and resize if needed
        const aspectRatio = width / height;
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Use JPEG with 80% quality for better compression
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataURL.split(',')[1];
        resolve({ base64, mimeType: 'image/jpeg' });
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

  // Handle image file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('You can only upload image files.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size cannot be larger than 10MB.');
      return;
    }

    setUploadingImage(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const base64 = base64Data.split(',')[1]; // Remove data:image/...;base64, prefix
        
        const token = localStorage.getItem('refine-auth');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/gemini/upload-avatar-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            assistantId,
            imageData: base64,
            mimeType: file.type,
            fileName: file.name
          })
        });

        if (response.ok) {
          console.log('Image uploaded successfully');
          loadSavedImages(); // Reload to show the new uploaded image
          // Clear the file input
          event.target.value = '';
        } else {
          const errorData = await response.text();
          console.error('Server error:', response.status, errorData);
          throw new Error(`Server returned ${response.status}: ${errorData}`);
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Error occurred while uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle template background selection and save
  const handleSaveTemplate = async (templatePath: string, templateName: string) => {
    try {
      console.log(`Converting template: ${templateName}`);
      const { base64, mimeType } = await convertImageToBase64(templatePath);
      console.log(`Template converted, size: ${base64.length} characters`);
      
      const token = localStorage.getItem('refine-auth');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/gemini/save-avatar-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assistantId,
          imageData: base64,
          mimeType,
          prompt: `Template: ${templateName}`,
          description: `Predefined template background: ${templateName}`
        })
      });

      if (response.ok) {
        console.log('Template saved successfully');
        loadSavedImages(); // Reload to show the new template
        setSelectedTemplate(null);
      } else {
        const errorData = await response.text();
        console.error('Server error:', response.status, errorData);
        throw new Error(`Server returned ${response.status}: ${errorData}`);
      }
    } catch (error) {
      console.error('Error saving template background:', error);
      // You could add a toast notification here
      alert(`Error occurred while saving template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        Avatar Settings - {assistantName}
      </Typography>

      {/* Avatar Character Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            Avatar Selection
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose an avatar for your assistant.
          </Typography>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select Avatar
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1, maxWidth: 400 }}>
              {["Ayla", "Jessica", "Kevin", "Nina"].map((avatar) => (
                <Grid item xs={6} key={avatar}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      border: selectedAvatar === avatar ? 2 : 1,
                      borderColor: selectedAvatar === avatar ? "primary.main" : "divider",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => onAvatarChange && onAvatarChange(avatar)}
                    onDoubleClick={() => setExpandedAvatar(avatar)}
                  >
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                      <Box
                        component="img"
                        src={`/assets/models/${avatar}.png`}
                        alt={avatar}
                        sx={{
                          width: "100%",
                          height: 120,
                          objectFit: "contain",
                          borderRadius: 1,
                          mb: 1,
                        }}
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {avatar}
                      </Typography>
                      {selectedAvatar === avatar && (
                        <CheckCircleIcon
                          color="primary"
                          sx={{ fontSize: 20, mt: 1 }}
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Avatar Expanded View Dialog */}
      <Dialog
        open={expandedAvatar !== null}
        onClose={() => setExpandedAvatar(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Avatar Preview</Typography>
          <IconButton onClick={() => setExpandedAvatar(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          {expandedAvatar && (
            <Box>
              <Box
                component="img"
                src={`/assets/models/${expandedAvatar}.png`}
                alt={expandedAvatar}
                sx={{
                  width: "100%",
                  maxWidth: 300,
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 2,
                  mb: 2,
                  boxShadow: 3,
                }}
              />
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {expandedAvatar}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click to select this avatar
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              if (expandedAvatar && onAvatarChange) {
                onAvatarChange(expandedAvatar);
              }
              setExpandedAvatar(null);
            }}
          >
            Select This Avatar
          </Button>
          <Button
            variant="outlined"
            onClick={() => setExpandedAvatar(null)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Background Generation Section */}
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ImageIcon color="primary" />
        Avatar Backgrounds
      </Typography>

      {/* Template Background Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImageIcon color="primary" />
            Template Backgrounds
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose from ready-made background templates.
          </Typography>

          <Grid container spacing={2}>
            {templateBackgrounds.map((template) => (
              <Grid item xs={12} sm={6} md={3} key={template.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    border: selectedTemplate === template.id ? 2 : 1,
                    borderColor: selectedTemplate === template.id ? "primary.main" : "divider",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent sx={{ p: 2, textAlign: "center" }}>
                    <Box
                      component="img"
                      src={template.path}
                      alt={template.name}
                      sx={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {template.name}
                    </Typography>
                    {selectedTemplate === template.id && (
                      <CheckCircleIcon
                        color="primary"
                        sx={{ fontSize: 20, mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {selectedTemplate && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={() => {
                  const template = templateBackgrounds.find(t => t.id === selectedTemplate);
                  if (template) {
                    handleSaveTemplate(template.path, template.name);
                  }
                }}
                startIcon={<SaveIcon />}
              >
                Set Selected Template
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Custom Image Upload Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUploadIcon color="primary" />
            Upload Your Own Image
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload your custom background image (Maximum 10MB, image files only).
          </Typography>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 6,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backgroundColor: 'background.default',
              width: '100%',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
                transform: 'translateY(-2px)',
                boxShadow: 2
              },
              '&:active': {
                transform: 'translateY(0px)'
              }
            }}
            component="label"
            htmlFor="image-upload"
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
            
            <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2, opacity: 0.7 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
              {uploadingImage ? 'Uploading...' : 'Select an image or drag and drop here'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              PNG, JPG, JPEG formats, maximum 10MB
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Click to browse or drag your image file here
            </Typography>
            
            {uploadingImage && (
              <Box sx={{ mt: 3 }}>
                <CircularProgress size={32} thickness={4} />
                <Typography variant="body2" sx={{ mt: 1, color: 'primary.main' }}>
                  Processing your image...
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {generationInfo && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Model:</strong> {generationInfo.model} | 
            <strong> Format:</strong> {generationInfo.aspectRatio} | 
            <strong> Maksimum:</strong> {generationInfo.maxPromptLength} simvol
          </Typography>
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            Create New Avatar Background
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Background description"
            placeholder="For example: A peaceful nature scene with blue sky, white clouds and green meadows"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            sx={{ mb: 2 }}
            helperText={`${prompt.length}/${generationInfo?.maxPromptLength || 500} characters`}
          />

          {generationInfo?.recommendations && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Recommendations:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {generationInfo.recommendations.map((rec: string, index: number) => (
                  <Chip key={index} label={rec} size="small" variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoAwesomeIcon />}
              sx={{ minWidth: 150 }}
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>

            {generatedImage && (
              <Button
                variant="outlined"
                onClick={openPreview}
                startIcon={<ImageIcon />}
              >
                Preview
              </Button>
            )}

            {prompt && (
              <Button
                variant="text"
                onClick={() => setPrompt('')}
                startIcon={<RefreshIcon />}
              >
                Clear
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Saved Avatar Images ({savedImages.length})
            </Typography>
            <IconButton onClick={loadSavedImages} disabled={loadingSavedImages}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {loadingSavedImages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : savedImages.length === 0 ? (
            <Alert severity="info">
              No avatar images created yet. Create new images from the sections above.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {savedImages.map((image) => (
                <Grid item xs={12} sm={6} md={4} key={image.id}>
                  <Paper
                    sx={{
                      p: 2,
                      position: 'relative',
                      border: image.isActive ? '2px solid' : '1px solid',
                      borderColor: image.isActive ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      }
                    }}
                    onDoubleClick={() => setExpandedSavedImage(image)}
                  >
                    {image.isActive && (
                      <Chip
                        label="Active"
                        color="primary"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                        icon={<CheckCircleIcon />}
                      />
                    )}

                    <Box
                      sx={{
                        width: '100%',
                        height: 120,
                        backgroundImage: `url(data:${image.mimeType};base64,${image.imageData})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 1,
                        mb: 1
                      }}
                    />

                    <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                      {image.prompt}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      {new Date(image.createdAt).toLocaleDateString('az-AZ')}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!image.isActive && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleActivateImage(image.id)}
                        >
                          Activate
                        </Button>
                      )}
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Generated Avatar Background Preview
        </DialogTitle>
        <DialogContent>
          {generatedImage && (
            <Box>
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  backgroundImage: `url(data:${generatedImage.image.mimeType};base64,${generatedImage.image.base64Data})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2
                }}
              />
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Prompt:</strong> {generatedImage.prompt}
              </Typography>
              {generatedImage.description && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Description:</strong> {generatedImage.description}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveImage}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isSaving ? 'Saving...' : 'Save and Use'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Saved Image Expanded View Dialog */}
      <Dialog
        open={expandedSavedImage !== null}
        onClose={() => setExpandedSavedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Saved Avatar Background Preview</Typography>
          <IconButton onClick={() => setExpandedSavedImage(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          {expandedSavedImage && (
            <Box>
              <Box
                sx={{
                  width: "100%",
                  height: 400,
                  backgroundImage: `url(data:${expandedSavedImage.mimeType};base64,${expandedSavedImage.imageData})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 3,
                  boxShadow: 3,
                }}
              />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {expandedSavedImage.prompt}
              </Typography>
              {expandedSavedImage.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>Description:</strong> {expandedSavedImage.description}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                <strong>Created:</strong> {new Date(expandedSavedImage.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
              {expandedSavedImage.isActive && (
                <Chip
                  label="Currently Active"
                  color="primary"
                  size="small"
                  sx={{ mt: 2 }}
                  icon={<CheckCircleIcon />}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          {expandedSavedImage && !expandedSavedImage.isActive && (
            <Button
              variant="contained"
              onClick={() => {
                if (expandedSavedImage) {
                  handleActivateImage(expandedSavedImage.id);
                  setExpandedSavedImage(null);
                }
              }}
              startIcon={<CheckCircleIcon />}
            >
              Set as Active
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => setExpandedSavedImage(null)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};