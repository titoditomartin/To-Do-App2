import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/authContext/UserContext.jsx';
import App from './App.jsx';
import Login from './Login.jsx';
import Register from './register.jsx';
import ProfilePage from './ProfilePage.jsx';

const root = createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Register />
  },
  {
    path: "/profile",
    element: <ProfilePage />
  },
  {
    path: "/dashboard",
    element: <App />
  }
])

root.render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>
);
