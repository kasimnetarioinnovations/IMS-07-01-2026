import React, { useEffect, useState, useRef, useMemo } from "react";
import { MdAddShoppingCart } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import { TbFileExport } from "react-icons/tb";
import Pagination from "../../../components/Pagination";
import AddCustomers from "../../../pages/Modal/customerModals/AddCustomerModal"; // Your new Add modal
import EditCustomerModal from "../../../pages/Modal/customerModals/EditCustomerModal"; // Your new Edit modal
import CustomerDetails from "../../../pages/Modal/customerModals/CustomerDetails"; // Side details panel
import api from "../../../pages/config/axiosInstance";
import { toast } from "react-toastify";
import CreditNoteImg from "../../../assets/images/create-creditnote.png";
import CreditICONImg from "../../../assets/images/create-icon1.png";
import GenerateICONImg from "../../../assets/images/create-icon4.png";
import DeleteICONImg from "../../../assets/images/delete.png";
import EditICONImg from "../../../assets/images/edit.png";
import ConfirmDeleteModal from "../../ConfirmDelete";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";


const menuItems = [
  {
    label: "Edit",
    icon: <img src={EditICONImg} size={18} />,
    action: "edit",
  },
  {
    label: "Create Invoice",
    icon: <img src={CreditICONImg} size={18} />,
    action: "invoice",
  },
  {
    label: "Generate Quotation",
    icon: <img src={GenerateICONImg} size={18} />,
    action: "quotation",
  },
  {
    label: "Create Credit Notes",
    icon: <img src={CreditNoteImg} size={18} />,
    action: "credit_note",
  },
  {
    label: "Delete",
    icon: <img src={DeleteICONImg} size={18} />,
    action: "delete",
  },
];

