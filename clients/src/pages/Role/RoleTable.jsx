// components/Role/RoleTable.jsx
import React from "react";
import { FaUser } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import DeleteICONImg from "../../assets/images/delete.png";
import ViewDetailsImg from "../../assets/images/view-details.png";
import EditICONImg from "../../assets/images/edit.png";

const RoleTable = ({
  roles = [],
  loading = false,
  openMenuIndex,
  setOpenMenuIndex,
  menuRef,
  onDelete,
  onRowClick,
  selectedRolesForExport = [],
  handleCheckboxChange,
  selectAllForExport,
  handleSelectAllForExport

}) => {
  const navigate = useNavigate();

  const getPermissionsSummary = (role) => {
    if (!role.modulePermissions || Object.keys(role.modulePermissions).length === 0) return "Limited";

    const allFull = Object.values(role.modulePermissions).every(modulePerms => {
      return modulePerms.create && modulePerms.read && modulePerms.update && modulePerms.delete;
    });
  

    return allFull ? "Full" : "Limited";
  };

  const handleMenuAction = (action, role) => {
    setOpenMenuIndex(null);
    switch (action) {
      case "edit":
        navigate(`/edit-role/${role._id}`, { state: { role } });
        break;
      case "permissions":
        localStorage.setItem("selectedRoleName", role.roleName);
        navigate("", { state: { role } });
        break;
      case "delete":
        onDelete?.(role);
        break;
      default:
        break;
    }
  };

  // Stop row click propagation when clicking checkbox
  const handleCheckboxClick = (e, roleId) => {
    e.stopPropagation();
    handleCheckboxChange?.(roleId);
  };

  // Stop row click propagation when clicking select all checkbox
  const handleSelectAllClick = (e) => {
    e.stopPropagation();
    handleSelectAllForExport?.();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        Loading roles...
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        No roles found
      </div>
    );
  }

  return (
    <table
      className="table mb-0"
      style={{ borderSpacing: 0, borderCollapse: "separate" }}
    >
      <thead>
        <tr>
          {/* Select All Checkbox Column */}
          <th
            style={{
              backgroundColor: "#F3F8FB",
              fontWeight: 400,
              fontSize: 14,
              color: "#727681",
              padding: "12px 16px",
              position: "sticky",
              top: 0,
              zIndex: 10,
              width: "50px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <input
                type="checkbox"
                checked={selectAllForExport}
                onChange={handleSelectAllClick}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  accentColor: "#1F7FFF",
                }}
              />
            </div>
          </th>
          {["Roles", "Members", "Permissions", "Actions"].map((h, i) => (
            <th
              key={i}
              style={{
                backgroundColor: "#F3F8FB",
                fontWeight: 400,
                fontSize: 14,
                color: "#727681",
                padding: "12px 16px",
                position: "sticky",
                top: 0,
                zIndex: 10,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {roles.map((role, index) => (
          <tr key={role._id} style={{ verticalAlign: "middle", cursor: "pointer", backgroundColor: selectedRolesForExport.includes(role._id) ? "#f0f8ff" : "transparent" }} onClick={() => onRowClick?.(role)}>
            {/* Checkbox Cell */}
            <td
              style={{
                padding: "14px 16px",
                width: "50px"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <input
                  type="checkbox"
                  checked={selectedRolesForExport.includes(role._id)}
                  onChange={(e) => handleCheckboxClick(e, role._id)}
                  style={{
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    accentColor: "#1F7FFF",
                  }}
                />
              </div>
            </td>
            {/* Role Name */}
            <td style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 14, color: "#0E101A" }}>
                {role.roleName}
              </div>
            </td>

            {/* Members Count */}
            <td style={{ padding: "14px 16px" }}>
              <div className="d-flex align-items-center" style={{ gap: 8 }}>
                <span style={{ color: "#0E101A", fontSize: 14 }}>
                  {role.memberCount || 0}
                </span>
                <FaUser style={{ color: "#6C748C", fontSize: 14 }} />
              </div>
            </td>

            {/* Permissions */}
            <td style={{ padding: "14px 16px" }}>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  backgroundColor: getPermissionsSummary(role) === "Full" ? "#D4F7C7" : "#F7C7C9",
                  color: getPermissionsSummary(role) === "Full" ? "#01774B" : "#A80205",
                }}
              >
                {getPermissionsSummary(role)}
              </span>
            </td>

            {/* Actions */}
            <td style={{ padding: "8px 16px", position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuIndex(openMenuIndex === index ? null : index);
                }}
              >
                {/* Three dots button */}
                <div
                  style={{
                    width: 24,
                    height: 24,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ width: 4, height: 4, background: "#6C748C", borderRadius: 2 }} />
                  <div style={{ width: 4, height: 4, background: "#6C748C", borderRadius: 2 }} />
                  <div style={{ width: 4, height: 4, background: "#6C748C", borderRadius: 2 }} />
                </div>

                {/* Dropdown menu */}
                {openMenuIndex === index && (
                  <div
                    ref={menuRef}
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: 6,
                      width: 180,
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      border: "1px solid #E5E7EB",
                      zIndex: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() => handleMenuAction("edit", role)}
                      className="button-action"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 14,
                        fontWeight: 400,
                        cursor: "pointer",
                        color: "#333",
                      }}
                    >
                      <img src={EditICONImg} alt="edit" />  Edit
                    </div>
                    <div
                      onClick={() => handleMenuAction("permissions", role)}
                      className="button-action"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 14,
                        fontWeight: 400,
                        cursor: "pointer",
                        color: "#333",
                      }}
                    >
                      <img src={ViewDetailsImg} alt="viewdetails" />  View Permissions
                    </div>
                    <div
                      onClick={() => handleMenuAction("delete", role)}
                      className="button-action"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 12px",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 14,
                        fontWeight: 400,
                        cursor: "pointer",
                        color: "#333",
                      }}
                    >
                      <img src={DeleteICONImg} alt="delete" />  Delete
                    </div>
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RoleTable;