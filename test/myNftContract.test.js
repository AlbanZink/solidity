const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTContract", function () {
    let NFTContract, nftContract, owner, addr1, addr2;
    const priceFeed = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // This is an example Chainlink price feed address for ETH/USD on the Rinkeby testnet.

    beforeEach(async function () {
        NFTContract = await ethers.getContractFactory("NFTContract");
        [owner, addr1, addr2, _] = await ethers.getSigners();
        nftContract = await NFTContract.deploy(priceFeed);
        await nftContract.deployed();
    });

    it("Should mint a new NFT when buyNFT is called", async function () {
        await addr1.sendTransaction({ to: nftContract.address, value: ethers.utils.parseEther("1.0") });
        expect(await nftContract.getMyNFTs({ from: addr1.address })).to.have.lengthOf(1);
    });

    it("Should increase the price for each additional NFT", async function () {
        await addr1.sendTransaction({ to: nftContract.address, value: ethers.utils.parseEther("2.0") });
        await addr1.sendTransaction({ to: nftContract.address, value: ethers.utils.parseEther("3.0") });
        const prices = await Promise.all(
            (await nftContract.getMyNFTs({ from: addr1.address })).map((id) => nftContract.getPrice(id))
        );
        expect(prices[0]).to.be.lessThan(prices[1]);
    });

    it("Should fail if the sent value is too low", async function () {
        await expect(
            addr1.sendTransaction({ to: nftContract.address, value: ethers.utils.parseEther("0.0001") })
        ).to.be.revertedWith("Insufficient ETH to buy NFT");
    });

    it("Should return the correct price for an NFT", async function () {
        await addr1.sendTransaction({ to: nftContract.address, value: ethers.utils.parseEther("1.0") });
        const nftId = (await nftContract.getMyNFTs({ from: addr1.address }))[0];
        expect(await nftContract.getPrice(nftId)).to.be.above(0);
    });
});
