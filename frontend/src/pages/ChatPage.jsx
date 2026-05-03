import { useState } from "react"
import ReactMarkdown from "react-markdown"

export default function ChatPage({ file, fileType, onHome }) {
  // Store conversation history - each message has a role (ai or user) and text content
  const [messages, setMessages] = useState([
    { role: "ai", text: `Document loaded. Ask me anything about ${file?.name}` }
  ])
  // Store user's current input in the text field
  const [input, setInput] = useState("")

  // Handle sending a question to the backend
  const sendMessage = async () => {
    // Don't send empty messages
    if (!input.trim()) return
    
    const question = input
    
    // Add user's question to chat
    setMessages(prev => [...prev, { role: "user", text: question }])
    setInput("")
    
    // Show loading indicator while waiting for AI response
    setMessages(prev => [...prev, { role: "ai", text: "..." }])

    try {
      // Send question to backend API
      const response = await fetch("https://document-qa-agent-dq1u.onrender.com/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question })
      })

      const data = await response.json()
      
      // Replace loading indicator with actual AI response
      setMessages(prev => [
          ...prev.slice(0, -1),
          { role: "ai", text: data.answer }
      ])
    } catch (err) {
      // Handle network or backend errors
      setMessages(prev => [
          ...prev.slice(0, -1),
          { role: "ai", text: "Error connecting to backend. Please try again." }
      ])
    }
}

  return (
    <div className="flex flex-col flex-1 relative z-10">
      {/* Top bar showing document name and upload button */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-purple-900/20 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          {/* Pulse indicator showing document is active */}
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
          <span className="text-xs text-purple-400">{file?.name}</span>
        </div>
        {/* Button to upload a different document */}
        <button onClick={onHome} className="text-xs text-purple-400 border border-purple-500/30 rounded-full px-4 py-1.5 hover:bg-purple-500/10 transition-all">
          Upload New Document
        </button>
      </div>

      {/* Chat message history */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Message avatar - AI or User indicator */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${msg.role === "ai" ? "bg-purple-500/15 text-purple-400 border border-purple-500/30" : "bg-purple-700 text-purple-100"}`}>
              {msg.role === "ai" ? "AI" : "U"}
            </div>
            
            {/* Message content bubble */}
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "ai" ? "bg-white/4 border border-purple-500/20 text-zinc-300 rounded-tl-sm" : "bg-purple-700/40 border border-purple-500/30 text-purple-100 rounded-tr-sm"}`}>
              {/* Render markdown formatting in AI responses */}
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>

      {/* Input area - text field and send button */}
      <div className="px-6 py-4 border-t border-purple-900/30 flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question about your document..."
          className="flex-1 bg-white/5 border border-purple-500/25 rounded-xl px-4 py-2.5 text-sm text-purple-100 placeholder-zinc-700 outline-none focus:border-purple-500/60"
        />
        {/* Send button - triggers sendMessage on click */}
        <button onClick={sendMessage} className="bg-purple-600 hover:bg-purple-500 rounded-xl w-10 h-10 flex items-center justify-center transition-all flex-shrink-0">
          <svg className="w-4 h-4 stroke-white" fill="none" strokeWidth="2" viewBox="0 0 24 24">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}