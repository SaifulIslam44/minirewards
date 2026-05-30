// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AppStorage, LibAppStorage, Modifiers} from "../libraries/LibAppStorage.sol";

/**
 * @title RewardsFacet
 * @notice A Diamond Facet (EIP-2535) that implements a daily-limited,
 *         points-based reward system for a Celo MiniPay dApp.
 *
 *  Deployment / wiring notes (do these once against your existing Diamond):
 *   1. Deploy this facet.
 *   2. Use your DiamondCut facet to `diamondCut` and register the selectors
 *      below (executeAction, batchExecuteAction, setDailyTxLimit, etc.).
 *   3. Call `initRewards(adminAddress)` exactly once via the Diamond to seed
 *      defaults (dailyTxLimit = 10, pointsPerTx = 5).
 */
contract RewardsFacet is Modifiers {
    // --- Events ---
    event ActionExecuted(address indexed user, uint256 count, uint256 pointsAwarded, uint256 totalPoints);
    event DailyTxLimitUpdated(uint256 newLimit);
    event PointsPerTxUpdated(uint256 newPoints);
    event RewardsInitialized(address indexed admin);

    // --- Initialization (call once through the Diamond) ---
    function initRewards(address _admin) external {
        require(!s.initialized, "RewardsFacet: already initialized");
        s.initialized = true;
        s.admin = _admin;
        s.dailyTxLimit = 10;
        s.pointsPerTx = 5;
        emit RewardsInitialized(_admin);
    }

    // --- Core user functions ---

    /// @notice Perform a single action, earning `pointsPerTx` points.
    function executeAction() external {
        _execute(msg.sender, 1);
    }

    /// @notice Perform `count` actions in one transaction (handy for the AI agent).
    /// @param count Number of actions to perform; must fit within the daily limit.
    function batchExecuteAction(uint8 count) external {
        require(count > 0, "RewardsFacet: count must be > 0");
        _execute(msg.sender, count);
    }

    /// @dev Shared logic: validates the daily limit, updates counters, awards points.
    function _execute(address user, uint256 count) internal {
        uint256 day = LibAppStorage.currentDay();
        uint256 used = s.userDailyTxCount[user][day];
        require(used + count <= s.dailyTxLimit, "RewardsFacet: daily tx limit exceeded");

        s.userDailyTxCount[user][day] = used + count;

        uint256 awarded = count * s.pointsPerTx;
        s.userPoints[user] += awarded;

        if (!s.isKnownUser[user]) {
            s.isKnownUser[user] = true;
            s.users.push(user);
        }

        emit ActionExecuted(user, count, awarded, s.userPoints[user]);
    }

    // --- Admin functions ---

    function setDailyTxLimit(uint256 limit) external onlyAdmin {
        require(limit > 0, "RewardsFacet: limit must be > 0");
        s.dailyTxLimit = limit;
        emit DailyTxLimitUpdated(limit);
    }

    function setPointsPerTx(uint256 points) external onlyAdmin {
        s.pointsPerTx = points;
        emit PointsPerTxUpdated(points);
    }

    // --- View functions ---

    function admin() external view returns (address) {
        return s.admin;
    }

    function dailyTxLimit() external view returns (uint256) {
        return s.dailyTxLimit;
    }

    function pointsPerTx() external view returns (uint256) {
        return s.pointsPerTx;
    }

    function getUserPoints(address user) external view returns (uint256) {
        return s.userPoints[user];
    }

    /// @notice How many actions the user can still perform today.
    function getRemainingDailyTx(address user) external view returns (uint256) {
        uint256 day = LibAppStorage.currentDay();
        uint256 used = s.userDailyTxCount[user][day];
        if (used >= s.dailyTxLimit) {
            return 0;
        }
        return s.dailyTxLimit - used;
    }

    /// @notice Returns the full leaderboard sorted by points (descending).
    /// @dev On-chain sort is O(n^2); acceptable for modest user counts. For
    ///      large user bases, paginate or maintain a sorted structure off-chain.
    function getLeaderboard()
        external
        view
        returns (address[] memory addresses, uint256[] memory points)
    {
        uint256 len = s.users.length;
        addresses = new address[](len);
        points = new uint256[](len);

        for (uint256 i = 0; i < len; i++) {
            addresses[i] = s.users[i];
            points[i] = s.userPoints[s.users[i]];
        }

        // Simple insertion sort (descending by points).
        for (uint256 i = 1; i < len; i++) {
            address addrKey = addresses[i];
            uint256 ptsKey = points[i];
            uint256 j = i;
            while (j > 0 && points[j - 1] < ptsKey) {
                addresses[j] = addresses[j - 1];
                points[j] = points[j - 1];
                j--;
            }
            addresses[j] = addrKey;
            points[j] = ptsKey;
        }
    }
}
