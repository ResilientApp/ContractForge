import type { ContractTemplate } from './index';

const ERC20Template: ContractTemplate = {
  id: 'erc20-token',
  name: 'ERC20 Token',
  description: 'Standard fungible token contract with transfer, approval, and balance tracking functionality. Perfect for creating cryptocurrencies, reward points, or utility tokens.',
  category: 'token',
  icon: 'Coins',
  difficulty: 'beginner',
  tags: ['ERC20', 'Token', 'Fungible', 'Standard'],
  parameters: [
    {
      name: 'tokenName',
      label: 'Token Name',
      type: 'string',
      description: 'The full name of your token',
      required: true,
      placeholder: 'My Token',
    },
    {
      name: 'tokenSymbol',
      label: 'Token Symbol',
      type: 'string',
      description: 'Short symbol for your token (3-5 characters)',
      required: true,
      placeholder: 'MTK',
    },
    {
      name: 'decimals',
      label: 'Decimals',
      type: 'number',
      description: 'Number of decimal places (typically 18)',
      defaultValue: 18,
      required: true,
      validation: { min: 0, max: 18 },
    },
    {
      name: 'initialSupply',
      label: 'Initial Supply',
      type: 'number',
      description: 'Total initial supply of tokens',
      required: true,
      placeholder: '1000000',
      validation: { min: 1 },
    },
  ],
  generateCode: (params) => {
    const { tokenName, tokenSymbol, decimals, initialSupply } = params;
    return `pragma solidity >= 0.5.0;

/**
 * @title ${tokenName}
 * @dev ERC20 Token implementation
 * @notice This is a standard ERC20 token contract
 */
contract ${tokenSymbol}Token {
    string public name = "${tokenName}";
    string public symbol = "${tokenSymbol}";
    uint8 public decimals = ${decimals};
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    /**
     * @dev Constructor that gives msg.sender all of the initial supply
     */
    constructor() public {
        totalSupply = ${initialSupply} * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    /**
     * @dev Transfer tokens to a specified address
     * @param _to The address to transfer to
     * @param _value The amount to be transferred
     */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[msg.sender] >= _value, "ERC20: insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    /**
     * @dev Approve the passed address to spend the specified amount of tokens
     * @param _spender The address which will spend the funds
     * @param _value The amount of tokens to be spent
     */
    function approve(address _spender, uint256 _value) public returns (bool) {
        require(_spender != address(0), "ERC20: approve to the zero address");
        
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another
     * @param _from The address which you want to send tokens from
     * @param _to The address which you want to transfer to
     * @param _value The amount of tokens to be transferred
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[_from] >= _value, "ERC20: insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "ERC20: insufficient allowance");
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}`;
  },
};

export default ERC20Template;
