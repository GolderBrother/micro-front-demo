import Vue from "vue";
import App from "./App.vue";
// 路由劫持, 帮助我们导出单页子应用 插件：single-spa single-spa-vue single-spa-react
import { registerApplication, start } from "single-spa";
import router from './router';
Vue.config.productionTip = false;

/**
 * 加载script
 * @param {string} url js文件地址
 */
function loadScript(url = "") {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// singleSpa 缺陷是：不够灵活 不能动态加载js文件
// 样式不隔离 没有js沙箱的机制(同一个window)
// 注册应用
registerApplication(
  "muyVueApp",
  async () => {
    // 这个规定必须是一个promise
    console.log("load child app");
    // 加载子应用打包后的类库
    // 加载顺序：vendor(公共) -> app
    await loadScript("http://localhost:10000/js/chunk-vendors.js");
    await loadScript("http://localhost:10000/js/app.js");
    // 返回 bootstrap mount unmount 这三个方法，在window.singleVue属性上
    return window.singleVue;
  },
  // 满足条件就会加载上面的子应用脚本
  // 当用户切换到/vue 的路径下，就加载刚才定义的子应用
  (location) => location.pathname.startsWith("/vue"),
  // 自定义配置对象
  {}
);

// 启动应用
start();

new Vue({
  router,
  render: (h) => h(App)
}).$mount("#app");
