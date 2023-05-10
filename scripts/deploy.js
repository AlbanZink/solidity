async function main() {
    const NFTContract = await ethers.getContractFactory("NFTContract");
    const nftContract = await NFTContract.deploy("0x9326BFA02ADD2366b30bacB125260Af641031331"); // replace with the correct address
    console.log("Contract deployed to:", nftContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });
