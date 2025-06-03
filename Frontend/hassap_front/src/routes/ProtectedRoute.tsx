import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedRoute() {
  // const [isAuth, setIsAuth] = useState(false);
  const isAuth = false;

  return isAuth ? <Outlet /> : <Navigate to="/" />;
}
