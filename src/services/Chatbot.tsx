"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Copy, Code, Sparkles, Bot, User } from "lucide-react"
import { generateSmartContract } from "./deepseekService"
import "../components/ui/chatbot.css"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  isCode?: boolean
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your Smart Contract Assistant, I can help you generate, explain, and optimize smart contracts for ResilientDB. What would you like to create today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Only scroll to bottom when there are more than 1 message (initial welcome message)
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await generateSmartContract(input.trim())
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response,
        timestamp: new Date(),
        isCode: response.includes("contract ") || response.includes("pragma solidity"),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, I encountered an error while generating your smart contract. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <div className="header-icon">
            <Sparkles className="sparkles-icon" />
          </div>
          <div className="header-text">
            <h2>Smart Contract Assistant</h2>
            <p>Powered by DeepSeek AI</p>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">{message.type === "user" ? <User size={20} /> : <Bot size={20} />}</div>
            <div className="message-content">
              {message.isCode ? (
                <div className="code-block">
                  <div className="code-header">
                    <Code size={16} />
                    <span>Smart Contract</span>
                    <button onClick={() => copyToClipboard(message.content)} className="copy-button">
                      <Copy size={14} />
                    </button>
                  </div>
                  <pre className="code-content">
                    <code>{message.content}</code>
                  </pre>
                </div>
              ) : (
                <div className="text-content">{message.content}</div>
              )}
              <div className="message-timestamp">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai">
            <div className="message-avatar">
              <Bot size={20} />
            </div>
            <div className="message-content">
              <div className="loading-indicator">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="loading-text">Generating smart contract...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the smart contract you want to create..."
            className="message-input"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className="send-button">
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chatbot
