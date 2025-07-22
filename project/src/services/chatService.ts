import { VideoData } from '../types';

// Calculate cosine similarity between two vectors
const cosineSimilarity = (a: number[], b: number[]): number => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Generate embedding for a query
const generateQueryEmbedding = async (query: string): Promise<number[]> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not found, using mock embedding');
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, use a backend API
    });

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Query embedding error:', error);
    return Array.from({ length: 1536 }, () => Math.random() - 0.5);
  }
};

// Find most relevant chunks using similarity search
const findRelevantChunks = (
  queryEmbedding: number[],
  videoData: VideoData,
  topK: number = 3
): { chunk: any; similarity: number }[] => {
  const similarities = videoData.embeddings.map((embedding, index) => ({
    chunk: videoData.chunks[index],
    similarity: cosineSimilarity(queryEmbedding, embedding),
    index
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};

// Generate answer using OpenAI GPT
const generateAnswer = async (
  question: string,
  relevantChunks: { chunk: any; similarity: number }[],
  videoTitle: string
): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Mock response for demo
    const hasRelevantContent = relevantChunks.some(item => item.similarity > 0.3);
    
    if (hasRelevantContent) {
      return `✅ Yes, based on the video "${videoTitle}", I can provide information about your question. Here are the key points:

• The video discusses relevant concepts related to your query
• Important details are covered in the content
• The information is presented in a clear and informative manner

*Note: This is a demo response. Configure OpenAI API key for full functionality.*`;
    } else {
      return `❌ I don't have enough relevant information in this video to answer your question about "${question}". The video "${videoTitle}" doesn't seem to cover this topic in detail.`;
    }
  }

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const context = relevantChunks
      .map(item => `[Similarity: ${item.similarity.toFixed(2)}] ${item.chunk.text}`)
      .join('\n\n');

    const prompt = `You are an AI assistant helping users understand video content. Based on the following transcript excerpts from the YouTube video "${videoTitle}", answer the user's question.

Context from video transcript:
${context}

Question: ${question}

Instructions:
- If the context contains relevant information, provide a clear answer with key points in bullet format
- Start with ✅ if you can answer the question based on the context
- Start with ❌ if the context doesn't contain relevant information
- Be specific and reference the video content
- Keep the response concise but informative
- If you cannot answer based on the provided context, clearly state that

Answer:`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions about video content based only on provided transcript context.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    return response.choices[0].message.content || 'Unable to generate response';
  } catch (error) {
    console.error('Answer generation error:', error);
    throw new Error('Failed to generate answer. Please try again.');
  }
};

export const askQuestion = async (
  question: string,
  videoData: VideoData
): Promise<string> => {
  try {
    // Generate embedding for the question
    const queryEmbedding = await generateQueryEmbedding(question);
    
    // Find relevant chunks
    const relevantChunks = findRelevantChunks(queryEmbedding, videoData);
    
    // Generate answer
    const answer = await generateAnswer(question, relevantChunks, videoData.title);
    
    return answer;
  } catch (error) {
    console.error('Question answering error:', error);
    throw error;
  }
};

// Generate video summary
export const generateVideoSummary = async (videoData: VideoData): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return `📋 **Video Summary: ${videoData.title}**

This video covers several important topics and provides valuable insights. Here are the key takeaways:

• Main concepts and ideas are presented clearly
• Relevant examples and case studies are discussed  
• Practical applications and implementations are covered
• Expert insights and best practices are shared

*Note: Configure OpenAI API key for detailed AI-generated summaries.*`;
  }

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    // Use first few chunks for summary
    const contextChunks = videoData.chunks.slice(0, 5).map(chunk => chunk.text).join('\n\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant that creates concise video summaries. Create bullet-point summaries that capture the key points and main themes.'
        },
        {
          role: 'user',
          content: `Create a bullet-point summary of this YouTube video titled "${videoData.title}" based on the following transcript excerpts:

${contextChunks}

Format the summary with:
- A brief title/header
- 4-6 key bullet points highlighting the main topics
- Keep it concise and informative

Summary:`
        }
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    return response.choices[0].message.content || 'Unable to generate summary';
  } catch (error) {
    console.error('Summary generation error:', error);
    return 'Unable to generate video summary at this time.';
  }
};