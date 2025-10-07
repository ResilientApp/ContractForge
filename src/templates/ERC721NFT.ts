import type { ContractTemplate } from './index';

const ERC721Template: ContractTemplate = {
  id: 'erc721-nft',
  name: 'ERC721 NFT',
  description: 'Non-fungible token (NFT) contract for unique digital assets. Each token has a unique ID and can represent art, collectibles, or any unique item.',
  category: 'nft',
  icon: 'Image',
  difficulty: 'intermediate',
  tags: ['ERC721', 'NFT', 'Non-Fungible', 'Collectible'],
  parameters: [
    {
      name: 'nftName',
      label: 'NFT Collection Name',
      type: 'string',
      description: 'Name of your NFT collection',
      required: true,
      placeholder: 'My NFT Collection',
    },
    {
      name: 'nftSymbol',
      label: 'NFT Symbol',
      type: 'string',
      description: 'Short symbol for your NFT collection',
      required: true,
      placeholder: 'MNFT',
    },
    {
      name: 'baseURI',
      label: 'Base Token URI',
      type: 'string',
      description: 'Base URI for token metadata',
      required: false,
      placeholder: 'https://api.example.com/metadata/',
    },
  ],
  generateCode: (params) => {
    const { nftName, nftSymbol, baseURI = '' } = params;
    return `pragma solidity >= 0.5.0;

/**
 * @title ${nftName}
 * @dev ERC721 Non-Fungible Token implementation
 * @notice NFT contract for unique digital assets
 */
contract ${nftSymbol}NFT {
    string public name = "${nftName}";
    string public symbol = "${nftSymbol}";
    string public baseTokenURI = "${baseURI}";
    
    uint256 public tokenCounter;
    address public owner;
    
    mapping(uint256 => address) public tokenOwner;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public tokenApprovals;
    mapping(address => mapping(address => bool)) public operatorApprovals;
    
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor sets the contract owner
     */
    constructor() public {
        owner = msg.sender;
        tokenCounter = 0;
    }
    
    /**
     * @dev Mint a new NFT
     * @param _to Address to mint the NFT to
     */
    function mint(address _to) public onlyOwner returns (uint256) {
        require(_to != address(0), "ERC721: mint to the zero address");
        
        uint256 tokenId = tokenCounter;
        tokenCounter++;
        
        tokenOwner[tokenId] = _to;
        balanceOf[_to]++;
        
        emit Transfer(address(0), _to, tokenId);
        return tokenId;
    }
    
    /**
     * @dev Get the owner of a token
     * @param _tokenId Token ID to query
     */
    function ownerOf(uint256 _tokenId) public view returns (address) {
        address tokenOwnerAddress = tokenOwner[_tokenId];
        require(tokenOwnerAddress != address(0), "ERC721: owner query for nonexistent token");
        return tokenOwnerAddress;
    }
    
    /**
     * @dev Transfer token to another address
     * @param _to Address to transfer to
     * @param _tokenId Token ID to transfer
     */
    function transfer(address _to, uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "ERC721: transfer of token that is not own");
        require(_to != address(0), "ERC721: transfer to the zero address");
        
        balanceOf[msg.sender]--;
        balanceOf[_to]++;
        tokenOwner[_tokenId] = _to;
        
        emit Transfer(msg.sender, _to, _tokenId);
    }
    
    /**
     * @dev Approve another address to transfer the given token ID
     * @param _to Address to be approved
     * @param _tokenId Token ID to be approved
     */
    function approve(address _to, uint256 _tokenId) public {
        address tokenOwnerAddress = ownerOf(_tokenId);
        require(_to != tokenOwnerAddress, "ERC721: approval to current owner");
        require(msg.sender == tokenOwnerAddress, "ERC721: approve caller is not owner");
        
        tokenApprovals[_tokenId] = _to;
        emit Approval(tokenOwnerAddress, _to, _tokenId);
    }
    
    /**
     * @dev Get token URI for metadata
     * @param _tokenId Token ID to query
     */
    function tokenURI(uint256 _tokenId) public view returns (string memory) {
        require(tokenOwner[_tokenId] != address(0), "ERC721: URI query for nonexistent token");
        return string(abi.encodePacked(baseTokenURI, uint2str(_tokenId)));
    }
    
    /**
     * @dev Convert uint to string
     */
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(j - j / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            j /= 10;
        }
        return string(bstr);
    }
}`;
  },
};

export default ERC721Template;
