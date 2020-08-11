import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

function render() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
}

// 如何独立运行微应用？
// 有些时候我们希望直接启动微应用从而更方便的开发调试，你可以使用这个全局变量来区分当前是否运行在 qiankun 的主应用的上下文中
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 导出三个方法给主应用使用
/**
 * 启动方法
 * @param {object} props 属性对象
 */
export async function bootstrap(props) {}
/**
 * 挂载
 * @param {object} props 属性对象
 */
export async function mount(props) {
  console.log("react mount props", props);
  render();
}

/**
 * 卸载
 * @param {object} props 属性对象
 */
export async function unmount(props) {
  console.log('react unmount props', props);
  ReactDOM.unmountComponentAtNode(document.getElementById("root"));
}
