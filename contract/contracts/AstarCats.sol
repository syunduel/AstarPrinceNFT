// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract AstarCats is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string baseURI = "";
    string public baseExtension = ".json";
    uint256 private preCost = 2 ether;
    uint256 private publicCost = 3 ether;
    uint256 public maxSupply = 7777;
    uint256 public publicMaxMintAmount = 10;
    bool public paused = true;
    bool public revealed = false;
    bool public presale = true;
    string public notRevealedUri;
    uint256 private whiteListCount = 0;
    mapping(address => uint256) private whiteLists;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initNotRevealedUri
    ) ERC721(_name, _symbol) {
        setNotRevealedURI(_initNotRevealedUri);
    }

    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function publicMint(uint256 _mintAmount) public payable {
        uint256 supply = totalSupply();
        uint256 cost = publicCost * _mintAmount;
        mintCheck(_mintAmount, supply, cost);
        require(_mintAmount <= publicMaxMintAmount, "mint limit over");

        for (uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function preMint(uint256 _mintAmount) public payable {
        uint256 supply = totalSupply();
        uint256 cost = preCost * _mintAmount;
        mintCheck(_mintAmount, supply, cost);
        require(presale, "This time is not presale");
        require(whiteLists[msg.sender] >= _mintAmount, "Can not whitelist");

        for (uint256 i = 1; i <= _mintAmount; i++) {
            _safeMint(msg.sender, supply + i);
            whiteLists[msg.sender]--;
        }
    }

    function mintCheck(
        uint256 _mintAmount,
        uint256 supply,
        uint256 cost
    ) private view {
        require(!paused, "Cats are lazy, call to wake them up");
        require(_mintAmount > 0, "Mint amount is 0");
        require(supply + _mintAmount <= maxSupply, "End of supply");
        require(msg.value >= cost, "Not enough funds for mint");
    }

    function ownerMint(uint256 count) public onlyOwner {
        uint256 supply = totalSupply();

        for (uint256 i = 1; i < count; i++) {
            _safeMint(msg.sender, supply + i);
        }
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if (revealed == false) {
            return notRevealedUri;
        }

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    function reveal() public onlyOwner {
        revealed = true;
    }

    function is_revealed() public view returns (bool) {
        return revealed;
    }

    function setPresale(bool _state) public onlyOwner {
        presale = _state;
    }

    function is_presale() public view returns (bool) {
        return presale;
    }

    function getCurrentCost() public view returns (uint256) {
        if (presale) {
            return preCost;
        } else {
            return publicCost;
        }
    }

    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedUri = _notRevealedURI;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension)
        public
        onlyOwner
    {
        baseExtension = _newBaseExtension;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function is_paused() public view returns (bool) {
        return paused;
    }

    function deleteWL(address addr) public virtual onlyOwner {
        whiteListCount = whiteListCount - whiteLists[addr];
        delete (whiteLists[addr]);
    }

    function upsertWL(address addr, uint256 maxMint) public virtual onlyOwner {
        whiteListCount = whiteListCount - whiteLists[addr];
        whiteLists[addr] = maxMint;
        whiteListCount = whiteListCount + maxMint;
    }

    function pushMultiWL(address[] memory list) public virtual onlyOwner {
        for (uint256 i = 0; i < list.length; i++) {
            whiteLists[list[i]]++;
            whiteListCount++;
        }
    }

    function getWhiteListCount() public view returns (uint256) {
        return whiteListCount;
    }
}
