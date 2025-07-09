// DeepSeek API service for smart contract generation
import { fewShotPrompt } from '../Prompts/FewshotPrompts';

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
          temperature: 0.3, // Lower temperature for more consistent code generation
          max_tokens: 4000, // Increased for longer contracts
          messages: [
            {
              role: 'system',
              content: `You are ContractForge, a helpful AI assistant specialized in smart contracts for ResilientDB. 

You can:
1. **Generate Solidity smart contracts** when users ask for contract creation
2. **Explain and discuss** smart contract concepts, security, and best practices
3. **Answer general questions** about blockchain, ResilientDB, and development
4. **Provide guidance** on contract deployment and testing

When generating contracts:
- Use proper Solidity syntax (>= 0.5.0)
- Include security best practices
- Add comprehensive error handling
- Emit events for state changes
- Implement proper access control
- Optimize for gas efficiency

For contract requests: Return clean, compilable Solidity code without markdown formatting.
For explanations and discussions: Respond conversationally and helpfully.`
            },
            {
              role: 'user',
              content: fewShotPrompt(prompt)
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

      // Clean up the response to ensure it's just Solidity code
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```solidity')) {
        cleanedContent = cleanedContent.replace(/^```solidity\n/, '').replace(/\n```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }
      
      // Remove any explanatory text before the pragma statement
      const pragmaIndex = cleanedContent.indexOf('pragma solidity');
      if (pragmaIndex > 0) {
        cleanedContent = cleanedContent.substring(pragmaIndex);
      }

      return cleanedContent;

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
  