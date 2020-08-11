import React from "react";
import { BrowserRouter, Link, Route } from "react-router-dom";
import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      {/* 配置子应用的根路由 */}
      <BrowserRouter basename="/react">
        <Link to="/">首页</Link>
        <Link to="/about">关于页面</Link>
        <Route
          path="/"
          exact
          render={() => (
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                  Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                  className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn React
                </a>
              </header>
            </div>
          )}
        ></Route>
        <Route to="/about" render={() => <h2>about页面</h2>}></Route>
      </BrowserRouter>
    </div>
  );
}

export default App;
