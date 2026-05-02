import { useState } from "react"
import HomePage from "./pages/HomePage"
import ChatPage from "./pages/ChatPage"

/**
 * Navigation bar component - shown at the top of every page
 * Displays the DocuMind branding and tagline
 */
function Navbar({ page, onHome }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/30 bg-white/[0.02] backdrop-blur-sm relative z-10">
      {/* App logo and name */}
      <div className="text-xl font-medium tracking-tight">
        <span className="text-purple-100">Docu</span>
        <span className="text-purple-400">Mind</span>
        {/* Decorative dot after logo */}
        <span className="inline-block w-2 h-2 rounded-full bg-purple-400 ml-1 mb-0.5 align-middle"></span>
      </div>
      
      {/* Tagline badge */}
      <span className="text-xs text-purple-400 border border-purple-500/30 rounded-full px-3 py-1 bg-purple-500/8">
        AI-Powered Document Intelligence
      </span>
    </div>
  )
}

/**
 * Animated background stars component
 * Creates a beautiful twinkling star field effect with gradient orbs
 */
function Stars() {
  // Generate array of 80 stars with random positions and animation properties
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,           // Random vertical position
    left: Math.random() * 100,          // Random horizontal position
    size: Math.random() * 2 + 0.5,      // Random size between 0.5px and 2.5px
    duration: 2 + Math.random() * 3,    // Random pulse duration between 2-5 seconds
    delay: Math.random() * 3,           // Random animation delay
  }))
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Render each star with unique animation properties */}
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            opacity: Math.random() * 0.5 + 0.1,
          }}
        />
      ))}
      
      {/* Decorative gradient orbs in corners */}
      <div className="absolute w-80 h-80 rounded-full -top-20 -right-20 bg-purple-600/10 blur-3xl" />
      <div className="absolute w-64 h-64 rounded-full bottom-10 -left-10 bg-purple-900/15 blur-3xl" />
    </div>
  )
}

/**
 * Main App component - handles page navigation and state management
 * Routes between HomePage (upload) and ChatPage (Q&A)
 */
function App() {
  // Track which page is currently displayed (home or chat)
  const [page, setPage] = useState("home")
  // Store the uploaded file object for access in ChatPage
  const [uploadedFile, setUploadedFile] = useState(null)
  // Store the file type (pdf, word, excel) for reference
  const [fileType, setFileType] = useState(null)

  /**
   * Handle file upload from HomePage
   * Saves file info and navigates to chat page
   */
  const handleUpload = (file, type) => {
    setUploadedFile(file)
    setFileType(type)
    setPage("chat")
  }

  /**
   * Handle return to home page
   * Clears uploaded file data and resets to upload screen
   */
  const handleHome = () => {
    setPage("home")
    setUploadedFile(null)
    setFileType(null)
  }

  return (
    <div className="min-h-screen bg-[#05050f] flex flex-col relative">
      {/* Animated background */}
      <Stars />
      
      {/* Navigation bar (visible on all pages) */}
      <Navbar page={page} onHome={handleHome} />
      
      {/* Page content - show HomePage for upload or ChatPage for Q&A */}
      {page === "home" && <HomePage onUpload={handleUpload} />}
      {page === "chat" && <ChatPage file={uploadedFile} fileType={fileType} onHome={handleHome} />}
    </div>
  )
}

export default App