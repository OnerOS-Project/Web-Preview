import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Routes, Route } from 'react-router-dom';
import './app.css';
import App from './app';
import Settings from './pages/Settings';
import reportWebVitals from './reportWebVitals';


export default function AppRouting() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        {
          index: true,
          element: <App />,
        },
      ],
    },
    {
      path: '/internal/app/settings',
      element: <Settings />,
    },
  ]);
  return <RouterProvider router={router} />;
}

const root = ReactDOM.createRoot(document.getElementById('web-os'));
root.render(
  <React.StrictMode>
    <AppRouting />
  </React.StrictMode>
);

reportWebVitals();
