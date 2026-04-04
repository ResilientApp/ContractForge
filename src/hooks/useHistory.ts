import { useEffect, useState } from "react"
import type { Message } from "@/hooks/useMessages"

const STORAGE_KEY = "cf_chat_messages_v1" // legacy single-session storage
const STORAGE_CHATS_KEY = "cf_chats_v2" // multi-session storage by chatId

export interface StoredMessage {
    id: string
    type: "user" | "ai"
    content: string
    isCode?: boolean
    timestamp: string
}

export interface StoredChat {
    id: string
    title?: string
    createdAt: string
    updatedAt: string
    messages: StoredMessage[]
}

export interface ChatSummary {
    id: string
    title?: string
    createdAt: string
    updatedAt: string
    lastMessagePreview?: string
}

function serializeMessages(messages: Message[]): StoredMessage[] {
    return messages.map((m) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        isCode: m.isCode,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : new Date(m.timestamp).toISOString(),
    }))
}

function deserializeMessages(stored: StoredMessage[] | null | undefined): Message[] {
    if (!stored) return []
    return stored.map((m) => ({
        id: m.id,
        type: m.type,
        content: m.content,
        isCode: m.isCode,
        // validation and compilationStatus intentionally omitted from storage; recompute if needed at runtime
        timestamp: new Date(m.timestamp),
    }))
}

export function loadHistory(): Message[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw) as StoredMessage[]
        return deserializeMessages(parsed)
    } catch {
        return []
    }
}

export function saveHistory(messages: Message[]): void {
    try {
        const serialized = serializeMessages(messages)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized))
    } catch {
        // no-op
    }
}

export function clearHistory(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        // no-op
    }
}

// Multi-chat APIs
function readChatsStore(): Record<string, StoredChat> {
    try {
        const raw = localStorage.getItem(STORAGE_CHATS_KEY)
        if (!raw) return {}
        const obj = JSON.parse(raw) as Record<string, StoredChat>
        return obj || {}
    } catch {
        return {}
    }
}

function writeChatsStore(chats: Record<string, StoredChat>): void {
    try {
        localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(chats))
    } catch {
        // no-op
    }
}

export function loadChat(chatId: string): Message[] {
    const store = readChatsStore()
    const chat = store[chatId]
    if (!chat) return []
    return deserializeMessages(chat.messages)
}

export function saveChat(chatId: string, messages: Message[], title?: string): void {
    const store = readChatsStore()
    const nowIso = new Date().toISOString()
    const existing = store[chatId]
    const storedMessages = serializeMessages(messages)
    const computedTitle = title || existing?.title || deriveTitleFromMessages(messages)
    store[chatId] = {
        id: chatId,
        title: computedTitle,
        createdAt: existing?.createdAt || nowIso,
        updatedAt: nowIso,
        messages: storedMessages,
    }
    writeChatsStore(store)
}

export function listChats(): ChatSummary[] {
    const store = readChatsStore()
    const summaries = Object.values(store).map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        lastMessagePreview: c.messages.length ? truncate(c.messages[c.messages.length - 1].content, 80) : undefined,
    }))
    // sort by updatedAt desc
    return summaries.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function deleteChat(chatId: string): void {
    const store = readChatsStore()
    if (store[chatId]) {
        delete store[chatId]
        writeChatsStore(store)
    }
}

function deriveTitleFromMessages(messages: Message[]): string | undefined {
    const firstUser = messages.find((m) => m.type === "user")
    if (!firstUser) return undefined
    return truncate(firstUser.content.replace(/<[^>]+>/g, ""), 40)
}

function truncate(text: string, max: number): string {
    if (text.length <= max) return text
    return text.slice(0, max - 1) + "…"
}

const useHistory = () => {
    const [history, setHistory] = useState<Message[]>(() => loadHistory())

    useEffect(() => {
        saveHistory(history)
    }, [history])

    return { history, setHistory, clearHistory }
}

export default useHistory