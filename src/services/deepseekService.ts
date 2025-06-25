// DeepSeek API service for smart contract generation
export async function generateSmartContract(prompt: string): Promise<string> {
    try {
      // Check if API key is configured
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!apiKey || apiKey === 'sk-1234567890abcdef') {
        throw new Error('DeepSeek API key not configured. Please add VITE_DEEPSEEK_API_KEY to your .env file.');
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          temperature: 0.7,
          max_tokens: 2000,
          messages: [
            {
              role: 'system',
              content: `You are ContractForge, a helpful AI assistant for generating smart contracts for ResilientDB. 

For general conversation, respond naturally and conversationally.
For contract requests, generate contracts in the specified JSON format.

Be friendly, helpful, and explain things clearly.`
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from API');
      }

      return content;

    } catch (error) {
      console.error("Error generating smart contract:", error);
      
      if (error instanceof Error && error.message.includes('API key not configured')) {
        return `🔑 **API Key Missing**

I need your DeepSeek API key to work properly. Please:

1. Create a .env file in your project root
2. Add: VITE_DEEPSEEK_API_KEY=your_actual_api_key_here
3. Restart your development server

You can get a DeepSeek API key from: https://platform.deepseek.com/`;
      }

      return `❌ **Connection Error**

I'm having trouble connecting to my AI service. This could be due to:

• Network connectivity issues
• Invalid API key
• API service temporarily unavailable

**Error details:** ${error instanceof Error ? error.message : 'Unknown error'}

Please check your internet connection and API configuration, then try again.`;
    }
}
  