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
import GoBack from './routes/GoBack.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
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
  // Ruta comodín para manejar 404 y volver a la anterior
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
