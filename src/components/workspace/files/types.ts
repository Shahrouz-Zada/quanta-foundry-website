import type { FileView } from '@/lib/workspace-files-server';
import type { FileViewer } from '@/lib/workspace-files';

export type { FileView };

export interface ViewerInfo extends FileViewer {
  name: string;
}

export interface TeamInfo {
  id: string;
  name: string;
  /** Names only (null when the person has none); never emails. */
  members: { id: string; name: string | null }[];
}

export interface RosterEntry {
  userId: string;
  name: string;
  email: string;
  teamId: string | null;
}

export interface StorageInfo {
  personalUsed: number;
  teamUsed: number;
  quota: number;
}
