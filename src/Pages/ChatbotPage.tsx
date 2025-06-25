import type React from "react"
import Navbar from "../components/Navbar"
import Chatbot from "../services/Chatbot"

const ChatbotPage: React.FC = () => {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-hidden">
      <Navbar />
      <main className="h-[calc(100vh-80px)]">
        <Chatbot />
      </main>
    </div>
  )
}

export default ChatbotPage
