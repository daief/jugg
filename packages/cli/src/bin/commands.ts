import { CommandSchema } from '../interface';

export const commandList: CommandSchema[] = [
  {
    command: 'dev',
    description: 'start dev server',
    option: [
      {
        flags: '-p, --port <port>',
        description: 'dev server port',
        defaultValue: '3000',
      },
    ],
    env: {
      NODE_ENV: 'development',
    },
  },
  {
    command: 'build',
    description: 'exec build',
    env: {
      NODE_ENV: 'production',
    },
  },
];
