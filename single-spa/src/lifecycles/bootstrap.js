/* eslint-disable prettier/prettier */
import {
  NOT_BOOTSTRAPPED,
  BOOTSTRAPPING,
  NOT_LOADED,
} from "../applications/app.helpers";

export async function toBootstrapPromise(app) {
  // 未启动的状态
  if (app.status !== NOT_BOOTSTRAPPED) return app;
  // 启动后
  app.status = BOOTSTRAPPING;
  await app.bootstrap(app.customProps);
  // 未加载
  app.status = NOT_LOADED;
  return app;
}
