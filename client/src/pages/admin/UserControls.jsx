import { useEffect, useState } from "react";
import Spinner from "../../components/spinner/Spinner";
import "./userControls.scss";
import { useAppContext } from "../../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { FiUserCheck, FiUserX, FiShield, FiUser } from "react-icons/fi";

function UserControls() {
  const { getToken, user } = useAppContext();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const base_url = import.meta.env.VITE_BASE_URL;

  const fetchUsersData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${base_url}/api/admin/all-users`, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      console.log(data.users);
      setUsers(data.users);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, action) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }));

      const { data } = await axios.patch(
        `${base_url}/api/admin/update-user-role`,
        {
          userId,
          action, // 'make-admin' or 'remove-admin'
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);

        // Update local state with the returned metadata or construct it
        setUsers((prevUsers) =>
          prevUsers.map((userItem) =>
            userItem.id === userId
              ? {
                  ...userItem,
                  privateMetadata: {
                    ...userItem.privateMetadata,
                    role: action === "make-admin" ? "admin" : null,
                  },
                }
              : userItem
          )
        );

        // Log for debugging
        console.log("Role update successful:", {
          userId,
          action,
          updatedMetadata: data.updatedMetadata,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error updating role:", error);
      toast.error("Failed to update user role");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersData();
    }
  }, [user]);

  // Updated isAdmin function to handle null values properly
  const isAdmin = (userObj) => {
    const role = userObj?.privateMetadata?.role;
    return role === "admin";
  };

  return !isLoading ? (
    <div className="usercontrols-wrapper">
      <h1 className="admin-title">User Controls</h1>
      <div className="blur-circle1" />
      <div className="blur-circle2" />

      <div className="usercontrols-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FiUser />
          </div>
          <div className="stat-info">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admin">
            <FiShield />
          </div>
          <div className="stat-info">
            <h3>{users.filter((user) => isAdmin(user)).length}</h3>
            <p>Admin Users</p>
          </div>
        </div>
      </div>

      <div className="usercontrols-table-wrapper">
        <table className="usercontrols-table">
          <thead>
            <tr>
              <th className="usercontrols-header">Email</th>
              <th className="usercontrols-header">Name</th>
              <th className="usercontrols-header">Role</th>
              <th className="usercontrols-header">Created At</th>
              <th className="usercontrols-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userItem, index) => (
              <tr key={index} className="usercontrols-row">
                <td className="usercontrols-cell email">
                  {userItem.emailAddresses?.[0]?.emailAddress || "N/A"}
                </td>
                <td className="usercontrols-cell name">
                  {userItem.firstName && userItem.lastName
                    ? `${userItem.firstName} ${userItem.lastName}`
                    : userItem.firstName || userItem.lastName || "N/A"}
                </td>
                <td className="usercontrols-cell role">
                  <span
                    className={`role-badge ${
                      isAdmin(userItem) ? "admin" : "user"
                    }`}
                  >
                    {isAdmin(userItem) ? (
                      <>
                        <FiShield /> Admin
                      </>
                    ) : (
                      <>
                        <FiUser /> User
                      </>
                    )}
                  </span>
                </td>
                <td className="usercontrols-cell date">
                  {new Date(userItem.createdAt).toLocaleDateString()}
                </td>
                <td className="usercontrols-cell actions">
                  {userItem.id !== user?.id && (
                    <div className="action-buttons">
                      {!isAdmin(userItem) ? (
                        <button
                          className="btn make-admin"
                          onClick={() =>
                            handleRoleChange(userItem.id, "make-admin")
                          }
                          disabled={actionLoading[userItem.id]}
                        >
                          {actionLoading[userItem.id] ? (
                            <span className="loading-spinner"></span>
                          ) : (
                            <>
                              <FiUserCheck /> Make Admin
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          className="btn remove-admin"
                          onClick={() =>
                            handleRoleChange(userItem.id, "remove-admin")
                          }
                          disabled={actionLoading[userItem.id]}
                        >
                          {actionLoading[userItem.id] ? (
                            <span className="loading-spinner"></span>
                          ) : (
                            <>
                              <FiUserX /> Remove Admin
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  {userItem.id === user?.id && (
                    <span className="current-user">Current User</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div className="spinner-fullscreen">
      <Spinner />
    </div>
  );
}

export default UserControls;