export default function Customers() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const navigate = useNavigate();

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const menuRef = useRef();

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/customers");
      setCustomers(res.data || []);
    } catch (err) {
      toast.error("Failed to load customers");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate tab counts
  const calculateTabCounts = useMemo(() => {
    if (!customers.length) return { All: 0, New: 0, Elite: 0, Overdue: 0 };

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Fix date mutation issue

    let newCount = 0;
    let eliteCount = 0;
    let overdueCount = 0;

    customers.forEach(customer => {
      const createdAt = new Date(customer.createdAt);

      // New: Created in last 30 days
      if (createdAt >= thirtyDaysAgo) {
        newCount++;
      }

      // Elite: Based on spending or loyalty tier
      const isElite =
        (customer.totalPurchaseAmount > 10000) || // Spent more than 10,000
        (customer.loyaltyTier === "gold" || customer.loyaltyTier === "platinum") ||
        (customer.totalPurchases > 10); // More than 10 purchases

      if (isElite) {
        eliteCount++;
      }

      // Overdue: Has due amount and possibly overdue invoices
      if (customer.totalDueAmount > 0) {
        overdueCount++;
      }
    });

    return {
      All: customers.length,
      New: newCount,
      Elite: eliteCount,
      Overdue: overdueCount
    };
  }, [customers]);

  // Create tabs data with calculated counts
  const tabsData = [
    { label: "All", count: calculateTabCounts.All },
    { label: "New", count: calculateTabCounts.New },
    { label: "Elite", count: calculateTabCounts.Elite },
    { label: "Overdue", count: calculateTabCounts.Overdue },
  ];

  // Filter customers based on active tab and search
  const filteredCustomers = useMemo(() => {
    if (!customers.length) return [];

    let filtered = [...customers];

    // Apply tab filter
    if (activeTab !== "All") {
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);


      switch (activeTab) {
        case "New":
          filtered = filtered.filter(customer => {
            const createdAt = new Date(customer.createdAt);
            return createdAt >= thirtyDaysAgo;
          });
          break;

        case "Elite":
          filtered = filtered.filter(customer => {
            // Define elite criteria
            const isElite =
              (customer.totalPurchaseAmount > 10000) || // Spent more than 10,000
              (customer.loyaltyTier === "gold" || customer.loyaltyTier === "platinum") ||
              (customer.totalPurchases > 10); // More than 10 purchases

            return isElite;
          });
          break;

        case "Overdue":
          filtered = filtered.filter(customer =>
            customer.totalDueAmount > 0
          );
          break;

        default:
          break;
      }
    }

    // Apply search filter
    if (search.trim()) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm) ||
        customer.phone?.includes(search) ||
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.address?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [customers, activeTab, search]);

  // Paginate filtered customers
  const paginatedCustomers = useMemo(() => {
    const indexOfLastTerm = currentPage * itemsPerPage;
    const indexOfFirstTerm = indexOfLastTerm - itemsPerPage;
    return filteredCustomers.slice(indexOfFirstTerm, indexOfLastTerm);
  }, [filteredCustomers, currentPage, itemsPerPage]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuAction = async (action, customer) => {
    setOpenMenuIndex(null);
    switch (action) {
      case "edit":
        setSelectedCustomer(customer);
        setOpenEditModal(true);
        break;
      case "delete":
        setSelectedCustomer(customer);
        setShowDeleteModal(true);
        break;
      case "invoice":
        navigate(`/createinvoice/${customer._id}`, {
          state: { customer }
        });
        break;
      case "quotation":
        navigate(`/create-quotition/${customer._id}`, {
          state: { customer },
        });
        break;
      case "credit_note":
        navigate("/credit-note", {
          state: { customer },
        });
        break;
      default:
        break;
    }
  };

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer);
    setOpenDetailsModal(true);
  };

  useEffect(() => {
    if (!loading && customers.length === 0) {
      navigate("/empty-customers", { replace: true });
    }
  }, [loading, customers, navigate]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  return (
    
        <div className="px-4 py-4" style={{ fontFamily: '"Inter", sans-serif' }}>
          {/* Header */}
          <div
            className="d-flex justify-content-between align-items-center"
            style={{ marginBottom: "20px" }}
          >
            <h3 style={{ fontSize: 22, color: "#0E101A", fontWeight: 500 }}>
              Customers
            </h3>
            <button
              className="btn d-flex align-items-center"
              style={{
                background: "#fff",
                border: "1.5px solid #1F7FFF",
                color: "#1F7FFF",
                borderRadius: 8,
                padding: "8px 16px",
                fontWeight: 500,
                fontSize: 14,
              }}
              onClick={() => setOpenAddModal(true)}
            >
              <MdAddShoppingCart className="me-2" /> Add Customer
            </button>
          </div>

          {/* Main Card */}
          <div style={{ background: "white", borderRadius: 16, padding: 20 }}>
            {/* Tabs + Search + Export */}
            <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div
                  style={{
                    background: "#F3F8FB",
                    padding: 3,
                    borderRadius: 8,
                    display: "flex",
                    gap: 8,
                    overflowX: "auto",
                    height: "33px",
                  }}
                >
                  {tabsData.map((t) => {
                    const active = activeTab === t.label;
                    return (
                      <div
                        key={t.label}
                        onClick={() => setActiveTab(t.label)}
                        role="button"
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          background: active ? "#fff" : "transparent",
                          boxShadow: active
                            ? "0 1px 4px rgba(0,0,0,0.08)"
                            : "none",
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          cursor: "pointer",
                          minWidth: 90,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div style={{ fontSize: 14, color: "#0E101A" }}>
                          {t.label}
                        </div>
                        <div style={{ color: "#727681", fontSize: 14 }}>
                          {t.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center search-box"
                  style={{
                    background: "#FCFCFC",
                    padding: "4px 20px",
                    borderRadius: 8,
                    border: "1px solid #EAEAEA",
                    minHeight: 32,
                  }}
                >
                  <FiSearch style={{ color: "#14193D66" }} />
                  <input
                    className="form-control border-0 shadow-none"
                    style={{ background: "transparent", padding: 0 }}
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <button
                  style={{
                    background: "#FCFCFC",
                    border: "1px solid #EAEAEA",
                    borderRadius: 8,
                    padding: "4px 14px",
                    fontSize: "14px",
                    color: "#0E101A",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 500,
                  }}
                >
                  <TbFileExport
                    style={{ color: "#14193D66", marginRight: "10px" }}
                  />
                  Export
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive" style={{ maxHeight: "600px" }}>
              <table
                className="table mb-0"
                style={{ borderSpacing: 0, borderCollapse: "separate" }}
              >
                <thead>
                  <tr>
                    {[
                      "Customer Name",
                      "Points Available",
                      "Due Amount",
                      "Total Spent",
                      "Actions",
                    ].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          backgroundColor: "#F3F8FB",
                          fontWeight: 400,
                          fontSize: 14,
                          color: "#727681",
                          padding: "12px 16px",
                          position: "sticky",
                          top: 0,
                          zIndex: 10,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        Loading customers...
                      </td>
                    </tr>
                  ) : paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((customer, index) => (
                      <tr
                        key={customer._id}
                        style={{ verticalAlign: "middle", cursor: "pointer" }}
                        onClick={() => handleRowClick(customer)}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            className="d-flex align-items-center"
                            style={{ gap: 10 }}
                          >
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 8,
                                background: "#eee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                color: "#666",
                              }}
                            >
                              {customer.name?.charAt(0).toUpperCase() || "C"}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: 400,
                                  color: "#0E101A",
                                }}
                              >
                                {customer.name || "Unknown"}
                              </div>
                              <div style={{ fontSize: 12, color: "#727681" }}>
                                {customer.phone || "No phone"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: 14,
                            color: "#0E101A",
                          }}
                        >
                          🪙 {customer.availablePoints || 0}points
                        </td>

                        <td
                          style={{
                            padding: "14px 16px",
                            fontWeight: 500,
                            color: customer.totalDueAmount > 0 ? "#681b0dff" : "#727681",
                          }}
                        >
                          {customer.totalDueAmount > 0 ? `₹${customer.totalDueAmount.toFixed(2)}` : "₹0.00/-"}
                        </td>

                        <td style={{ padding: "14px 16px", color: customer.totalPurchaseAmount > 0 ? "#0D6828" : "#727681", }}>
                          {customer.totalPurchaseAmount > 0 ? `₹${customer.totalPurchaseAmount.toFixed(2)}` : "₹0.00/-"}
                        </td>

                        <td
                          style={{
                            padding: "8px 16px",
                            position: "relative",
                            overflow: "visible",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "start",
                              alignItems: "center",
                              position: "relative",
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuIndex(
                                openMenuIndex === index ? null : index
                              );
                            }}
                          >
                            {/* three dot button */}
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  width: 4,
                                  height: 4,
                                  background: "#6C748C",
                                  borderRadius: 2,
                                }}
                              />
                              <div
                                style={{
                                  width: 4,
                                  height: 4,
                                  background: "#6C748C",
                                  borderRadius: 2,
                                }}
                              />
                              <div
                                style={{
                                  width: 4,
                                  height: 4,
                                  background: "#6C748C",
                                  borderRadius: 2,
                                }}
                              />
                            </div>

                            {/* dropdown */}
                            {openMenuIndex === index && (
                              <div
                                ref={menuRef}
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  right: 0,
                                  marginTop: 6,
                                  width: 210,
                                  backgroundColor: "#fff",
                                  borderRadius: 12,
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                  border: "1px solid #E5E7EB",
                                  zIndex: 999999,
                                  overflow: "hidden",
                                }}
                              >
                                {menuItems.map((item) => (
                                  <div
                                    key={item.action}
                                    onClick={() =>
                                      handleMenuAction(item.action, customer)
                                    }
                                    className="button-action"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 12,
                                      padding: "8px 12px",
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: 16,
                                      fontWeight: 400,
                                      cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "#e3f2fd";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="page-redirect-btn px-2">
              <Pagination
                currentPage={currentPage}
                total={filteredCustomers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
            <ConfirmDeleteModal
              isOpen={showDeleteModal}
              onCancel={() => {
                setShowDeleteModal(false);
                setSelectedCustomer(null);
              }}
              onConfirm={async () => {
                try {
                  await api.delete(`/api/customers/${selectedCustomer._id}`);
                  toast.success("Customer deleted successfully!");
                  fetchCustomers();
                } catch (error) {
                  toast.error("Failed to delete customer");
                } finally {
                  setShowDeleteModal(false);
                  setSelectedCustomer(null);
                }
              }}
            />
          </div>

          {/* Side Details Modal */}
          {openDetailsModal && selectedCustomer && (
            <>
              <span
                onClick={() => setOpenDetailsModal(false)}
                style={{
                  cursor: "pointer",
                  position: "fixed",
                  left: "calc(100vw - 700px - 60px)", // Position just left of panel
                  top: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #EAEAEA",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  zIndex: 10000, // Higher than panel's z-index
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <IoIosArrowBack style={{ color: "#6C748C", fontSize: "18px" }} />
              </span>
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  width: "740px",
                  height: "100vh",
                  background: "white",
                  boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
                  transition: "right 0.4s ease",
                  zIndex: 9999,
                  overflowY: "auto",
                }}
              >
                <CustomerDetails
                  data={selectedCustomer}
                  onClose={() => setOpenDetailsModal(false)}
                  onEdit={(customer) => {
                    setOpenDetailsModal(true);
                    setSelectedCustomer(customer);
                    setOpenEditModal(true);
                  }}
                />
              </div>
            </>
          )}

          {/* Add Customer Modal */}
          {openAddModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
              onClick={() => setOpenAddModal(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <AddCustomers
                  onClose={() => {
                    setOpenAddModal(false);
                    fetchCustomers();
                  }}
                />
              </div>
            </div>
          )}

          {/* Edit Customer Modal */}
          {openEditModal && selectedCustomer && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
              onClick={() => setOpenEditModal(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <EditCustomerModal
                  customer={selectedCustomer}
                  onClose={() => {
                    setOpenEditModal(false);
                    setSelectedCustomer(null);
                    fetchCustomers();
                  }}
                />
              </div>
            </div>
          )}
        </div>
    
  );
}
