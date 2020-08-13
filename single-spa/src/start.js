/* eslint-disable prettier/prettier */
import { reroute } from "./navigations/reroutes";
export let started = false;
export function start() {
  // 需要挂载应用
  started = true;
  // 除了去加载应用还需要去挂载应用
  reroute();
}
