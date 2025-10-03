import type React from "react"
import Navbar from "../components/Navbar"
import Chatbot from "../services/Chatbot"
import Footer from "../components/Footer"

const ChatbotPage: React.FC = () => {
  return (
    <div className="chatbot-page bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Navbar />
      <main className="chatbot-main">
        <Chatbot />
      </main>
      <Footer />
    </div>
  )
}

export default ChatbotPage
