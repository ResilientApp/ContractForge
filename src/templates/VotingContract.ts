import type { ContractTemplate } from './index';

const VotingTemplate: ContractTemplate = {
  id: 'voting-contract',
  name: 'Voting Contract',
  description: 'Decentralized voting system where users can create proposals and vote on them. Includes proposal tracking, voting periods, and result tallying.',
  category: 'dao',
  icon: 'Vote',
  difficulty: 'intermediate',
  tags: ['Voting', 'DAO', 'Governance', 'Proposals'],
  parameters: [
    {
      name: 'contractName',
      label: 'Contract Name',
      type: 'string',
      description: 'Name of the voting contract',
      required: true,
      placeholder: 'DAOVoting',
    },
    {
      name: 'votingDuration',
      label: 'Default Voting Duration (seconds)',
      type: 'number',
      description: 'Default duration for voting periods',
      defaultValue: 604800,
      required: true,
      validation: { min: 3600 },
    },
  ],
  generateCode: (params) => {
    const { contractName, votingDuration } = params;
    return `pragma solidity >= 0.5.0;

/**
 * @title ${contractName}
 * @dev Decentralized voting system for proposals
 * @notice Users can create and vote on proposals
 */
contract ${contractName} {
    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    address public owner;
    uint256 public proposalCount;
    uint256 public defaultVotingDuration = ${votingDuration};
    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public voters;
    
    event ProposalCreated(uint256 indexed proposalId, string description, uint256 endTime);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event VoterRegistered(address indexed voter);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyRegisteredVoter() {
        require(voters[msg.sender], "Not a registered voter");
        _;
    }
    
    /**
     * @dev Constructor sets the contract owner
     */
    constructor() public {
        owner = msg.sender;
        voters[msg.sender] = true;
    }
    
    /**
     * @dev Register a voter
     * @param _voter Address to register as voter
     */
    function registerVoter(address _voter) public onlyOwner {
        require(_voter != address(0), "Invalid voter address");
        require(!voters[_voter], "Voter already registered");
        
        voters[_voter] = true;
        emit VoterRegistered(_voter);
    }
    
    /**
     * @dev Create a new proposal
     * @param _description Description of the proposal
     * @param _duration Duration for voting (0 uses default)
     */
    function createProposal(string memory _description, uint256 _duration) public onlyOwner returns (uint256) {
        uint256 duration = _duration > 0 ? _duration : defaultVotingDuration;
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.description = _description;
        proposal.endTime = block.timestamp + duration;
        proposal.executed = false;
        proposal.yesVotes = 0;
        proposal.noVotes = 0;
        
        emit ProposalCreated(proposalCount, _description, proposal.endTime);
        return proposalCount;
    }
    
    /**
     * @dev Vote on a proposal
     * @param _proposalId ID of the proposal to vote on
     * @param _support True for yes, false for no
     */
    function vote(uint256 _proposalId, bool _support) public onlyRegisteredVoter {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp < proposal.endTime, "Voting period has ended");
        require(!proposal.hasVoted[msg.sender], "Already voted on this proposal");
        
        proposal.hasVoted[msg.sender] = true;
        
        if (_support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }
        
        emit Voted(_proposalId, msg.sender, _support);
    }
    
    /**
     * @dev Execute a proposal after voting period
     * @param _proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp >= proposal.endTime, "Voting period has not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        bool passed = proposal.yesVotes > proposal.noVotes;
        
        emit ProposalExecuted(_proposalId, passed);
    }
    
    /**
     * @dev Get proposal details
     * @param _proposalId ID of the proposal
     */
    function getProposal(uint256 _proposalId) public view returns (
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 endTime,
        bool executed
    ) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        
        return (
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.endTime,
            proposal.executed
        );
    }
    
    /**
     * @dev Check if an address has voted on a proposal
     * @param _proposalId ID of the proposal
     * @param _voter Address to check
     */
    function hasVoted(uint256 _proposalId, address _voter) public view returns (bool) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Invalid proposal ID");
        return proposals[_proposalId].hasVoted[_voter];
    }
}`;
  },
};

export default VotingTemplate;
