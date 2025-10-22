import type { ValidationResult } from "@/services/contractValidator"
import { useState } from "react"

export interface Message {
    id: string
    type: "user" | "ai"
    content: string
    timestamp: Date
    isCode?: boolean
    compilationStatus?: "success" | "error" | "pending"
    validation?: ValidationResult
}

const useMessages = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            type: "ai",
            content:
            "Hello! I'm your Smart Contract Assistant for ResilientDB. I can generate Solidity smart contracts from natural language descriptions.<br><br><strong>💡 Try these examples:</strong><br>• \"Create a simple token contract with transfer and balance functions\"<br>• \"Build a voting system where users can create and vote on proposals\"<br>• \"Make a multi-signature wallet that requires 2 out of 3 signatures\"<br>• \"Create a crowdfunding contract where people can contribute and claim rewards\"<br>• Click the \"Templates\" button to browse pre-built contract templates<br><br>What type of smart contract would you like to create?",
            timestamp: new Date(),
        },
    ])

    return { messages, setMessages }
}

export default useMessages