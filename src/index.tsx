import React from 'react';
import ReactDOM from "react-dom/client";
import './index.css';
import App from './App.js';
import * as serviceWorker from "./serviceWorker";
import { Amplify } from "aws-amplify";
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

try {
  const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  

  serviceWorker.unregister();

} catch (error) {
  // Ignore errors thrown during CloudWatch RUM web client initialization
  if (process.env.NODE_ENV == 'development')
    console.log('why am I here');
}
