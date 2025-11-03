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
  
  // Conversation flow state
  const [conversationStep, setConversationStep] = useState(0);
  const [userSelections, setUserSelections] = useState({
    bodyArea: null,
    panel: null,
    ageGroup: null,
    sex: null,
    scenario: null
  });
  
  // Checkpoint state to track history
  const [checkpoints, setCheckpoints] = useState([]);
  const [showCheckpointMenu, setShowCheckpointMenu] = useState(false);
  
  // Dynamic options from database
  const [availableOptions, setAvailableOptions] = useState({
    bodyArea: [],
    panel: [],
    ageGroup: [],
    sex: []
  });
  
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

  // Start the conversation flow when chat begins
  useEffect(() => {
    if (messages.length === 0 && conversationStep === 0) {
      startConversationFlow();
    }
  }, []);

  // Close checkpoint menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCheckpointMenu && !event.target.closest('.checkpoint-menu-container')) {
        setShowCheckpointMenu(false);
      }
    };

    if (showCheckpointMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCheckpointMenu]);

  // Fetch available options from database
  const fetchOptions = async (type, filters = {}) => {
    try {
      const params = new URLSearchParams({
        type,
        filters: JSON.stringify(filters)
      });
      
      console.log(`🌐 Fetching ${type} options...`);
      const response = await fetch(`/api/chat?${params}`);
      const data = await response.json();
      
      console.log(`📥 Response for ${type}:`, data);
      
      if (data.success) {
        if (data.options.length === 0) {
          console.warn(`⚠️ No ${type} options found in database!`);
    alert(`⚠️ Warning: No ${type} options found in your database. Please check:\n\n1. MongoDB connection\n2. Database name\n3. Collection name ('imaging_recommendation')\n4. Documents have '${type}' field`);
        }
        return data.options;
      } else {
        console.error('Error fetching options:', data.error);
        alert(`❌ Error fetching ${type}: ${data.error}`);
        return [];
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      alert(`❌ Network error fetching ${type}: ${error.message}\n\nPlease check:\n1. Is the dev server running?\n2. Is MongoDB connected?`);
      return [];
    }
  };

  const startConversationFlow = async () => {
    // Fetch body area options from database
    const bodyAreaOptions = await fetchOptions('bodyArea');
    console.log('🔍 Fetched body area options:', bodyAreaOptions);
    setAvailableOptions(prev => ({ ...prev, bodyArea: bodyAreaOptions }));
    
    const initialMessage = {
      id: Date.now().toString(),
      content: "Welcome! I'll guide you through finding the right radiological examination. Let's start:\n\n**Please select the Body Area:**",
      role: 'assistant',
      timestamp: new Date(),
      options: bodyAreaOptions
    };
    console.log('📨 Initial message with options:', initialMessage);
    setMessages([initialMessage]);
    setConversationStep(1);
    setShowWelcome(false);
    setCheckpoints([]); // Clear checkpoints on new flow
  };

  const saveCheckpoint = () => {
    const checkpoint = {
      id: Date.now(),
      step: conversationStep,
      stepName: getStepName(conversationStep),
      selections: { ...userSelections },
      messages: [...messages],
      options: { ...availableOptions },
      timestamp: new Date()
    };
    setCheckpoints(prev => [...prev, checkpoint]);
  };

  const getStepName = (step) => {
    switch(step) {
      case 0: return 'Start';
      case 1: return 'Body Area Selection';
      case 2: return 'Panel Selection';
      case 3: return 'Age Group Selection';
      case 4: return 'Sex Selection';
      case 5: return 'Scenario Input';
      case 6: return 'Scenario Selection';
      case 7: return 'Free Conversation';
      default: return `Step ${step}`;
    }
  };

  const restoreCheckpoint = (checkpointId) => {
    const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) {
      alert('Checkpoint not found!');
      return;
    }
    
    setConversationStep(checkpoint.step);
    setUserSelections(checkpoint.selections);
    setMessages(checkpoint.messages);
    setAvailableOptions(checkpoint.options);
    
    // Remove all checkpoints after the restored one
    const checkpointIndex = checkpoints.findIndex(cp => cp.id === checkpointId);
    setCheckpoints(prev => prev.slice(0, checkpointIndex));
    setShowCheckpointMenu(false);
  };

  const handleOptionSelect = async (option, step) => {
    // Save checkpoint before making changes
    saveCheckpoint();
    
    // Add user's selection as a message
    const userMessage = {
      id: Date.now().toString(),
      content: option,
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Update selections based on current step
    let updatedSelections = { ...userSelections };
    
    switch(step) {
      case 1: // Body Area
        updatedSelections.bodyArea = option;
        setUserSelections(updatedSelections);
        
        // Fetch panel options based on selected body area
        const panelOptions = await fetchOptions('panel', { bodyArea: option });
        setAvailableOptions(prev => ({ ...prev, panel: panelOptions }));
        
        setTimeout(() => {
          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: "Great! Now, **please select the Panel:**",
            role: 'assistant',
            timestamp: new Date(),
            options: panelOptions
          };
          setMessages(prev => [...prev, assistantMessage]);
          setConversationStep(2);
        }, 500);
        break;
        
      case 2: // Panel
        updatedSelections.panel = option;
        setUserSelections(updatedSelections);
        
        // Fetch age group options based on previous selections
        const ageGroupOptions = await fetchOptions('ageGroup', { 
          bodyArea: updatedSelections.bodyArea,
          panel: option 
        });
        setAvailableOptions(prev => ({ ...prev, ageGroup: ageGroupOptions }));
        
        setTimeout(() => {
          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: "Perfect! Next, **please choose the Age group:**",
            role: 'assistant',
            timestamp: new Date(),
            options: ageGroupOptions
          };
          setMessages(prev => [...prev, assistantMessage]);
          setConversationStep(3);
        }, 500);
        break;
        
      case 3: // Age Group
        updatedSelections.ageGroup = option;
        setUserSelections(updatedSelections);
        
        // Fetch sex options based on all previous selections
        const sexOptions = await fetchOptions('sex', { 
          bodyArea: updatedSelections.bodyArea,
          panel: updatedSelections.panel,
          ageGroup: option
        });
        setAvailableOptions(prev => ({ ...prev, sex: sexOptions }));
        
        setTimeout(() => {
          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: "Excellent! Now, **please select the Sex:**",
            role: 'assistant',
            timestamp: new Date(),
            options: sexOptions
          };
          setMessages(prev => [...prev, assistantMessage]);
          setConversationStep(4);
        }, 500);
        break;
        
      case 4: // Sex
        updatedSelections.sex = option;
        setUserSelections(updatedSelections);
        setTimeout(() => {
          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: "Almost there! **Please type the Scenario** you are looking for (e.g., 'chest pain', 'shortness of breath', etc.).\n\nI'll search the database for the most relevant cases.",
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setConversationStep(5);
        }, 500);
        break;
    }
  };

  const handleScenarioSelect = async (scenarioId, scenarioDescription) => {
    // Save checkpoint before selecting scenario
    saveCheckpoint();
    
    // Add user's selection message
    const userMessage = {
      id: Date.now().toString(),
      content: `Selected: ${scenarioId}`,
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenarioId: scenarioId,
          bodyArea: userSelections.bodyArea,
          panel: userSelections.panel,
          ageGroup: userSelections.ageGroup,
          sex: userSelections.sex
        }),
      });

      const data = await response.json();
      
      console.log('📦 Received data from API:', data);
      console.log('📋 Procedures array:', data.procedures);
      console.log('📊 Procedure count:', data.procedures?.length);
      
      let responseContent = '';
      if (data.success && data.scenario) {
        responseContent = `**Scenario ${data.scenario.scenario_id}: ${data.scenario.scenario_description}**\n\n`;
        
        // Fix: procedures are at data.procedures, not data.scenario.procedures
        if (data.procedures && data.procedures.length > 0) {
          responseContent += `**Appropriate Imaging Procedures (${data.procedures.length}):**\n\n`;
          data.procedures.forEach((proc, index) => {
            responseContent += `${index + 1}. **${proc.procedure_name}**\n`;
            responseContent += `   • Color: ${proc.color_indicator || 'N/A'}\n`;
            responseContent += `   • Adult RRL: ${proc.adult_rrl || 'N/A'}\n`;
            responseContent += `   • Pediatric RRL: ${proc.peds_rrl || 'N/A'}\n`;
            responseContent += `   • Appropriateness: ${proc.appropriateness_category}\n\n`;
          });
        } else {
          responseContent += '\nNo procedures with appropriate ratings found for this scenario.';
        }
        
        responseContent += '\n---\n\nWould you like to start a new search? Type "restart" or ask another question.';
        setConversationStep(7); // Move to free conversation
      } else {
        responseContent = 'Sorry, I couldn\'t retrieve the procedure details for this scenario. Please try again or type "restart".';
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching scenario details:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error retrieving the scenario details. Please try again or type "restart".',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Save checkpoint before processing user input (for step 5 onwards)
    if (conversationStep >= 5) {
      saveCheckpoint();
    }

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
    const currentInput = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Auto scroll to bottom when sending message
    setTimeout(() => scrollToBottom(), 100);

    // If at step 5 (scenario search), query the database
    if (conversationStep === 5) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenario: currentInput,
            bodyArea: userSelections.bodyArea,
            panel: userSelections.panel,
            ageGroup: userSelections.ageGroup,
            sex: userSelections.sex
          }),
        });

        const data = await response.json();
        
        let responseContent = '';
        if (data.success && data.results.length > 0) {
          responseContent = `I found **${data.count} matching scenario(s)** for "${currentInput}":\n\n`;
          responseContent += `Please select a scenario number to view appropriate imaging procedures:\n\n`;
          
          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: responseContent,
            role: 'assistant',
            timestamp: new Date(),
            scenarioOptions: data.results // Store scenarios for button rendering
          };
          setMessages(prev => [...prev, assistantMessage]);
          setConversationStep(6); // Move to scenario selection step
        } else {
          responseContent = `I couldn't find any matching scenarios for "${currentInput}" with the selected criteria.\n\nWould you like to:\n1. Try a different keyword\n2. Restart the search with different parameters (type "restart")`;
          
          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: responseContent,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setConversationStep(7); // Move to free conversation
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error querying database:', error);
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, there was an error searching the database. Please try again or type "restart" to begin a new search.',
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
      }
    } else if (conversationStep === 6) {
      // Step 6: User selected a scenario, fetch detailed procedures
      setIsLoading(false);
    } else if (conversationStep === 7) {
      // Free conversation after initial flow
      if (currentInput.toLowerCase().includes('restart')) {
        setConversationStep(0);
        setUserSelections({
          bodyArea: null,
          panel: null,
          ageGroup: null,
          sex: null,
          scenario: null
        });
        startConversationFlow();
        setIsLoading(false);
      } else if (currentInput === '1') {
        // User wants to try a different keyword - go back to step 5
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: "Almost there! **Please type the Scenario** you are looking for (e.g., 'chest pain', 'shortness of breath', etc.).\n\nI'll search the database for the most relevant cases.",
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setConversationStep(5); // Go back to scenario input step
        setIsLoading(false);
      } else {
        // Regular AI response
        setTimeout(() => {
          const assistantMessage = {
            id: (Date.now() + 1).toString(),
            content: generateResponse(currentInput),
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
        }, 1000 + Math.random() * 2000);
      }
    } else {
      // Should not reach here if flow is working correctly
      setIsLoading(false);
    }
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
      messages: [],
      lastActive: new Date()
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setConversationStep(0);
    setUserSelections({
      bodyArea: null,
      panel: null,
      ageGroup: null,
      sex: null,
      scenario: null
    });
    setShowWelcome(true);
    setCheckpoints([]); // Clear checkpoints
    // Start the flow automatically
    setTimeout(() => startConversationFlow(), 300);
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
          
          {messages.map((message, messageIndex) => {
            // Check if this message's options are still active (it's the last assistant message with options)
            const isLastAssistantWithOptions = message.role === 'assistant' && message.options && 
              messageIndex === messages.map((m, i) => m.role === 'assistant' && m.options ? i : -1).filter(i => i !== -1).pop();
            
            const isLastAssistantWithScenarios = message.role === 'assistant' && message.scenarioOptions && 
              messageIndex === messages.map((m, i) => m.role === 'assistant' && m.scenarioOptions ? i : -1).filter(i => i !== -1).pop();
            
            return (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              
              <div className="flex flex-col gap-2 max-w-3xl">
                <div
                  className={`px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="text-sm leading-6 whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                
                {/* Display scenario buttons if message has scenarioOptions */}
                {message.scenarioOptions && message.scenarioOptions.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {message.scenarioOptions.map((scenario) => (
                      <button
                        key={scenario.scenario_id}
                        onClick={() => {
                          if (!isLastAssistantWithScenarios) {
                            alert('⚠️ This question has already been answered.\n\nUse "Restore Checkpoint" to go back and change your answer.');
                            return;
                          }
                          handleScenarioSelect(scenario.scenario_id, scenario.scenario_description);
                        }}
                        className={`px-4 py-3 rounded-lg text-left font-medium shadow-sm transition-all ${
                          isLastAssistantWithScenarios
                            ? 'bg-white dark:bg-gray-700 border-2 border-blue-500 dark:border-blue-400 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer'
                            : 'bg-gray-200 dark:bg-gray-600 border-2 border-gray-400 dark:border-gray-500 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                        disabled={isLoading || !isLastAssistantWithScenarios}
                      >
                        <span className={`font-bold ${isLastAssistantWithScenarios ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>{scenario.scenario_id}:</span> {scenario.scenario_description}
                      </button>
                    ))}
                  </div>
                )}
                {/* Display dropdown select if message has options */}
                {message.options && message.options.length > 0 && (
                  <div className="w-full mt-3">
                    <div className="relative inline-block w-full max-w-md">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            if (!isLastAssistantWithOptions) {
                              alert('⚠️ This question has already been answered.\n\nUse "Restore Checkpoint" to go back and change your answer.');
                              e.target.value = '';
                              return;
                            }
                            console.log('Selected:', e.target.value);
                            handleOptionSelect(e.target.value, conversationStep);
                            setTimeout(() => {
                              e.target.value = '';
                            }, 100);
                          }
                        }}
                        disabled={!isLastAssistantWithOptions}
                        className={`w-full px-4 py-3 pr-10 border-2 rounded-lg focus:outline-none text-base font-medium appearance-none shadow-md transition-all ${
                          isLastAssistantWithOptions
                            ? 'bg-white dark:bg-gray-700 border-black dark:border-gray-400 text-gray-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600'
                            : 'bg-gray-200 dark:bg-gray-600 border-gray-400 dark:border-gray-500 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
                        }`}
                        style={{ minHeight: '48px' }}
                        defaultValue=""
                      >
                        <option value="" disabled className="text-gray-500">
                          {isLastAssistantWithOptions ? '👉 Click here to select' : '🔒 Already answered'}
                        </option>
                        {message.options.map((option, index) => (
                          <option key={index} value={option} className="py-3 text-gray-900 dark:text-white">
                            {option}
                          </option>
                        ))}
                      </select>
                      {/* Custom Arrow Icon */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg 
                          className={`w-6 h-6 ${isLastAssistantWithOptions ? 'text-black dark:text-gray-300' : 'text-gray-400'}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          strokeWidth="3"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          );
          })}

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
            {/* Restore Checkpoint Button - Shows when checkpoints exist */}
            {checkpoints.length > 0 && (
              <div className="relative mb-3 checkpoint-menu-container">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setShowCheckpointMenu(!showCheckpointMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium shadow-md transition-all"
                    title="View and restore checkpoints"
                  >
                    <ChevronLeft size={18} />
                    Restore Checkpoint ({checkpoints.length})
                  </button>
                </div>
                
                {/* Checkpoint Menu Dropdown */}
                {showCheckpointMenu && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-96 bg-white dark:bg-gray-800 border-2 border-amber-500 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 bg-amber-500 text-white font-semibold border-b-2 border-amber-600">
                      Select Checkpoint to Restore
                    </div>
                    <div className="p-2">
                      {checkpoints.map((checkpoint, index) => (
                        <button
                          key={checkpoint.id}
                          onClick={() => restoreCheckpoint(checkpoint.id)}
                          className="w-full text-left px-4 py-3 mb-2 bg-gray-50 dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {index + 1}. {checkpoint.stepName}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {checkpoint.selections.bodyArea && (
                                  <span className="mr-2">📍 {checkpoint.selections.bodyArea}</span>
                                )}
                                {checkpoint.selections.panel && (
                                  <span className="mr-2">📋 {checkpoint.selections.panel}</span>
                                )}
                                {checkpoint.selections.ageGroup && (
                                  <span className="mr-2">👤 {checkpoint.selections.ageGroup}</span>
                                )}
                                {checkpoint.selections.sex && (
                                  <span className="mr-2">⚧ {checkpoint.selections.sex}</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {new Date(checkpoint.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                            <ChevronLeft size={16} className="text-amber-500 mt-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
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