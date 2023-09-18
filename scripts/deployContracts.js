const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Deploy MockUSDC
    const initialSupply = hre.ethers.utils.parseUnits("1000000", 6); 
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy(initialSupply);
    await mockUSDC.deployed();
    console.log("MockUSDC deployed to:", mockUSDC.address);

    // Use the MockUSDC address to deploy USDCBill
    const billAmount = hre.ethers.utils.parseUnits("500", 6); // Example amount
    const USDCBill = await hre.ethers.getContractFactory("USDCBill");
    const usdcBill = await USDCBill.deploy(billAmount, 0, mockUSDC.address);
    await usdcBill.deployed();
    console.log("USDCBill deployed to:", usdcBill.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
