import { extendConfig } from '@axew/jugg';

export default extendConfig({
  plugins: [
    [
      '@axew/jugg-plugin-doc',
      {
        source: {
          docs: ['README.md'],
          jugg: ['packages/jugg/**/*.md'],
          'jugg-plugin-doc': ['packages/jugg-plugin-doc/*.md'],
        },
        title: 'Jugg',
        description: 'A naive front-end scaffold.',
      },
    ],
  ],
});
