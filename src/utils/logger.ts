import chalk from 'chalk';
import { Logger } from '../types';

export const logger: Logger = {
  info: (message: string) => {
    console.log(chalk.blue('ℹ'), message);
  },

  success: (message: string) => {
    console.log(chalk.green('✓'), message);
  },

  error: (message: string) => {
    console.log(chalk.red('✗'), message);
  },

  warning: (message: string) => {
    console.log(chalk.yellow('⚠'), message);
  },

  step: (message: string) => {
    console.log(chalk.cyan('→'), message);
  }
};

export const formatBranch = (branch: string): string => {
  return chalk.yellow(`"${branch}"`);
};

export const formatCommand = (command: string): string => {
  return chalk.gray(`$ ${command}`);
};

export const printSeparator = (): void => {
  console.log(chalk.gray('─'.repeat(50)));
};

export const printHeader = (title: string): void => {
  console.log();
  console.log(chalk.bold.blue(title));
  printSeparator();
}; 