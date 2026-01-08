// components/Users/UserTable.jsx
import React from "react";
import { BsThreeDots } from "react-icons/bs";
import { HiOutlineArrowsUpDown } from "react-icons/hi2";
import { FiEdit } from "react-icons/fi";
import { MdRemoveRedEye, MdOutlineChangeCircle } from "react-icons/md";
import DeleteICONImg from "../../assets/images/delete.png";
import ViewDetailsImg from "../../assets/images/view-details.png";
import EditICONImg from "../../assets/images/edit.png";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

const UserTable = ({
  users = [],
  loading = false,
  onEdit,
  onDelete,
  onViewDetails,
  openMenuIndex,
  setOpenMenuIndex,
  menuRef,
  selectedUsersForExport,
  handleCheckboxChange,
  selectAllForExport,
  handleSelectAllForExport,
}) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return { backgroundColor: "#D4F7C7", color: "#01774B" };
      case "Inactive":
        return { backgroundColor: "#F7C7C9", color: "#A80205" };
      case "Blacklist":
        return { backgroundColor: "#BBE1FF", color: "#003E70" };
      default:
        return { backgroundColor: "#EAEAEA", color: "#727681" };
    }
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center py-5">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="text-center py-5 text-muted">No users found</div>;
  }

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: "0 10px",
        fontFamily: "Inter",
      }}
    >
      <thead style={{ position: "sticky", top: 0, zIndex: 9 }}>
        <tr style={{ backgroundColor: "#F3F8FB", textAlign: "left" }}>
          <th
            style={{
              padding: "8px 16px",
              color: "#727681",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            <input
              type="checkbox"
              id="select-all-users"
              checked={selectAllForExport}
              onChange={handleSelectAllForExport}
              style={{ marginRight: "8px" }}
            />
            User
          </th>
          <th
            style={{
              padding: "8px 16px",
              color: "#727681",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Roles
          </th>
          <th
            style={{
              padding: "8px 16px",
              color: "#727681",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Last Login
          </th>
          <th
            style={{
              padding: "8px 16px",
              color: "#727681",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Permissions
          </th>
          <th
            style={{
              padding: "8px 16px",
              color: "#727681",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Status
            <HiOutlineArrowsUpDown style={{ marginLeft: "10px" }} />
          </th>
          <th
            style={{
              padding: "8px 16px",
              color: "#727681",
              fontSize: "14px",
              fontWeight: 400,
            }}
          >
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {users.map((user, index) => (
          <tr
            key={user._id || index}
            style={{
              backgroundColor: "white",
              borderBottom: "1px solid #FCFCFC",
            }}
          >
            {/* User column */}
            <td style={{ padding: "8px 16px" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <input
                  type="checkbox"
                  checked={selectedUsersForExport.includes(user._id)}
                  onChange={() => handleCheckboxChange(user._id)}
                  style={{ marginRight: "8px" }}
                />
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "8px",
                        backgroundColor: "#D9D9D9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#727681",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      {user.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span style={{ color: "#0E101A", fontSize: "14px" }}>
                      {user.name || "Unknown User"}
                    </span>
                    <span style={{ color: "#727681", fontSize: "14px" }}>
                      {user.email || "No email"}{" "}
                      {user.phone ? `& ${user.phone}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </td>

            {/* Role */}
            <td
              style={{
                padding: "8px 16px",
                color: "#0E101A",
                fontSize: "14px",
              }}
            >
              {user.role?.roleName || "No Role"}
            </td>

            {/* Last Login */}
            <td
              style={{
                padding: "8px 16px",
                color: "#0E101A",
                fontSize: "14px",
              }}
            >
              {formatLastLogin(user.lastLogin)}
            </td>

            {/* Permissions */}
            <td
              style={{
                padding: "8px 16px",
                color: "#0E101A",
                fontSize: "14px",
              }}
            >
              {user.role?.permissions ? "Limited" : "Full"}
            </td>

            {/* Status */}
            <td style={{ padding: "8px 16px" }}>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  ...getStatusStyle(user.status),
                }}
              >
                {user.status || "Active"}
              </span>
            </td>

            {/* Actions */}
            <td style={{ padding: "8px 16px", textAlign: "center" }}>
              <button
                onClick={() =>
                  setOpenMenuIndex(openMenuIndex === index ? null : index)
                }
                className="btn"
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label="actions"
              >
                <HiOutlineDotsHorizontal size={28} color="grey" />
              </button>
              {openMenuIndex === index && (
                <div
                  ref={menuRef}
                  style={{
                    backgroundColor: "white",
                    padding: "1px 10px",
                    borderRadius: "16px",
                    position: "absolute",
                    zIndex: 1000,
                    right: "130px",
                    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ul
                    style={{
                      listStyle: "none",
                      marginBottom: "0",
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "10px",
                      padding: "15px 0px",
                    }}
                  >
                    <li
                      onClick={() => {
                      onEdit?.(user);
                      setOpenMenuIndex(null);
                    }}
                      className="button-action"
                      style={{
                        color: "#0E101A",
                        fontFamily: "Inter",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: " 5px 10px",
                        borderRadius: "8px",
                      }}
                    >
                      <img src={EditICONImg} alt="cat_actions_icon" />
                      <label
                        style={{
                          color: "#0E101A",
                          fontFamily: "Inter",
                          fontSize: "16px",
                          textDecoration: "none",
                        }}
                      >
                        Edit
                      </label>
                    </li>

                    <li
                      onClick={() => {
                      onViewDetails?.(user);
                      setOpenMenuIndex(null);
                    }}
                      className="button-action"
                      style={{
                        color: "#0E101A",
                        fontFamily: "Inter",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: " 5px 10px",
                        borderRadius: "8px",
                      }}
                    >
                      <img src={ViewDetailsImg} alt="cat_actions_icon" />
                      <label
                        style={{
                          color: "#0E101A",
                          fontFamily: "Inter",
                          fontSize: "16px",
                          textDecoration: "none",
                        }}
                      >
                       View Details
                      </label>
                    </li>
                    <li
                      onClick={() => {
                      onDelete?.(user);
                      setOpenMenuIndex(null);
                    }}
                      className="button-action"
                      style={{
                        color: "#0E101A",
                        fontFamily: "Inter",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: " 5px 10px",
                        borderRadius: "8px",
                      }}
                    >
                      <img src={DeleteICONImg} alt="cat_actions_icon" />
                      <label
                        style={{
                          color: "#0E101A",
                          fontFamily: "Inter",
                          fontSize: "16px",
                          textDecoration: "none",
                        }}
                      >
                       Delete
                      </label>
                    </li>
                  </ul>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
