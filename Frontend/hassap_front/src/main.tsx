import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./routes/Login.tsx";
import ForgotPass from "./routes/ForgotPass.tsx";
import Signup from "./routes/Signup.tsx";
import Dashboard from "./routes/Dashboard.tsx";
import Account from "./routes/Account.tsx";
import ChangePass from "./routes/ChangePass.tsx";
import AccountEdit from "./routes/AccountEdit.tsx";
import Export from "./routes/Export.tsx";
import ExportAdd from "./routes/ExportAdd.tsx";
import ExportEdit from "./routes/ExportEdit.tsx";
import ExportHistory from "./routes/ExportHistory.tsx";
import Suppliers from "./routes/Suppliers.tsx";
import SuppliersAdd from "./routes/SuppliersAdd.tsx";
import SuppliersEdit from "./routes/SuppliersEdit.tsx";
import Buyers from "./routes/Buyers.tsx";
import BuyersAdd from "./routes/BuyersAdd.tsx";
import BuyersEdit from "./routes/BuyersEdit.tsx";
import Production from "./routes/Production.tsx";
import ProductionAdd from "./routes/ProductionAdd.tsx";
import ProductionEdit from "./routes/ProductionEdit.tsx";
import Inputs from "./routes/Inputs.tsx";
import InputsAdd from "./routes/InputsAdd.tsx";
import InputsEdit from "./routes/InputsEdit.tsx";
import HistoricConsumption from "./routes/HistoricConsumption.tsx";
import Properties from "./routes/Properties.tsx";
import PropertiesAdd from "./routes/PropertiesAdd.tsx";
import PropertiesEdit from "./routes/PropertiesEdit.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import PublicRoute from "./routes/PublicRoute.tsx";
import GoBack from "./routes/GoBack.tsx";
import "./index.css";
import Main from "./routes/sondeo/Main.tsx";
import ResetPassword from "./routes/Reset.tsx";
import Developers from "./routes/Developers.tsx";
import Layout from "./routes/layouts/menu.tsx";
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
    path: "/recovery",
    element: (
      <PublicRoute>
        <ForgotPass />
      </PublicRoute>
    ),
  },
  {
    path: "/reset",
    element: (
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "dashboard",
        element: (
          <Layout>
            <Dashboard />
          </Layout>
        ),
      },
      {
        path: "account",
        element: (
          <Layout>
            <Account />
          </Layout>
        ),
      },
      {
        path: "account/change",
        element: <ChangePass />,
      },
      {
        path: "account/edit",
        element: <AccountEdit />,
      },
      {
        path: "properties",
        element: (
          <Layout>
            <Properties />
          </Layout>
        ),
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
        element: (
          <Layout>
            <Export />
          </Layout>
        ),
      },
      {
        path: "export/add",
        element: <ExportAdd />,
      },
      {
        path: "export/edit",
        element: <ExportEdit />,
      },
      {
        path: "export/history",
        element: <ExportHistory />,
      },
      {
        path: "production",
        element: (
          <Layout>
            <Production />
          </Layout>
        ),
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
        element: (
          <Layout>
            <Inputs />
          </Layout>
        ),
      },
      {
        path: "inputs/add",
        element: <InputsAdd />,
      },
      {
        path: "inputs/edit",
        element: <InputsEdit />,
      },
      {
        path: "inputs/consumption",
        element: <HistoricConsumption />,
      },
      {
        path: "buyers",
        element: (
          <Layout>
            <Buyers />
          </Layout>
        ),
      },
      {
        path: "buyers/add",
        element: <BuyersAdd />,
      },
      {
        path: "buyers/edit",
        element: <BuyersEdit />,
      },
      {
        path: "suppliers",
        element: (
          <Layout>
            <Suppliers />
          </Layout>
        ),
      },
      {
        path: "suppliers/add",
        element: <SuppliersAdd />,
      },
      {
        path: "suppliers/edit",
        element: <SuppliersEdit />,
      },
      {
        path: "sondeo",
        element: (
          <Layout>
            <Main />
          </Layout>
        ),
      },
      {
        path: "Developer",
        element: (
          <Layout>
            <Developers />
          </Layout>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <GoBack />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
