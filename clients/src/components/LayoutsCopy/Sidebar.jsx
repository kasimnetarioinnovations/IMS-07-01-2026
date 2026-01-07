import React, { useState, useEffect } from "react";
import "../../styles/sidebar.css";
import munc_logo from "../../assets/images/munc-logo.png";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { BiLogoWhatsapp } from "react-icons/bi";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import UserId from "../../assets/images/user-logo.png";
import all_p from "../../assets/images/allp-icon.png";
import cat_icon from "../../assets/images/cat-icon.png";
import exp_icon from "../../assets/images/exp-icon.png";
import dam_icon from "../../assets/images/dam-icon.png";
import low_icon from "../../assets/images/low-icon.png";
import cus_icon from "../../assets/images/cus-icon.png";
import dues_icon from "../../assets/images/over-icon.png";
import "../../styles/Responsive.css";
import { FaAnglesLeft } from "react-icons/fa6";
import { useAuth } from "../../components/auth/AuthContext";
import { IoLogOutOutline } from "react-icons/io5";
import api from "../../pages/config/axiosInstance"


const Sidebar = () => {
 const { user: authUser, logout } = useAuth();
   const userData = authUser;
   console.log("usersrs", userData);
   
    const [users, setUser] = useState(null);
     const userObj = authUser;
  const userId = authUser?._id
  const { user } = useAuth();

   const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout", {}, { withCredentials: true });
      logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

   useEffect(() => {
    // if (!userId || !token) return;
    if (!userId) return;

    const fetchUser = async () => {
      try {
        // First try to use the user data from localStorage
        if (userObj) {
          setUser(userObj);
        }

        // Then fetch fresh data from the API
        const response = await api.get(`/api/user/${userId}`, {
          withCredentials: true,
        });

        if (response.data) {
          setUser(response.data);
          // Update localStorage with fresh data
          // localStorage.setItem("user", JSON.stringify(response.data));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // If API call fails, use localStorage data if available
        if (userObj && !user) {
          setUser(userObj);
        }
      }
    };

    fetchUser();
   })

  
  
 
// const permissions = user?.role?.modulePermissions || {};

if (!user) return null;


  const id = user?._id || user?.id;
    console.log("ID", id);
  const permissions = user?.role?.modulePermissions || {};
  console.log("permission", permissions);
  

const canAccess = (module, action = "read") => {
    // ✅ Admin bypass: full access - check roleName instead of name
    if (user?.role?.roleName?.toLowerCase() === "admin") return true;

    // If no permissions or module not defined → deny
    if (!permissions || !permissions[module]) {
      console.warn(`Module "${module}" not found in permissions for user ${user?.name}`);
      return false;
    }

    const modulePerms = permissions[module];

    // ✅ Allow only if all:true or specific action:true
    return modulePerms?.all === true || modulePerms?.[action] === true;
  };


  
  const [openDropdown, setOpenDropdown] = useState(null);
  const handleToggle = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Close button handler
  const handleSidebarClose = () => {
    const sidebar = document.querySelector(".sidebarmenu-container");
    sidebar?.classList.remove("sidebar-active");
    setSidebarActive(false);
  };

  const hasInventoryAccess =
  canAccess("AddProduct", "read") ||
  canAccess("Product", "read") ||
  canAccess("Category", "read") ||
  canAccess("Damage&Return", "read") ||
  canAccess("LowStocks", "read") ||
  canAccess("HSN", "read") ||
  canAccess("PrintBarcode", "read");

   const hasMainAccess =
  canAccess("Dashboard", "read") ||
   canAccess("POS", "read")  

 const hasConnectAccess =
 canAccess("Whatsapp", "read") ||
  canAccess("Chat", "read") ||
  canAccess("Mail", "read") 

  return (
    <div>
      <div
        id="sidebarMenu"
        className="sidebarmenu-container"
        style={{
          width: "235px",
          height: "100vh",
          backgroundColor: "white",
          padding: "16px 16px 16px 16px",
        
        }}
      >
        {/* Close Button */}
        <div
          className="close-btn"
          onClick={handleSidebarClose}
          style={{
            position: "absolute",
            right: "-20px",
            top: "50px",
            backgroundColor: "rgb(185 212 228)",
            borderRadius: "50px",
            padding: "5px",
            width: "35px",
            height: "35px",
            // display: "flex",
            alignItems: "center",
            justifyContent: "center",
            display: "none",
          }}
        >
          <FaAnglesLeft className="close-icon" size={22} color="#52adfa" />
        </div>

        <div className="sidebar-logo d-flex justify-content-center pb-4">
          <img
            src={munc_logo}
            alt="munc_logo"
            style={{ objectFit: "contain", width: "100%", maxWidth: "150px" }}
          />
        </div>

        {/* Siebar Menu Link */}
        <div className="sidebar-menu-link" >
          {/* Main  */}
           {hasMainAccess && (
           <ul className="sidebarmenu">
            <li
              className="sidebarmenu-item d-flex flex-column"
              onClick={() => handleToggle("main")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Main</span>
                <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "main" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}
              <ul
                className={`dropdown ${openDropdown === "main" ? "open" : ""}`}
              >
                   {canAccess("Dashboard" , "read") && (
                <li>
                  <NavLink to="dashboard">
                    <RiDashboardHorizontalLine size={16} />
                    Dashboard
                  </NavLink>
                </li>
                   )}
                 
                 {canAccess("POS" , "read") && (
                   <li>
                  <NavLink to="/pos">
                    <BiLogoWhatsapp size={16} />
                    POS
                  </NavLink>
                </li>
                 )}
                
                  
              </ul>
            </li>
            <hr style={{ height: "1px", color: "#979797ff" }} />
          </ul>
           )}
            
            {/* Connect */}
            {hasConnectAccess && (
             <ul className="sidebarmenu" style={{ paddingBottom: "18px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("connect")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Connect</span>
                <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "connect" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "connect" ? "open" : ""
                }`}
              >
                {canAccess("Whatsapp" , "read") && (
                <li>
                  <NavLink to="whatsapp">
                    <BiLogoWhatsapp size={16} />
                    Connect Whatsapp
                  </NavLink>
                </li>
                  )}
                 
                
                 {canAccess("Chat" , "read") && (
                 <li>
                  <NavLink to="/chat">
                    <BiLogoWhatsapp size={16} />
                    Chat
                  </NavLink>
                </li>
                  )}
                  {canAccess("Mail" , "read") && (
                <li>
                  <NavLink to="/mail/inbox">
                    <BiLogoWhatsapp size={16} />
                    Mail
                  </NavLink>
                </li>
                    )}
                 
              </ul>
            </li>
          </ul>
          )}
          
          {/* Inventory */}
           {hasInventoryAccess && (
          <ul className="sidebarmenu" style={{ paddingBottom: "18px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("inventory")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Inventory</span>
                <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "inventory" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "inventory" ? "open" : ""
                }`}
              >
                {/* {canAccess("AddProduct", "read") &&( */}
                <li>
                  <NavLink to="add-product">
                    <img src={all_p} alt="all_p" />
                    Add Products
                  </NavLink>
                </li>
               {/* )} */}
                
                
                {canAccess("Product" , "read") && (
                <li>
                  <NavLink to="product">
                    <img src={all_p} alt="all_p" />
                    All Products
                  </NavLink>
                </li>
                )}
                 {canAccess("Category", "read") &&(
                <li>
                  <NavLink to="category-list">
                    <img src={cat_icon} alt="" />
                    Category
                  </NavLink>
                </li>
                 )}
                 
                {/* {canAccess("Damage&Return", "read") && ( */}
                <li>
                  <NavLink to="damage-return">
                    <img src={dam_icon} alt="" />
                    Damage & Return
                  </NavLink>
                </li>
                 {/* )}  */}
                  {/* {canAccess("LowStocks", "read") &&( */}
                <li>
                  <NavLink to="low-stocks">
                    <img src={low_icon} alt="" />
                    Low Stocks
                  </NavLink>
                </li>
               {/* )}   */}
                 {canAccess("HSN", "read") &&(
                 <li>
                  <NavLink to="hsn">
                    <img src={low_icon} alt="" />
                    HSN
                  </NavLink>
                </li>
                 )}
                   {canAccess("PrintBarcode", "read") &&(
                 <li>
                  <NavLink to="barcode">
                    <img src={low_icon} alt="" />
                    Print Barcode
                  </NavLink>
                </li>
                   )}
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}
          </ul>
           )} 
          {/* Customers */}
          <ul className="sidebarmenu" style={{ paddingBottom: "18px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("customers")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Customers</span>
                <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "customers" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "customers" ? "open" : ""
                }`}
              >
                  {canAccess("Customer", "read") &&(
                <li>
                  <NavLink to="customers">
                    <img src={cus_icon} alt="cus_icon" />
                    All Customers
                  </NavLink>
                </li>
                  )}
                {canAccess("Dues&Advance", "read") &&(
                <li>
                  <NavLink to="customerdueadvance">
                    <img src={dues_icon} alt="" />
                    Dues & Advance
                  </NavLink>
                </li>
                )}
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}
          </ul>
          {/* Supplires */}
          <ul className="sidebarmenu" style={{ paddingBottom: "18px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("suppliers")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Suppliers</span>
                <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "suppliers" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "suppliers" ? "open" : ""
                }`}
              >
                 {canAccess ("Supplier", "read") && (
                <li>
                  <NavLink to="supplier-list">
                    <RiDashboardHorizontalLine size={16} />
                    All Suppliers
                  </NavLink>
                </li>
                )}
                
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}
          </ul>
          {/* Purchase Order */}
          <ul className="sidebarmenu" style={{ paddingBottom: "18px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("purchase")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Purchase Order</span>
                <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "purchase" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "purchase" ? "open" : ""
                }`}
              >
                {/* <li>
                <NavLink to="/m/create-purchase"><RiDashboardHorizontalLine size={16}/>Create Purchase Order</NavLink>
              </li> */}
              {canAccess("Purchase","read") &&(
                <li>
                  <NavLink to="purchase-list">
                    <BiLogoWhatsapp size={16} />
                    Purchase Orders
                  </NavLink>
                </li>
                )}
                   {canAccess("DebitNote","read") &&(
                <li>
                  <NavLink to="debit-note">
                    <BiLogoWhatsapp size={16} />
                    Debit Note
                  </NavLink>
                </li>
                   )}
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}
          </ul>
          {/* Sales Order */}
          <ul className="sidebarmenu" style={{ paddingBottom: "0px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("sales")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Sales Order</span>
                <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "sales" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${openDropdown === "sales" ? "open" : ""}`}
              >
                 {canAccess("Sales", "read") && (
                <li>
                  <NavLink to="online-orders">
                    <RiDashboardHorizontalLine size={16} />
                    Sales Order
                  </NavLink>
                </li>
                )}
               {canAccess("Invoices", "read") && (
                <li>
                  <NavLink to="invoice">
                    <BiLogoWhatsapp size={16} />
                     Invoice
                  </NavLink>
                </li>
               )}
               {/* {canAccess("Invoices", "read") && ( */}
                <li>
                  <NavLink to="/quotation-list">
                    <BiLogoWhatsapp size={16} />
                     Quotaion
                  </NavLink>
                </li>
               {/* )} */}
                {/* <li>
                <NavLink to="/reports"><BiLogoWhatsapp size={16}/>Sales History</NavLink>
              </li> */}
              {canAccess("CreditNote", "read") && (
                <li>
                  <NavLink to="credit-note">
                    <BiLogoWhatsapp size={16} />
                    Credit Note
                  </NavLink>
                </li>
              )}
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}

            <hr style={{ height: "1px", color: "#979797ff" }} />
          </ul>
          {/* My Online Store */}
          {/* {canAccess("Myonlinestore" , "read") &&( */}
          <ul className="sidebarmenu" style={{ paddingBottom: "0px" }}>
            <div
              className="sidebarmenu-title"
              style={{ color: "black", fontSize: "14px" }}
            >
              <span>My Online Store</span>
              <button
                style={{
                  border: "1px solid #4105F5",
                  borderRadius: "50px",
                  backgroundColor: "transparent",
                  fontSize: "12px",
                  fontFamily: "Inter",
                  color: "#4105F5",
                  fontWeight: "500",
                }}
              >
                UPCOMING
              </button>
            </div>
            <hr style={{ height: "1px", color: "#979797ff" }} />
          </ul>
          {/* )} */}
          {/* Warehouse */}
          <ul className="sidebarmenu" style={{ paddingBottom: "0px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("warehouse")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Warehouse</span>
                <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "warehouse" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "warehouse" ? "open" : ""
                }`}
              >
                 {canAccess("Warehouse","read") &&(
                <li>
                  <NavLink to="warehouse">
                    <RiDashboardHorizontalLine size={16} />
                    All Warehouse
                  </NavLink>
                </li>
                 )}
                <li>
                  <NavLink to="stock-movement-log">
                    <BiLogoWhatsapp size={16} />
                    Stock Movement
                  </NavLink>
                </li>
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}

            <hr style={{ height: "1px", color: "#979797ff" }} />
          </ul>
          {/* Payment Adjustment */}
          <ul className="sidebarmenu" style={{ paddingBottom: "0px" }}>
            <li
              className="expenses-li"
              style={{ fontSize: "16px", paddingBottom: "18px" }}
            >
              <NavLink
              to='expense-report'
                style={{
                  fontSize: "16px",
                  textDecoration: "none",
                  color: "black",
                }}
              >
                Expenses
              </NavLink>
            </li>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("payment")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Payment Adjustment</span>
                <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "payment" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "payment" ? "open" : ""
                }`}
              >
                <li>
                  <NavLink to="/dashboard">
                    <RiDashboardHorizontalLine size={16} />
                    Payment In
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reports">
                    <BiLogoWhatsapp size={16} />
                    Payment Out
                  </NavLink>
                </li>
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}

            <hr style={{ height: "1px", color: "#979797ff" }} />
          </ul>
          {/* Reports */}
          <ul className="sidebarmenu" style={{ paddingBottom: "18px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("reports")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Reports</span>
                 <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "reports" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "reports" ? "open" : ""
                }`}
              >
                <li>
                  <NavLink to="sales-report">
                    <RiDashboardHorizontalLine size={16} />
                    Sales Report
                  </NavLink>
                </li>
                <li>
                  <NavLink to="purchase-report">
                    <BiLogoWhatsapp size={16} />
                    Purchase Report
                  </NavLink>
                </li>
                <li>
                  <NavLink to="inventory-report">
                    <BiLogoWhatsapp size={16} />
                    Inventory Report
                  </NavLink>
                </li>
                <li>
                  <NavLink to="supplier-report">
                    <BiLogoWhatsapp size={16} />
                    Supplier Report
                  </NavLink>
                </li>
                <li>
                  <NavLink to="return-damage-report">
                    <BiLogoWhatsapp size={16} />
                    Return & Damages Report
                  </NavLink>
                </li>
                <li>
                  <NavLink to="credit&debit-note">
                    <BiLogoWhatsapp size={16} />
                    Debit & Credit Note Report
                  </NavLink>
                </li>
                <li>
                  <NavLink to="overdue-report">
                    <BiLogoWhatsapp size={16} />
                    Overdue Report
                  </NavLink>
                </li>
               
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}
          </ul>
          {/* Accounting */}
          <ul className="sidebarmenu" style={{ paddingBottom: "18px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("accounting")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Accounting</span>
                 <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "accounting" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "accounting" ? "open" : ""
                }`}
              >
                <li>
                  <NavLink to="/dashboard">
                    <RiDashboardHorizontalLine size={16} />
                    Balance Sheet
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reports">
                    <BiLogoWhatsapp size={16} />
                    Profit & Loss
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reports">
                    <BiLogoWhatsapp size={16} />
                    Overdue Report
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reports">
                    <BiLogoWhatsapp size={16} />
                    Expense Report
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reports">
                    <BiLogoWhatsapp size={16} />
                    B2B & B2C
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reports">
                    <BiLogoWhatsapp size={16} />
                    Payment History
                  </NavLink>
                </li>
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}
          </ul>
           {/* User Role and managemnt */}
         
           <li
              className="user-role-li"
              style={{ fontSize: "16px", paddingBottom: "18px" }}
            >
              <NavLink
              to='users'
                style={{
                  fontSize: "16px",
                  textDecoration: "none",
                  color: "black",
                }}
              >
                Users Role & Management
              </NavLink>
            </li>
          {/* Settings */}
          <ul className="sidebarmenu" style={{ paddingBottom: "18px" }}>
            <li
              className="sidebarmenu-item"
              onClick={() => handleToggle("settings")}
            >
              <div
                className="sidebarmenu-title"
                style={{ color: "black", fontSize: "14px" }}
              >
                <span>Settings</span>
               <MdOutlineKeyboardArrowRight
                  size={14}
                  className={`dropdown-icon ${
                    openDropdown === "settings" ? "rotate" : ""
                  }`}
                />
              </div>

              {/* Dropdown items */}

              <ul
                className={`dropdown ${
                  openDropdown === "settings" ? "open" : ""
                }`}
              >
                <li>
                  <NavLink to="settings/user-profile-settings">
                    <RiDashboardHorizontalLine size={16} />
                     Setting 1
                  </NavLink>
                </li>
                <li>
                    <NavLink to={`profile/${id}`}>
                      <BiLogoWhatsapp size={16} />
                      Settings 2
                    </NavLink>
                </li>
              </ul>
            </li>
            {/* <hr style={{height:"1px", color:"#979797ff"}}/> */}
          </ul>
        </div>
       {/* User Info */}
{userData ? (
  <div
    className="user-id d-flex align-items-center justify-content-between"
    style={{ backgroundColor: "white" }}
  >
    {/* Profile Image OR First Letter */}
    {userData?.profileImage?.url ? (
      <img
        src={userData.profileImage.url}
        alt="Profile"
        style={{
          borderRadius: "50px",
          objectFit: "contain",
          height: "40px",
          width: "40px",
        }}
      />
    ) : (
      <div
        style={{
          height: "40px",
          width: "40px",
          borderRadius: "50%",
          backgroundColor: "#e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "600",
        }}
      >
        {userData?.name?.charAt(0)?.toUpperCase()}
      </div>
    )}

    {/* User Info */}
    <div className="user-id-info">
      <p
        style={{
          marginBottom: "0",
          color: "#3D3D3D",
          fontSize: "14px",
        }}
      >
        {userObj?.name || "User"}
      </p>

      <p
        style={{
          marginBottom: "0",
          color: "#727681",
          fontSize: "12px",
        }}
      >
        {userData?.role?.roleName || "User"}
      </p>
    </div>

    {/* Logout */}
    <IoLogOutOutline
      onClick={handleLogout}
      color="red"
      title="Logout"
      size={18}
    />
  </div>
) : null}

      </div>
    </div>
  );
};

export default Sidebar;
