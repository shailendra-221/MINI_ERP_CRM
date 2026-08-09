import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/customers/CustomerList";
import CustomerForm from "./pages/customers/CustomerForm";
import CustomerDetail from "./pages/customers/CustomerDetail";
import ProductList from "./pages/products/ProductList";
import ProductForm from "./pages/products/ProductForm";
import ProductDetail from "./pages/products/ProductDetail";
import ChallanList from "./pages/challans/ChallanList";
import ChallanForm from "./pages/challans/ChallanForm";
import ChallanDetail from "./pages/challans/ChallanDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />

        <Route path="/customers" element={<CustomerList />} />
        <Route
          path="/customers/new"
          element={
            <ProtectedRoute roles={["ADMIN", "SALES"]}>
              <CustomerForm />
            </ProtectedRoute>
          }
        />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route
          path="/customers/:id/edit"
          element={
            <ProtectedRoute roles={["ADMIN", "SALES"]}>
              <CustomerForm />
            </ProtectedRoute>
          }
        />

        <Route path="/products" element={<ProductList />} />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute roles={["ADMIN", "WAREHOUSE"]}>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute roles={["ADMIN", "WAREHOUSE"]}>
              <ProductForm />
            </ProtectedRoute>
          }
        />

        <Route path="/challans" element={<ChallanList />} />
        <Route
          path="/challans/new"
          element={
            <ProtectedRoute roles={["ADMIN", "SALES"]}>
              <ChallanForm />
            </ProtectedRoute>
          }
        />
        <Route path="/challans/:id" element={<ChallanDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
