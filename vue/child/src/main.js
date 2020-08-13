import Vue from 'vue'
import App from './App.vue'
import router from './router';
import singleSpaVue from 'single-spa-vue'

Vue.config.productionTip = false
const appOptions = {
  // 挂载到父应用中的id为vue的标签中
  el: '#vue',
  router,
  render: h => h(App)
}
// 包装后的生命周期
const vueLifeCycle = singleSpaVue({
  Vue,
  appOptions
})

// 表示是父应用引用子应用
if(window.singleSpaNavigate) {
  // 动态设置子应用publicPath
  // 设置发出的请求资源相当于根路径，webpack会自动拼接资源的相对路径为绝对路径
  __webpack_public_path__ = 'http://localhost:10000/'
}else {
  // 如果当前不是子应用
  delete appOptions.el; // 删除之前的父应用标签节点
  new Vue(appOptions).$mount('#vue');
}

// 导出三个方法给父应用来调用，相当于协议接入，我定好了协议，父应用会调用这些方法

export const bootstrap = vueLifeCycle.bootstrap;
export const mount = vueLifeCycle.mount;
export const unmount = vueLifeCycle.unmount;

// new Vue({
//   render: h => h(App),
// }).$mount('#app')
