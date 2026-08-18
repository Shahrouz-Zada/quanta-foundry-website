'use server';

import { saveLearnerResponse, saveLearnerProgress } from '@/lib/dal';
import { ProgressState } from '@prisma/client';

export async function saveResponseAction(offeringSessionId: string, blockId: string, value: any) {
  try {
    await saveLearnerResponse(offeringSessionId, blockId, value);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save response:', error);
    return { success: false, error: error.message };
  }
}

export async function saveProgressAction(offeringSessionId: string, stageId: string, state: ProgressState) {
  try {
    await saveLearnerProgress(offeringSessionId, stageId, state);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save progress:', error);
    return { success: false, error: error.message };
  }
}
