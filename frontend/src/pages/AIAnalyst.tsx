import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, Database } from 'lucide-react'
import { sendChatMessage } from '../api'

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  data?: any;
}

export const AIAnalyst = () => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Hello! I am RetailIQ, your AI Business Analyst. You can ask me anything about your retail data. For example: "What is our total revenue by product category?" or "Who are our top 5 customers?"'
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await sendChatMessage(userMessage)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.reply,
        sql: response.sql,
        data: response.data
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error connecting to the data engine. Please make sure the backend is running and the Groq API key is valid."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="text-brand-500" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AI Business Analyst</h1>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col p-0">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-tr from-brand-500 to-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-brand-500'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-brand-500 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-sm border border-slate-100 dark:border-slate-700'}`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                
                {msg.sql && (
                  <div className="text-xs text-slate-400 flex flex-col gap-1 mt-2">
                    <div className="flex items-center gap-1 font-mono bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-2xl">
                      <Database size={12} className="flex-shrink-0" /> 
                      <span className="whitespace-nowrap">{msg.sql}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-brand-500">
                <Bot size={20} />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 rounded-tl-sm border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-4 bg-white/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your revenue, customers, or products..." 
              className="w-full pl-6 pr-16 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-slate-800 dark:text-white"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
