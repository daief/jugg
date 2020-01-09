import { extendConfig } from '@axew/jugg';

export default extendConfig({
  plugins: [
    [
      '@axew/jugg-plugin-doc',
      {
        source: {
          docs: ['README.md'],
        },
      },
    ],
  ],
  define: {
    THEME_CONFIG: {
      title: 'title',
    },
  },
});
