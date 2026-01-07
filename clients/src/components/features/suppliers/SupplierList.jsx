import React, { useEffect, useRef, useState } from "react";
import { LuSearch, LuUserPlus } from "react-icons/lu";
import { BsThreeDots } from "react-icons/bs";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Supplierimg from "../../../assets/images/suppimg.png";
import { CiCircleInfo } from "react-icons/ci";
import "../../../pages/Modal/suppliers/Supplier.css";
import { Link, useNavigate } from "react-router-dom";
import AddSupplier from "../../../pages/Modal/suppliers/AddSupplierModals";
import SupplierDetails from "./SupplierDetails";
import { PiInfo } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import { TbFileExport } from "react-icons/tb";
import CreditNoteImg from "../../../assets/images/create-creditnote.png";
import CreditICONImg from "../../../assets/images/create-icon1.png";
import GenerateICONImg from "../../../assets/images/create-icon4.png";
import DeleteICONImg from "../../../assets/images/delete.png";
import EditICONImg from "../../../assets/images/edit.png";
import Pagination from "../../../components/Pagination";
import ConfirmDeleteModal from "../../../components/ConfirmDelete";
import api from "../../../pages/config/axiosInstance";
import { toast } from "react-toastify";
import EditSupplierModal from "../../../pages/Modal/suppliers/EditSupplierModals";
import { IoIosArrowBack } from "react-icons/io";



