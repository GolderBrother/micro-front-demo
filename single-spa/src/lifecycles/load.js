/* eslint-disable prettier/prettier */
import {
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
} from "../applications/app.helpers";

/**
 * 拍平函数数组
 * @param {*} fns 函数数组
 */
function flattenFnArray(fns = []) {
  fns = Array.isArray(fns) ? fns : [fns];
  return (props) =>
    fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve());
}

export async function toLoadPromise(app) {
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
