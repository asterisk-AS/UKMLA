// Type definitions for libraries that don't have built-in type definitions

declare module 'deepseek-api' {
  /**
   * Creates a new chat session with DeepSeek
   * @param token The DeepSeek user token
   * @param id Optional custom chat ID
   * @returns A promise resolving to the chat ID or an error object
   */
  export function createNewChat(token: string, id?: string): Promise<string | { error: string }>;

  /**
   * Sends a message to DeepSeek and streams the response
   * @param text The message text to send
   * @param chat The chat session details
   * @param callback Function to process response chunks
   * @returns A promise resolving to the final response data
   */
  export function sendMessage(
    text: string, 
    chat: { id: string; token: string; parent_id?: string }, 
    callback: (chunk: {
      type: 'message' | 'thinking' | 'search' | 'error' | 'done';
      content?: string;
      error?: string;
    }) => void
  ): Promise<any>;

  /**
   * Map storing chat session details
   */
  export const chats: Map<string, {
    id: string;
    token: string;
    cookies: null;
  }>;
}
