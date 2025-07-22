import React from 'react';
import { CheckCircle, Loader2, AlertCircle, Youtube, FileText, Zap, Database } from 'lucide-react';
import { ProcessingState } from '../types';

interface ProcessingStepsProps {
  state: ProcessingState;
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ state }) => {
  const steps = [
    {
      id: 'extract',
      title: 'Extract Transcript',
      description: 'Getting video captions and metadata',
      icon: Youtube,
    },
    {
      id: 'chunk',
      title: 'Process Text',
      description: 'Breaking transcript into searchable chunks',
      icon: FileText,
    },
    {
      id: 'embeddings',
      title: 'Generate Embeddings',
      description: 'Converting text to vector representations',
      icon: Zap,
    },
    {
      id: 'index',
      title: 'Build Index',
      description: 'Creating vector database for fast retrieval',
      icon: Database,
    },
  ];

  const getStepStatus = (stepId: string, currentState: ProcessingState) => {
    if (currentState === 'error') return 'error';
    if (currentState === 'ready') return 'completed';
    
    const stepOrder = ['extract', 'chunk', 'embeddings', 'index'];
    const currentStepIndex = stepOrder.findIndex(id => id === stepId);
    
    // For demo purposes, we'll simulate progress through steps
    const progressStepIndex = Math.min(stepOrder.length - 1, Math.floor(Date.now() / 1000) % stepOrder.length);
    
    if (currentStepIndex < progressStepIndex) return 'completed';
    if (currentStepIndex === progressStepIndex) return 'processing';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <h3 className="text-lg font-semibold text-gray-900">Processing Video</h3>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, state);
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : status === 'processing'
                      ? 'bg-blue-100 text-blue-600'
                      : status === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : status === 'processing' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : status === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-8 mt-2 transition-all duration-300 ${
                      status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-4">
                <h4
                  className={`font-medium transition-colors ${
                    status === 'completed'
                      ? 'text-green-800'
                      : status === 'processing'
                      ? 'text-blue-800'
                      : status === 'error'
                      ? 'text-red-800'
                      : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                
                {status === 'processing' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-1.5 rounded-full transition-all duration-1000 animate-pulse w-2/3" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {state === 'error' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Processing Failed</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Unable to process the video. Please check the URL and try again.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessingSteps;