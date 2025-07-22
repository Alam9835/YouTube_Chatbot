import React, { useState } from 'react';
import { Youtube, ArrowRight, Loader2 } from 'lucide-react';

interface VideoInputProps {
  onSubmit: (url: string) => void;
}

const VideoInput: React.FC<VideoInputProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) return;
    
    if (!validateYouTubeUrl(url)) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(url.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    'https://youtu.be/ScMzIvxBSi4'
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Youtube className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold text-gray-900">YouTube Video</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <input
            id="youtube-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={!url.trim() || isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Process Video
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2">Try these sample videos:</p>
        <div className="space-y-1">
          {sampleUrls.map((sampleUrl, index) => (
            <button
              key={index}
              onClick={() => setUrl(sampleUrl)}
              className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
              disabled={isSubmitting}
            >
              {sampleUrl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoInput;