import React, { useEffect, useState, useRef } from "react";
import { MdAddShoppingCart } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import "react-datepicker/dist/react-datepicker.css";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import Custommrr from "../../../assets/images/suppimg.png";
import CustomerDetails from "../../../pages/Modal/customerModals/CustomerDetails";
import AddCustomers from "../../../pages/Modal/customerModals/AddCustomerModal";
import { useNavigate } from "react-router-dom";
import { TbFileExport } from "react-icons/tb";
import api from "../../../pages/config/axiosInstance";
import Pagination from "../../../components/Pagination";
import ConfirmDeleteModal from "../../ConfirmDelete";
import { toast } from "react-toastify";
import CreditNoteImg from "../../../assets/images/create-creditnote.png";
import CreditICONImg from "../../../assets/images/create-icon1.png";
import GenerateICONImg from "../../../assets/images/create-icon4.png";
import DeleteICONImg from "../../../assets/images/delete.png";
import EditICONImg from "../../../assets/images/edit.png";
import EditCustomerModal from "../../../pages/Modal/customerModals/EditCustomerModal";


export default function CustomerDuesAdvanceList({ data }) {
  console.log("data for with", data);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  //   const [openModal, setOpenModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  //   const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [customers, setCustomers] = useState([]);

  const [tabCounts, setTabCounts] = useState({
    All: 0,
    Due: 0,
    Advance: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const menuRef = useRef(null);


  const fetchCustomers = async () => {
    try {
      const typeParam = activeTab === "All" ? "all" : (activeTab || "").toLowerCase();
      const res = await api.get("/api/customers/filter/dues-advance", {
        params: { type: typeParam, search: search || "" },
      });
      const { customers: fetchedCustomers, tabCounts: counts } = res.data;
      setCustomers(fetchedCustomers);
      setFilteredCustomers(fetchedCustomers);
      console.log("Fetched customers:", fetchedCustomers);
      setTabCounts({
        All: counts.all,
        Due: counts.due,
        Advance: counts.advance,
      })
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, [activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchCustomers();
      }
    }, 500); // Debounce delay of 500ms

    return () => {
      clearTimeout(timer);
    };
  }, [search, activeTab]);

  useEffect(() => {
    const filteredRows = customers.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase()))
    setFilteredCustomers(filteredRows)
    setCurrentPage(1);
  }, [search, customers])
  // pagination
  const indexOfLastTerm = currentPage * itemsPerPage;
  const indexOfFirstTerm = indexOfLastTerm - itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(indexOfFirstTerm, indexOfLastTerm);

  useEffect(() => {
    if (!loading && customers.length === 0) {
      navigate("/customerdueempty", { replace: true })
    }
  }, [loading, customers, navigate])

  return (
   
        <div className="px-4 py-4" style={{ fontFamily: '"Inter", sans-serif' }}>
          {/* Header */}
          <div
            className="d-flex justify-content-between align-items-center"
            style={{ marginBottom: "20px" }}
          >
            <h3 style={{ fontSize: 22, color: "#0E101A", fontWeight: 500 }}>
              Dues and Advance
            </h3>
          </div>

          {/* Search + Tabs */}
          <div style={{ background: "white", borderRadius: 16, padding: 20 }}>
            <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-4">
              {/* TABS */}
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
                  {Object.entries(tabCounts || {}).map(([label, count]) => {
                    const active = activeTab === label;
                    return (
                      <div
                        key={label}
                        onClick={() => setActiveTab(label)}
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
                          {label}
                        </div>
                        <div style={{ color: "#727681", fontSize: 14 }}>
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SEARCH */}
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

            {/* TABLE */}
            <div style={{ borderRadius: 12, background: "white" }}>
              <div
                className="table-responsive"
                style={{
                  maxHeight: 600,
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <div>
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
                        ].map((heading, i) => (
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
                            {heading}
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
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setOpenDetailsModal(true);
                            }}
                            style={{ verticalAlign: "middle", cursor: "pointer" }}
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
                                    {customer?.name}
                                  </div>
                                  <div style={{ fontSize: 12, color: "#727681" }}>
                                    {customer?.phone}
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
                              {customer?.availablePoints || 0}🪙 points
                            </td>

                            <td
                              style={{
                                padding: "14px 16px",
                                fontWeight: 500,
                                color: customer?.totalDueAmount && customer.totalDueAmount > 0 ? "#D92D20" : "#16A34A",
                              }}
                            >
                              {customer?.totalDueAmount && customer.totalDueAmount > 0
                                ? `₹${customer.totalDueAmount.toFixed(2)}/-`
                                : "₹0.00/-"}
                            </td>

                            <td
                              style={{ padding: "14px 16px", color: customer?.totalPurchaseAmount && customer.totalPurchaseAmount > 0 ? "#16A34A" : "#0E101A", fontWeight: 500 }}
                            >
                              {customer?.totalPurchaseAmount
                                ? `₹${customer.totalPurchaseAmount.toFixed(2)}/-`
                                : "₹0.00/-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
                    toast.success("Customer due advance deleted successfully!")
                    fetchCustomers();
                  } catch (error) {
                    toast.error("Failed to delete due advance customer ")
                  } finally {
                    setShowDeleteModal(false);
                    setSelectedCustomer(null);
                  }
                }}
              />

              {/* SIDE MODAL */}
              {openDetailsModal && selectedCustomer && (
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
              )}
            </div>
          </div>
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
