#!/usr/bin/env node

import { Command } from 'commander';
import { MergeCommand } from './commands/merge';
import { logger } from './utils/logger';

const program = new Command();

// Package info
const packageJson = require('../package.json');

program
  .name('devkit')
  .description('A CLI tool to simplify dev workflow')
  .version(packageJson.version);

// Merge command
program
  .command('merge')
  .description('Merge current branch into target branch')
  .argument('<target-branch>', 'Target branch to merge into')
  .option('-d, --dry-run', 'Show what would be done without executing')
  .option('-f, --force', 'Force merge without confirmation (use with caution)')
  .action(async (targetBranch: string, options: { dryRun?: boolean; force?: boolean }) => {
    try {
      const mergeCommand = new MergeCommand();
      await mergeCommand.execute({
        targetBranch,
        dryRun: options.dryRun,
        force: options.force
      });
    } catch (error) {
      logger.error(`Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  });

// Global error handler
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 