// Smart Contract Validation Service
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  contractInfo: {
    name: string;
    functions: string[];
    events: string[];
    stateVariables: string[];
  };
}

export class ContractValidator {
  private static extractContractName(code: string): string {
    const match = code.match(/contract\s+(\w+)/);
    return match ? match[1] : 'Unknown';
  }

  private static extractFunctions(code: string): string[] {
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)/g;
    const functions: string[] = [];
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      functions.push(match[1]);
    }
    
    return functions;
  }

  private static extractEvents(code: string): string[] {
    const eventRegex = /event\s+(\w+)/g;
    const events: string[] = [];
    let match;
    
    while ((match = eventRegex.exec(code)) !== null) {
      events.push(match[1]);
    }
    
    return events;
  }

  private static extractStateVariables(code: string): string[] {
    const variableRegex = /(\w+)\s+(public|private|internal|external)?\s*(\w+)/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(code)) !== null) {
      // Filter out function parameters and local variables
      if (!code.substring(0, match.index).includes('function') && 
          !code.substring(0, match.index).includes('(')) {
        variables.push(`${match[1]} ${match[3]}`);
      }
    }
    
    return variables;
  }

  static validateContract(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic structure checks
    if (!code.includes('pragma solidity')) {
      errors.push('Missing pragma solidity directive');
    }

    if (!code.includes('contract ')) {
      errors.push('No contract definition found');
    }

    // Security checks
    if (code.includes('tx.origin') && !code.includes('// WARNING: tx.origin')) {
      warnings.push('Use of tx.origin detected - consider using msg.sender instead for security');
    }

    if (code.includes('block.timestamp') && !code.includes('// WARNING: block.timestamp')) {
      warnings.push('Use of block.timestamp detected - be aware of miner manipulation');
    }

    // Best practices
    if (!code.includes('event ') && code.includes('function ')) {
      suggestions.push('Consider adding events for important state changes');
    }

    if (code.includes('require(') && !code.includes('require(') && !code.includes('assert(')) {
      suggestions.push('Consider adding require statements for input validation');
    }

    // ResilientDB compatibility checks
    if (code.includes('pragma solidity') && !code.match(/pragma solidity >= 0\.5\.0/)) {
      warnings.push('Ensure Solidity version is >= 0.5.0 for ResilientDB compatibility');
    }

    // Gas optimization suggestions
    if (code.includes('for (uint i = 0; i < array.length; i++)')) {
      suggestions.push('Consider caching array.length in a local variable for gas optimization');
    }

    if (code.includes('storage') && code.includes('memory') && !code.includes('// storage vs memory')) {
      suggestions.push('Review storage vs memory usage for gas optimization');
    }

    // Extract contract information
    const contractInfo = {
      name: this.extractContractName(code),
      functions: this.extractFunctions(code),
      events: this.extractEvents(code),
      stateVariables: this.extractStateVariables(code)
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      contractInfo
    };
  }

  static generateTestCases(code: string): string {
    const contractName = this.extractContractName(code);
    const functions = this.extractFunctions(code);
    
    let testCode = `// Test cases for ${contractName}\n`;
    testCode += `// Add these to your test file\n\n`;
    
    functions.forEach(func => {
      if (func !== 'constructor') {
        testCode += `// Test for ${func} function\n`;
        testCode += `// TODO: Add specific test cases based on function parameters\n`;
        testCode += `// Example: test${func.charAt(0).toUpperCase() + func.slice(1)}() {\n`;
        testCode += `//   // Your test logic here\n`;
        testCode += `// }\n\n`;
      }
    });
    
    return testCode;
  }

  static generateDeploymentScript(code: string): string {
    const contractName = this.extractContractName(code);
    
    return `// Deployment script for ${contractName}
// Use this with ResilientDB's contract_service_tools

// 1. Compile the contract:
// solc --evm-version homestead --combined-json bin,hashes --pretty-json --optimize ${contractName}.sol > ${contractName}.json

// 2. Create deployment JSON:
{
  "command": "deploy",
  "contract_path": "path/to/${contractName}.json",
  "contract_name": "${contractName}.sol:${contractName}",
  "init_params": "YOUR_INITIAL_PARAMETERS",
  "owner_address": "YOUR_OWNER_ADDRESS"
}

// 3. Deploy using:
// bazel-bin/service/tools/kv/api_tools/contract_service_tools -c service/tools/config/interface/service.config --config_file=deploy.json`;
  }
} 