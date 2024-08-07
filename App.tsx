import * as React from 'react'
import { Home } from './src/screens/Home/Home';
import { Router } from './src/routes';

export default function App() {
  return (
    <React.StrictMode>
      <Router />
    </React.StrictMode>
  );
}
