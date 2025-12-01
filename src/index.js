import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './app.css';
import App from './app';
import Settings from './pages/Settings/homescreen';
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

  return (
    <div
      style={{
        height: '100%',
        color: 'white',
        backgroundColor: '#222',
        textAlign: 'center',
      }}
    >
      <RouterProvider router={router} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('web-os'));
root.render(
  <React.StrictMode>
    <AppRouting />
  </React.StrictMode>
);

reportWebVitals();
