import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './routes/Login.tsx'
import Signup from './routes/Signup.tsx'
import Dashboard from './routes/Dashboard.tsx'
import Account from './routes/Account.tsx'
import AccountEdit from './routes/AccountEdit.tsx'
import Export from './routes/Export.tsx'
import Production from './routes/Production.tsx'
import ProductionAdd from './routes/ProductionAdd.tsx'
import ProductionEdit from './routes/ProductionEdit.tsx'
import Inputs from './routes/Inputs.tsx'
import Properties from './routes/Properties.tsx'
import PropertiesAdd from './routes/PropertiesAdd.tsx'
import PropertiesEdit from './routes/PropertiesEdit.tsx'
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
        path: "account/edit",
        element: <AccountEdit />,
      },
      {
        path: "properties",
        element: <Properties />,
      },
      {
        path: "properties/edit",
        element: <PropertiesEdit />,
      },
      {
        path: "properties/add",
        element: <PropertiesAdd />,
      },
      {
        path: "export",
        element: <Export />,
      },
      {
        path: "production",
        element: <Production />,
      },
      {
        path: "production/add",
        element: <ProductionAdd />,
      },
      {
        path: "production/edit",
        element: <ProductionEdit />,
      },
      {
        path: "inputs",
        element: <Inputs />,
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
