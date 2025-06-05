import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './routes/Login.tsx'
import Signup from './routes/Signup.tsx'
import Dashboard from './routes/Dashboard.tsx'
import Account from './routes/Account.tsx'
import Properties from './routes/Properties.tsx'
import ProtectedRoute from './routes/ProtectedRoute.tsx'
import PublicRoute from './routes/PublicRoute.tsx'
import GoBack from './routes/GoBack.tsx'
import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "account",
        element: <Account />,
      },
      {
        path: "properties",
        element: <Properties />,
      },
    ],
  },
  {
    path: "*",
    element: <GoBack />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
