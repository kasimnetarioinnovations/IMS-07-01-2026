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
import { useSocket } from "../../Context/SocketContext";
import api from "../../pages/config/axiosInstance";
import Activities from '../layouts/Navbar/activities'
import { GoPlus } from "react-icons/go";
import CreateModel from "../CreateModel";

const Navbar = () => {
  const [ShowCreateModel, setShowCreateModel] = useState(false);
  const [sidebarActive, setSidebarActive] = useState(false);
  const serchingRef = useRef(null);
  const serchingBtnRef = useRef(null);
  const [showRecentSearch, setShowRecentSearch] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [dropdownActive, setDropdownActive] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { connectSocket, getSocket } = useSocket();

  const fetchNotificationCount = async () => {
    try {
      if (!user) return;

      // console.log('🔔 Fetching notification count for user:', user?._id);

      const res = await api.get(`/api/notifications/unread/${user?._id}`);
      setNotificationCount(res.data.count || 0);
    } catch (error) {
      // console.error("Error fetching notification count:", error);
    }
  };


  useEffect(() => {
    if (!user) return;
    fetchNotificationCount(); // Fetch notification count

    // Initialize socket connection for real-time notifications
    const socket = connectSocket(api.defaults.baseURL);

    if (socket) {
      // Register current user so server can route events correctly
      try {
        socket.emit("add-user", user?._id);
      } catch (e) {
        // console.error("Failed to register user on socket:", e);
      }

      // Listen for new notifications
      socket.on("new-notification", (notificationData) => {
        setNotificationCount((prev) => prev + 1);
      });
    }

    return () => {
    };
  }, [user]);

  const handleUnreadCountChange = (count) => {
    setNotificationCount(Math.max(0, Number(count) || 0));
  };

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
      // console.warn(`Module "${module}" not found in permissions for user ${user?.name}`);
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
  const modelRef = useRef(null);
  const buttonRef = useRef(null);
  const handleCreateClick = () => {
    setShowCreateModel(prev => !prev); // toggles open/close
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search dropdown
      if (
        serchingRef.current &&
        !serchingRef.current.contains(event.target) &&
        serchingBtnRef.current &&
        !serchingBtnRef.current.contains(event.target)
      ) {
        setShowRecentSearch(false);
      }

      // Close create modal
      if (
        modelRef.current &&
        !modelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowCreateModel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      // console.error("Fullscreen toggle failed:", err);
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
          className={`mobile-toggle-btn d-none ${sidebarActive ? "active" : ""
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
        {/* <div className="nav-logo">
          <img
            src={nav_logo}
            alt="nav_logo"
            style={{ width: "100%", objectFit: "contain" }}
          />
        </div> */}

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
            style={{ cursor: "pointer", fontSize: "25px" }}
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
            <div style={{ position: "relative" }}
              className="icon-hover"
              onClick={(e) => {
                e.preventDefault();
                setDropdownActive(!dropdownActive);
              }}>
              <PiBellThin size={26} cursor="pointer" title="Notifications" />
              {notificationCount > 0 && (
                <span
                  className="badge rounded-pill"
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    backgroundColor: "red",
                    color: "white",
                    fontSize: "10px",
                    minWidth: "18px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    border: "1px solid white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </div>

            {dropdownActive && (
              <div
                className=""
                style={{ borderRadius: "8px", position: "absolute", top: "55px", right: "80px", zIndex: 1000, }}
              >
                <Activities onUnreadCountChange={handleUnreadCountChange} onClose={() => setDropdownActive(false)} />
              </div>
            )}
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

          {/* Create Model */}
          <button
            ref={buttonRef}
            onClick={handleCreateClick}
            className="create-btn button-hover button-color"
            style={{
              // backgroundColor: "#1F7FFF",
              color: "white",
              border: "none",
              fontFamily: 'Inter',
              fontSize: "14px",

              padding: "8px",
              borderRadius: "8px",
              width: "89px",
              height: "36px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "4px"

            }}
          >
            <GoPlus size={20} />
            Create
          </button>
        </div>

      </nav>

      {ShowCreateModel && (
        <div ref={modelRef}>
          <CreateModel />
        </div>
      )}


      {showRecentSearch && (
        <div ref={serchingRef}>
          <SearchningFor results={filteredRoutes} onSelect={handleNavigate} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
