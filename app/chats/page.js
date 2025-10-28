"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Plus, Menu, MessageSquare, ChevronLeft, ChevronRight, Edit2, Trash2, Check, X } from 'lucide-react';
import SimpleSplitText from '../../components/SimpleSplitText';

export default function ChatPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([
    {
      id: '1',
      title: 'Radiological Assistant',
      messages: [],
      lastActive: new Date()
    }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [hoveredSessionId, setHoveredSessionId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkScrollPosition = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Check initial position
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Hide the welcome message when user sends first message
    if (showWelcome) {
      setShowWelcome(false);
    }

    const userMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Auto scroll to bottom when sending message
    setTimeout(() => scrollToBottom(), 100);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: generateResponse(userMessage.content),
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateResponse = (userInput) => {
    const responses = [
      "Based on your query, I can help you understand the radiological examination process. What specific type of imaging are you interested in?",
      "For radiological referrals, it's important to provide detailed clinical history. Would you like me to guide you through the referral process?",
      "I can assist with understanding different imaging modalities like CT, MRI, X-ray, and ultrasound. Which one would you like to know more about?",
      "The Smart Referral System can help optimize your imaging requests. Let me know what symptoms or conditions you're investigating.",
      "For accurate diagnosis, proper patient preparation is crucial. I can provide specific instructions for different examination types."
    ];
    
    if (userInput.toLowerCase().includes('mri')) {
      return "MRI (Magnetic Resonance Imaging) is excellent for soft tissue visualization. It's particularly useful for brain, spine, joints, and abdominal imaging. Would you like specific preparation instructions?";
    }
    if (userInput.toLowerCase().includes('ct') || userInput.toLowerCase().includes('scan')) {
      return "CT scans provide detailed cross-sectional images and are great for trauma, chest, and abdominal conditions. They're faster than MRI but involve radiation exposure. What area needs to be examined?";
    }
    if (userInput.toLowerCase().includes('x-ray')) {
      return "X-rays are the most common imaging method, ideal for bone fractures, chest conditions, and initial assessments. They're quick and cost-effective. What symptoms are you investigating?";
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewChat = () => {
    const newSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [{
        id: Date.now().toString(),
        content: 'Hello! I\'m your Smart Referral System assistant. How can I help you with radiological examinations today?',
        role: 'assistant',
        timestamp: new Date()
      }],
      lastActive: new Date()
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages(newSession.messages);
  };

  const deleteChat = (sessionId) => {
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
      if (remainingSessions.length > 0) {
        setCurrentSessionId(remainingSessions[0].id);
        setMessages(remainingSessions[0].messages);
      } else {
        createNewChat();
      }
    }
  };

  const startRenaming = (sessionId, currentTitle) => {
    setEditingSessionId(sessionId);
    setEditingTitle(currentTitle);
  };

  const saveRename = () => {
    if (editingSessionId && editingTitle.trim()) {
      setChatSessions(prev => 
        prev.map(session => 
          session.id === editingSessionId 
            ? { ...session, title: editingTitle.trim() }
            : session
        )
      );
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const cancelRename = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Toggle Arrow Button */}
      <div className={`${sidebarOpen ? 'translate-x-80' : 'translate-x-0'} fixed top-1/2 transform -translate-y-1/2 z-50 transition-transform duration-300`}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-8 h-12 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-r-lg flex items-center justify-center shadow-lg transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={`relative group mb-2 rounded-lg transition-colors ${
                currentSessionId === session.id
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onMouseEnter={() => setHoveredSessionId(session.id)}
              onMouseLeave={() => setHoveredSessionId(null)}
            >
              {editingSessionId === session.id ? (
                <div className="flex items-center gap-2 p-3">
                  <MessageSquare size={16} className="text-gray-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename();
                      if (e.key === 'Escape') cancelRename();
                    }}
                    className="flex-1 bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={saveRename}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    <Check size={14} className="text-green-600" />
                  </button>
                  <button
                    onClick={cancelRename}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    <X size={14} className="text-red-600" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setCurrentSessionId(session.id);
                      setMessages(session.messages);
                    }}
                    className="w-full text-left p-3 flex items-center gap-2"
                  >
                    <MessageSquare size={16} className="text-gray-500 flex-shrink-0" />
                    <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">
                      {session.title}
                    </span>
                  </button>
                  
                  {/* Hover Options */}
                  {hoveredSessionId === session.id && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startRenaming(session.id, session.title);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Rename"
                      >
                        <Edit2 size={14} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(session.id);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bot className="text-blue-600" size={24} />
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Smart Referral System Assistant
              </h1>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 relative">
          <div 
            ref={messagesContainerRef}
            className="h-full overflow-y-auto p-4 space-y-6"
          >
          {/* Welcome Message with SplitText Animation */}
          {showWelcome && (
            <div className="flex items-center justify-center min-h-[200px]">
              <SimpleSplitText
                text="Hello, How Are You Today?"
                className="text-4xl font-bold text-gray-800 dark:text-gray-200"
                delay={50}
                duration={0.8}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                textAlign="center"
                tag="h2"
              />
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              
              <div
                className={`max-w-3xl px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="text-sm leading-6 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="max-w-3xl px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">Assistant is typing...</span>
                </div>
              </div>
            </div>
          )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Scroll-to-bottom button placed above the textarea (shows when not at bottom) */}
            <div className="flex items-end justify-end mb-2">
              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center shadow transition hover:scale-105"
                  title="Scroll to bottom"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-black"
                  >
                    <path
                      d="M8.5 11L12 14.5L15.5 11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="relative flex items-end gap-3 bg-gray-100 dark:bg-gray-700 rounded-2xl p-2">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about radiological examinations, referral processes, or imaging guidelines..."
                className="flex-1 bg-transparent border-0 outline-none resize-none px-3 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-500 max-h-32"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '24px',
                }}
                onInput={(e) => {
                  const target = e.target;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              This is a simulation. Responses are generated for demonstration purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}