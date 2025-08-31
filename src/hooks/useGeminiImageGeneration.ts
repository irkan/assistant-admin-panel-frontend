import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

interface GeneratedImage {
  mimeType: string;
  base64Data: string;
  size: number;
}

interface GenerationResult {
  image: GeneratedImage;
  description: string;
  prompt: string;
  generatedAt: string;
}

interface GenerationInfo {
  model: string;
  aspectRatio: string;
  maxPromptLength: number;
  minPromptLength: number;
  supportedFormats: string[];
  recommendations: string[];
}

export const useGeminiImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const generateImage = async (prompt: string): Promise<GenerationResult | null> => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const token = localStorage.getItem('refine-auth');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/gemini/generate-avatar-background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate image');
      }

      setGeneratedImage(data.data);
      return data.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveImage = async (assistantId: number, imageData: GenerationResult): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('refine-auth');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/gemini/save-avatar-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          assistantId,
          imageData: imageData.image.base64Data,
          mimeType: imageData.image.mimeType,
          prompt: imageData.prompt,
          description: imageData.description
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save image');
      }

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const getGenerationInfo = async (): Promise<GenerationInfo | null> => {
    try {
      const token = localStorage.getItem('refine-auth');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/api/gemini/info`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get generation info');
      }

      return data.data;

    } catch (err) {
      console.error('Error getting generation info:', err);
      return null;
    }
  };

  const clearImage = () => {
    setGeneratedImage(null);
    setError(null);
  };

  return {
    isGenerating,
    generatedImage,
    error,
    isSaving,
    generateImage,
    saveImage,
    getGenerationInfo,
    clearImage
  };
};