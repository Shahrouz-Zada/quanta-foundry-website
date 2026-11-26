'use server';

// =============================================================================
// Workspace Q · team discussion threads — server actions. Each one checks
// again who may use the thread (lib/discussions-server.ts); the page hiding a
// button protects nothing.
// =============================================================================

import { z } from 'zod';
import { audit } from '@/lib/workspace-files-server';
import { discussionsDb as db, resolveThread, messageSelect, toMessageView } from '@/lib/discussions-server';
import { MAX_MESSAGE_CHARS, RATE_LIMIT, RATE_WINDOW_MS, cleanMessage, type MessageView } from '@/lib/discussions';

export type DiscussionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

class UserError extends Error {}

function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof UserError) return { ok: false, error: error.message };
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? 'Invalid input.' };
  console.error('Discussion action failed:', error);
  return { ok: false, error: 'Something went wrong. Please try again.' };
}

const NOT_YOURS = 'This conversation isn’t available to you. Refresh the page.';

/** Posts a message, creating the thread on its first message. */
export async function postDiscussionMessage(input: { key: string; body: string }): Promise<DiscussionResult<{ message: MessageView }>> {
  try {
    const data = z.object({ key: z.string().max(220), body: z.string().max(MAX_MESSAGE_CHARS * 2) }).parse(input);
    const body = cleanMessage(data.body);
    if (!body) throw new UserError('Write a message first.');
    if (body.length > MAX_MESSAGE_CHARS) throw new UserError(`Messages can be up to ${MAX_MESSAGE_CHARS} characters.`);
    const access = await resolveThread(data.key);
    if (!access.ok) throw new UserError(NOT_YOURS);

    const created = await db.$transaction(async (tx) => {
      // One poster at a time per person, so a burst of parallel sends can't get past the limit.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`discussion:${access.user.id}`}))`;
      const now = new Date();
      const recent = await tx.discussionMessage.count({
        where: { authorId: access.user.id, createdAt: { gt: new Date(now.getTime() - RATE_WINDOW_MS) } },
      });
      if (recent >= RATE_LIMIT) throw new UserError('You’re sending messages very fast. Wait a moment and try again.');
      const thread = await tx.discussionThread.upsert({
        where: { targetKey: access.key },
        create: { offeringId: access.offeringId, targetKey: access.key, ...access.record, lastMessageAt: now },
        update: { lastMessageAt: now },
        select: { id: true },
      });
      const message = await tx.discussionMessage.create({
        data: { threadId: thread.id, authorId: access.user.id, body, createdAt: now, updatedAt: now },
        select: messageSelect(access.offeringId),
      });
      // Your own message counts as read.
      await tx.discussionRead.upsert({
        where: { threadId_userId: { threadId: thread.id, userId: access.user.id } },
        create: { threadId: thread.id, userId: access.user.id, lastReadAt: now },
        update: { lastReadAt: now },
      });
      return message;
    });
    return { ok: true, message: toMessageView(created, access.offeringId) };
  } catch (error) {
    return fail(error);
  }
}

/**
 * Deletes a message: its author can delete it, and staff can delete any
 * message (moderation, recorded in the class activity log). The text is
 * erased; the thread shows "message deleted".
 */
export async function deleteDiscussionMessage(input: { messageId: string }): Promise<DiscussionResult> {
  try {
    const data = z.object({ messageId: z.string().min(1).max(64) }).parse(input);
    const message = await db.discussionMessage.findUnique({
      where: { id: data.messageId },
      select: { id: true, authorId: true, deletedAt: true, thread: { select: { targetKey: true } } },
    });
    if (!message) throw new UserError('This message no longer exists. Refresh the page.');
    const access = await resolveThread(message.thread.targetKey);
    if (!access.ok) throw new UserError(NOT_YOURS);
    const own = message.authorId === access.user.id;
    if (!own && !access.canModerate) throw new UserError('You can only delete your own messages.');
    if (message.deletedAt) return { ok: true };
    const now = new Date();
    await db.$transaction(async (tx) => {
      await tx.discussionMessage.update({
        where: { id: message.id },
        data: { body: '', deletedAt: now, deletedById: access.user.id, updatedAt: now },
      });
      if (!own) {
        await audit(tx, {
          offeringId: access.offeringId, actorId: access.user.id, action: 'discussion.delete', entity: 'DiscussionMessage',
          entityId: message.id, details: { thread: message.thread.targetKey, authorId: message.authorId },
        });
      }
    });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

/** Marks a thread as read up to now, for the "new" counts. */
export async function markDiscussionRead(input: { key: string }): Promise<DiscussionResult> {
  try {
    const data = z.object({ key: z.string().max(220) }).parse(input);
    const access = await resolveThread(data.key);
    if (!access.ok) throw new UserError(NOT_YOURS);
    const thread = await db.discussionThread.findUnique({ where: { targetKey: access.key }, select: { id: true } });
    if (!thread) return { ok: true };
    const now = new Date();
    await db.discussionRead.upsert({
      where: { threadId_userId: { threadId: thread.id, userId: access.user.id } },
      create: { threadId: thread.id, userId: access.user.id, lastReadAt: now },
      update: { lastReadAt: now },
    });
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
