import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { IoIosSearch, IoIosArrowDown } from "react-icons/io";
import { FaArrowLeft, FaBarcode, FaFileImport } from "react-icons/fa6";
import { MdOutlineViewSidebar, MdAddShoppingCart } from "react-icons/md";
import { TbFileImport, TbFileExport } from "react-icons/tb";

import Pagination from "../../components/Pagination";
import Barcode from "../../assets/images/barcode.jpg";

function DamageReport() {
  const [viewBarcode, setViewBarcode] = useState([]);
  const [viewOptions, setViewOptions] = useState([]);

  const buttonRefs = useRef([]);
  const modelRef = useRef(null); // reference to modal area

  // ✅ close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // close only when:
      const isClickInsideModel =
        modelRef.current && modelRef.current.contains(event.target);

      const isClickInsideButton =
        buttonRefs.current[viewBarcode] &&
        buttonRefs.current[viewBarcode].contains(event.target);

      buttonRefs.current[viewOptions] &&
        buttonRefs.current[viewOptions].contains(event.target);

      if (!isClickInsideModel && !isClickInsideButton) {
        setViewBarcode(false);
        setViewOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [viewBarcode][viewOptions]);

  const products = [
    {
      name: "H&M Shirt",
      price: "₹3,200/-",
      category: "Men's, Shirt",
      qty: 12,
      code: "981763272809",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "H&M Shirt",
      price: "₹4,900/-",
      category: "Men's, Shirt",
      qty: 12,
      code: "019763272112",
      purchase: "₹2,900/-",
      selling: "₹4,900/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "Jack & Jones Jackets",
      price: "",
      category: "Jackets",
      qty: 19,
      code: "101763272231",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "Jack & Jones Jackets",
      price: "",
      category: "Jackets",
      qty: 19,
      code: "101763272231",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "Jack & Jones Jackets",
      price: "",
      category: "Jackets",
      qty: 19,
      code: "101763272231",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "Jack & Jones Jackets",
      price: "",
      category: "Jackets",
      qty: 19,
      code: "101763272231",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "Jack & Jones Jackets",
      price: "",
      category: "Jackets",
      qty: 19,
      code: "101763272231",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "Jack & Jones Jackets",
      price: "",
      category: "Jackets",
      qty: 19,
      code: "101763272231",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "Jack & Jones Jackets",
      price: "",
      category: "Jackets",
      qty: 19,
      code: "101763272231",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "Jack & Jones Jackets",
      price: "",
      category: "Jackets",
      qty: 19,
      code: "101763272231",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
    {
      name: "Jack & Jones Jackets",
      price: "",
      category: "Jackets",
      qty: 19,
      code: "101763272231",
      purchase: "₹2,500/-",
      selling: "₹3,200/-",
      reason: "The Shirt line were ripped in left hand side.",
    },
  ];

  const tabs = [{ label: "All", count: 156, active: true }];

  return (
    // <div className="page-wrapper">
      // <div className="content">
        <div className="px-4 py-4">
          {/* back, header, view style */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0px 0px 16px 0px", // Optional: padding for container
            }}
          >
            {/* Left: Title + Icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                height: '33px'
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "black",
                  fontSize: 22,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  height: '33px'
                }}
              >
                Damages Report
              </h2>
            </div>

            {/* Right: Action Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                height: "33px",
              }}
            >
              <button
                style={{
                  padding: "6px 16px",
                  background: "white",
                  border: "1px solid #1F7FFF",
                  color: "#1F7FFF",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: "14px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  height: "33px",
                }}
              >
                <MdAddShoppingCart className="fs-5" />
                <span className="fs-6">Add Expenses</span>
              </button>
            </div>
          </div>

          {/* main body */}
          <div style={{
            width: '100%',
            minHeight: 'auto',
            maxHeight: 'calc(100vh - 160px)',
            padding: 16,
            background: 'white',
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            fontFamily: 'Inter, sans-serif',
          }}>
            {/* tabs + Search Bar & import */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                height: "33px",
              }}
            >
              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  padding: 2,
                  background: "#F3F8FB",
                  borderRadius: 8,
                  flexWrap: "wrap",
                  maxWidth: "50%",
                  width: "fit-content",
                }}
              >
                {tabs.map((tab) => (
                  <div
                    key={tab.label}
                    style={{
                      padding: "4px 12px",
                      background: tab.active ? "white" : "transparent",
                      borderRadius: 8,
                      boxShadow: tab.active
                        ? "0px 1px 4px rgba(0, 0, 0, 0.10)"
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      color: "#0E101A",
                    }}
                  >
                    {tab.label}
                    <span style={{ color: "#727681" }}>{tab.count}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "inline-flex",
                  justifyContent: "end",
                  alignItems: "center",
                  gap: 16,
                  width: "50%",
                  height: "33px",
                }}
              >
                {/* search bar */}
                <div
                  style={{
                    width: "50%",
                    position: "relative",
                    padding: "5px 0px 5px 10px",
                    display: "flex",
                    borderRadius: 8,
                    alignItems: "center",
                    background: "#FCFCFC",
                    border: "1px solid #EAEAEA",
                    gap: "5px",
                    color: "rgba(19.75, 25.29, 61.30, 0.40)",
                    height: "33px",
                  }}
                >
                  <IoIosSearch style={{ fontSize: "25px" }} />
                  <input
                    type="text"
                    placeholder="Search"
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: 14,
                      background: "#FCFCFC",
                      color: "rgba(19.75, 25.29, 61.30, 0.40)",
                    }}
                  />
                </div>

                {/* Export Button */}
                <button
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 9,
                    padding: "8px 16px",
                    background: "#FCFCFC",
                    borderRadius: 8,
                    outline: "1px solid #EAEAEA",
                    outlineOffset: "-1px",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    height: "33px",
                    color: "#0E101A",
                  }}
                >
                  <TbFileExport className="fs-5 text-secondary" />
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div
              className="table-responsive"
              style={{
                overflowY: "auto",
                maxHeight: "510px",
              }}
            >
              <table
                className="table-responsive"
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  overflowX: "auto",
                }}
              >
                {/* Header */}
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    height: "38px",
                  }}
                >
                  <tr style={{ background: "#F3F8FB" }}>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: "auto",
                        fontWeight: "400",
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 12 }}
                      >
                        <input type="checkbox" style={{ width: 18, height: 18 }} />
                        Date
                      </div>
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: "auto",
                        fontWeight: "400",
                      }}
                    >
                      Products
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: "auto",
                        fontWeight: "400",
                      }}
                    >
                      Items Code
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: "auto",
                        fontWeight: "400",
                      }}
                    >
                      Quantity
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: "auto",
                        fontWeight: "400",
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: "auto",
                        fontWeight: "400",
                      }}
                    >
                      Reason
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #FCFCFC" }}>
                      {/* date */}
                      <td
                        style={{
                          padding: "8px 16px", verticalAlign: "middle", height: '46px'
                        }}
                      >
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 12 }}
                        >
                          <input
                            type="checkbox"
                            style={{ width: 18, height: 18 }}
                          />
                          {product.selling}
                        </div>
                      </td>

                      {/* Product Name & Category */}
                      <td style={{ padding: "8px 16px", verticalAlign: "middle" }}>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 12 }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                color: "#0E101A",
                                whiteSpace: "nowrap",
                                display: "flex",
                                gap: "5px",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                {product.name}{" "}
                                {product.price && (
                                  <span style={{ marginLeft: 4 }}>
                                    {product.price}
                                  </span>
                                )}
                              </div>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 8px",
                                  background: "#FFE0FC",
                                  color: "#AE009B",
                                  borderRadius: 36,
                                  fontSize: 12,
                                  marginTop: 4,
                                }}
                              >
                                {product.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Item Code */}
                      <td
                        style={{
                          padding: "8px 16px",
                          fontSize: 14,
                          color: "#0E101A",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            cursor: "pointer",
                            position: "relative",
                          }}
                          onClick={() =>
                            setViewBarcode(viewBarcode === index ? false : index)
                          }
                          ref={(el) => (buttonRefs.current[index] = el)}
                        >
                          {product.code}
                          <FaBarcode className="fs-6 text-secondary" />
                        </div>
                        {viewBarcode === index && (
                          <>
                            <div
                              style={{
                                position: "fixed",
                                inset: 0,
                                background: "rgba(0,0,0,0.5)",
                                zIndex: 999999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <div
                                ref={modelRef}
                                style={{
                                  width: "70%",
                                  backgroundColor: "#f5f4f4ff",
                                  borderRadius: 16,
                                  padding: 24,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    width: "400px",
                                    height: "auto",
                                    backgroundColor: "white",
                                    outfit: "contain",
                                    boxShadow: "10px 10px 40px rgba(0,0,0,0.10)",
                                    borderRadius: 16,
                                    padding: 16,
                                    border: "2px solid #dbdbdbff",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                  }}
                                >
                                  <span>
                                    {product.name} / {product.purchase}
                                  </span>
                                  <img
                                    src={Barcode}
                                    alt="Barcode"
                                    style={{ width: "100%" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </td>

                      {/* qty */}
                      <td
                        style={{
                          padding: "8px 16px",
                          fontSize: 14,
                          color: "#0E101A",
                        }}
                      >
                        {product.qty}
                      </td>

                      {/* amount */}
                      <td
                        style={{
                          padding: "8px 16px",
                          fontSize: 14,
                          color: "#0E101A",
                        }}
                      >
                        {product.selling}
                      </td>

                      {/* reason */}
                      <td
                        style={{
                          padding: "8px 16px",
                          fontSize: 14,
                          color: "#0E101A",
                        }}
                      >
                        {product.reason.length > 20
                          ? product.reason.slice(0, 20) + "..."
                          : product.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="page-redirect-btn px-2">
              <Pagination />
            </div>
          </div>
        </div>
     
  );
}

export default DamageReport;
