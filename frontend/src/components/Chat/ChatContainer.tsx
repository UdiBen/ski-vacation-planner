import React from "react";
import { MessageList } from "./MessageList";
import { InputBox } from "./InputBox";
import { useChat } from "../../hooks/useChat";
import { Mountain, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "../UI/Button";

export const ChatContainer: React.FC = () => {
  const { messages, isLoading, error, sendMessage, clearConversation } =
    useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mountain size={32} />
            <div>
              <h1 className="text-2xl font-bold">Ski Vacation Planner</h1>
              <p className="text-sm text-primary-100">
                AI-Powered Ski Trip Assistant
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              onClick={clearConversation}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              New Chat
            </Button>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* Input */}
      <InputBox onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};
