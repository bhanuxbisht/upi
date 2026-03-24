/**
 * PayWise Knowledge Engine — Index
 * 
 * Unified access to all domain knowledge.
 * This module provides the AI with REAL expertise instead of generic responses.
 */

export { 
    type CreditCard,
    type CreditCardReward,
    type RewardMath,
    type RewardMathCategory,
    type PenaltyMatrix,
    type LateFeeSlab
} from "./credit-cards";

export { 
    UPI_APPS, 
    getBestUPIAppForCategory, 
    getStrategiesForApps, 
    getOptimalAppStack,
    type UPIAppProfile,
} from "./upi-apps";

export {
    OFFER_STACKING_STRATEGIES,
    MONTHLY_ROUTINES,
    SUBSCRIPTION_OPTIMIZATION,
    TAX_PAYMENT_TIPS,
    estimateMonthlySavings,
    getRelevantStrategies,
    type Strategy,
} from "./payment-strategies";
