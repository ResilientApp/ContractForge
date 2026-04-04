import { useEffect, useState } from "react"

const STORAGE_FAVORITES_KEY = "cf_favorite_chat_ids_v1"

const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_FAVORITES_KEY)
      if (!raw) return []
      const ids = JSON.parse(raw) as string[]
      return Array.isArray(ids) ? ids : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      const deduped = Array.from(new Set(favorites))
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(deduped))
    } catch {
      // no-op
    }
  }, [favorites])

  const addFavorite = (chatId: string) => {
    setFavorites((prev: string[]) => Array.from(new Set([...prev, chatId])))
  }

  const removeFavorite = (chatId: string) => {
    setFavorites((prev: string[]) => prev.filter((id: string) => id !== chatId))
  }

  const isFavorite = (chatId: string | undefined): boolean => {
    if (!chatId) return false
    return favorites.includes(chatId)
  }

  const toggleFavorite = (chatId: string | undefined) => {
    if (!chatId) return
    setFavorites((prev: string[]) => {
      if (prev.includes(chatId)) return prev.filter(id => id !== chatId)
      return [...prev, chatId]
    })
  }

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }
}

export default useFavorites