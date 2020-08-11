import Vue from "vue";
import App from "./App.vue";
import router from "./router";

// Vue.config.productionTip = false;

// vue实例
let instance = null;
function render(props) {
  instance = new Vue({
    router,
    render: (h) => h(App),
  }).$mount("#app"); // 这是里挂载到自己的html中，基座会拿到这个挂载侯的html，将其插入进去
}

// 使用 webpack 运行时 publicPath 配置 我们在引用资源的时候，qiankun会自动注入这个变量
// qiankun 将会在微应用 bootstrap 之前注入一个运行时的 publicPath 变量，你需要做的是在微应用的 entry js 的顶部添加如下代码：
if (window.__POWERED_BY_QIANKUN__) {
  // 动态添加publicPath
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
// 如何独立运行微应用？
// 有些时候我们希望直接启动微应用从而更方便的开发调试，你可以使用这个全局变量来区分当前是否运行在 qiankun 的主应用的上下文中
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 导出三个方法

/**
 * 启动模块
 * @param {object} props 属性对象
 */
export async function bootstrap(props) {}

/**
 * 挂载方法
 * @param {object} props 属性对象
 */
export async function mount(props) {
  console.log("vue mount props", props);
  // 切换子应用，重新挂载不是加载
  render(props);
}

/**
 * 卸载方法
 * @param {object} props 属性对象
 */
export async function unmount(props) {
  console.log("vue unmount props", props);
  instance.$destroy();
}
