// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LibAppStorage
 * @notice Shared Diamond storage struct (AppStorage pattern, EIP-2535).
 * @dev All facets that need this state inherit from a contract that exposes
 *      `appStorage()`. Because every facet `delegatecall`s into the Diamond,
 *      they all read/write the SAME storage slot layout. Never reorder or
 *      remove existing fields in an upgrade; only append new ones at the end.
 */
struct AppStorage {
    // --- Ownership / Admin ---
    address admin;
    // --- Reward configuration ---
    uint256 dailyTxLimit; // max actions a user can perform per day
    uint256 pointsPerTx; // points awarded per action
    // --- User state ---
    mapping(address => uint256) userPoints; // total lifetime points
    // user => dayIndex => count of actions performed that day
    mapping(address => mapping(uint256 => uint256)) userDailyTxCount;
    // --- Leaderboard ---
    address[] users; // every address that has ever earned points
    mapping(address => bool) isKnownUser; // dedupe helper for `users`
    // --- Init guard ---
    bool initialized;
}

library LibAppStorage {
    /// @dev Returns a pointer to the AppStorage struct living at slot 0.
    function diamondStorage() internal pure returns (AppStorage storage ds) {
        assembly {
            ds.slot := 0
        }
    }

    /// @notice The current day index (UTC), used to bucket daily tx counts.
    function currentDay() internal view returns (uint256) {
        return block.timestamp / 1 days;
    }
}

/**
 * @title Modifiers
 * @notice Convenience base contract giving facets access to AppStorage + guards.
 */
contract Modifiers {
    AppStorage internal s;

    modifier onlyAdmin() {
        require(msg.sender == s.admin, "LibAppStorage: not admin");
        _;
    }
}
