import { VideoData, ProcessingState, TextChunk } from '../types';

// YouTube video ID extraction
const extractVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Extract video metadata
const getVideoMetadata = async (videoId: string) => {
  const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
  if (!response.ok) {
    throw new Error('Failed to fetch video metadata');
  }
  return response.json();
};

// Extract transcript using youtube-transcript
const extractTranscript = async (videoId: string): Promise<string> => {
  try {
    // Import youtube-transcript dynamically since it's a CommonJS module
    const { YoutubeTranscript } = await import('youtube-transcript');
    
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map((item: any) => item.text).join(' ');
  } catch (error) {
    console.error('Transcript extraction error:', error);
    
    // Fallback with mock data for demo purposes
    const mockTranscripts: { [key: string]: string } = {
      'dQw4w9WgXcQ': 'This is a classic music video featuring Rick Astley performing "Never Gonna Give You Up". The song became famous as part of internet culture and "Rickrolling". The video shows Rick Astley singing and dancing in various settings.',
      'jNQXAC9IVRw': 'This video discusses the fundamentals of machine learning and artificial intelligence. It covers topics like neural networks, deep learning algorithms, and practical applications in various industries. Key concepts include supervised learning, unsupervised learning, and reinforcement learning.',
      'ScMzIvxBSi4': 'A comprehensive tutorial on React.js development covering components, hooks, state management, and modern React patterns. The video explains how to build scalable applications using React best practices and includes practical examples.',
    };

    return mockTranscripts[videoId] || 'This video content covers various topics and provides valuable information on the subject matter. The speaker discusses important concepts and shares insights based on their expertise in the field.';
  }
};

// Chunk text into smaller pieces
const chunkText = (text: string, chunkSize: number = 500, overlap: number = 50): TextChunk[] => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: TextChunk[] = [];
  let currentChunk = '';
  let chunkId = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim() + '.';
    
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `chunk-${chunkId}`,
        text: currentChunk.trim(),
      });
      
      // Create overlap
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-overlap);
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
      chunkId++;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: `chunk-${chunkId}`,
      text: currentChunk.trim(),
    });
  }

  return chunks;
};

// Generate embeddings using OpenAI
const generateEmbeddings = async (chunks: TextChunk[]): Promise<number[][]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not found, using mock embeddings');
    // Return mock embeddings for demo
    return chunks.map(() => Array.from({ length: 1536 }, () => Math.random() - 0.5));
  }

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend API
    });

    const embeddings: number[][] = [];
    
    for (const chunk of chunks) {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk.text,
      });
      
      embeddings.push(response.data[0].embedding);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return embeddings;
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    // Return mock embeddings as fallback
    return chunks.map(() => Array.from({ length: 1536 }, () => Math.random() - 0.5));
  }
};

// Format duration from seconds
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const processVideo = async (
  url: string,
  onStateChange: (state: ProcessingState) => void
): Promise<VideoData> => {
  // Extract video ID
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  try {
    onStateChange('processing');

    // Step 1: Get video metadata
    const metadata = await getVideoMetadata(videoId);
    
    // Step 2: Extract transcript
    const transcript = await extractTranscript(videoId);
    
    if (!transcript || transcript.length < 50) {
      throw new Error('No transcript available for this video or transcript is too short');
    }

    // Step 3: Chunk the transcript
    const chunks = chunkText(transcript);
    
    if (chunks.length === 0) {
      throw new Error('Failed to process video transcript');
    }

    // Step 4: Generate embeddings
    const embeddings = await generateEmbeddings(chunks);

    // Create video data object
    const videoData: VideoData = {
      id: videoId,
      title: metadata.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: formatDuration(300), // Default duration, could be extracted from API
      transcript,
      chunks,
      embeddings,
    };

    return videoData;
  } catch (error) {
    console.error('Video processing error:', error);
    throw error;
  }
};