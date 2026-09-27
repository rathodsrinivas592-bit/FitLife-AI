import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, User as UserIcon, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiHealthAssistantModal: React.FC = () => {
  const { 
    isAiModalOpen, 
    setIsAiModalOpen, 
    userProfile, 
    calculationResults, 
    dailyMetrics,
    aiSuggestedPrompt, 
    setAiSuggestedPrompt 
  } = useApp();

  const [inputMessage, setInputMessage] = useState<string>('');
  const initialGreeting: ChatMessage = {
    id: 'msg-welcome',
    sender: 'assistant',
    text: `Hello ${userProfile.name}! 👋 I am FitLife AI, your personal health, nutrition, and fitness assistant powered by Gemini.

Your personalized daily targets:
• **Calories:** ${calculationResults.targetCalories.toLocaleString()} kcal (${userProfile.goal.replace('_', ' ')})
• **Protein:** ${calculationResults.targetProtein}g
• **Water Goal:** ${(userProfile.dailyWaterGoal / 1000).toFixed(1)}L
• **Steps:** 10,000 / day

How can I help you right now? Feel free to ask about meal swaps, Indian recipes, workout routines, or daily calorie adjustments!`,
    timestamp: 'Just now',
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'What should I eat for dinner?',
    'Can I replace paneer with chicken?',
    'How many calories should I eat today?',
    'Best workout for belly fat',
    'How to improve my sleep?',
    'Is 10,000 steps enough?',
  ];

  useEffect(() => {
    if (aiSuggestedPrompt) {
      setInputMessage(aiSuggestedPrompt);
      setAiSuggestedPrompt('');
    }
  }, [aiSuggestedPrompt, setAiSuggestedPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isAiModalOpen) return null;

  const handleSend = async (messageText?: string) => {
    const query = (messageText || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update conversation thread immediately
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    // Prepare multi-turn chat history (excluding the first generic welcome message if desired, or including all turns)
    const historyPayload = updatedMessages.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      content: m.text,
    }));

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          chatHistory: historyPayload.slice(-8), // Send last 8 conversation turns for contextual memory
          userProfile: {
            name: userProfile.name,
            age: userProfile.age,
            gender: userProfile.gender,
            height: userProfile.height,
            weight: userProfile.weight,
            targetWeight: userProfile.targetWeight,
            goal: userProfile.goal,
            activityLevel: userProfile.activityLevel,
            targetCalories: calculationResults.targetCalories,
            targetProtein: calculationResults.targetProtein,
            targetCarbs: calculationResults.targetCarbs,
            targetFat: calculationResults.targetFat,
            foodPreference: userProfile.foodPreference,
            allergies: userProfile.allergies.join(', '),
            waterGoal: userProfile.dailyWaterGoal,
            sleepDuration: userProfile.sleepGoal,
            caloriesConsumedToday: dailyMetrics.caloriesConsumed,
            stepsToday: dailyMetrics.steps,
            waterConsumedMlToday: dailyMetrics.waterConsumedMl,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || data.response || 'I am ready to help with your health and fitness goals!';

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: `Based on your ${userProfile.goal.replace('_', ' ')} target of ${calculationResults.targetCalories} kcal/day: Prioritize getting ${calculationResults.targetProtein}g of protein with balanced whole grains and vegetables. Hydrate with ${(userProfile.dailyWaterGoal / 1000).toFixed(1)}L of water and complete your daily walking target!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([initialGreeting]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 h-[88vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950">
              <Sparkles className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-base">FitLife AI Coach</h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold">
                  Gemini 3.8
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Multi-Turn Conversation Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs no-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-850 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
                <span
                  className={`block text-[9px] mt-1.5 text-right font-mono ${
                    msg.sender === 'user' ? 'text-slate-800/80' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2 pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Gemini is thinking and reviewing your targets...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Suggested Topics</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] whitespace-nowrap border border-slate-700/60 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-800"
        >
          <input
            type="text"
            placeholder="Ask about diet, workout, meal swaps, sleep..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Safety Disclaimer Footer */}
        <p className="text-[10px] text-slate-400 text-center">
          * Wellness coaching guidance only. Not intended as medical diagnosis or treatment.
        </p>
      </div>
    </div>
  );
};
