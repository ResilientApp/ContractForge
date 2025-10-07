import type { ContractTemplate } from './index';

const MultiSigTemplate: ContractTemplate = {
  id: 'multisig-wallet',
  name: 'Multi-Signature Wallet',
  description: 'Secure wallet requiring multiple signatures to execute transactions. Perfect for shared funds, DAOs, or organizations requiring multi-party approval.',
  category: 'utility',
  icon: 'Shield',
  difficulty: 'advanced',
  tags: ['MultiSig', 'Wallet', 'Security', 'Multi-Signature'],
  parameters: [
    {
      name: 'contractName',
      label: 'Contract Name',
      type: 'string',
      description: 'Name of the multi-sig wallet',
      required: true,
      placeholder: 'MultiSigWallet',
    },
    {
      name: 'requiredSignatures',
      label: 'Required Signatures',
      type: 'number',
      description: 'Number of signatures required to execute transactions',
      defaultValue: 2,
      required: true,
      validation: { min: 1, max: 10 },
    },
  ],
  generateCode: (params) => {
    const { contractName, requiredSignatures } = params;
    return `pragma solidity >= 0.5.0;

/**
 * @title ${contractName}
 * @dev Multi-signature wallet requiring multiple confirmations
 * @notice Requires ${requiredSignatures} signatures to execute transactions
 */
contract ${contractName} {
    struct Transaction {
        address destination;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmationCount;
    }
    
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public requiredSignatures = ${requiredSignatures};
    
    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;
    
    event Deposit(address indexed sender, uint256 value);
    event Submission(uint256 indexed transactionId);
    event Confirmation(address indexed sender, uint256 indexed transactionId);
    event Revocation(address indexed sender, uint256 indexed transactionId);
    event Execution(uint256 indexed transactionId);
    event ExecutionFailure(uint256 indexed transactionId);
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }
    
    modifier transactionExists(uint256 _transactionId) {
        require(_transactionId < transactions.length, "Transaction does not exist");
        _;
    }
    
    modifier notExecuted(uint256 _transactionId) {
        require(!transactions[_transactionId].executed, "Transaction already executed");
        _;
    }
    
    modifier notConfirmed(uint256 _transactionId) {
        require(!confirmations[_transactionId][msg.sender], "Transaction already confirmed");
        _;
    }
    
    /**
     * @dev Constructor sets initial owners
     * @param _owners Array of initial owner addresses
     */
    constructor(address[] memory _owners) public {
        require(_owners.length > 0, "Owners required");
        require(_owners.length >= requiredSignatures, "Not enough owners for required signatures");
        
        for (uint256 i = 0; i < _owners.length; i++) {
            require(_owners[i] != address(0), "Invalid owner address");
            require(!isOwner[_owners[i]], "Duplicate owner");
            
            isOwner[_owners[i]] = true;
            owners.push(_owners[i]);
        }
    }
    
    /**
     * @dev Fallback function allows to deposit ether
     */
    function() external payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
    }
    
    /**
     * @dev Submit a new transaction
     * @param _destination Transaction target address
     * @param _value Transaction ether value
     * @param _data Transaction data payload
     */
    function submitTransaction(address _destination, uint256 _value, bytes memory _data) 
        public onlyOwner returns (uint256) {
        uint256 transactionId = transactions.length;
        
        transactions.push(Transaction({
            destination: _destination,
            value: _value,
            data: _data,
            executed: false,
            confirmationCount: 0
        }));
        
        emit Submission(transactionId);
        confirmTransaction(transactionId);
        
        return transactionId;
    }
    
    /**
     * @dev Confirm a transaction
     * @param _transactionId Transaction ID
     */
    function confirmTransaction(uint256 _transactionId)
        public
        onlyOwner
        transactionExists(_transactionId)
        notConfirmed(_transactionId)
    {
        confirmations[_transactionId][msg.sender] = true;
        transactions[_transactionId].confirmationCount++;
        
        emit Confirmation(msg.sender, _transactionId);
        
        if (isConfirmed(_transactionId)) {
            executeTransaction(_transactionId);
        }
    }
    
    /**
     * @dev Revoke a confirmation
     * @param _transactionId Transaction ID
     */
    function revokeConfirmation(uint256 _transactionId)
        public
        onlyOwner
        transactionExists(_transactionId)
        notExecuted(_transactionId)
    {
        require(confirmations[_transactionId][msg.sender], "Transaction not confirmed");
        
        confirmations[_transactionId][msg.sender] = false;
        transactions[_transactionId].confirmationCount--;
        
        emit Revocation(msg.sender, _transactionId);
    }
    
    /**
     * @dev Execute a confirmed transaction
     * @param _transactionId Transaction ID
     */
    function executeTransaction(uint256 _transactionId)
        public
        onlyOwner
        transactionExists(_transactionId)
        notExecuted(_transactionId)
    {
        require(isConfirmed(_transactionId), "Not enough confirmations");
        
        Transaction storage transaction = transactions[_transactionId];
        transaction.executed = true;
        
        (bool success, ) = transaction.destination.call.value(transaction.value)(transaction.data);
        if (success) {
            emit Execution(_transactionId);
        } else {
            emit ExecutionFailure(_transactionId);
            transaction.executed = false;
        }
    }
    
    /**
     * @dev Check if transaction is confirmed
     * @param _transactionId Transaction ID
     */
    function isConfirmed(uint256 _transactionId) public view returns (bool) {
        return transactions[_transactionId].confirmationCount >= requiredSignatures;
    }
    
    /**
     * @dev Get transaction count
     */
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
    
    /**
     * @dev Get owner count
     */
    function getOwnerCount() public view returns (uint256) {
        return owners.length;
    }
}`;
  },
};

export default MultiSigTemplate;
