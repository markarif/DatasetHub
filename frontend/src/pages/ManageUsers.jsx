import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getUsers,
  addUser,
  updateUser,
  updateUserRole,
  deleteUser,
} from "../services/api";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organization: "",
    role: "user",
  });

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      organization: "",
      role: "user",
    });
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      organization: user.organization || "",
      role: user.role || "user",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          organization: formData.organization,
          role: formData.role,
        };

        await updateUser(editingId, updateData);
        alert("User updated successfully");
      } else {
        await addUser(formData);
        alert("User created successfully");
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to save user");
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      alert("User role updated successfully");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to update user role");
    }
  };

  const handleDelete = async (id) => {
    if (currentUser?.id === id) {
      alert("You cannot delete your own account while logged in.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user and their activity history?"
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      alert("User deleted successfully");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="page">
      <Link to="/admin" className="back-link">
        ← Back to admin
      </Link>

      <h1>Manage Users</h1>
      <p className="subtitle">
        Add users, edit details, change roles, or delete accounts.
      </p>

      <div className="details-card">
        <h2>{editingId ? "Edit User" : "Add New User"}</h2>

        <form className="form" onSubmit={handleSaveUser}>
          <label>Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {!editingId && (
            <>
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </>
          )}

          <label>Organization</label>
          <input
            name="organization"
            value={formData.organization}
            onChange={handleChange}
          />

          <label>Role</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="data_manager">Data Manager</option>
            <option value="admin">Admin</option>
          </select>

          <div className="top-actions">
            <button className="primary-btn" type="submit">
              {editingId ? "Update User" : "Create User"}
            </button>

            {editingId && (
              <button type="button" className="logout-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="details-card">
        <h2>Registered Users</h2>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Organization</th>
              <th>Quick Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.organization || "Not provided"}</td>

                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={currentUser?.id === user.id}
                  >
                    <option value="user">User</option>
                    <option value="data_manager">Data Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>{new Date(user.created_at).toLocaleDateString()}</td>

                <td>
                  <button className="small-btn" onClick={() => handleEdit(user)}>
                    Edit
                  </button>

                  <button
                    className="small-btn danger-btn"
                    onClick={() => handleDelete(user.id)}
                    disabled={currentUser?.id === user.id}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && <p className="empty-text">No users found.</p>}
      </div>
    </div>
  );
}

export default ManageUsers;