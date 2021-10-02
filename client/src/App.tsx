import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.css';
import {routes} from './routes';

export const App = () => {

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          Rivian vehicle management
        </header>
        <Switch>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                render={(props) => (
                  <route.component  />
                )}
              />
              ))}
          </Switch>
      </div>
    </Router>
  );
}
