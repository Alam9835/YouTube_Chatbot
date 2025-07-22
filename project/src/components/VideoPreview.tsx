import React from 'react';
import { VideoData } from '../types';
import { Play, Clock, FileText } from 'lucide-react';

interface VideoPreviewProps {
  video: VideoData;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ video }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3">
            <Play className="w-6 h-6 text-gray-700" />
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {video.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{video.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{video.chunks.length} chunks</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">Ready for questions</span>
          </div>
          <p className="text-green-700 text-xs mt-1">
            Video processed and indexed. You can now ask questions about the content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview;