import type { ValidationResult } from "@/services/contractValidator"
import { useEffect, useRef, useState } from "react"
import { loadHistory, saveHistory, loadChat, saveChat } from "@/hooks/useHistory"

export interface Message {
    id: string
    type: "user" | "ai"
    content: string
    timestamp: Date
    isCode?: boolean
    compilationStatus?: "success" | "error" | "pending"
    validation?: ValidationResult
}

function getInitialGreeting(): Message[] {
    return [
        {
            id: "1",
            type: "ai",
            content:
                "Hello! I'm your Smart Contract Assistant for ResilientDB. I can generate Solidity smart contracts from natural language descriptions.<br><br><strong>💡 Try these examples:</strong><br>• \"Create a simple token contract with transfer and balance functions\"<br>• \"Build a voting system where users can create and vote on proposals\"<br>• \"Make a multi-signature wallet that requires 2 out of 3 signatures\"<br>• \"Create a crowdfunding contract where people can contribute and claim rewards\"<br>• Click the \"Templates\" button to browse pre-built contract templates<br><br>What type of smart contract would you like to create?",
            timestamp: new Date(),
        },
    ]
}

const useMessages = (chatId?: string) => {
    const [messages, setMessages] = useState<Message[]>(() => {
        if (chatId) {
            const chatMessages = loadChat(chatId)
            // If the chatId exists in history (has any messages), load it; else start fresh with greeting
            return chatMessages && chatMessages.length > 0 ? chatMessages : getInitialGreeting()
        }
        const history = loadHistory()
        return history && history.length > 0 ? history : getInitialGreeting()
    })
    const persistEnabledRef = useRef<boolean>(false)

    // Reset message list when chatId changes (new chat or switching chats)
    useEffect(() => {
        if (chatId) {
            const chatMessages = loadChat(chatId)
            // Only load from history if there is prior content; otherwise show greeting and wait for first user message
            setMessages(chatMessages && chatMessages.length > 0 ? chatMessages : getInitialGreeting())
            persistEnabledRef.current = (chatMessages || []).some(m => m.type === "user")
            return
        }
        const history = loadHistory()
        setMessages(history && history.length > 0 ? history : getInitialGreeting())
        persistEnabledRef.current = (history || []).some(m => m.type === "user")
    }, [chatId])

    const appendUserMessage = (content: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            type: "user",
            content: content.trim(),
            timestamp: new Date(),
        }
        setMessages(prev => {
            const next = [...prev, newMessage]
            if (chatId) {
                persistEnabledRef.current = true
                saveChat(chatId, next)
            } else {
                saveHistory(next)
            }
            return next
        })
    }

    const appendAiMessage = (message: Message) => {
        setMessages(prev => {
            const next = [...prev, message]
            if (chatId) {
                if (persistEnabledRef.current) {
                    saveChat(chatId, next)
                }
            } else {
                saveHistory(next)
            }
            return next
        })
    }

    return { messages, setMessages, appendUserMessage, appendAiMessage }
}

export default useMessages