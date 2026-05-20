import { BrowserRouter, Routes, Route } from "react-router-dom";
import DatasetList from "./pages/DatasetList";
import DatasetDetails from "./pages/DatasetDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AddDataset from "./pages/AddDataset";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./pages/ProtectedRoute";
import AiGapReports from "./pages/AiGapReports";
import ManageDatasets from "./pages/ManageDatasets";
import EditDataset from "./pages/EditDataset";
import FeedbackReports from "./pages/FeedbackReports";
import UserProfile from "./pages/UserProfile";
import RequestAccess from "./pages/RequestAccess";
import AccessRequests from "./pages/AccessRequests";
import ManageDomains from "./pages/ManageDomains";
import ManageUsers from "./pages/ManageUsers";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DatasetList />} />

        <Route
          path="/datasets/:id"
          element={
            <ProtectedRoute>
              <DatasetDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/request-access/:id"
          element={
            <ProtectedRoute>
              <RequestAccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute adminOnly={true}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-dataset"
          element={
            <ProtectedRoute adminOnly={true}>
              <AddDataset />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-datasets"
          element={
            <ProtectedRoute adminOnly={true}>
              <ManageDatasets />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-domains"
          element={
            <ProtectedRoute adminOnly={true}>
              <ManageDomains />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-users"
          element={
            <ProtectedRoute adminOnly={true}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-dataset/:id"
          element={
            <ProtectedRoute adminOnly={true}>
              <EditDataset />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback-reports"
          element={
            <ProtectedRoute adminOnly={true}>
              <FeedbackReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-gap-reports"
          element={
            <ProtectedRoute adminOnly={true}>
              <AiGapReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/access-requests"
          element={
            <ProtectedRoute adminOnly={true}>
              <AccessRequests />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;