/**
 * ref: @vue/cli-shared-utils
 */
import chalk from 'chalk';
import readline from 'readline';
const padStart = require('string.prototype.padstart');

export class Logger {
  // tslint:disable no-console

  log(msg: string, tag = '') {
    tag ? console.log(this.format(this.chalkTag(tag), msg)) : console.log(msg);
  }

  info(msg: string, tag = '') {
    console.log(this.format(chalk.bgBlue.black(' INFO ') + (tag ? this.chalkTag(tag) : ''), msg));
  }

  done(msg: string, tag = '') {
    console.log(this.format(chalk.bgGreen.black(' DONE ') + (tag ? this.chalkTag(tag) : ''), msg));
  }

  warn(msg: string, tag = '') {
    console.warn(
      this.format(
        chalk.bgYellow.black(' WARN ') + (tag ? this.chalkTag(tag) : ''),
        chalk.yellow(msg)
      )
    );
  }

  error(msg: string | Error, tag = '') {
    console.error(
      this.format(
        chalk.bgRed(' ERROR ') + (tag ? this.chalkTag(tag) : ''),
        chalk.red(msg.toString())
      )
    );
    if (msg instanceof Error) {
      console.error(msg.stack);
    }
  }

  clearConsole(title: string) {
    if (process.stdout.isTTY) {
      const blank = '\n'.repeat(process.stdout.rows);
      console.log(blank);
      readline.cursorTo(process.stdout, 0, 0);
      readline.clearScreenDown(process.stdout);
      if (title) {
        console.log(title);
      }
    }
  }

  private format(label: string, msg: string) {
    return msg
      .split('\n')
      .map((line, i) => {
        return i === 0 ? `${label} ${line}` : padStart(line, chalk.reset(label).length);
      })
      .join('\n');
  }

  private chalkTag(msg: string) {
    return chalk.bgBlackBright.white.dim(` ${msg} `);
  }
}

export const logger = new Logger();
