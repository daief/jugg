/**
 * ref: @vue/cli-service/lib/commands/build/formatStats.js
 */

import { Jugg } from '../..';
import { Stats } from 'webpack';
import fs from 'fs';
import path from 'path';

const zlib = require('zlib');
const chalk = require('chalk');
const ui = require('cliui')({ width: 80 });

export function formatStats(stats: Stats, jugg: Jugg) {
  const json = stats.toJson({
    hash: false,
    modules: false,
    chunks: false,
  });

  let assets = json.assets
    ? json.assets
    : json.children.reduce((acc: any, child: any) => acc.concat(child.assets), []);

  const seenNames = new Map();
  const isJS = (val: string) => /\.js$/.test(val);
  const isCSS = (val: string) => /\.css$/.test(val);
  const isMinJS = (val: string) => /\.min\.js$/.test(val);
  assets = assets
    .filter((a: any) => {
      if (seenNames.has(a.name)) {
        return false;
      }
      seenNames.set(a.name, true);
      return isJS(a.name) || isCSS(a.name);
    })
    .sort((a: any, b: any) => {
      if (isJS(a.name) && isCSS(b.name)) {
        return -1;
      }
      if (isCSS(a.name) && isJS(b.name)) {
        return 1;
      }
      if (isMinJS(a.name) && !isMinJS(b.name)) {
        return -1;
      }
      if (!isMinJS(a.name) && isMinJS(b.name)) {
        return 1;
      }
      return b.size - a.size;
    });

  function formatSize(size: number) {
    return (size / 1024).toFixed(2) + ' kb';
  }

  function getGzippedSize(asset: any) {
    // TODO
    const filepath = jugg.Utils.getAbsolutePath('dist', asset.name);
    const buffer = fs.readFileSync(filepath);
    return formatSize(zlib.gzipSync(buffer).length);
  }

  function makeRow(a: string, b: string, c: string) {
    return `  ${a}\t    ${b}\t ${c}`;
  }

  ui.div(
    makeRow(chalk.cyan.bold(`File`), chalk.cyan.bold(`Size`), chalk.cyan.bold(`Gzipped`)) +
      `\n\n` +
      assets
        .map((asset: any) =>
          makeRow(
            /js$/.test(asset.name)
              ? chalk.green(path.join('dist', asset.name))
              : chalk.blue(path.join('dist', asset.name)),
            formatSize(asset.size),
            getGzippedSize(asset)
          )
        )
        .join(`\n`)
  );

  return `${ui.toString()}\n\n  ${chalk.gray(`Images and other types of assets omitted.`)}\n`;
}
