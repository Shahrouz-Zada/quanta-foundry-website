'use server';

import { saveLearnerResponse, saveLearnerProgress } from '@/lib/dal';
import { Prisma, ProgressState } from '@prisma/client';

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
