import { BrowserRouter as Router } from "react-router-dom";
import Routes from "./routes/Routes";
import { Provider } from "react-redux";
import store from "./store";

function App() {
  return (
    <Provider store={store}>
      <Router >
        <Routes />
      </Router>
    </Provider>
  );
}

export default App;
