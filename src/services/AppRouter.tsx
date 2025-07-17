"use client"

import type React from "react"
import { useState, useEffect } from "react"
import LandingPage from "../Pages/LandingPage"
import ChatbotPage from "../Pages/ChatbotPage"

const AppRouter: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const navigate = (path: string) => {
    window.history.pushState({}, "", path)
    setCurrentPath(path)
  }

  // Make navigate function available globally
  ;(window as any).navigate = navigate

  switch (currentPath) {
    case "/chatbot":
      return <ChatbotPage/>
    case "/":
    default:
      return <LandingPage />
  }
}

export default AppRouter
