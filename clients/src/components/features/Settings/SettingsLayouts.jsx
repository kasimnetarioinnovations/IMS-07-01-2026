import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import "../../../styles/Settings.css";
import "../../../styles/Responsive.css";

const SettingsLayouts = () => {
  return (
    <div className="page-wrapper">
      <div className="content">
          <div>
      <h1
        style={{
          fontSize: "22px",
          fontFamily: "Inter",
          fontWeight: "500",
          paddingBottom: "10px",
        }}
      >
        Settings
      </h1>

      <div
        className="settings-layout-container d-flex"
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "16px",
          width: "100%",
          gap: "32px",
          height: "calc(100vh - 150px)",
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <div
          className="settings-sidebars"
          style={{ borderRight: "1px solid #dad6d6ff", width: "250px", paddingRight: "px", }}
        >
          {/* sidebar navlink */}
          <ul
            className="settings-sidebar-navlink"
            style={{
              listStyle: "none",
              paddingLeft: "0",
              marginBottom: "0",
              display: "flex",
              flexDirection: "column",
              gap: "25px",
            }}
          >
            <li className="settings-siber-menu-link">
              <NavLink
                to="user-profile-settings"
                className={({ isActive }) => (isActive ? "active-link" : "")}
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  textDecoration: "none",
                  color: "#727681",
                }}
              >
                User Profile
              </NavLink>
            </li>
            <li className="settings-siber-menu-link">
              {/* <Link
               to="company-settings"
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  color: "#727681",
                  textDecoration: "none",
                }}
              >
                Company Details
              </Link> */}
              <NavLink
                to="company-settings"
                className={({ isActive }) => (isActive ? "active-link" : "")}
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  textDecoration: "none",
                  color: "#727681",
                }}
              >
                Company Details
              </NavLink>
            </li>
            <li className="settings-siber-menu-link">
              {/* <Link
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  color: "#727681",
                  textDecoration: "none",
                }}
              >
                Print
              </Link> */}
              <NavLink
                to="barcode-print"
                className={({ isActive }) => (isActive ? "active-link" : "")}
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  textDecoration: "none",
                  color: "#727681",
                }}
              >
                Print
              </NavLink>
            </li>
            <li className="settings-siber-menu-link">
              {/* <Link
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  color: "#727681",
                  textDecoration: "none",
                }}
              >
                Notes, Terms & Footer se..
              </Link> */}
              <NavLink
                to="notes-term-condition"
                className={({ isActive }) => (isActive ? "active-link" : "")}
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  textDecoration: "none",
                  color: "#727681",
                }}
              >
                Notes, Terms & Footer se..
              </NavLink>
            </li>
            <li className="settings-siber-menu-link">
              {/* <Link
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  color: "#727681",
                  textDecoration: "none",
                }}
              >
               Taxes & GST
              </Link> */}
              <NavLink
                to="taxes-gst"
                className={({ isActive }) => (isActive ? "active-link" : "")}
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  textDecoration: "none",
                  color: "#727681",
                }}
              >
                Taxes & GST
              </NavLink>
            </li>
            <li className="settings-siber-menu-link">
              <NavLink
                to="pricing&planing"
                className={({ isActive }) => (isActive ? "active-link" : "")}
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  textDecoration: "none",
                  color: "#727681",
                }}
              >
                Pricing & Plans
              </NavLink>
            </li>
            <li className="settings-siber-menu-link">
              <NavLink
                to="supports"
                className={({ isActive }) => (isActive ? "active-link" : "")}
                style={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  textDecoration: "none",
                  color: "#727681",
                }}
              >
                Supports
              </NavLink>

            </li>
          </ul>
        </div>
        {/* Settings-right-content */}
        <div className="right-settings-content w-100">
          <Outlet />
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default SettingsLayouts;
