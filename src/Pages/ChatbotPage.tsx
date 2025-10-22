import type React from "react"
import Chatbot from "../services/Chatbot"
import { useState } from "react"
import TemplateSelector from "@/components/TemplateSelector"
import { ContractValidator } from "@/services/contractValidator"
import useMessages from "@/hooks/useMessages"
import type { Message } from "@/hooks/useMessages"
import Sidebar from "@/components/Sidebar"

const ChatbotPage: React.FC = () => {
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const { setMessages } = useMessages()


  const validateSolidityCode = (code: string): boolean => {
    // Basic validation - check for essential Solidity elements
    const hasPragma = code.includes("pragma solidity");
    const hasContract = code.includes("contract ");
    const hasFunction = code.includes("function ");
    
    return hasPragma && hasContract && hasFunction;
  }

  const handleTemplateSelect = (code: string, _templateName: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      type: "ai",
      content: code,
      timestamp: new Date(),
      isCode: true,
      compilationStatus: validateSolidityCode(code) ? "success" : "error",
      validation: ContractValidator.validateContract(code),
    }
    setMessages((prev) => [...prev, aiMessage])
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 min-h-screen !max-h-screen">
      <main className="min-h-screen flex w-full justify-start items-start">
        <Sidebar isSidebarCollapsed={isSidebarCollapsed} setIsSidebarCollapsed={setIsSidebarCollapsed} setIsTemplateSelectorOpen={setIsTemplateSelectorOpen} />

        <Chatbot validateSolidityCode={validateSolidityCode} />

        <TemplateSelector isOpen={isTemplateSelectorOpen} onClose={() => setIsTemplateSelectorOpen(false)} onSelectTemplate={handleTemplateSelect} />
      </main>
    </div>
  )
}

export default ChatbotPage
