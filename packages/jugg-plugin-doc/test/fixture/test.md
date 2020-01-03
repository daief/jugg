---
title: 这是 metadata
---

## title1 - tsx

描述 1，这一段会被解析。

```tsx
import { Button } from 'antd';

export default <Button>btn</Button>;
```

# title2

这里会被忽略

```js
import { Button } from 'antd';

export default <Button>btn</Button>;
```

## title - js

这一段会被解析。

```js
import { Button } from 'antd';

export default <Button>btn</Button>;
```

## title - bash

这一段会被忽略。

```bash
$ yarn install
```