const hre = require('hardhat');
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const receiverAddress = "0xc553E06A2aDa2730dee8f439Bf6598A00B0dA5EB";
  const amountToSend = hre.ethers.utils.parseEther("100"); // Send 1 ETH

  // Send ETH to the receiver
  const tx = await deployer.sendTransaction({
    to: receiverAddress,
    value: amountToSend,
  });

  await tx.wait();

  console.log(`Sent ${hre.ethers.utils.formatEther(amountToSend)} ETH to ${receiverAddress}`);

  console.log('Deploying contracts with the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  // Deploy MockUSDC
  const initialSupply = hre.ethers.utils.parseUnits('1000000', 6);
  const MockUSDC = await hre.ethers.getContractFactory('MockUSDC');
  const mockUSDC = await MockUSDC.deploy(initialSupply);
  await mockUSDC.deployed();
  console.log('MockUSDC deployed to:', mockUSDC.address);

  // Send MockUSDC to receiving address for testing
  const usdcAmountToSend = hre.ethers.utils.parseUnits("100", 6); // Send 100 tokens with 6 decimal places

  // Get the ERC20 token contract instance
  const erc20Token = await hre.ethers.getContractAt("MockUSDC", mockUSDC.address);

  // Check the deployer's token balance
  const deployerBalanceBefore = await erc20Token.balanceOf(deployer.address);
  console.log(`Deployer's ERC20 Token Balance Before: ${deployerBalanceBefore.toString()}`);

  // Send ERC20 tokens to the receiver
  const usdcTx = await erc20Token.transfer(receiverAddress, usdcAmountToSend);

  // Wait for the transaction to be mined
  await usdcTx.wait();

  // Check the deployer's token balance after the transfer
  const deployerBalanceAfter = await erc20Token.balanceOf(deployer.address);
  console.log(`Deployer's ERC20 Token Balance After: ${deployerBalanceAfter.toString()}`);

  console.log(`Sent ${usdcAmountToSend.toString()} ERC20 tokens to ${receiverAddress}`);

  // Use the MockUSDC address to deploy USDCBill
  const billAmount = hre.ethers.utils.parseUnits('500', 6); // Example amount
  const USDCBill = await hre.ethers.getContractFactory('USDCBill');
  const usdcBill = await USDCBill.deploy(billAmount, 0, mockUSDC.address);
  await usdcBill.deployed();
  console.log('USDCBill deployed to:', usdcBill.address);

  saveFrontendFiles(usdcBill);
}

function saveFrontendFiles(usdcBill) {
  const fs = require('fs');
  const contractsDir = path.join(
    __dirname,
    '..',
    'frontend',
    'src',
    'contracts'
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, 'usdcBill-address.json'),
    JSON.stringify({ USDCBill: usdcBill.address }, undefined, 2)
  );

  const USDCBillArtifact = artifacts.readArtifactSync('USDCBill');

  fs.writeFileSync(
    path.join(contractsDir, 'USDCBill.json'),
    JSON.stringify(USDCBillArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
