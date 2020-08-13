/* eslint-disable prettier/prettier */
import { reroute } from "./reroutes";

// 拦截路由变化事件
export const routingEventListeningTo = ["hashchange", "popstate"];

function urlReroute() {
  reroute([], arguments);
}

// 需要拦截的路由方法(等应用加载完毕后才执行)， 其他事件(比如click事件)就不需要管理
const captureEventListeners = {
  // 后续挂载的事件先暂存起来, 当应用切换完成后调用
  hashchange: [],
  popstate: [],
};

// 我们处理应用加载的逻辑是在最前面
// 拦截路由变化，重新执行reroute, 刷新应用，已经加载后的不会再次加载，而是直接挂载
// 监听原生的浏览器hash变化事件
window.addEventListener("hashchange", urlReroute);
// 监听原生的浏览器前进后退事件
window.addEventListener("popstate", urlReroute);

const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

// 重写路由方法
// 用户注册的方法重写为下面的方法
// 用户可能还会绑定自己的路由事件 vue
// 当我们应用切换后，还需要处理原来的方法(vue原来的方法)，需要在应用切换后再执行
window.addEventListener = function (eventName, fn) {
  // 缓存中没有这个方法，就存起来，否则不存
  if (
    routingEventListeningTo.indexOf(eventName) >= 0 &&
    !captureEventListeners[eventName].some((listener) => listener === fn)
  ) {
    captureEventListeners[eventName].push(fn);
    return;
  }
  // 等应用加载完成后，执行用户绑定的方法
  return originalAddEventListener.apply(this, arguments);
};

window.removeEventListener = function (eventName, fn) {
  if (routingEventListeningTo.indexOf(eventName) >= 0) {
    // 移除方法
    captureEventListeners[eventName] = captureEventListeners[eventName].filter(
      (listener) => listener !== fn
    );
    return;
  }
  // 等应用加载完成后，执行用户绑定的方法
  return originalRemoveEventListener.apply(this, arguments);
};

// 如果是hash路由，hash变化是可以切换
// 如果是浏览器路由，因为浏览器路由是基于h5 API的，切换时不会触发popstate事件
// 补丁方法
function patchedUpdateState(updateState, methodName) {
  return function () {
    const urlBefore = window.location.href;
    updateState.apply(this, arguments);
    const urlAfter = window.location.href;
    // 如果前后路径不一致，说明需要重新加载应用
    if (urlBefore !== urlAfter) {
      // 重新加载应用, 传入事件源
      // eslint-disable-next-line no-undef
      urlReroute(new PopStateEvent("popstate"));
    }
  };
}

// 重写方法: 用户调用pushState，重新生成一个补丁方法
window.history.pushState = patchedUpdateState(
  window.history.pushState,
  "pushState"
);
window.history.replaceState = patchedUpdateState(
  window.history.replaceState,
  "replaceState"
);

// qiankun源码
// 如果浏览器支持proxy, 就用proxy创建沙箱，否则使用快照沙箱
// 从window取属性，不更新原来的window
// 每个实例都是一个proxy