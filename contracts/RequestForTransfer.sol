// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (uint256);
}

contract RequestForTransfer {
    // Structure to represent a transfer request
    struct TransferRequest {
        address requester; // The user requesting the transfer
        address from; // The wallet from which funds will be transferred
        uint256 amount; // The amount to be transferred
        bool approved; // Whether the transfer request has been approved or not
        bool canceled; // Whether the transfer request has been canceled or not
        string message; // A message or note attached to the transfer request
    }

    IERC20 public usdc;
    TransferRequest[] public requests;

    // Mappings to store request IDs by requester and "from" addresses
    mapping(address => uint256[]) public requestsByRequester;
    mapping(address => uint256[]) public requestsByFrom;

    event TransferRequested(
        uint256 requestId,
        address requester,
        address from,
        uint256 amount
    );
    event TransferApprovedAndExecuted(uint256 requestId);
    event TransferRequestCancelled(uint256 requestId);

    constructor(address _usdcAddress) {
        require(_usdcAddress != address(0), "Invalid USDC address");
        usdc = IERC20(_usdcAddress);
    }

    function requestTransfer(
        address _from,
        uint256 _amount,
        string memory _message
    ) external {
        TransferRequest memory newRequest = TransferRequest({
            requester: msg.sender,
            from: _from,
            amount: _amount,
            approved: false,
            canceled: false,
            message: _message
        });
        requests.push(newRequest);
        uint256 requestId = requests.length - 1;

        requestsByRequester[msg.sender].push(requestId);
        requestsByFrom[_from].push(requestId);

        emit TransferRequested(requestId, msg.sender, _from, _amount);
    }

    function approveAndExecuteTransfer(uint256 _requestId) external {
        require(_requestId < requests.length, "Invalid request ID");
        TransferRequest storage request = requests[_requestId];
        require(
            msg.sender == request.from,
            "Only the source wallet can approve and execute the transfer"
        );

        uint256 allowance = usdc.allowance(request.from, address(this));
        require(allowance >= request.amount, "Insufficient allowance");

        bool success = usdc.transferFrom(
            request.from,
            request.requester,
            request.amount
        );
        require(success, "Transfer failed");

        request.approved = true;
        emit TransferApprovedAndExecuted(_requestId);
    }

    function cancelRequest(uint256 _requestId) external {
        require(_requestId < requests.length, "Invalid request ID");
        TransferRequest storage request = requests[_requestId];

        // Ensure that the caller is the requester, the request hasn't been approved, and it's not already canceled
        require(
            msg.sender == request.requester,
            "Only the requester can cancel the request"
        );
        require(
            !request.approved,
            "Request has already been approved and cannot be cancelled"
        );
        require(!request.canceled, "Request has already been canceled");

        // Mark the request as canceled
        request.canceled = true;

        emit TransferRequestCancelled(_requestId);
    }

    function getRequestIdsForRequester(
        address _requester
    ) external view returns (uint256[] memory) {
        return requestsByRequester[_requester];
    }

    function getRequestIdsForFrom(
        address _from
    ) external view returns (uint256[] memory) {
        return requestsByFrom[_from];
    }
}
