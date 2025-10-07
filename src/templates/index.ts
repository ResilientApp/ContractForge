export interface TemplateParameter {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'address';
  description: string;
  defaultValue?: string | number | boolean;
  required: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'token' | 'nft' | 'dao' | 'defi' | 'utility';
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  parameters: TemplateParameter[];
  generateCode: (params: Record<string, any>) => string;
  tags: string[];
}

import ERC20Template from './ERC20Token';
import ERC721Template from './ERC721NFT';
import VotingTemplate from './VotingContract';
import MultiSigTemplate from './MultiSigWallet';
import CrowdfundingTemplate from './Crowdfunding';

export { ERC20Template, ERC721Template, VotingTemplate, MultiSigTemplate, CrowdfundingTemplate };

export const getAllTemplates = (): ContractTemplate[] => {
  return [
    ERC20Template,
    ERC721Template,
    VotingTemplate,
    MultiSigTemplate,
    CrowdfundingTemplate,
  ];
};

export const getTemplateById = (id: string): ContractTemplate | undefined => {
  return getAllTemplates().find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): ContractTemplate[] => {
  return getAllTemplates().filter(template => template.category === category);
};
