/* eslint-disable prettier/prettier */
import {
  NOT_BOOTSTRAPPED,
  BOOTSTRAPPING,
  NOT_MOUNTED,
} from "../applications/app.helpers";

export async function toBootstrapPromise(app) {
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
