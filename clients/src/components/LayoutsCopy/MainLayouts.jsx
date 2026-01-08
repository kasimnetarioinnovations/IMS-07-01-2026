import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";

const MainLayouts = () => {
  const location = useLocation();

  // check if current route is addproduct
  const hideSidebar =
    location.pathname === "/add-product" ||
    location.pathname === "/product/edit" ||
    location.pathname === "/viewproduct" ||
    location.pathname === "/create-purchase-orders" ||
    location.pathname === "/m/create-creditnote" ||
    location.pathname === "/skeleton" || 
    location.pathname === "/createinvoice" || 
    location.pathname === "/create-debitnote" ;
  return (
    <div
      className="main-layouts"
      style={{
        backgroundColor: "#EFEFEF",
        display: "flex",
        overflow: "hidden",
        maxHeight: "100vh",
      }}
    >
      {!hideSidebar && <Sidebar />}

      <div
        className="right-layouts d-flex flex-column"
        style={{
          width: hideSidebar ? "100%" : "calc(100% - 235px)",
         
        }}
      >
        <Navbar />
        <div style={{borderLeft:"1px solid #e0dedeff"}}>
        <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayouts;
