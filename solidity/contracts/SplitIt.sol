// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";

contract SplitIt {
    using SafeERC20 for IERC20;
    using Address for address;

    // the USDC token contract address
    IERC20 public immutable usdc;

    // a payment struct
    struct Payment {
        address payer; // address of the payer
        string name; // name of the payer
        string comment; // comment from the payer
    }
    
    // a structure to represent a bill
    struct Split {
        address creator; // Address of the creator
        uint256 totalAmount; // Total amount of the bill
        uint256 amountPerPerson; // Amount each person needs to pay
        uint256 totalPaid; // Total amount paid so far
    }

    // mapping of split IDs to their corresponding split struct
    mapping(uint256 => Split) public splits;

    // mapping of split IDs to payments
    mapping(uint256 => Payment[]) public payments;

    // mapping of splits created by address
    mapping(address => uint256[]) public splitsByAddress;

    // mapping of payments made by address
    mapping(address => uint256[]) public paymentsByAddress;

    // counter for generating split IDs
    uint256 public splitCounter;

    // event to emit when a new split is created
    event SplitCreated(uint256 indexed splitId, uint256 totalAmount, uint256 amountPerPerson);

    // event to emit when a participant pays their share of the bill
    event Paid(uint256 indexed splitId, address indexed participant, uint256 amount);

    /**
     * @dev Constructor to initialize the USDC token contract address
     * @param _usdc The USDC token contract address
    */
    constructor(IERC20 _usdc) {
        usdc = _usdc;
    }

    /**
     * @dev Function to create a new split
     * @param _creator The address of the creator
     * @param _totalAmount The total amount of the bill
     * @param _amountPerPerson The amount each person needs to pay
    */
    function createSplit(address _creator, uint256 _totalAmount, uint256 _amountPerPerson) external {
        require(_totalAmount > 0, "Total amount should be greater than 0");
        require(_amountPerPerson > 0, "Amount per person should be greater than 0");

        Split memory split = Split(_creator, _totalAmount, _amountPerPerson, 0);
        splits[splitCounter] = split;

        emit SplitCreated(splitCounter, _totalAmount, _amountPerPerson);

        splitCounter++;
    }

    /**
     * @dev Function to pay the split
     * @param _splitId The ID of the split
     * @param _address The address of the payer
     * @param _fundedFrom The address from which the payment is funded
     * @param _name The name of the payer
     * @param _comment The comment from the payer
    */
    function pay(uint256 _splitId, address _address, address _fundedFrom, string memory _name, string memory _comment) external {
        Split storage split = splits[_splitId];
        require(split.totalPaid < split.totalAmount, "Split already paid");

        uint256 amount = split.amountPerPerson;
        split.totalPaid += amount;

        // create a payment struct and add it to the payments mapping
        Payment memory payment = Payment(_address, _name, _comment);
        payments[_splitId].push(payment);

        usdc.safeTransferFrom(_fundedFrom, split.creator, amount);

        emit Paid(_splitId, _address, amount);
    }

    /**
     * @dev Function to get the split by id
     * @return The split
    */
    function getSplit(uint256 _splitId) public view returns (Split memory) {
        return splits[_splitId];
    }

    /**
     * @dev Function to get the splits created by an address
     * @param _address The address of the user
    */
    function getSplitsByAddress(address _address) public view returns (uint256[] memory) {
        return splitsByAddress[_address];
    }

    /**
     * @dev Function to get the payments for a split
     * @param _splitId The ID of the split
     * @return The payments for the split
    */
    function getPayments(uint256 _splitId) public view returns (Payment[] memory) {
        return payments[_splitId];
    }

}