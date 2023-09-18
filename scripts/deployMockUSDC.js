const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const initialSupply = hre.ethers.utils.parseUnits("1000000", 6); // 1 million MockUSDC with 6 decimals
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy(initialSupply);

  await mockUSDC.deployed();

  console.log("MockUSDC deployed to:", mockUSDC.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
