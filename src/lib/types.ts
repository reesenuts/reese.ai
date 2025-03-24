export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}

export interface DataEntry {
    id: string;
    question: string;
    answer: string;
    category: string;
    keywords: string[];
    variations: string[];
}

export interface StreamingMessage extends ChatMessage {
    isStreaming?: boolean;
} 