module.exports = {
  lintOnSave: false,
  devServer: {
    port: 10000,
    // 配置允许跨域
    headers: {
      "Access-Controll-Allow-Origin": "*",
    },
  },
  // configureWebpack: {
  //   output: {
  //     // 打包后的类库名称
  //     library: "vueApp",
  //     // 打包后的模式
  //     libraryTarget: "umd",
  //   },
  // },
  configureWebpack: {
    output: {
      library: "vueApp",
      libraryTarget: "umd",
    },
  },
};
