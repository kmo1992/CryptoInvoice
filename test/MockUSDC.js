const { expect } = require("chai");

describe("MockUSDC", function() {
  it("Should deploy correctly and have the right initial balance", async function() {
    const [deployer] = await ethers.getSigners(); // Fetch the deployer address
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const initialSupply = ethers.utils.parseUnits("1000000", 6); // 1 million MockUSDC with 6 decimals
    const mockUSDC = await MockUSDC.deploy(initialSupply);
    
    await mockUSDC.deployed();

    expect(await mockUSDC.totalSupply()).to.equal(initialSupply);
    expect(await mockUSDC.balanceOf(deployer.address)).to.equal(initialSupply); // Corrected this line
  });
});
