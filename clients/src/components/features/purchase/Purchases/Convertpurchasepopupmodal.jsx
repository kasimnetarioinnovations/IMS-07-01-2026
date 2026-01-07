import React from "react";
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

const Convertpurchasepopupmodal = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.30)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onCancel} // click outside → close
    >
      {/* Modal Box */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          width: "420px",
          maxWidth: "92vw",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >

        {/* Body */}
        <div style={{ padding: "24px", textAlign: "left" }}>
          <p
            style={{
              margin: "0 0 8px 0",
              fontSize: "15px",
              color: "#4B5563",
              lineHeight: "1.5",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Are you sure you want to convert this invoice into purchase order ?
          </p>
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: "0 24px 24px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
          }}
        >
            <button
           onClick={() => onConfirm("cancelled")}
            style={{
              padding: "10px 24px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#EF4444",
              backgroundColor: "#f7c7c9",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              cursor: "pointer",
              minWidth: "80px",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f7c7c9")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#f7c7c9")}
          >
           <RxCross2 style={{fontWeight:500}}/> Rejected
          </button>
          <button
            onClick={() => onConfirm("received")}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6ab789",
              backgroundColor: "#d4f7c7",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              cursor: "pointer",
              minWidth: "80px",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#d4f7c7")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#d4f7c7")}
          >
           <IoIosCheckmark style={{fontWeight:500}}/> Approved
          </button>
        </div>
      </div>
    </div>
  );
};

export default Convertpurchasepopupmodal;