'use server';

import {
  saveLearnerResponse,
  saveLearnerProgress,
  lockPredictionResponse,
  setPredictionLockState,
} from '@/lib/dal';
import { LockState, Prisma, ProgressState } from '@prisma/client';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function saveResponseAction(offeringSessionId: string, blockId: string, value: Prisma.InputJsonValue) {
  try {
    await saveLearnerResponse(offeringSessionId, blockId, value);
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to save response:', error);
    return { success: false, error: errorMessage(error) };
  }
}

export async function saveProgressAction(offeringSessionId: string, stageId: string, state: ProgressState) {
  try {
    await saveLearnerProgress(offeringSessionId, stageId, state);
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to save progress:', error);
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Lock a prediction (learner action). The response must already be saved —
 * call saveResponseAction first. See lockPredictionResponse() in dal.ts for
 * the state machine this enforces.
 */
export async function lockPredictionAction(offeringSessionId: string, blockId: string) {
  try {
    const result = await lockPredictionResponse(offeringSessionId, blockId);
    return { success: true, lockedAt: result.lockedAt };
  } catch (error: unknown) {
    console.error('Failed to lock prediction:', error);
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Reopen a locked prediction so the learner can edit it again.
 * Instructor/admin only — enforced in setPredictionLockState(), which also
 * writes the required PredictionLockAudit row.
 */
export async function reopenPredictionAction(responseId: string, reason?: string) {
  try {
    await setPredictionLockState(responseId, LockState.REOPENED, reason);
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to reopen prediction:', error);
    return { success: false, error: errorMessage(error) };
  }
}

/**
 * Void a locked prediction (e.g. the learner locked the wrong answer, or it
 * needs to be excluded from evaluation). Instructor/admin only — same
 * guardrails as reopen.
 */
export async function voidPredictionAction(responseId: string, reason?: string) {
  try {
    await setPredictionLockState(responseId, LockState.VOIDED, reason);
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to void prediction:', error);
    return { success: false, error: errorMessage(error) };
  }
}
