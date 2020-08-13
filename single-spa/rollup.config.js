import serve from "rollup-plugin-serve";
export default {
  input: "./src/single-spa.js",
  output: {
    // 输出的文件位置和名称
    file: "./lib/umd/single-spa.js",
    // 打包的模块方式
    format: "umd",
    // 挂载到window上的变量名称
    name: "singleSpa",
    // 是否输出sourcemap
    sourcemap: true,
  },
  plugins: [
    serve({
      openPage: "/index.html",
      contentBase: "./",
      port: 3000,
    }),
  ],
};
