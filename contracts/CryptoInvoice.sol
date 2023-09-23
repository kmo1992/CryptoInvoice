// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
}

contract CryptoInvoice {
    enum InvoiceStatus {
        Opened,
        Accepted,
        Cancelled
    }

    struct Invoice {
        address payable seller;
        uint256 amount;
        InvoiceStatus status;
    }

    mapping(uint256 => Invoice) public invoices;
    uint256 public invoiceCount = 0;

    IERC20 public usdc;

    event InvoiceOpened(uint256 invoiceId, address seller, uint256 amount);
    event InvoiceAccepted(uint256 invoiceId, address payer);
    event InvoiceCancelled(uint256 invoiceId);

    constructor(address _usdcAddress) {
        usdc = IERC20(_usdcAddress);
    }

    function openInvoice(uint256 _amount) external {
        require(_amount > 0, "Amount should be greater than 0");

        invoiceCount++;
        invoices[invoiceCount] = Invoice({
            seller: payable(msg.sender),
            amount: _amount,
            status: InvoiceStatus.Opened
        });

        emit InvoiceOpened(invoiceCount, msg.sender, _amount);
    }

    function acceptInvoice(uint256 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(
            invoice.status == InvoiceStatus.Opened,
            "Invoice is not in 'Opened' state"
        );

        invoice.status = InvoiceStatus.Accepted;

        // Transfer USDC from the payer to the seller
        require(
            usdc.transferFrom(msg.sender, invoice.seller, invoice.amount),
            "USDC transfer failed"
        );

        emit InvoiceAccepted(_invoiceId, msg.sender);
    }

    function cancelInvoice(uint256 _invoiceId) external {
        Invoice storage invoice = invoices[_invoiceId];
        require(
            invoice.status == InvoiceStatus.Opened,
            "Invoice is not in 'Opened' state"
        );
        require(
            invoice.seller == msg.sender,
            "Only the seller can cancel the invoice"
        );

        invoice.status = InvoiceStatus.Cancelled;

        emit InvoiceCancelled(_invoiceId);
    }
}
