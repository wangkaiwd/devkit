export interface MergeOptions {
  targetBranch: string;
  dryRun?: boolean;
  force?: boolean;
}

export interface GitStatus {
  current: string;
  isClean: boolean;
  ahead: number;
  behind: number;
}

export interface MergeResult {
  success: boolean;
  message: string;
  conflicts?: string[];
}

export interface Logger {
  info: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  step: (message: string) => void;
}

export interface GitOperations {
  getCurrentBranch(): Promise<string>;
  checkoutBranch(branch: string): Promise<void>;
  mergeBranch(sourceBranch: string, targetBranch: string): Promise<MergeResult>;
  pushBranch(branch: string): Promise<void>;
  getStatus(): Promise<GitStatus>;
  branchExists(branch: string): Promise<boolean>;
  isGitRepository(): Promise<boolean>;
} 