import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet, useLocation, matchPath } from "react-router-dom";



const MainLayouts = () => {
  const location = useLocation();

  // check if current route is addproduct
  const hideSidebar =
    location.pathname === "/add-product" ||
    location.pathname === "/product/edit" ||
    location.pathname === "/viewproduct" ||
    location.pathname === "/m/create-creditnote" ||
    location.pathname === "/skeleton" || 
    // for edit view product
    matchPath("/product/edit/:id", location.pathname) || 
    matchPath("/product/view/:id", location.pathname) ||
    // for invoice, quotation, credit note
      matchPath("/createinvoice/:customerId", location.pathname) ||
       matchPath("/create-quotition/:customerId", location.pathname) ||         
       location.pathname === "/credit-note" ||
       // for purchaseorder, debit note
       matchPath("/create-purchase-orders/:supplierId", location.pathname) ||
       matchPath("/create-supplier-debitnote/:supplierId", location.pathname)

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
