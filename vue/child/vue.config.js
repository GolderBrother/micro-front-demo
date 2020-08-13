module.exports = {
  // 关闭eslint检查.
  lintOnSave: false,
  // webpack基本配置，打包成类库
  configureWebpack: {
    output: {
      // 打包后的库名称
      library: "singleVue",
      // umd模块
      // 相当于会将 bootstrap mount unmount这三个属性挂载到 window.singleVue 属性上
      libraryTarget: "umd",
    },
    // 开发服务器
    devServer: {
      port: 10000,
    },
  },
};
