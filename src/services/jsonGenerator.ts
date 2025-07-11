// JSON Generator Service for ResVault
export interface ContractConfig {
  contract_name: string;
  arguments: string;
}

export class JSONGenerator {
  private static extractContractName(code: string): string {
    const match = code.match(/contract\s+(\w+)/);
    return match ? match[1] : 'Unknown';
  }

  private static extractConstructorParams(code: string): string[] {
    const constructorMatch = code.match(/constructor\s*\(([^)]*)\)/);
    if (!constructorMatch) return [];
    
    const paramsString = constructorMatch[1].trim();
    if (!paramsString) return [];
    
    // Split by comma, but be careful with string literals
    const params: string[] = [];
    let currentParam = '';
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < paramsString.length; i++) {
      const char = paramsString[i];
      
      if (escapeNext) {
        currentParam += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        currentParam += char;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        currentParam += char;
        continue;
      }
      
      if (char === ',' && !inString) {
        params.push(currentParam.trim());
        currentParam = '';
        continue;
      }
      
      currentParam += char;
    }
    
    if (currentParam.trim()) {
      params.push(currentParam.trim());
    }
    
    return params;
  }

  private static parseParamType(param: string): { type: string; name: string } {
    const trimmed = param.trim();
    const parts = trimmed.split(/\s+/);
    
    if (parts.length >= 2) {
      return {
        type: parts[0],
        name: parts[parts.length - 1]
      };
    }
    
    return {
      type: 'string',
      name: trimmed
    };
  }

  private static generateDefaultValue(paramType: string): string {
    switch (paramType.toLowerCase()) {
      case 'string':
        return '"Default Value"';
      case 'uint':
      case 'uint256':
      case 'uint8':
      case 'uint16':
      case 'uint32':
      case 'uint64':
      case 'uint128':
        return '0';
      case 'int':
      case 'int256':
      case 'int8':
      case 'int16':
      case 'int32':
      case 'int64':
      case 'int128':
        return '0';
      case 'bool':
        return 'false';
      case 'address':
        return '0x0000000000000000000000000000000000000000';
      default:
        return '"Default Value"';
    }
  }

  private static formatArgument(value: string, type: string): string {
    switch (type.toLowerCase()) {
      case 'string':
        // Return the value as-is, JSON.stringify will handle escaping
        return value;
      case 'bool':
        return value.toLowerCase() === 'true' ? 'true' : 'false';
      case 'address':
        return value.startsWith('0x') ? value : value;
      case 'uint':
      case 'uint256':
      case 'uint8':
      case 'uint16':
      case 'uint32':
      case 'uint64':
      case 'uint128':
      case 'int':
      case 'int256':
      case 'int8':
      case 'int16':
      case 'int32':
      case 'int64':
      case 'int128':
        return value;
      default:
        return value;
    }
  }

  static generateResVaultJSON(code: string, customArgs?: string[]): ContractConfig {
    const contractName = this.extractContractName(code);
    const constructorParams = this.extractConstructorParams(code);
    
    let argumentsArray: string[] = [];
    
    if (customArgs && customArgs.length > 0) {
      argumentsArray = constructorParams.map((param, index) => {
        const { type } = this.parseParamType(param);
        const value = customArgs[index] || this.generateDefaultValue(type);
        return this.formatArgument(value, type);
      });
    } else {
      argumentsArray = constructorParams.map(param => {
        const { type } = this.parseParamType(param);
        const defaultValue = this.generateDefaultValue(type);
        return this.formatArgument(defaultValue, type);
      });
    }
    
    // Create the arguments string with proper escaping and quoting
    const argumentsString = argumentsArray.map(arg => {
      // If it's a string value, wrap it in quotes only if not already quoted
      if (
        typeof arg === 'string' &&
        !arg.startsWith('0x') &&
        !['true', 'false'].includes(arg) &&
        isNaN(Number(arg))
      ) {
        // Remove any existing quotes
        let cleanArg = arg;
        if (cleanArg.startsWith('"') && cleanArg.endsWith('"')) {
          cleanArg = cleanArg.slice(1, -1);
        }
        return `"${cleanArg}"`;
      }
      return arg;
    }).join(',');
    
    return {
      contract_name: contractName,
      arguments: argumentsString
    };
  }

  static generateExampleJSONs(): ContractConfig[] {
    return [
      {
        contract_name: "VotingContract",
        arguments: '"Proposal Title",3600,true'
      },
      {
        contract_name: "SimpleToken",
        arguments: '"MyToken","MTK",18,1000000'
      },
      {
        contract_name: "MultiSigWallet",
        arguments: '["0x1234567890123456789012345678901234567890","0x0987654321098765432109876543210987654321"],2'
      }
    ];
  }
} 