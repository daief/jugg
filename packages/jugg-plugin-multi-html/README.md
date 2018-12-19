# jugg-plugin-multi-html

Aim to generate multi html files with `routes` config, which is base on `html-webpack-plugin`.

# config

```ts
interface Config {
  routes: Array<{
    // route path
    path: string;
    // assign a specific template path, relative to the `src/`
    template?: string;
  }>;
}

```

# example

```js
// .juggrc.js
export default {
  plugins: [
    [
      '@axew/jugg-plugin-multi-html',
      {
        routes: [
          {
            path: '/user',
            template: './documents/user.ejs'
          },
          {
            path: '/user/profile',
            template: './documents/profile.ejs'
          }
        ]
      }
    ]
  ]
}
```

After building.

```bash
# dist/
.
├── index.f4bf6a3f58833a69beb9.js
├── index.html
└── user
    ├── index.html
    └── profile
        └── index.html
```

# Notice
- When publichPath is a relative path, assets path in html is not right.
