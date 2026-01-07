import React from "react";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

const SearchningFor = () => {
  return (
    <div
      style={{
        width: "550px",
        height: "262px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter:" blur(4.4px)",
        WebkitBackdropFilter:"blur(4.4px)",
        padding: "12px 14px",
        borderRadius: "6px",
        border: "1px solid rgba(255, 255, 255, 0.24)",
        backgroundColor: "rgba(255, 255, 255, 0.81)",
        position:"absolute",
        zIndex:"999",
        left:"37.6%",
        right:"50%",
        top:"6%"
      }}
    > 
     
      <label htmlFor="" style={{paddingBottom:"8px", fontFamily:"Inter", fontWeight:"400", fontSize:"14px"}}>Searching for</label>
      <div style={{ borderBottom: "1px solid #EAEAEA", display:"flex", gap:"8px",paddingBottom:"8px", fontFamily:"Inter", fontWeight:"400", fontSize:"14px" }}>
        <span
          style={{
            backgroundColor: "#E5F0FF",
            borderRadius: "8px",
            padding: "4px 8px",
          }}
        >
          Products
        </span>
        <span
          style={{
            backgroundColor: "#E5F0FF",
            borderRadius: "8px",
            padding: "4px 8px",
          }}
        >
          Customers
        </span>
        <span
          style={{
            backgroundColor: "#E5F0FF",
            borderRadius: "8px",
            padding: "4px 8px",
          }}
        >
          Suppliers
        </span>
        <span
          style={{
            backgroundColor: "#E5F0FF",
            borderRadius: "8px",
            padding: "4px 8px",
          }}
        >
          Invoices
        </span>
      </div>
    </div>
  );
};

export default SearchningFor;
