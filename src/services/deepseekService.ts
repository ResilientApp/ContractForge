// DeepSeek API service for smart contract generation
import { fewShotPrompt } from '../Prompts/FewshotPrompts';

export interface JSONGenerationResult {
  syntaxJSON: {
    contract_name: string;
    arguments: string;
  };
  exampleJSON: {
    contract_name: string;
    arguments: string;
  };
}

export async function generateSmartContract(prompt: string): Promise<string> {
    try {
      // Check if API key is configured
      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      const MODEL = import.meta.env.VITE_DEEPSEEK_MODEL;
      const BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL;
      console.log('MODEL', MODEL);
      if (!apiKey || apiKey === 'sk-1234567890abcdef') {
        throw new Error('DeepSeek API key not configured. Please add VITE_DEEPSEEK_API_KEY to your .env file.');
      }

      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: MODEL,
          // temperature: 0.3, // Lower temperature for more consistent code generation
          // max_tokens: 4000, // Increased for longer contracts
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
  
export async function generateJSONFromSolidity(solidityCode: string): Promise<JSONGenerationResult> {
  try {
    // Check if API key is configured
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    const MODEL = import.meta.env.VITE_DEEPSEEK_MODEL;
    const BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL;
    if (!apiKey || apiKey === 'sk-1234567890abcdef') {
      throw new Error('DeepSeek API key not configured. Please add VITE_DEEPSEEK_API_KEY to your .env file.');
    }

    const jsonPrompt = `
Generate JSON for this contract:

\`\`\`solidity
${solidityCode}
\`\`\`

Return EXACTLY:

===EXAMPLE_JSON===
{"contract_name":"ContractName","arguments":"\\"value1\\",\\"value2\\",123"}

Rules: contract_name from Solidity, arguments as comma-separated values, strings with escaped quotes, numbers without quotes.`;

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
              body: JSON.stringify({
          model: MODEL,
          // temperature: 0.1, // Very low temperature for consistent JSON generation
          // max_tokens: 3000, // Increased to ensure both sections complete
          messages: [
          {
            role: 'system',
            content: 'You are a Solidity-to-ResilientDB JSON converter. Generate JSON configurations in the specified format.'
          },
          {
            role: 'user',
            content: jsonPrompt
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

    // Parse the response to extract JSON section
    const exampleMatch = content.match(/===EXAMPLE_JSON===\n([\s\S]*?)(?=\n|$)/);

    if (!exampleMatch) {
      console.error('Full AI Response:', content);
      throw new Error('Invalid response format: missing EXAMPLE_JSON section');
    }

    const exampleJSONStr = exampleMatch[1].trim();
    console.log('Raw Example JSON:', exampleJSONStr);
    
    // Remove any markdown code blocks if present
    let cleanExampleJSON = exampleJSONStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Fix common JSON formatting issues
    cleanExampleJSON = cleanExampleJSON.replace(/^\s*{\s*/, '{').replace(/\s*}\s*$/, '}');
    
    console.log('Cleaned Example JSON:', cleanExampleJSON);
    
    // Check if example JSON is incomplete
    if (!exampleJSONStr.includes('}') || exampleJSONStr.length < 10) {
      console.error('Example JSON is incomplete:', exampleJSONStr);
      throw new Error('AI response incomplete: Example JSON section is not properly formatted');
    }
    
    let exampleJSON;
    try {
      exampleJSON = JSON.parse(cleanExampleJSON);
    } catch (parseError) {
      console.error('JSON Parse Error - Example:', cleanExampleJSON);
      
      // Try to fix common JSON issues
      try {
        // Remove any trailing commas
        const fixedExample = cleanExampleJSON.replace(/,(\s*[}\]])/g, '$1');
        exampleJSON = JSON.parse(fixedExample);
      } catch (secondError) {
        throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

    // Validate JSON structure
    if (!exampleJSON.contract_name || typeof exampleJSON.arguments !== 'string') {
      throw new Error('Invalid EXAMPLE_JSON structure');
    }

    return {
      syntaxJSON: exampleJSON, // Use the same JSON for both sections
      exampleJSON
    };

  } catch (error) {
    console.error("Error generating JSON from Solidity:", error);
    
    if (error instanceof Error && error.message.includes('API key not configured')) {
      throw new Error('DeepSeek API key not configured. Please add VITE_DEEPSEEK_API_KEY to your .env file.');
    }

    if (error instanceof Error && error.message.includes('Invalid response format')) {
      throw new Error('Failed to parse AI response. Please try again.');
    }

    if (error instanceof Error && error.message.includes('JSON parsing failed')) {
      throw new Error(`JSON parsing failed: ${error.message}. Please try again.`);
    }

    throw new Error(`JSON generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
  