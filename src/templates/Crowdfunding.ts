import type { ContractTemplate } from './index';

const CrowdfundingTemplate: ContractTemplate = {
  id: 'crowdfunding',
  name: 'Crowdfunding Campaign',
  description: 'Crowdfunding contract for raising funds with goals, deadlines, and automatic refunds if goal is not met. Perfect for project funding and ICOs.',
  category: 'defi',
  icon: 'TrendingUp',
  difficulty: 'intermediate',
  tags: ['Crowdfunding', 'DeFi', 'Fundraising', 'Campaign'],
  parameters: [
    {
      name: 'contractName',
      label: 'Campaign Name',
      type: 'string',
      description: 'Name of your crowdfunding campaign',
      required: true,
      placeholder: 'MyCampaign',
    },
    {
      name: 'fundingGoal',
      label: 'Funding Goal (wei)',
      type: 'number',
      description: 'Target amount to raise in wei',
      required: true,
      placeholder: '1000000000000000000',
      validation: { min: 1 },
    },
    {
      name: 'durationDays',
      label: 'Campaign Duration (days)',
      type: 'number',
      description: 'How many days the campaign should run',
      defaultValue: 30,
      required: true,
      validation: { min: 1, max: 365 },
    },
  ],
  generateCode: (params) => {
    const { contractName, fundingGoal, durationDays } = params;
    const durationSeconds = durationDays * 24 * 60 * 60;
    return `pragma solidity >= 0.5.0;

/**
 * @title ${contractName}
 * @dev Crowdfunding contract with goal and deadline
 * @notice Campaign runs for ${durationDays} days with a goal of ${fundingGoal} wei
 */
contract ${contractName} {
    address public creator;
    uint256 public fundingGoal = ${fundingGoal};
    uint256 public deadline;
    uint256 public amountRaised;
    bool public fundingGoalReached = false;
    bool public campaignClosed = false;
    
    mapping(address => uint256) public contributions;
    address[] public contributors;
    
    event FundTransfer(address indexed backer, uint256 amount, bool isContribution);
    event GoalReached(address recipient, uint256 totalAmountRaised);
    event FundingGoalReached(bool reached);
    
    modifier afterDeadline() {
        require(block.timestamp >= deadline, "Campaign is still active");
        _;
    }
    
    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this function");
        _;
    }
    
    /**
     * @dev Constructor initializes the campaign
     */
    constructor() public {
        creator = msg.sender;
        deadline = block.timestamp + ${durationSeconds};
    }
    
    /**
     * @dev Contribute to the campaign
     */
    function contribute() public payable {
        require(!campaignClosed, "Campaign has been closed");
        require(block.timestamp < deadline, "Campaign has ended");
        require(msg.value > 0, "Contribution must be greater than 0");
        
        if (contributions[msg.sender] == 0) {
            contributors.push(msg.sender);
        }
        
        contributions[msg.sender] += msg.value;
        amountRaised += msg.value;
        
        emit FundTransfer(msg.sender, msg.value, true);
        
        if (amountRaised >= fundingGoal && !fundingGoalReached) {
            fundingGoalReached = true;
            emit FundingGoalReached(true);
        }
    }
    
    /**
     * @dev Check if goal was reached and transfer funds
     */
    function checkGoalReached() public afterDeadline {
        require(!campaignClosed, "Campaign already closed");
        
        if (amountRaised >= fundingGoal) {
            fundingGoalReached = true;
            emit GoalReached(creator, amountRaised);
        }
        
        campaignClosed = true;
    }
    
    /**
     * @dev Withdraw funds if goal was reached
     */
    function withdrawFunds() public onlyCreator afterDeadline {
        require(campaignClosed, "Campaign not yet closed");
        require(fundingGoalReached, "Funding goal not reached");
        
        uint256 amount = address(this).balance;
        if (amount > 0) {
            msg.sender.transfer(amount);
            emit FundTransfer(msg.sender, amount, false);
        }
    }
    
    /**
     * @dev Get refund if goal was not reached
     */
    function getRefund() public afterDeadline {
        require(campaignClosed, "Campaign not yet closed");
        require(!fundingGoalReached, "Funding goal was reached");
        require(contributions[msg.sender] > 0, "No contribution to refund");
        
        uint256 amount = contributions[msg.sender];
        contributions[msg.sender] = 0;
        
        msg.sender.transfer(amount);
        emit FundTransfer(msg.sender, amount, false);
    }
    
    /**
     * @dev Get campaign status
     */
    function getCampaignStatus() public view returns (
        uint256 _amountRaised,
        uint256 _fundingGoal,
        uint256 _deadline,
        bool _fundingGoalReached,
        bool _campaignClosed
    ) {
        return (
            amountRaised,
            fundingGoal,
            deadline,
            fundingGoalReached,
            campaignClosed
        );
    }
    
    /**
     * @dev Get contribution amount for an address
     * @param _contributor Address to check
     */
    function getContribution(address _contributor) public view returns (uint256) {
        return contributions[_contributor];
    }
    
    /**
     * @dev Get total number of contributors
     */
    function getContributorCount() public view returns (uint256) {
        return contributors.length;
    }
    
    /**
     * @dev Get time remaining in campaign
     */
    function getTimeRemaining() public view returns (uint256) {
        if (block.timestamp >= deadline) {
            return 0;
        }
        return deadline - block.timestamp;
    }
}`;
  },
};

export default CrowdfundingTemplate;
