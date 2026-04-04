import { EllipsisIcon, StarIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

interface ChatItemProps {
    chat: {
        id: string
        title: string
    }
    handleChatSelect: (id: string) => void
    chatId: string,
    handleDeleteChat: (id: string) => void,
    handleFavoriteChat: (id: string) => void,
    isFavorite: (id: string) => boolean,
}

const ChatItem = ({ chat, handleChatSelect, chatId, handleDeleteChat, handleFavoriteChat, isFavorite }: ChatItemProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleDelete = () => {
        handleDeleteChat(chat.id)
        setIsMenuOpen(false)
    }

    const handleFavorite = () => {
        handleFavoriteChat(chat.id)
        setIsMenuOpen(false)
    }   

    return (
        <div className="w-full group relative flex items-center gap-2 group" onMouseLeave={() => setIsMenuOpen(false)}>
            <button title={chat?.title} onClick={() => handleChatSelect(chat?.id)} className={`hover:bg-gray-700 rounded-md !p-1.5 duration-200 cursor-pointer !w-full flex items-center justify-start ${chat?.id === chatId ? 'bg-gray-800' : ''} relative `}>
                <p className="!text-sm !text-gray-300 text-start w-full !pr-6 truncate">{chat.title}</p>
            </button>

            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex items-center gap-1">
                <button className="hover:bg-gray-700 rounded-md !p-1.5 duration-200 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <EllipsisIcon size={16} />
                </button>

                <div className={`absolute left-0 top-full bg-gray-800 rounded-md z-10 ${isMenuOpen ? 'block' : 'hidden'} flex flex-col items-start justify-start !p-2`}>
                    <button onClick={handleFavorite} title={isFavorite(chat.id) ? 'Unfavorite' : 'Favorite'} className="p-1 cursor-pointer rounded-md hover:bg-gray-600 flex items-center justify-start gap-2 !px-2.5 !py-2 w-full">
                        <StarIcon size={20} className={isFavorite(chat.id) ? 'text-yellow-400' : 'text-gray-500'} />
                        <span className="!text-sm !text-gray-300 text-start w-full truncate">{isFavorite(chat.id) ? 'Unfavorite' : 'Favorite'}</span>
                    </button>
                    <button onClick={handleDelete} title="Delete Chat" className="p-1 cursor-pointer rounded-md hover:bg-gray-600 flex items-center justify-start gap-2 !px-2.5 !py-2 w-full">
                        <Trash2Icon size={20} className="text-red-500" />
                        <span className="!text-sm !text-gray-300 text-start w-full truncate">Delete Chat</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatItem