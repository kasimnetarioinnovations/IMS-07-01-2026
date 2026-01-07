import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import calendarIcon from "../../../assets/img/date.png";
import { MdNavigateNext } from "react-icons/md";
import { GrFormPrevious } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import BASE_URL from "../../config/config";
import axios from "axios";

//New Redesign--------------------------------------------------------------------------------------------------
import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import Pagination from "../../../components/Pagination";
import ViewDebitCreditModal from './DebitCreditReportView';

import { IoIosSearch, IoIosArrowDown } from "react-icons/io";
import { FiEdit } from "react-icons/fi";
import { MdOutlineViewSidebar, MdAddShoppingCart } from "react-icons/md";
import { RiListView, RiDeleteBinLine } from "react-icons/ri";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";
import { RiInboxArchiveFill, RiInboxUnarchiveFill } from "react-icons/ri";
import { TbFileImport, TbFileExport } from "react-icons/tb";
import { LuReceiptText } from "react-icons/lu";
import { LuPackageSearch } from "react-icons/lu";
import { LuRefreshCcwDot } from "react-icons/lu";
import { TiDocumentText } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { TiTick } from "react-icons/ti";
import {
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
} from "react-icons/md";

const CreditDebitNotes = () => {
  const [debitData, setDebitData] = useState([]);

  // Fetch Debit Notes (Outflow)
  useEffect(() => {
    const fetchDebitNotes = async () => {
      try {
        const token = localStorage.getItem("token");

        // ✅ FIX 2: Correctly structured the headers for the axios request.
        const res = await axios.get(
          `${BASE_URL}/api/debit-notes/getDebit?limit=10&page=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.data.debitNotes) {
          setDebitData(res.data.debitNotes);
        } else if (res.data.data) {
          setDebitData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching debit notes:", error);
      }
    };
    fetchDebitNotes();
  }, []);

  // ✅ FIX 3: Uncommented dummy data for InflowTable to show something.
  // In a real app, you would fetch this from an API like you did for debitData.
  const data = [
    // {
    //   date: "12 Jul 2025",
    //   from: "Electricity",
    //   type: "Short Circuit",
    //   invoiceNo: "INV-001",
    //   amount: "1500",
    //   paymentMode: "UPI",
    //   status: "Due",
    // },
    // {
    //   date: "13 Jul 2025",
    //   from: "Supplier Refund",
    //   type: "Goods Return",
    //   invoiceNo: "INV-002",
    //   amount: "3000",
    //   paymentMode: "Bank",
    //   status: "Paid",
    // },
    // {
    //   date: "14 Jul 2025",
    //   from: "Customer Credit",
    //   type: "Overpayment",
    //   invoiceNo: "INV-003",
    //   amount: "500",
    //   paymentMode: "Cash",
    //   status: "Paid",
    // },
  ];

  // This dummy data is no longer needed if the API call works, but is here for reference.
  const data2 = [
    // {
    //   date: "12 Jul 2025",
    //   to: "Electricity",
    //   type: "Short Circuit",
    //   invoiceNo: "UPI",
    //   amount: "Shop",
    //   paymentMode: "UPI",
    //   status: "Due",
    // },
    // {
    //   date: "12 Jul 2025",
    //   to: "Electricity",
    //   type: "Short Circuit",
    //   invoiceNo: "UPI",
    //   amount: "Shop",
    //   paymentMode: "UPI",
    //   status: "Paid",
    // },
  ];

  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-03-31"),
      key: "selection",
    },
  ]);
  const [activeTab, setActiveTab] = useState("inflow");
  const navigate = useNavigate();

  const handleChange = (item) => {
    setRange([item.selection]);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };
  const handleExport = () => {
    const dataToExport = activeTab === "inflow" ? data : debitData;
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${activeTab === "inflow" ? "Credit" : "Debit"}Notes.xlsx`);
  };


  const [viewDebitCreditModel, setViewDebitCreditModel] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);  // For pre-fill

  const handleDebitCreditModel = (product) => {  // FIXED: Accept product
    setSelectedProduct(product);  // ADDED: Store for modal
    setViewDebitCreditModel(true);
  };

  const tabs = [
    { label: 'All', count: 156, active: true },
    { label: 'Debit Note', count: 91 },
    { label: 'Credit Note', count: 52 },
  ];

  const products = [
    {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Debit Note",
      amount: "1,300/-",
      paystatus: "Paid",
      status: "Approved",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Credit Note",
      amount: "1,300/-",
      paystatus: "Pending",
      status: "Rejected",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Debit Note",
      amount: "1,300/-",
      paystatus: "Paid",
      status: "Approved",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Credit Note",
      amount: "1,300/-",
      paystatus: "Pending",
      status: "Rejected",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Debit Note",
      amount: "1,300/-",
      paystatus: "Paid",
      status: "Approved",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Credit Note",
      amount: "1,300/-",
      paystatus: "Pending",
      status: "Rejected",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Debit Note",
      amount: "1,300/-",
      paystatus: "Paid",
      status: "Approved",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Credit Note",
      amount: "1,300/-",
      paystatus: "Pending",
      status: "Rejected",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Debit Note",
      amount: "1,300/-",
      paystatus: "Paid",
      status: "Approved",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Credit Note",
      amount: "1,300/-",
      paystatus: "Pending",
      status: "Rejected",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Debit Note",
      amount: "1,300/-",
      paystatus: "Paid",
      status: "Approved",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    }, {
      issueDate: "12/12/2025",
      supplier: 'Decathilon',
      refinvno: "DN-019",
      type: "Credit Note",
      amount: "1,300/-",
      paystatus: "Pending",
      status: "Rejected",
      createdby: "Alok",
      reason: "The cotton blend top was ripped",
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* <div
          style={{
            backgroundColor: "white",
            border: "1px solid #E6E6E6",
            borderRadius: "8px",
          }}
        >
          <div
            className="d-flex justify-content-between"
            style={{ padding: "20px" }}
          >
            <span
              style={{
                color: "#262626",
                fontFamily: '"Roboto", sans-serif',
                fontWeight: "500",
                fontSize: "18px",
              }}
            >
              Credit & Debit Notes
            </span>
            <button
              onClick={handleExport}
              style={{
                border: "none",
                backgroundColor: "#FFFFFF",
                boxShadow:
                  "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                borderRadius: "4px",
                padding: "5px 8px",
                color: "#676767",
                fontSize: "16px",
                fontWeight: "400",
                fontFamily: '"Roboto", sans-serif',
              }}
            >
              Export
            </button>
          </div>

          <div
            style={{
              borderTop: "1px solid #E6E6E6",
              borderBottom: "1px solid #E6E6E6",
            }}
          >
            <div
              style={{
                padding: "10px 20px",
                display: "flex",
                gap: "10px",
                fontFamily: '"Roboto", sans-serif',
                fontWeight: "400",
                fontSize: "16px",
              }}
            >
              <button
                onClick={() => setActiveTab("inflow")}
                style={{
                  border: "none",
                  backgroundColor: "white",
                  color: "#080808ff",
                  borderBottom:
                    activeTab === "inflow" ? "2px solid grey" : "none",
                  cursor: "pointer",
                }}
              >
                Credit Notes
              </button>
              <button
                onClick={() => setActiveTab("outflow")}
                style={{
                  backgroundColor: "white",
                  border: "none",
                  borderBottom:
                    activeTab === "outflow" ? "2px solid grey" : "none",
                  cursor: "pointer",
                }}
              >
                Debit Notes
              </button>
            </div>
          </div>

          <div
            className="d-flex justify-content-between align-items-center"
            style={{ padding: "15px 20px" }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{
                  border: "none",
                  backgroundColor: "#E6E6E6",
                  color: "#262626",
                  padding: "3px 7px",
                }}
              >
                All
              </button>
              <button
                style={{
                  border: "none",
                  backgroundColor: "#e6e6e60c",
                  color: "#262626",
                  padding: "3px 7px",
                }}
              >
                Issued
              </button>
              <button
                style={{
                  border: "none",
                  backgroundColor: "#e6e6e60c",
                  color: "#262626",
                  padding: "3px 7px",
                }}
              >
                Refunded
              </button>
              <button
                style={{
                  border: "none",
                  backgroundColor: "#e6e6e60c",
                  color: "#262626",
                  padding: "3px 7px",
                }}
              >
                Adjusted
              </button>
              <button
                style={{
                  border: "none",
                  backgroundColor: "#e6e6e60c",
                  color: "#262626",
                  padding: "3px 7px",
                }}
              >
                Cancelled
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <div
                onClick={toggleCalendar}
                style={{
                  border: "1px solid #E6E6E6",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  width: "250px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <span>{`${format(range[0].startDate, "dd/MM/yyyy")} - ${format(
                  range[0].endDate,
                  "dd/MM/yyyy"
                )}`}</span>
                <img
                  src={calendarIcon}
                  alt="calendar"
                  style={{ width: "18px" }}
                />
              </div>
              {showCalendar && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 999,
                    top: "100%",
                    right: 0,
                    marginTop: "5px",
                  }}
                >
                  <DateRange
                    editableDateInputs={true}
                    onChange={handleChange}
                    moveRangeOnFirstSelection={false}
                    ranges={range}
                    rangeColors={["#1368EC"]}
                  />
                </div>
              )}
            </div>
          </div>

          {activeTab === "inflow" ? (
            <InflowTable data={data} navigate={navigate} />
          ) : (
            // The call here is correct, passing debitData as the 'data' prop
            <OutflowTable data={debitData} navigate={navigate} />
          )}

          <div
            className="d-flex justify-content-end gap-3"
            style={{ padding: "10px 50px" }}
          >
            <span
              style={{
                backgroundColor: "white",
                boxShadow: "rgb(0 0 0 / 4%) 0px 3px 8px",
                padding: "7px",
                borderRadius: "5px",
                border: "1px solid #e4e0e0ff",
              }}
            >
              10 <span style={{ color: "grey" }}>per page</span>
            </span>
            <span
              style={{
                backgroundColor: "white",
                boxShadow: "rgb(0 0 0 / 4%) 0px 3px 8px",
                padding: "7px",
                borderRadius: "5px",
                border: "1px solid #e4e0e0ff",
              }}
            >
              1-4 <span style={{ color: "grey" }}>of 4</span>{" "}
              <button
                style={{
                  border: "none",
                  color: "grey",
                  backgroundColor: "white",
                }}
              >
                <GrFormPrevious />
              </button>{" "}
              <button style={{ border: "none", backgroundColor: "white" }}>
                <MdNavigateNext />
              </button>
            </span>
          </div>
        </div> */}

        <div className="">
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
                height: "33px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "black",
                  fontSize: 22,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  height: "33px",
                }}
              >
                Debit & Credit Note Report
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

          {/* main content */}
          <div
            style={{
              width: "100%",
              minHeight: "auto",
              maxHeight: "calc(100vh - 200px)",
              padding: 16,
              background: "white",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              fontFamily: "Inter, sans-serif",
              overflowY: "auto",
            }}
          >
            {/* tabs + Search Bar & export import */}
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
                  height: "33px",
                  maxWidth: "50%",
                  minWidth: "auto",
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

              {/* Search Bar & export import */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "end",
                  gap: "24px",
                  height: "33px",
                  width: "50%",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    position: "relative",
                    padding: "8px 16px 8px 20px",
                    display: "flex",
                    borderRadius: 8,
                    alignItems: "center",
                    background: "#FCFCFC",
                    border: "1px solid #EAEAEA",
                    gap: "5px",
                    color: "rgba(19.75, 25.29, 61.30, 0.40)",
                  }}
                >
                  <IoIosSearch />
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

                <div
                  style={{
                    display: "inline-flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
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
                      color: "#0E101A",
                      height: "33px",
                    }}
                  >
                    <TbFileExport className="fs-5 text-secondary" />
                    Export
                  </button>
                </div>
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
                        width: 120,
                        fontWeight: "400",
                      }}
                    >
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 12 }}
                      >
                        <input type="checkbox" style={{ width: 18, height: 18 }} />
                        Issue Date
                      </div>
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: 200,
                        fontWeight: "400",
                      }}
                    >
                      Supplier Name
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: 120,
                        fontWeight: "400",
                      }}
                    >
                      Ref. Invoice No.
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: 120,
                        fontWeight: "400",
                      }}
                    >
                      Type
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: 120,
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
                        width: 120,
                        fontWeight: "400",
                      }}
                    >
                      Payment Status
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: 120,
                        fontWeight: "400",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: 120,
                        fontWeight: "400",
                      }}
                    >
                      Created By
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "4px 16px",
                        color: "#727681",
                        fontSize: 14,
                        width: 250,
                        fontWeight: "400",
                      }}
                    >
                      Reason
                    </th>
                  </tr>
                </thead>

                <tbody
                  style={
                    {
                      // overflowY:'auto',
                    }
                  }
                >
                  {products.map((product, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #FCFCFC" }} >
                      {/* issued date */}
                      <td style={{ padding: "8px 16px", verticalAlign: "middle" }}>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 12 }}
                          onClick={() => handleDebitCreditModel(product)}
                        >
                          <input
                            type="checkbox"
                            style={{ width: 18, height: 18 }}
                          />
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
                                cursor: 'pointer',
                              }}
                            >
                              <div>{product.issueDate}</div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* supplier */}
                      <td
                        style={{
                          padding: "8px 16px",
                          fontSize: 14,
                          color: "#0E101A",
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDebitCreditModel(product)}
                      >
                        {product.supplier}
                      </td>

                      {/* ref invoice no */}
                      <td
                        style={{
                          padding: "8px 16px",
                          fontSize: 14,
                          color: "#0E101A",
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDebitCreditModel(product)}
                      >
                        {product.refinvno}
                      </td>

                      {/* type */}
                      <td
                        style={{
                          padding: "8px 16px",
                          // fontSize: 14,
                          color: "#0E101A",
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDebitCreditModel(product)}
                      >
                        {product.type}
                      </td>

                      {/* amount */}
                      <td
                        style={{
                          padding: "8px 16px",
                          // fontSize: 14,
                          color: "#0E101A",
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDebitCreditModel(product)}
                      >
                        {product.amount}
                      </td>

                      {/* paystatus */}
                      <td
                        style={{
                          padding: "8px 16px",
                          // fontSize: 14,
                          color: "#0E101A",
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDebitCreditModel(product)}
                      >
                        {product.paystatus}
                      </td>

                      {/* status */}
                      <td
                        style={{
                          padding: "8px 16px",
                          // fontSize: 14,
                          color: "#0E101A",
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDebitCreditModel(product)}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            background: product.status === "Approved" ? "#D4F7C7" : "#F7C7C9",
                            color: product.status === "Approved" ? "#01774B" : "#A80205",
                            borderRadius: 36,
                            fontSize: 12,
                            marginTop: 4,
                          }}
                        >
                          {product.status === "Approved" ? <TiTick /> : "x"} {product.status}
                        </span>
                      </td>

                      {/* createdby */}
                      <td
                        style={{
                          padding: "8px 16px",
                          // fontSize: 14,
                          color: "#0E101A",
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDebitCreditModel(product)}
                      >
                        {product.createdby}
                      </td>

                      {/* reason */}
                      <td
                        style={{
                          padding: "8px 16px",
                          // fontSize: 14,
                          color: "#0E101A",
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDebitCreditModel(product)}
                      >
                        {product.reason.length > 30 ? product.reason.slice(0, 30) + "..." : product.reason}
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

          {/* view debit credit report model */}
          {viewDebitCreditModel && (
            <ViewDebitCreditModal
              closeModal={() => setViewDebitCreditModel(false)}
              selectedProduct={selectedProduct}  // FIXED: Pass data
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Inflow Table
// const InflowTable = ({ data, navigate }) => (
//   <div className="table-responsive">
//     <table className="table datatable">
//       <thead>
//         <tr>
//           <th style={{ padding: "15px 20px" }}>
//             <input type="checkbox" />
//           </th>
//           <th style={{ padding: "15px 20px" }}>Date</th>
//           <th style={{ padding: "15px 20px" }}>From</th>
//           <th style={{ padding: "15px 20px" }}>Type</th>
//           <th style={{ padding: "15px 20px" }}>Invoice No.</th>
//           <th style={{ padding: "15px 20px" }}>Amount</th>
//           <th style={{ padding: "15px 20px" }}>Payment Mode</th>
//           <th style={{ padding: "15px 20px" }}>Status</th>
//           <th style={{ padding: "15px 20px" }}>Actions</th>
//         </tr>
//       </thead>
//       <tbody
//         style={{
//           color: "#262626",
//           fontFamily: '"Roboto", sans-serif',
//           fontWeight: "400",
//           fontSize: "16px",
//         }}
//       >
//         {data.length > 0 ? (
//           data.map((item, index) => (
//             <tr
//               key={index}
//               style={{ borderBottom: "1px solid #E6E6E6", cursor: "pointer" }}
//               onClick={() => navigate("/credit")}
//             >
//               <td style={{ padding: "10px 20px" }}>
//                 <input type="checkbox" />
//               </td>
//               <td style={{ padding: "10px 20px" }}>{item.date}</td>
//               <td style={{ padding: "10px 20px" }}>{item.from}</td>
//               <td style={{ padding: "10px 20px" }}>{item.type}</td>
//               <td style={{ padding: "10px 20px" }}>{item.invoiceNo}</td>
//               <td style={{ padding: "10px 20px" }}>{item.amount}</td>
//               <td style={{ padding: "10px 20px" }}>{item.paymentMode}</td>
//               <td style={{ padding: "10px 20px" }}>
//                 <span
//                   style={{
//                     padding: "5px",
//                     borderRadius: "5px",
//                     backgroundColor:
//                       item.status === "Due" ? "#FCE4E6" : "#DFFFE0",
//                     color: item.status === "Due" ? "#491E1F" : "#1E4921",
//                   }}
//                 >
//                   {item.status}
//                 </span>
//               </td>
//               <td
//                 style={{
//                   padding: "10px 20px",
//                   fontWeight: "800",
//                   color: "black",
//                 }}
//               >
//                 ...
//               </td>
//             </tr>
//           ))
//         ) : (
//           <tr>
//             <td colSpan="9" style={{ padding: "20px", textAlign: "center" }}>
//               No Credit Notes Found
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   </div>
// );

// Outflow Table
// ✅ FIX 1: Changed prop from 'data2' to 'data' to match what's being passed.
// const OutflowTable = ({ data, navigate }) => (
//   <div className="table-responsive">
//     <table className="table datatable">
//       <thead>
//         <tr>
//           <th style={{ padding: "15px 20px" }}>
//             <input type="checkbox" />
//           </th>
//           <th style={{ padding: "15px 20px" }}>Date</th>
//           <th style={{ padding: "15px 20px" }}>To</th>
//           <th style={{ padding: "15px 20px" }}>Invoice No.</th>
//           <th style={{ padding: "15px 20px" }}>Amount</th>
//           <th style={{ padding: "15px 20px" }}>Status</th>
//         </tr>
//       </thead>
//       <tbody
//         style={{
//           color: "#262626",
//           fontFamily: '"Roboto", sans-serif',
//           fontWeight: "400",
//           fontSize: "16px",
//         }}
//       >
//         {/* ✅ FIX 1.1: Use the 'data' prop here */}
//         {data?.length > 0 ? (
//           data.map((note, index) => (
//             <tr
//               key={note._id || index}
//               style={{ borderBottom: "1px solid #E6E6E6", cursor: "pointer" }}
//               onClick={() => navigate("/debit")}
//             >
//               <td style={{ padding: "10px 20px" }}>
//                 <input type="checkbox" />
//               </td>
//               <td style={{ padding: "10px 20px" }}>
//                 {note.debitNoteDate
//                   ? new Date(note.debitNoteDate).toLocaleDateString()
//                   : "-"}
//               </td>
//               <td style={{ padding: "10px 20px" }}>
//                 {note.billTo?.name || note.billTo?.firstName || "-"}
//               </td>
//               <td style={{ padding: "10px 20px" }}>
//                 {note.debitNoteId || note._id}
//               </td>
//               <td style={{ padding: "10px 20px" }}>{note.total || "-"}</td>
//               <td style={{ padding: "10px 20px" }}>
//                 <span
//                   style={{
//                     padding: "5px",
//                     borderRadius: "5px",
//                     backgroundColor:
//                       note.status === "Due" ? "#FCE4E6" : "#DFFFE0",
//                     color: note.status === "Due" ? "#491E1F" : "#1E4921",
//                   }}
//                 >
//                   {note.status}
//                 </span>
//               </td>
//             </tr>
//           ))
//         ) : (
//           <tr>
//             <td colSpan="6" style={{ padding: "20px", textAlign: "center" }}>
//               No Debit Notes Found
//             </td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   </div>
// );

export default CreditDebitNotes;
