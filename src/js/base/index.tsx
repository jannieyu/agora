import * as React from "react"
import { render, createStore, Provider } from "./react_base"
import { rootReducer } from "./reducers"
import "./styles.scss"

const App = () => (
  <div className="app">
    <h1 className="title"> Hello, World!</h1>
  </div>
)

const store = createStore(rootReducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("app"),
)
