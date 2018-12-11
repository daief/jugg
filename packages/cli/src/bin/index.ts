#!/usr/bin/env node
import program from 'commander';
import { commandList } from './commands';
import Jugg from '../Jugg';
const packageJSON = require('../../package.json');

program.version(packageJSON.version).usage('<command> [options]');

commandList.forEach(schema => {
  const { command, description, option, env } = schema;
  const line = program.command(command);

  if (description) {
    program.description(description);
  }

  (option || []).forEach(opt => {
    const { flags, description: optDesc, fn, defaultValue } = opt;

    if (fn) {
      line.option(flags, optDesc, fn, defaultValue);
    } else {
      line.option(flags, optDesc, defaultValue);
    }
  });

  line.action(opt => {
    Object.keys(env || {}).forEach(key => {
      process.env[key] = env[key];
    });

    new Jugg(command, opt);
  });
});

program.parse(process.argv);

if (program.args.length === 0) {
  // default show help
  program.help();
}
