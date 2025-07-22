import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Copy, Check, FileText } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateVideoSummary } from '../services/chatService';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSubmit: (question: string) => void;
  videoTitle: string;
  videoData?: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSubmit, 
  videoTitle,
  videoData
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [question]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || isLoading) return;

    const currentQuestion = question.trim();
    setQuestion('');
    setIsLoading(true);

    try {
      await onSubmit(currentQuestion);
    } finally {
      setIsLoading(false);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleGenerateSummary = async () => {
    if (!videoData || isGeneratingSummary) return;

    setIsGeneratingSummary(true);
    
    try {
      const summary = await generateVideoSummary(videoData);
      
      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: summary,
        timestamp: new Date()
      };

      // You would need to pass this back to parent or handle it differently
      // For now, we'll just show it in console
      console.log('Generated summary:', summary);
    } catch (error) {
      console.error('Failed to generate summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatMessage = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
      line = line.trim();
      
      if (line.startsWith('✅') || line.startsWith('❌')) {
        return (
          <p key={index} className="mb-3 font-medium text-gray-800 text-base">
            {line}
          </p>
        );
      }
      
      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <li key={index} className="ml-4 mb-1 text-gray-700">
            {line.substring(1).trim()}
          </li>
        );
      }
      
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h4 key={index} className="font-semibold text-gray-800 mb-2 text-base">
            {line.replace(/\*\*/g, '')}
          </h4>
        );
      }
      
      if (line.startsWith('📋') || line.includes('Summary:')) {
        return (
          <h3 key={index} className="font-semibold text-blue-800 mb-3 text-lg">
            {line}
          </h3>
        );
      }
      
      if (line.startsWith('*') && line.endsWith('*')) {
        return (
          <p key={index} className="text-sm text-gray-500 italic mb-2">
            {line.substring(1, line.length - 1)}
          </p>
        );
      }
      
      return (
        <p key={index} className="mb-2 text-gray-700">
          {line}
        </p>
      );
    });
  };

  const suggestedQuestions = [
    "What is the main topic of this video?",
    "Can you summarize the key points?",
    "What are the most important takeaways?",
    "Are there any specific examples mentioned?",
    "What conclusions does the video reach?",
    "Does this video talk about artificial intelligence?",
    "What technical concepts are discussed?",
    "Are there any actionable tips or advice?"
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Chat with Video</h3>
          </div>
          
          {videoData && (
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {isGeneratingSummary ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isGeneratingSummary ? 'Generating...' : 'Summary'}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1 truncate">
          Discussing: {videoTitle}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">Ready to Answer</h4>
            <p className="text-gray-500 mb-6">Ask me anything about this video's content</p>
            
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">Suggested questions:</p>
              {suggestedQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setQuestion(q)}
                  className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : ''}`}>
              <div
                className={`rounded-lg px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : 'bg-gray-50 text-gray-900'
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  {formatMessage(message.content)}
                </div>
                
                {message.type === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                  >
                    {copiedMessageId === message.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="text-xs text-gray-400 mt-1 px-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing video content...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a question about the video..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
              style={{ minHeight: '42px', maxHeight: '120px' }}
              disabled={isLoading}
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-2 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[42px]"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;