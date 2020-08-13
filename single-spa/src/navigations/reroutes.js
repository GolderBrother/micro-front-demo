/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { started } from "../start";
import { getAppChanges } from "../applications/app";
import { toLoadPromise } from "../lifecycles/load";
import { toUnmountPromise } from "../lifecycles/unmount";
import { toBootstrapPromise } from "../lifecycles/bootstrap";
import { toMountPromise } from "../lifecycles/mount";
import "./navigator-event";
/**
 * 核心应用处理方法
// 这个流程是用于初始化操作的，我们还需要 当路径切换时重新加载应用
 */
export function reroute() {
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
