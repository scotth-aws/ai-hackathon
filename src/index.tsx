import React from 'react';
import ReactDOM from 'react-dom/client';
//import ReactDOM from "react-dom";
import './index.css';
import Home from './Components/Home/index.jsx';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from "./serviceWorker";
import Routing from "./Components/Router";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

try {

  if (process.env.NODE_ENV == 'development')
    console.log('I am here');
  const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
  //ReactDOM.render(Routing, document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <Home />
    </React.StrictMode>
  );
  serviceWorker.unregister();

} catch (error) {
  // Ignore errors thrown during CloudWatch RUM web client initialization
  if (process.env.NODE_ENV == 'development')
    console.log('why am I here');
}
