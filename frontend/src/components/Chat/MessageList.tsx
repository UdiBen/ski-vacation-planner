import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import { Message as MessageType } from '../../types';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Ski Vacation Planner!
            </h2>
            <p className="text-gray-600 mb-6">
              I'm your AI ski vacation planning assistant. I can help you with:
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">⛷️</div>
                <h3 className="font-semibold mb-1">Resort Recommendations</h3>
                <p className="text-sm text-gray-600">
                  Get personalized ski resort suggestions based on your skill level and preferences
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">🌨️</div>
                <h3 className="font-semibold mb-1">Weather & Snow Conditions</h3>
                <p className="text-sm text-gray-600">
                  Check real-time weather and snow forecasts for any ski resort
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold mb-1">Budget Planning</h3>
                <p className="text-sm text-gray-600">
                  Convert currencies and plan your ski vacation budget
                </p>
              </div>
            </div>
            <div className="mt-8 text-left max-w-2xl mx-auto bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">Try asking:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• "What are the best ski resorts for beginners in the Alps?"</li>
                <li>• "What's the weather like in Aspen right now?"</li>
                <li>• "How much is 1000 USD in Swiss Francs?"</li>
                <li>• "I want to plan a ski trip in February. Where should I go?"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <Loader2 className="animate-spin" size={20} />
            <span>Assistant is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
