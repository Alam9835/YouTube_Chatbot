import React, { useState } from 'react';
import { Youtube, MessageCircle, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import VideoInput from './components/VideoInput';
import ChatInterface from './components/ChatInterface';
import ProcessingSteps from './components/ProcessingSteps';
import VideoPreview from './components/VideoPreview';
import { ProcessingState, ChatMessage, VideoData } from './types';
import { processVideo } from './services/videoProcessor';
import { askQuestion } from './services/chatService';

function App() {
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleVideoSubmit = async (url: string) => {
    try {
      setError(null);
      setProcessingState('processing');
      setMessages([]);
      
      const result = await processVideo(url, setProcessingState);
      setVideoData(result);
      setProcessingState('ready');
      
      // Add welcome message
      setMessages([{
        id: Date.now().toString(),
        type: 'assistant',
        content: `✅ Video processed successfully! I've analyzed "${result.title}" and can now answer questions about its content.

**What I can help you with:**
• Answer specific questions about the video content
• Provide summaries of key points
• Find relevant information from the transcript
• Explain concepts discussed in the video

**Try asking something like:**
• "What is the main topic of this video?"
• "Can you summarize the key points?"
• "Does this video mention [specific topic]?"

*Ready to chat! Ask me anything about the video.*`,
        timestamp: new Date()
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the video');
      setProcessingState('error');
    }
  };

  const handleQuestionSubmit = async (question: string) => {
    if (!videoData) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const answer = await askQuestion(question, videoData);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '❌ I apologize, but I encountered an error while processing your question. This might be due to API limitations or network issues. Please try again or rephrase your question.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleReset = () => {
    setProcessingState('idle');
    setVideoData(null);
    setMessages([]);
    setError(null);
  };

  // Check if OpenAI API key is configured
  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Youtube className="w-8 h-8" />
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                YouTube Chat AI
              </h1>
              <p className="text-sm text-gray-600">Chat with any YouTube video using RAG & AI</p>
            </div>
            {videoData && (
              <button
                onClick={handleReset}
                className="ml-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                New Video
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* API Key Warning */}
        {!hasApiKey && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Demo Mode</span>
            </div>
            <p className="text-yellow-700 mt-1 text-sm">
              For full functionality, configure your OpenAI API key in the .env file. 
              Currently running with mock responses for demonstration purposes.
            </p>
          </div>
        )}

        {processingState === 'idle' && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              RAG-Powered Video Analysis
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Chat with YouTube Videos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Paste any YouTube video link and start asking questions about its content. 
              Our AI extracts the transcript, creates embeddings, and provides intelligent answers using Retrieval-Augmented Generation (RAG).
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Input and Preview */}
          <div className="lg:col-span-1">
            {processingState === 'idle' && (
              <VideoInput onSubmit={handleVideoSubmit} />
            )}
            
            {videoData && processingState === 'ready' && (
              <VideoPreview video={videoData} />
            )}
            
            {(processingState === 'processing' || processingState === 'error') && (
              <ProcessingSteps state={processingState} />
            )}
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-2">
            {processingState === 'ready' && videoData && (
              <ChatInterface
                messages={messages}
                onSubmit={handleQuestionSubmit}
                videoTitle={videoData.title}
                videoData={videoData}
              />
            )}
            
            {processingState === 'idle' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to Chat</h3>
                  <p>Enter a YouTube video URL to start asking questions about its content</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        {processingState === 'idle' && (
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">How RAG Technology Works</h3>
              <p className="text-gray-600">Our Retrieval-Augmented Generation system makes video content searchable and interactive</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Youtube className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Extract Transcript</h4>
                <p className="text-gray-600 text-sm">Automatically extract video captions and metadata from YouTube</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Chunk & Process</h4>
                <p className="text-gray-600 text-sm">Break transcript into optimized chunks for better context retrieval</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Generate Embeddings</h4>
                <p className="text-gray-600 text-sm">Create vector embeddings using OpenAI for semantic understanding</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Smart Retrieval</h4>
                <p className="text-gray-600 text-sm">Find relevant content and generate accurate answers using GPT-4o-mini</p>
              </div>
            </div>
            
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-4">✨ Advanced Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <h5 className="font-semibold text-gray-800">Context-Aware Answers</h5>
                    <p className="text-sm text-gray-600">Get accurate responses based on actual video content</p>
                  </div>
                  <div>
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <h5 className="font-semibold text-gray-800">Video Summaries</h5>
                    <p className="text-sm text-gray-600">Generate comprehensive bullet-point summaries</p>
                  </div>
                  <div>
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <h5 className="font-semibold text-gray-800">Semantic Search</h5>
                    <p className="text-sm text-gray-600">Find information even if not explicitly mentioned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;