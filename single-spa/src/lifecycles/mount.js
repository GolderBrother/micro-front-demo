/* eslint-disable prettier/prettier */
import { NOT_MOUNTED, MOUNTING, MOUNTED } from "../applications/app.helpers";

export async function toMountPromise(app) {
  // 需要未挂载的应用才行
  if (app.status !== NOT_MOUNTED) return app;
  // 挂载中
  app.status = MOUNTING;
  await app.mount(app.customProps);
  // 已挂载
  app.status = MOUNTED;
  return app;
}
