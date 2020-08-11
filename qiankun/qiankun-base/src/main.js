import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
Vue.config.productionTip = false;
Vue.use(ElementUI);

import { registerMicroApps, start } from "qiankun";

const apps = [
  {
    name: "vueApp", // 应用的名字
    // 默认会加载这个html, 解析里面的js，动态的执行（子应用必须支持跨域）
    // 可以省略请求前缀，浏览器会自动组装
    entry: "//localhost:10000",
    // fetch
    container: "#vue", // 容器标签ID
    activeRule: "/vue", // 激活的路径
    // 主子应用通信：通过props来传递给子应用属性
    props: {
      a: 'a'
    }
  },
  {
    name: "reactApp",
    // 默认会加载这个html, 解析里面的js，动态的执行（子应用必须支持跨域）
    entry: "//localhost:20000",
    // fetch
    container: "#react", // 容器标签ID
    activeRule: "/react", // 激活的路径
    // 主子应用通信：通过props来传递给子应用属性
    props: {
      b: 'b'
    }
  },
];
registerMicroApps(apps); // 注册应用
start({
  prefetch: false // 取消预加载
});// 启动
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
