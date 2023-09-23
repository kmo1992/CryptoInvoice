const { expect } = require("chai");

describe("CryptoInvoice", function() {
  let CryptoInvoice, cryptoInvoice, MockUSDC, mockUSDC, owner, addr1, addr2;

  beforeEach(async () => {
    // Deploy MockUSDC
    MockUSDC = await ethers.getContractFactory("MockUSDC");
    initialSupply = ethers.utils.parseUnits("0", 6); // 1 million MockUSDC with 6 decimals
    mockUSDC = await MockUSDC.deploy(initialSupply);

    // Deploy CryptoInvoice with the address of MockUSDC
    CryptoInvoice = await ethers.getContractFactory("CryptoInvoice");
    cryptoInvoice = await CryptoInvoice.deploy(mockUSDC.address);
    await cryptoInvoice.deployed();

    // Set up signers
    [owner, addr1, addr2] = await ethers.getSigners();
  });

  describe("openInvoice", function() {
    it("should create a new opened invoice", async function() {
      await cryptoInvoice.openInvoice(1000);
      const invoice = await cryptoInvoice.invoices(1);
      expect(invoice.seller).to.equal(owner.address);
      expect(invoice.amount).to.equal(1000);
      expect(invoice.status).to.equal(0); // 0 is for Opened
    });
  });

  describe("acceptInvoice", function() {
    it("should allow an invoice to be accepted and transfer funds", async function() {

      invoiceAmount = ethers.utils.parseUnits("100", 6);  
      await cryptoInvoice.openInvoice(invoiceAmount);

      // Approve the funds and accept the invoice
      await mockUSDC.mint(addr1.address, invoiceAmount);
      await mockUSDC.connect(addr1).approve(cryptoInvoice.address, invoiceAmount);
      await cryptoInvoice.connect(addr1).acceptInvoice(1);

      const invoice = await cryptoInvoice.invoices(1);
      expect(invoice.status).to.equal(1); // 1 is for Accepted
      expect(await mockUSDC.balanceOf(owner.address)).to.equal(invoiceAmount);
    });
  });

  describe("cancelInvoice", function() {
    it("should allow the seller to cancel the invoice", async function() {
      await cryptoInvoice.openInvoice(1000);
      await cryptoInvoice.cancelInvoice(1);

      const invoice = await cryptoInvoice.invoices(1);
      expect(invoice.status).to.equal(2); // 2 is for Cancelled
    });

    it("should not allow others to cancel the invoice", async function() {
      await cryptoInvoice.openInvoice(1000);
      
      await expect(cryptoInvoice.connect(addr1).cancelInvoice(1)).to.be.revertedWith("Only the seller can cancel the invoice");
    });
  });
});