const menuItems = [
  {
    label: "Edit",
    icon: <img src={EditICONImg} size={18} />,
    action: "edit",
  },
  {
    label: "Create Purchase",
    icon: <img src={CreditICONImg} size={18} />,
    action: "invoice",
  },
  {
    label: "Create Debit Notes",
    icon: <img src={CreditNoteImg} size={18} />,
    action: "credit_note",
  },
  {
    label: "Delete",
    icon: <img src={DeleteICONImg} size={18} />,
    action: "delete",
  },
];
const SupplierList = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [search, setSearch] = useState("");
  const [openAddSupplierModal, setOpenAddSupplierModal] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEditModal, setOpenEditModal] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/suppliers");
      console.log('ressssss',res.data)
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const tabsData = [
    { label: "All", count: suppliers.length },
    {
      label: "Manufacturer",
      count: suppliers.filter((s) => s.businessType === "Manufacturer").length,
    },
    {
      label: "Distributor",
      count: suppliers.filter((s) => s.businessType === "Distributor").length,
    },
    {
      label: "Wholesaler",
      count: suppliers.filter((s) => s.businessType === "Wholesaler").length,
    },
  ]

  const menuRef = useRef();
  const addSupplierRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuIndex(false);
      }
      if (
        addSupplierRef.current &&
        !addSupplierRef.current.contains(e.target)
      ) {
        setOpenAddSupplierModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat("en-IN").format(Math.abs(amount));
    return `${amount < 0 ? "-" : ""}₹ ${formatted}/-`;
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesTab =
      activeTab === "All" || s.businessType === activeTab;

    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);

    return matchesTab && matchesSearch;
  });
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);



  const handleMenuAction = async (action, supplier) => {
    console.log("🔄 Edit clicked, supplier object:", supplier);
    console.log("📌 Supplier ID:", supplier._id)
    setOpenMenuIndex(null);
    switch (action) {
      case "edit":
        setSelectedSupplier(supplier);
        setOpenEditModal(true);
        break;
      case "delete":
        setSelectedSupplier(supplier);
        setShowDeleteModal(true);
        break;
      case "invoice":
        navigate(`/create-purchase-orders/${supplier._id}`, {
          state: { supplier }
        });
        break;
      case "credit_note":
        navigate(`/create-supplier-debitnote/${supplier._id}`, {
          state: { supplier },
        });
        break;
      default:
        break;
    }
  };

  const handleRowClick = (supplierId) => {
    setSelectedSupplier(supplierId);
    setOpenModal(true);
  };

  useEffect(() => {
    if (!loading && suppliers.length === 0) {
      navigate("/empty-supplier", { replace: true });
    }
  }, [loading, suppliers, navigate]);

  return (
    <div className="px-4 py-4" style={{ fontFamily: '"Inter", sans-serif' }}>
     
        <div style={{ fontFamily: '"Inter", sans-serif' }}>
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#0E101A",
                fontWeight: 500,
                fontSize: "22px",
                lineHeight: "120%",
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Suppliers
            </span>

            <button
              style={{
                border: "1px solid #1F7FFF",
                borderRadius: "8px",
                padding: "8px 16px",
                color: "#1F7FFF",
                fontWeight: 400,
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "transparent",
                fontFamily: '"Inter", sans-serif',
              }}
              onClick={() => setOpenAddSupplierModal(true)}
            >
              <LuUserPlus /> Add Supplier
            </button>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "20px" }}>
            <div
              className="card shadow-sm border-0"
              style={{ borderRadius: "10px", padding: "20px" }}
            >
              {/* Filters and Search */}
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
              <div
                className="table-responsive"
                style={{
                  cursor: "pointer",
                  maxHeight: "600px",  // CHANGE: Use maxHeight instead of height
                  overflowY: "auto",   // CHANGE: Use auto instead of scroll
                  scrollbarWidth: "thin",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {/* Wrapper div for padding around the table – this creates the fixed space at top/bottom */}
                <table
                  className="table mb-0"
                  style={{
                    borderCollapse: "separate",
                    borderSpacing: "0",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  <thead>
                    <tr>
                      {[
                        "Supplier Name",
                        "Category / Brand Dealing With",
                        "Balance Amount",
                        "Total Spent",
                        "Actions",
                      ].map((heading, i) => (
                        <th
                          key={i}
                          style={{
                            backgroundColor: "#F3F8FB",
                            fontWeight: 400,
                            fontSize: "14px",
                            color: "#727681",
                            padding: "12px 16px",
                            fontFamily: '"Inter", sans-serif',
                            position: "sticky",
                            top: 0, // Changed to match padding exactly—prevents misalignment
                            zIndex: 1000, // Increased for stronger layering over scrolling tbody rows
                          }}
                        >
                          {heading === "Balance Amount" ? (
                            <>
                              {heading}{" "}
                              <PiInfo
                                style={{ color: "#6C748C", fontWeight: 500 }}
                              />
                            </>
                          ) : (
                            heading
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedSuppliers.map((supplier, index) => (
                      <tr
                        key={index}
                        style={{
                          verticalAlign: "middle",
                          fontFamily: '"Inter", sans-serif',
                        }}
                        onClick={() => handleRowClick(supplier._id)}
                      >
                        {/* Supplier Name */}
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            className="d-flex align-items-center"
                            style={{ gap: "10px" }}
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
                              {supplier?.name?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <div>
                              <div
                                style={{
                                  color: "#0E101A",
                                  fontWeight: 400,
                                  fontSize: "14px",
                                  fontFamily: '"Inter", sans-serif',
                                }}
                              >
                                {supplier.name}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#727681",
                                  fontFamily: '"Inter", sans-serif',
                                }}
                              >
                                {supplier.phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "6px",
                            }}
                          >
                            {supplier.category.map((item, i) => (
                              <span
                                key={i}
                                style={{
                                  backgroundColor: "#E5F0FF",
                                  color: "#0E101A",
                                  borderRadius: "16px",
                                  padding: "4px 12px",
                                  fontSize: "14px",
                                  fontFamily: '"Inter", sans-serif',
                                }}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Balance */}
                        <td
                          style={{
                            color: supplier.balance < 0 ? "#D00003" : "#0D6828",
                            fontWeight: "500",
                            padding: "14px 16px",
                            fontFamily: '"Inter", sans-serif',
                          }}
                        >
                          {formatCurrency(supplier.balance)}
                        </td>

                        {/* Total Spent */}
                        <td
                          style={{
                            color: "#0E101A",
                            fontSize: "14px",
                            padding: "14px 16px",
                            fontFamily: '"Inter", sans-serif',
                          }}
                        >
                          ₹{" "}
                          {new Intl.NumberFormat("en-IN").format(
                            supplier.totalSpent
                          )}
                          /-
                        </td>

                        {/* Actions */}
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
                                      handleMenuAction(item.action, supplier)
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
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                total={filteredSuppliers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
              />

              <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onCancel={() => { setShowDeleteModal(false); setSelectedSupplier(null); }}
                onConfirm={async () => {
                  try {
                    await api.delete(`/api/suppliers/${selectedSupplier._id}`);
                    toast.success("Supplier deleted successfully");
                    setSuppliers((prev) =>
                      prev.filter((s) => s._id !== selectedSupplier._id)
                    );
                    setShowDeleteModal(false);
                    setSelectedSupplier(null);
                  } catch (error) {
                    console.error("Delete Supplier Error:", error);
                    toast.error(
                      error.response?.data?.message ||
                      "Failed to delete supplier"
                    );
                  }
                }}
              />
              {openModal && selectedSupplier && (
                <>
                  <span
                    onClick={() => setOpenModal(false)}
                    style={{
                      cursor: "pointer",
                      position: "fixed",
                      left: "calc(100vw - 900px - 60px)", // Position just left of panel
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
                      width: "940px",
                      height: "100vh",
                      background: "white",
                      boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
                      transition: "right 0.4s ease",
                      zIndex: 9999,
                      overflowY: "auto",
                    }}
                  >
                    <SupplierDetails
                      supplierId={selectedSupplier}
                      onClose={() => setOpenModal(false)}
                    />
                  </div>
                </>
              )}


              {/* add supplier */}
              {openAddSupplierModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                  }}
                >
                  <AddSupplier onClose={() => setOpenAddSupplierModal(false)} onSuccess={fetchSuppliers} />
                </div>
              )}

              {/* edit supplier */}
              {openEditModal && selectedSupplier && (
                <EditSupplierModal
                  supplierId={selectedSupplier._id}
                  onClose={() => { setOpenEditModal(false); setSelectedSupplier(null); }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default SupplierList;
