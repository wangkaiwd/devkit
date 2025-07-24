import ora from 'ora';
import inquirer from 'inquirer';
import { GitManager } from '../utils/git';
import { logger, formatBranch, printHeader, formatCommand } from '../utils/logger';
import { MergeOptions } from '../types';

export class MergeCommand {
  private gitManager: GitManager;

  constructor() {
    this.gitManager = new GitManager();
  }

  async execute(options: MergeOptions): Promise<void> {
    const { targetBranch, dryRun = false, force = false } = options;

    try {
      // Pre-flight checks
      await this.performPreflightChecks(targetBranch);

      // Get current branch
      const currentBranch = await this.gitManager.getCurrentBranch();
      
      if (currentBranch === targetBranch) {
        logger.error(`Cannot merge branch into itself. Current branch is already ${formatBranch(targetBranch)}`);
        process.exit(1);
      }

      // Show operation plan
      await this.showOperationPlan(currentBranch, targetBranch, dryRun);

      if (dryRun) {
        logger.info('Dry run completed. No actual changes were made.');
        return;
      }

      // Ask for confirmation (unless force flag is used)
      if (!force) {
        const confirmed = await this.askForConfirmation();
        if (!confirmed) {
          logger.info('Operation cancelled by user.');
          return;
        }
      } else {
        logger.warning('Force flag detected. Skipping confirmation.');
      }

      // Execute merge workflow
      await this.executeMergeWorkflow(currentBranch, targetBranch);

    } catch (error) {
      logger.error(`Merge operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }

  private async performPreflightChecks(targetBranch: string): Promise<void> {
    printHeader('🔍 Pre-flight Checks');

    const spinner = ora('Checking Git repository...').start();

    try {
      // Check if we're in a Git repository
      const isGitRepo = await this.gitManager.isGitRepository();
      if (!isGitRepo) {
        spinner.fail('Not a Git repository');
        throw new Error('Current directory is not a Git repository');
      }
      spinner.succeed('Git repository detected');

      // Check Git status
      spinner.start('Checking working directory status...');
      const status = await this.gitManager.getStatus();
      
      if (!status.isClean) {
        spinner.fail('Working directory is not clean');
        throw new Error('You have uncommitted changes. Please commit or stash them before merging.');
      }
      spinner.succeed('Working directory is clean');

      // Fetch latest changes
      spinner.start('Fetching latest changes from origin...');
      await this.gitManager.fetchOrigin();
      spinner.succeed('Fetched latest changes from origin');

      // Check if target branch exists
      spinner.start(`Checking if target branch ${formatBranch(targetBranch)} exists...`);
      const targetExists = await this.gitManager.branchExists(targetBranch);
      if (!targetExists) {
        spinner.fail(`Target branch ${formatBranch(targetBranch)} does not exist`);
        throw new Error(`Target branch "${targetBranch}" does not exist locally or remotely`);
      }
      spinner.succeed(`Target branch ${formatBranch(targetBranch)} exists`);

    } catch (error) {
      spinner.fail('Pre-flight checks failed');
      throw error;
    }
  }

  private async showOperationPlan(currentBranch: string, targetBranch: string, dryRun: boolean): Promise<void> {
    printHeader(`📋 Operation Plan ${dryRun ? '(DRY RUN)' : ''}`);
    
    logger.step(`1. Switch from ${formatBranch(currentBranch)} to ${formatBranch(targetBranch)}`);
    logger.step(`2. Pull latest changes for ${formatBranch(targetBranch)}`);
    logger.step(`3. Merge ${formatBranch(currentBranch)} into ${formatBranch(targetBranch)}`);
    logger.step(`4. Push ${formatBranch(targetBranch)} to remote`);
    logger.step(`5. Switch back to ${formatBranch(currentBranch)}`);
    
    console.log();
    logger.info(`Source branch: ${formatBranch(currentBranch)}`);
    logger.info(`Target branch: ${formatBranch(targetBranch)}`);
  }

  private async askForConfirmation(): Promise<boolean> {
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to proceed with the merge operation?',
        default: false
      }
    ]);

    return answers.proceed;
  }

  private async executeMergeWorkflow(currentBranch: string, targetBranch: string): Promise<void> {
    printHeader('🚀 Executing Merge Workflow');

    let spinner = ora();

    try {
      // Step 1: Switch to target branch
      spinner.start(`Switching to ${formatBranch(targetBranch)}...`);
      await this.gitManager.checkoutBranch(targetBranch);
      spinner.succeed(`Switched to ${formatBranch(targetBranch)}`);

      // Step 2: Pull latest changes
      spinner.start(`Pulling latest changes for ${formatBranch(targetBranch)}...`);
      await this.gitManager.pullBranch(targetBranch);
      spinner.succeed(`Pulled latest changes for ${formatBranch(targetBranch)}`);

      // Step 3: Merge source branch
      spinner.start(`Merging ${formatBranch(currentBranch)} into ${formatBranch(targetBranch)}...`);
      const mergeResult = await this.gitManager.mergeBranch(currentBranch, targetBranch);
      
      if (!mergeResult.success) {
        spinner.fail(`Merge failed: ${mergeResult.message}`);
        
        if (mergeResult.conflicts && mergeResult.conflicts.length > 0) {
          logger.error('Merge conflicts detected in the following files:');
          mergeResult.conflicts.forEach(file => logger.error(`  - ${file}`));
          logger.info('Please resolve conflicts manually and run:');
          logger.info(formatCommand('git add .'));
          logger.info(formatCommand('git commit'));
          logger.info(formatCommand(`git push origin ${targetBranch}`));
        }
        
        throw new Error(mergeResult.message);
      }
      spinner.succeed(`Merged ${formatBranch(currentBranch)} into ${formatBranch(targetBranch)}`);

      // Step 4: Push to remote
      spinner.start(`Pushing ${formatBranch(targetBranch)} to remote...`);
      await this.gitManager.pushBranch(targetBranch);
      spinner.succeed(`Pushed ${formatBranch(targetBranch)} to remote`);

      // Step 5: Switch back to original branch
      spinner.start(`Switching back to ${formatBranch(currentBranch)}...`);
      await this.gitManager.checkoutBranch(currentBranch);
      spinner.succeed(`Switched back to ${formatBranch(currentBranch)}`);

      // Success message
      console.log();
      logger.success(`🎉 Successfully merged ${formatBranch(currentBranch)} into ${formatBranch(targetBranch)}!`);
      logger.info(`The changes have been pushed to the remote repository.`);

    } catch (error) {
      spinner.fail('Merge workflow failed');
      
      // Try to switch back to original branch on error
      try {
        await this.gitManager.checkoutBranch(currentBranch);
        logger.info(`Switched back to ${formatBranch(currentBranch)}`);
      } catch (checkoutError) {
        logger.warning(`Failed to switch back to ${formatBranch(currentBranch)}`);
      }
      
      throw error;
    }
  }
} 