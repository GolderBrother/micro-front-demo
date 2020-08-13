(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
}(this, (function (exports) { 'use strict';

  /* eslint-disable prettier/prettier */
  // 描述应用的整个状态

  const NOT_LOADED = "NOT_LOADED"; // 没有加载过(应用初始状态)
  const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE"; // 加载资源
  const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED"; // 没有启动(还没有调用bootstrap方法)
  const BOOTSTRAPPING = "BOOTSTRAPPING"; // 启动中
  const NOT_MOUNTED = "NOT_MOUNTED"; // 没有挂载(没有调用mount方法)
  const MOUNTING = "MOUNTING"; // 挂载中
  const MOUNTED = "MOUNTED"; // 挂载完毕
  const UNMOUNTING = "UNMOUNTING"; // 解除挂载中(卸载中)
  const SKIP_BECAUSE_BROKEN = "SKIP_BECAUSE_BROKEN"; // 运行出错

  // 当前这个应用是否要被激活
  // 如果返回true，那么应用应该就开始初始化等一系列操作
  function shouldBeActive(app) {
    return app.activeWhen(window.location);
  }

  /* eslint-disable prettier/prettier */
  let started = false;
  function start() {
    // 需要挂载应用
    started = true;
    // 除了去加载应用还需要去挂载应用
    reroute();
  }

  /* eslint-disable prettier/prettier */

  /**
   * 拍平函数数组
   * @param {*} fns 函数数组
   */
  function flattenFnArray(fns = []) {
    fns = Array.isArray(fns) ? fns : [fns];
    return (props) =>
      fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve());
  }

  async function toLoadPromise(app) {
    // 避免app重复加载，缓存里面有就直接取
    if (app.loadPromise) return app.loadPromise; // 缓存机制
    // 没有的话就需要缓存一次再return
    return (app.loadPromise = Promise.resolve().then(async () => {
      // 正在加载中
      app.status = LOADING_SOURCE_CODE;
      // 上面的缓存机制保证了 loadApp 只调用一次loadApp(用户传入的方法，该方法返回一个Proimse)
      const { bootstrap, mount, unmount } = await app.loadApp(app.customProps);
      // 已加载，未启动
      // 三个属性值可能是个数组，将用户传入的多个方法组合成一个，并且可以依次调用
      // 将多个promise组合在一起 compose
      app.status = NOT_BOOTSTRAPPED;
      app.bootstrap = flattenFnArray(bootstrap);
      app.mount = flattenFnArray(mount);
      app.unmount = flattenFnArray(unmount);
      delete app.loadPromise;
      return app;
    }));
  }

  /* eslint-disable prettier/prettier */

  async function toUnmountPromise(app) {
    // 当前应用没有被挂载就直接什么都不做了
    if (app.status !== MOUNTED) return app;
    // 卸载中
    app.status = UNMOUNTING;
    await app.unmount(app.customProps);
    // 已卸载(未挂载)
    app.status = NOT_MOUNTED;
    return app;
  }

  /* eslint-disable prettier/prettier */

  async function toBootstrapPromise(app) {
    console.log('toBootstrapPromise app.status', app.status);
    // 未启动的状态才需要启动，防止重复启动
    if (app.status !== NOT_BOOTSTRAPPED) return app;
    // 启动后
    app.status = BOOTSTRAPPING;
    await app.bootstrap(app.customProps);
    // 更新为未挂载
    app.status = NOT_MOUNTED;
    return app;
  }

  /* eslint-disable prettier/prettier */

  async function toMountPromise(app) {
    // 需要未挂载的应用才行, 避免应用重复挂载
    if (app.status !== NOT_MOUNTED) return app;
    // 挂载中
    app.status = MOUNTING;
    await app.mount(app.customProps);
    // 已挂载
    app.status = MOUNTED;
    return app;
  }

  /* eslint-disable prettier/prettier */

  // 拦截路由变化事件
  const routingEventListeningTo = ["hashchange", "popstate"];

  function urlReroute() {
    reroute();
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
    window.history.pushState);
  window.history.replaceState = patchedUpdateState(
    window.history.replaceState);

  // qiankun源码
  // 如果浏览器支持proxy, 就用proxy创建沙箱，否则使用快照沙箱
  // 从window取属性，不更新原来的window
  // 每个实例都是一个proxy

  /* eslint-disable prettier/prettier */
  /**
   * 核心应用处理方法
  // 这个流程是用于初始化操作的，我们还需要 当路径切换时重新加载应用
   */
  function reroute() {
    // NOT_MOUNTED: 表示需要被加载
    // NOT_LOADING：表示需要被加载
    // 获取需要被加载的应用
    // 获取需要被挂载的应用
    // 获取需要被卸载的应用
    const { appsToLoaded, appsToMount, appsToUnmount } = getAppChanges();
    // start方法调用时是同步的，但是加载流程是异步的
    if (started) {
      // app装载
      return performAppChanges();
    } else {
      // 注册应用时 需要预先下载
      return loadApps();
    }

    // 预加载子应用资源
    async function loadApps() {
      // 就是获取到bootstrap,mount和unmount方法放到app上, 因此用户需要导出这三个方法，否则不能预加载
      // 并发加载应用
      const apps = await Promise.all(appsToLoaded.map(toLoadPromise));
    }
    // 根据路径来转载应用
    async function performAppChanges() {
      // 需要去卸载的app
      const unmountPromises = appsToUnmount.map(toUnmountPromise);

      // 这个应用可能需要加载 但是路径不匹配  加载app1 的时候，这个时候切换到了app2
      appsToLoaded.map(async (app) => {
        // 加载app
        app = await toLoadPromise(app);
        // 启动app
        app = await toBootstrapPromise(app);
        return toMountPromise(app);
      });

      appsToMount.map(async (app) => {
        app = await toBootstrapPromise(app);
        return toMountPromise(app);
      });
    }
  }

  /* eslint-disable prettier/prettier */

  /**
   * 注册应用
   * @param {*} appName 应用名称
   * @param {*} loadApp 加载的应用
   * @param {*} activeWhen 当激活时候会调用 loadApp
   * @param {*} customProps 自定义属性
   */
  const apps = []; // 用来所有的应用
  // singleSpa也有类似vue的生命周期，因此需要维护应用所有的状态，相当于状态机
  function registerApplication(appName, loadApp, activeWhen, customProps) {
    apps.push({
      name: appName,
      loadApp,
      activeWhen,
      customProps,
      status: NOT_LOADED,
    });
    console.log("registerApplication apps", apps);
    // 需要加载应用
    reroute();
  }
  function getAppChanges() {
    // 需要加载的app
    const appsToLoaded = [];
    // 需要挂载的app
    const appsToMount = [];
    // 需要卸载的app
    const appsToUnmount = [];
    apps.forEach((app) => {
      // 需不需要被加载
      const appShouldBeActive = app.status !== SKIP_BECAUSE_BROKEN && shouldBeActive(app);
      switch (app.status) {
        // 这些状态的，就需要被加载
        case NOT_LOADED:
        case LOADING_SOURCE_CODE:
          if (appShouldBeActive) {
            appsToLoaded.push(app);
          }
          break;
        // 这些状态的就需要被挂载
        case NOT_BOOTSTRAPPED:
        case BOOTSTRAPPING:
        case NOT_MOUNTED:
          if (appShouldBeActive) {
            appsToMount.push(app);
          }
          break;
        // 需要被卸载
        case MOUNTED:
          // 当前这个应用不需要被激活才能卸载
          if (!appShouldBeActive) {
            appsToUnmount.push(app);
          }
          break;
      }
    });
    return {
      appsToLoaded,
      appsToMount,
      appsToUnmount,
    };
  }

  // 卸载 -> 加载 -> 挂载

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=single-spa.js.map
