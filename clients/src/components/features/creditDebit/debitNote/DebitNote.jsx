import React, { useEffect, useState, useRef } from "react";
import { MdAddShoppingCart } from "react-icons/md";
import { FiSearch } from "react-icons/fi";
import { BsThreeDots } from "react-icons/bs";
import { Link } from "react-router-dom";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import ViewDetailsImg from "../../../../assets/images/view-details.png";
import EditICONImg from "../../../../assets/images/edit.png";
import DeleteICONImg from "../../../../assets/images/delete.png";
import Pagination from "../../../../components/Pagination";
import api from "../../../../pages/config/axiosInstance";
import { toast } from "react-toastify";

/* ---------------- STATUS STYLES ---------------- */
const statusStyles = {
  success: { color: "#01774B", bg: "transparent", dot: false, icon: <FaCheck size={12} /> },
  danger: { color: "#A80205", bg: "transparent", dot: false, icon: <RxCross2 size={12} /> },
  warning: { color: "#7E7000", bg: "#F7F7C7", dot: true },
};

/* ---------------- RETURN TYPE STYLES ---------------- */
const returnTypeStyles = {
  Partial: { color: "#DAC100" },
  Full: { color: "#0078D9" },
};

/* ---------------- STATUS MAPPER ---------------- */
const mapStatus = (status) => {
  switch (status) {
    case "issued":
      return { label: "Issued", type: "warning" };
    case "settled":
      return { label: "Settled", type: "success" };
    case "cancelled":
      return { label: "Cancelled", type: "danger" };
    default:
      return { label: "Draft", type: "warning" };
  }
};

/* ---------------- RETURN TYPE ---------------- */
const getReturnType = (items = []) => {
  if (!items.length) return "—";
  // Backend has no returnQty yet → treat as Full
  return "Full";
};

export default function DebitNoteList() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const menuRef = useRef(null);

  /* ---------------- FETCH DEBIT NOTES ---------------- */
  const fetchDebitNotes = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/supplier-debit-notes", {
        params: {
          page: currentPage,
          limit: 10,
          search,
        },
      });

      const notes = res.data.debitNotes || [];
      setTotalPages(res.data.pagination?.totalPages || 1);

      const mapped = notes.map((note) => {
        const status = mapStatus(note.status);

        return {
          _id: note._id,
          supplier: note.supplierName,
          invoice: note.debitNoteNumber,
          dates: note.date
            ? new Date(note.date).toLocaleDateString()
            : "-",
          returntype: getReturnType(note.items),
          paymentmode: "—",
          status,
          totalamount: `₹ ${note.totalAmount}`,
          dueamount:
            note.status === "settled"
              ? "₹ 0"
              : `₹ ${note.totalAmount}`,
        };
      });

      setRows(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load debit notes");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebitNotes();
  }, [currentPage, search]);

  /* ---------------- DELETE HANDLER ---------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this debit note?")) return;

    try {
      await api.delete(`/api/supplier-debit-notes/${id}`);
      toast.success("Debit note deleted successfully");
      fetchDebitNotes();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete debit note");
    }
  };

  /* ---------------- CLICK OUTSIDE MENU ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="container-fluid p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Debit Notes</h3>

        <Link to="/m/empty-debitnote">
          <button className="btn btn-outline-primary">
            <MdAddShoppingCart /> Create Debit Note
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="d-flex justify-content-end mb-3">
        <div className="d-flex align-items-center search-box">
          <FiSearch />
          <input
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Return Type</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Total</th>
                <th>Due</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row, idx) => {
                  const sty = statusStyles[row.status.type] || statusStyles.warning;

                  return (
                    <tr key={row._id}>
                      <td>{row.supplier}</td>
                      <td>{row.invoice}</td>
                      <td>{row.dates}</td>

                      <td style={{ color: returnTypeStyles[row.returntype]?.color }}>
                        {row.returntype}
                      </td>

                      <td>{row.paymentmode}</td>

                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 10px",
                            borderRadius: 50,
                            background: sty.bg,
                            color: sty.color,
                          }}
                        >
                          {sty.dot ? (
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 20,
                                background: sty.color,
                              }}
                            />
                          ) : (
                            sty.icon
                          )}
                          {row.status.label}
                        </div>
                      </td>

                      <td>{row.totalamount}</td>
                      <td>{row.dueamount}</td>

                      {/* Actions */}
                      <td className="text-center" style={{ position: "relative" }}>
                        <button
                          className="btn"
                          onClick={() => setOpenMenu(openMenu === idx ? null : idx)}
                        >
                          <BsThreeDots />
                        </button>

                        {openMenu === idx && (
                          <div
                            ref={menuRef}
                            style={{
                              position: "absolute",
                              right: 0,
                              background: "#fff",
                              borderRadius: 10,
                              boxShadow: "0 8px 25px rgba(0,0,0,.15)",
                              zIndex: 100,
                            }}
                          >
                            <div className="menu-item">
                              <img src={ViewDetailsImg} alt="" /> View Details
                            </div>

                            <div className="menu-item">
                              <img src={EditICONImg} alt="" /> Edit
                            </div>

                            <div
                              className="menu-item text-danger"
                              onClick={() => handleDelete(row._id)}
                            >
                              <img src={DeleteICONImg} alt="" /> Delete
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    No debit notes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        total={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
