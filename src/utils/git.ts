import simpleGit, { SimpleGit, StatusResult } from 'simple-git';
import { GitOperations, GitStatus, MergeResult } from '../types';
import { logger } from './logger';

export class GitManager implements GitOperations {
  private git: SimpleGit;

  constructor(workingDir?: string) {
    this.git = simpleGit(workingDir || process.cwd());
  }

  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCurrentBranch(): Promise<string> {
    try {
      const status = await this.git.status();
      return status.current || 'HEAD';
    } catch (error) {
      throw new Error(`Failed to get current branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStatus(): Promise<GitStatus> {
    try {
      const status: StatusResult = await this.git.status();
      return {
        current: status.current || 'HEAD',
        isClean: status.files.length === 0,
        ahead: status.ahead,
        behind: status.behind
      };
    } catch (error) {
      throw new Error(`Failed to get git status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async branchExists(branch: string): Promise<boolean> {
    try {
      const branches = await this.git.branch(['-a']);
      const localExists = branches.all.includes(branch);
      const remoteExists = branches.all.some(b => b.includes(`origin/${branch}`));
      return localExists || remoteExists;
    } catch (error) {
      logger.warning(`Could not check if branch exists: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async checkoutBranch(branch: string): Promise<void> {
    try {
      // First try to checkout existing local branch
      await this.git.checkout(branch);
    } catch (error) {
      try {
        // If local branch doesn't exist, try to checkout from remote
        await this.git.checkoutBranch(branch, `origin/${branch}`);
      } catch (remoteError) {
        throw new Error(`Failed to checkout branch "${branch}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  async mergeBranch(sourceBranch: string, targetBranch: string): Promise<MergeResult> {
    try {
      const result = await this.git.merge([sourceBranch]);
      return {
        success: true,
        message: `Successfully merged ${sourceBranch} into ${targetBranch}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a merge conflict
      if (errorMessage.includes('CONFLICT') || errorMessage.includes('conflict')) {
        const status = await this.git.status();
        const conflicts = status.conflicted;
        
        return {
          success: false,
          message: `Merge conflict detected`,
          conflicts
        };
      }
      
      return {
        success: false,
        message: `Failed to merge: ${errorMessage}`
      };
    }
  }

  async pushBranch(branch: string): Promise<void> {
    try {
      await this.git.push('origin', branch);
    } catch (error) {
      throw new Error(`Failed to push branch "${branch}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchOrigin(): Promise<void> {
    try {
      await this.git.fetch('origin');
    } catch (error) {
      logger.warning(`Failed to fetch from origin: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async pullBranch(branch: string): Promise<void> {
    try {
      await this.git.pull('origin', branch);
    } catch (error) {
      throw new Error(`Failed to pull branch "${branch}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 