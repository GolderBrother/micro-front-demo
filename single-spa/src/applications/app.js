/* eslint-disable prettier/prettier */
import {
  NOT_LOADED,
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
  BOOTSTRAPPING,
  MOUNTED,
  NOT_MOUNTED,
  shouldBeActive,
} from "./app.helpers.js";
import { reroute } from "../navigations/reroutes.js";

/**
 * 注册应用
 * @param {*} appName 应用名称
 * @param {*} loadApp 加载的应用
 * @param {*} activeWhen 当激活时候会调用 loadApp
 * @param {*} customProps 自定义属性
 */
const apps = []; // 用来所有的应用
// singleSpa也有类似vue的生命周期，因此需要维护应用所有的状态，相当于状态机
export function registerApplication(appName, loadApp, activeWhen, customProps) {
  apps.push({
    name: appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_LOADED,
  });
  // 需要加载应用
  reroute();
}
export function getAppChanges() {
  // 需要加载的app
  const appsToLoaded = [];
  // 需要挂载的app
  const appsToMount = [];
  // 需要卸载的app
  const appsToUnmount = [];
  apps.forEach((app) => {
    // 需不需要被加载
    const appShouldBeActive = shouldBeActive(app);
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
        if(!appShouldBeActive) {
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
