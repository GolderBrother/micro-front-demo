# `qiankun` 实战

主应用(基座)使用`vue`, 然后加载两个子应用，分别是`vue`和`react`

创建主应用(基座) `vue`

```bash
vue create qiankun-base
```

创建子应用 `vue`

```bash
vue create qiankun-vue
```

创建子应用 `react`

```bash
npx create-react-app qiankun-react
```

重写react的webpack配置(变线)

```bash
yarn add react-app-rewired -D
```

然后创建一个`config-overrides.js`