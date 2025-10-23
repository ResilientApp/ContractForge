import { Sparkles, Layout, HomeIcon, SidebarIcon, SquarePenIcon, StarIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { listChats } from "@/hooks/useHistory"
import { useSearchParams } from "react-router-dom"

interface SidebarProps {
  isSidebarCollapsed: boolean
  setIsSidebarCollapsed: (isCollapsed: boolean) => void
  setIsTemplateSelectorOpen: (isOpen: boolean) => void
  setChatId: (id: string) => void
}

const Sidebar = ({ isSidebarCollapsed, setIsSidebarCollapsed, setIsTemplateSelectorOpen, setChatId }: SidebarProps) => {

  const chats = listChats()
  const [searchParams, setSearchParams] = useSearchParams()
  const chatId = searchParams.get("chatId")

  const handleChatSelect = (chatId: string) => {
    setChatId(chatId)
    setSearchParams((prev: URLSearchParams) => {
      prev.set("chatId", chatId)
      return prev
    })
  }

  const handleNewChat = () => {
    const newChatId = crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())
    setChatId(newChatId)
    setSearchParams((prev: URLSearchParams) => {
      prev.set("chatId", newChatId)
      return prev
    })
  }

  return (
    <div className={`hidden sm:flex flex-col justify-between items-center shrink-0 transition-all duration-100 ease-in min-h-screen h-full border border-r border-gray-800 w-[var(--sidebar-width)] ${isSidebarCollapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]'} bg-[rgba(15,15,23)]`}>
      <div className="px-3 py-2 w-full h-full flex-1 flex flex-col justify-start items-center gap-2">
        <div className="w-full flex items-center justify-between !px-2 !py-2 flex-wrap gap-2">
          <Link title="Home" to="/" className="hover:bg-gray-800 rounded-md !p-2 duration-100 cursor-pointer">
            <HomeIcon size={24} />
          </Link>
          <button title="Collapse Sidebar" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hover:bg-gray-800 rounded-md !p-2 duration-100 cursor-pointer">
            <SidebarIcon size={24} />
          </button>
        </div>

        <div className={`${isSidebarCollapsed ? 'hidden' : 'block'} w-full flex flex-col gap-1 items-center justify-center !px-2`}>
          <button title="New Chat" onClick={handleNewChat} className="hover:bg-gray-800 rounded-md !p-2 duration-200 cursor-pointer !w-full flex items-center justify-start gap-2">
            <SquarePenIcon size={20} className="text-gray-300" />
            <span className={`${isSidebarCollapsed ? 'hidden' : 'block'} !text-sm text-gray-300`}>New Chat</span>
          </button>

          <button title="Favorited Chats" onClick={() => { setIsTemplateSelectorOpen(true) }} className="hover:bg-gray-800 rounded-md !p-2 duration-200 cursor-pointer !w-full flex items-center justify-start gap-2">
            <StarIcon size={20} className="text-gray-300" />
            <span className={`${isSidebarCollapsed ? 'hidden' : 'block'} !text-sm text-gray-300`}>Favorited Chats</span>
          </button>
        </div>

        <div className="w-full flex flex-col items-center justify-start gap-2 !px-4 !mt-2 text-sm font-light">
          <p className="!text-sm !text-gray-300 text-start w-full">Chats</p>

          <div className="w-full flex flex-col items-center justify-start">
            {
              chats.map((chat) => (
                <button key={chat.id} title={chat.title} onClick={() => handleChatSelect(chat.id)} className={`hover:bg-gray-700 rounded-md !p-1.5 duration-200 cursor-pointer !w-full flex items-center justify-start ${chat.id === chatId ? 'bg-gray-800' : ''}`}>
                  <p className="!text-sm !text-gray-300 text-start w-full truncate">{chat.title}</p>
                </button>
              ))
            }
          </div>
        </div>

      </div>

      <div className="chatbot-header !mt-auto">
        <div className={`items-center justify-center gap-2 ${isSidebarCollapsed ? 'hidden' : 'flex'}`}>
          <div className="header-icon">
            <Sparkles className="sparkles-icon" />
          </div>
          <div className="header-text flex flex-col gap-0">
            <h2 className="!text-base">Smart Contract Assistant</h2>
            <p className="!text-xs !text-gray-500">Powered by DeepSeek AI</p>
          </div>
        </div>
        <button 
          className={`template-button w-full ${isSidebarCollapsed ? '!w-auto' : 'w-full'}`}
          onClick={() => setIsTemplateSelectorOpen(true)}
          title="Browse Templates"
        >
          <Layout size={20} />
          <span className={`${isSidebarCollapsed ? 'hidden' : 'block'} !text-sm`}>Templates</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar