import { awardRogeCoinsFn } from "@/lib/roge-coins.functions";

export type TransactionType = 'earned' | 'bonus' | 'referral';

interface AwardCoinsParams {
  userId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  referenceId?: string;
}

/**
 * Award Roge coins to a user through a server function.
 */
export async function awardRogeCoins({
  userId,
  type,
  amount,
  description,
  referenceId
}: AwardCoinsParams) {
  try {
    return await awardRogeCoinsFn({
      data: {
        user_id: userId,
        transaction_type: type,
        amount,
        description,
        reference_id: referenceId,
      },
    });
  } catch (error) {
    console.error('Error awarding Roge coins:', error);
    throw error;
  }
}

/**
 * Award coins when someone uses a public design
 */
export async function awardDesignUsageCoins(designCreatorId: string, designId: string) {
  return awardRogeCoins({
    userId: designCreatorId,
    type: 'earned',
    amount: 10, // 10 RC per design usage
    description: 'Design used by another user',
    referenceId: designId
  });
}

/**
 * Award welcome bonus for new users
 */
export async function awardWelcomeBonus(userId: string) {
  return awardRogeCoins({
    userId,
    type: 'bonus',
    amount: 100, // 100 RC welcome bonus
    description: 'Welcome bonus for joining the platform'
  });
}

/**
 * Award referral bonus
 */
export async function awardReferralBonus(referrerId: string, referredUserId: string) {
  return awardRogeCoins({
    userId: referrerId,
    type: 'referral',
    amount: 50, // 50 RC for successful referral
    description: 'Referral bonus for inviting a new user',
    referenceId: referredUserId
  });
}

/**
 * Award coins for completing an order
 */
export async function awardOrderCompletionBonus(userId: string, orderId: string, orderValue: number) {
  // Award 1% of order value as RC (minimum 5 RC)
  const amount = Math.max(5, Math.floor(orderValue * 0.01));
  
  return awardRogeCoins({
    userId,
    type: 'bonus',
    amount,
    description: 'Order completion bonus',
    referenceId: orderId
  });
}