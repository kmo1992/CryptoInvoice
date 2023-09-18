// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract USDCBill {
    address public receiver;
    uint256 public amountDue;
    uint256 public dueDate;
    IERC20 public usdcToken;

    constructor(
        uint256 _amountDue,
        uint256 _dueDate,
        address _usdcTokenAddress
    ) {
        receiver = msg.sender;
        amountDue = _amountDue;
        dueDate = _dueDate;
        usdcToken = IERC20(_usdcTokenAddress);
    }

    function payBill(address payer) external {
        require(block.timestamp <= dueDate, "Bill is expired");
        require(
            usdcToken.allowance(payer, address(this)) >= amountDue,
            "Not enough allowance"
        );

        usdcToken.transferFrom(payer, receiver, amountDue);

        amountDue = 0;
    }
}
