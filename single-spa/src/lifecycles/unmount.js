/* eslint-disable prettier/prettier */
import { MOUNTED, UNMOUNTING, NOT_MOUNTED } from "../applications/app.helpers";

export async function toUnmountPromise(app) {
  // 当前应用没有被挂载直接什么都不做了
  if (app.status !== MOUNTED) return app;
  // 卸载中
  app.status = UNMOUNTING;
  await app.unmount(app.customProps);
  // 已卸载(未挂载)
  app.status = NOT_MOUNTED;
  return app;
}
