// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTContract is ERC721, Ownable {
    uint256 public nftCount = 0;
    mapping(address => uint256[]) public ownerToNFTs;
    mapping(uint256 => uint256) public nftToPrice;
    AggregatorV3Interface internal priceFeed;

    constructor(address _priceFeed) ERC721("MyNFT", "MNFT") {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getLatestPrice() public view returns (int) {
        (,int price,,,) = priceFeed.latestRoundData();
        return price;
    }

    function buyNFT() external payable {
        int latestPrice = getLatestPrice();
        uint256 price = (ownerToNFTs[msg.sender].length + 1) * uint256(latestPrice);
        require(msg.value >= price, "Insufficient ETH to buy NFT");

        uint256 newItemId = nftCount++;
        _mint(msg.sender, newItemId);
        ownerToNFTs[msg.sender].push(newItemId);
        nftToPrice[newItemId] = price;

        if (msg.value > price)
            payable(msg.sender).transfer(msg.value - price);

        payable(owner()).transfer(price);
    }

    function getMyNFTs() external view returns (uint256[] memory) {
        return ownerToNFTs[msg.sender];
    }

    function getPrice(uint256 _nftId) external view returns (uint256) {
        return nftToPrice[_nftId];
    }
}