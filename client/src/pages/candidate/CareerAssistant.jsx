import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import {
  Bot,
  User,
  Send,
  Sparkles,
  HelpCircle,
  Briefcase,
  FileText,
  Lightbulb,
  Loader2,
  Cpu,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SUGGESTED_PROMPTS = [
  'Generate 5 top technical interview questions for a Full Stack MERN Developer',
  'What are best practices to describe project accomplishments on my resume using quantifiable metrics?',
  'Give me STAR framework behavioral interview preparation advice with an example',
  'What skills should I learn in 2026 to transition from Junior to Senior Software Engineer?',
];

export const CareerAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your **AI Career Assistant & Tech Coach**.\n\nI can help you:\n- 🎯 Generate tailored technical & behavioral interview questions\n- 📄 Optimize your resume keywords and bullet points\n- 🚀 Chart software engineering career paths & tech stacks\n- 💬 Practice salary negotiation strategies\n\nHow can I help you level up your career today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await aiAPI.careerAssistant({
        message: text,
        history: updatedMessages.slice(-8),
      });

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.data.reply },
        ]);
        if (res.data.aiNotice) {
          setAiNotice(res.data.aiNotice);
        }
      }
    } catch (err) {
      toast.error('Failed to communicate with AI Assistant.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an issue connecting to the AI service. Please verify your network connection or backend configuration.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive AI Career Mentor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">AI Career Assistant</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time career guidance, mock interviews, and resume coaching powered by AI.
          </p>
        </div>
      </div>

      {aiNotice && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>{aiNotice}</span>
        </div>
      )}

      {/* Chat Window */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white font-bold text-xs'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>AI Coach is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 text-xs whitespace-nowrap transition-colors shadow-2xs font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything (e.g. 'Generate React mock interview questions', 'How to negotiate salary')..."
              className="flex-1 text-xs sm:text-sm p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CareerAssistant;

