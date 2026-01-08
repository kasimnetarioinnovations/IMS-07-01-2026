import React, { useState, useRef, useEffect } from "react";
import nav_logo from "../../assets/images/kasper-logo.png";
import { CiSearch } from "react-icons/ci";
import { IoSettingsOutline } from "react-icons/io5";
import { PiBellThin } from "react-icons/pi";
import "../../styles/Navbar.css";
import pos_icon from "../../assets/images/pos-icon.png";
import "../../styles/Responsive.css";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { RiMenu2Line } from "react-icons/ri";
import ai from "../../assets/images/AI.png";
import SearchningFor from "./SearchningFor";
import { useAuth } from "../../components/auth/AuthContext";
import { SIDEBAR_SEARCH_ROUTES } from "../../utils/sidebarSearchConfig";
import { TbMaximize, TbZoomScan } from "react-icons/tb";

const Navbar = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const serchingRef = useRef(null);
  const serchingBtnRef = useRef(null);
  const [showRecentSearch, setShowRecentSearch] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  const settingGoToPage = () => {
    navigate("/settings/user-profile-settings");
  };

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    const sidebar = document.querySelector(".sidebarmenu-container");
    sidebar?.classList.toggle("sidebar-active");
    setSidebarActive((prev) => !prev);
  };

  const canAccess = (module, action = "read") => {
    // ✅ Admin bypass: full access - check roleName instead of name
    if (user?.role?.roleName?.toLowerCase() === "admin") return true;

    // If no permissions or module not defined → deny
    if (!permissions || !permissions[module]) {
      console.warn(
        `Module "${module}" not found in permissions for user ${user?.name}`
      );
      return false;
    }

    const modulePerms = permissions[module];

    // ✅ Allow only if all:true or specific action:true
    return modulePerms?.all === true || modulePerms?.[action] === true;
  };

  if (!user) return null;

  const id = user?._id || user?.id;
  const permissions = user?.role?.modulePermissions || {};

  // Serach function logic
  const [searchText, setSearchText] = useState("");
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const handleSearch = (value) => {
    setSearchText(value);

    if (!value.trim()) {
      setFilteredRoutes([]);
      return;
    }

    const results = SIDEBAR_SEARCH_ROUTES.filter((route) =>
      route.label.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredRoutes(results);
  };
  const handleNavigate = (path) => {
    navigate(path);
    setFilteredRoutes([]);
    setSearchText("");
    setShowRecentSearch(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        serchingRef.current &&
        !serchingRef.current.contains(event.target) &&
        serchingBtnRef.current &&
        !serchingBtnRef.current.contains(event.target)
      ) {
        setShowRecentSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "white",
        // height: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e0dedeff",
      }}
    >
      <nav
        style={{
          width: "100%",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
        }}
      >
        {/*Mobile Toggle Button  */}
        <div
          className={`mobile-toggle-btn d-none ${
            sidebarActive ? "active" : ""
          }`}
          id="mobileToggleBtn"
          onClick={handleSidebarToggle}
          style={{ border: "2px solid rgb(31, 127, 255)" }}
        >
          <RiMenu2Line
            className="open-icon"
            size={25}
            color="rgb(31, 127, 255)"
          />
        </div>
        <div className="nav-logo">
          <img
            src={nav_logo}
            alt="nav_logo"
            style={{ width: "100%", objectFit: "contain" }}
          />
        </div>

        <div
          className="nav-search-input border-hover d-flex align-items-center gap-1"
          style={{
            backgroundColor: "#FCFCFC",
            border: "1px solid #EAEAEA",
            width: "550px",
            padding: "5px 16px",
            borderRadius: "8px",
          }}
        >
          <CiSearch size={20} style={{ color: "#6C748C", fontWeight: "500" }} />
          <input
            onClick={() => {
              if (searchText.trim()) setShowRecentSearch(true);
            }}
            onChange={(e) => {
              handleSearch(e.target.value);
              setShowRecentSearch(e.target.value.trim().length > 0);
            }}
            type="search"
            placeholder="Search"
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              backgroundColor: "transparent",
            }}
          />
          <div
            className="ai d-flex justify-content-center align-items-center"
            style={{
              backgroundColor: "#E9F0F4",
              borderRadius: "4px",
              padding: "4px 4px",
              cursor: "pointer",
            }}
          >
            <img style={{ width: "100%" }} src={ai} alt="ai" />
          </div>
        </div>
        {/* FullScreen Maximaize */}
        <div className="d-flex align-items-center gap-3">
          <TbZoomScan
            id="btnFullscreen"
            style={{ cursor: "pointer" , fontSize:"25px"}}
            onClick={handleFullscreen}
            title="Max&Min"
            
          />

          <div className="nav-user-info  d-flex align-items-center gap-3">
            {canAccess("Settings", "read") && (
              <div className="icon-hover">
                <IoSettingsOutline
                  size={24}
                  onClick={settingGoToPage}
                  cursor="pointer"
                  title="Settings"
                />
              </div>
            )}
            <div className="icon-hover">
              <PiBellThin size={26} cursor="pointer" title="Notifications" />
            </div>
          </div>

          {canAccess("POS", "read") && (
            <button
              className="button-color button-hover d-flex justify-content-center align-items-center"
               data-bs-toggle="tooltip"
  data-bs-placement="top"
  title="POS MACHINE"
              style={{
                padding: "8px",
                width: "65px",
                height: "36px",
                gap: "4px",
              
              }}
            >
              <img src={pos_icon} alt="pos_icon" />
              <Link
                to="/pos"
                style={{
                  textDecoration: "none",
                  color: "white",
                  fontFamily: "Inter",
                  fontSize: "14px",
                  
                  
                }}
              >
                POS
              </Link>
            </button>
          )}
        </div>
      </nav>

      {showRecentSearch && (
        <div ref={serchingRef}>
          <SearchningFor results={filteredRoutes} onSelect={handleNavigate} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
