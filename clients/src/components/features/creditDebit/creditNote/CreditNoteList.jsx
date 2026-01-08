import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TbEye, TbTrash, TbFileExport } from "react-icons/tb";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import api from "../../../../pages/config/axiosInstance";
import Pagination from "../../../../components/Pagination";
import DeleteAlert from "../../../../utils/sweetAlert/DeleteAlert";
import ConfirmDeleteModal from "../../../ConfirmDelete";

function CreditNoteList() {
    const navigate = useNavigate();

    const [creditNotes, setCreditNotes] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    /* ---------------- FETCH ---------------- */
    const fetchCreditNotes = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/credit-notes");
            setCreditNotes(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            toast.error("Failed to load credit notes");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCreditNotes();
    }, []);

    /* ---------------- FILTER + SEARCH ---------------- */
    const filteredData = useMemo(() => {
        return creditNotes.filter((c) => {
            const matchesSearch =
                c.creditNoteNumber?.toLowerCase().includes(search.toLowerCase()) ||
                c.customerName?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                status === "all" ? true : c.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [creditNotes, search, status]);

    /* ---------------- PAGINATION ---------------- */
    const total = filteredData.length;
    const paginatedData = filteredData.slice(
        (page - 1) * limit,
        page * limit
    );

    useEffect(() => {
        setPage(1);
    }, [search, status]);

    /* ---------------- DELETE ---------------- */
    const handleDelete = async (id) => {
        const confirmed = await DeleteAlert({});
        if (!confirmed) return;

        try {
            await api.delete(`/api/credit-notes/${id}`);
            toast.success("Credit note deleted");
            fetchCreditNotes();
        } catch {
            toast.error("Delete failed");
        }
    };

    /* ---------------- EXPORT ---------------- */
    const handlePdf = () => {
        const doc = new jsPDF();
        doc.text("Credit Notes", 14, 15);

        const rows =
            selectedIds.length > 0
                ? creditNotes.filter((c) => selectedIds.includes(c._id))
                : filteredData;

        autoTable(doc, {
            startY: 20,
            styles: {
                fontSize: 8,
            },
            headStyles: {
                fillColor: [155, 155, 155],
                textColor: "white",
            },
            theme: "striped",
            head: [[
                "Credit Note No",
                "Invoice No",
                "Customer",
                "Date",
                "Status",
            ]],
            body: rows.map((c) => [
                c.creditNoteNumber,
                c.invoiceNumber || "-",
                c.customerName,
                new Date(c.date).toLocaleDateString(),
                // `₹${c.totalAmount.toFixed(2)}`,
                c.status,
            ]),
            styles: { fontSize: 8 },
        });

        doc.save("credit-notes.pdf");
    };

    const isAllSelected =
        paginatedData.length > 0 &&
        paginatedData.every((c) => selectedIds.includes(c._id));


    /* ---------------- UI ---------------- */
    return (
        <div className="p-4">
            {/* Header */}
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0px 0px 16px 0px",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        color: "black",
                        fontSize: 22,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                    }}
                >
                    Credit Notes
                </h2>
            </div>

            {/* MAIN CARD (same as quotation) */}
            <div
                style={{
                    width: "100%",
                    background: "white",
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    fontFamily: "Inter, sans-serif",
                }}
            >
                {/* SEARCH + STATUS + EXPORT (SAME ROW) */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 16,
                        height: "33px",
                    }}
                >
                    {/* Search */}
                    <div
                        style={{
                            width: "260px",
                            display: "flex",
                            alignItems: "center",
                            padding: "5px 10px",
                            borderRadius: 8,
                            background: "#FCFCFC",
                            border: "1px solid #EAEAEA",
                            gap: 6,
                        }}
                    >
                        <IoIosSearch style={{ fontSize: 22 }} />
                        <input
                            type="search"
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                fontSize: 14,
                                background: "transparent",
                            }}
                        />
                    </div>

                    {/* Status */}
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        style={{
                            height: "33px",
                            borderRadius: 8,
                            border: "1px solid #EAEAEA",
                            padding: "0px 10px",
                            fontSize: 14,
                        }}
                    >
                        <option value="all">All</option>
                        <option value="draft">Draft</option>
                        <option value="issued">Issued</option>
                        <option value="applied">Applied</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Export */}
                    <button
                        onClick={handlePdf}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 16px",
                            background: "#FCFCFC",
                            borderRadius: 8,
                            border: "1px solid #EAEAEA",
                            cursor: "pointer",
                            fontSize: 14,
                            height: "33px",
                        }}
                    >
                        <TbFileExport className="fs-5 text-secondary" />
                        Export
                    </button>
                </div>

                {/* TABLE */}
                <div
                    className="table-responsive"
                    style={{ maxHeight: "510px", overflowY: "auto" }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                        }}
                    >
                        <thead
                            style={{
                                position: "sticky",
                                top: 0,
                                background: "#F3F8FB",
                                zIndex: 10,
                            }}
                        >
                            <tr>
                                <th
                                    style={{
                                        textAlign: "left",
                                        padding: "4px 16px",
                                        width: 80,
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        style={{ width: 18, height: 18 }}
                                        checked={isAllSelected}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedIds((prev) => {
                                                    const next = new Set(prev);
                                                    paginatedData.forEach((c) => next.add(c._id));
                                                    return Array.from(next);
                                                });
                                            } else {
                                                setSelectedIds((prev) =>
                                                    prev.filter(
                                                        (id) => !paginatedData.some((c) => c._id === id)
                                                    )
                                                );
                                            }
                                        }}
                                    />
                                </th>

                                <th style={{ padding: "4px 16px" }}>Credit Note No</th>
                                <th style={{ padding: "4px 16px" }}>Invoice No</th>
                                <th style={{ padding: "4px 16px" }}>Customer</th>
                                <th style={{ padding: "4px 16px" }}>Date</th>
                                <th style={{ padding: "4px 16px" }}>Amount</th>
                                <th style={{ padding: "4px 16px" }}>Status</th>
                                <th style={{ padding: "4px 16px", textAlign: "center" }}>
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center p-3">
                                        Loading...
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center p-3">
                                        No Credit Notes Found
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((c) => (
                                    <tr key={c._id} style={{ borderBottom: "1px solid #FCFCFC" }}>
                                        <td style={{ padding: "8px 16px" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(c._id)}
                                                onChange={(e) =>
                                                    setSelectedIds((prev) =>
                                                        e.target.checked
                                                            ? [...prev, c._id]
                                                            : prev.filter((id) => id !== c._id)
                                                    )
                                                }
                                            />
                                        </td>

                                        <td style={{ padding: "8px 16px" }}>
                                            {c.creditNoteNumber}
                                        </td>
                                        <td style={{ padding: "8px 16px" }}>
                                            {c.invoiceNumber || "-"}
                                        </td>
                                        <td style={{ padding: "8px 16px" }}>
                                            {c.customerName}
                                        </td>
                                        <td style={{ padding: "8px 16px" }}>
                                            {new Date(c.date).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: "8px 16px" }}>
                                            ₹{c.totalAmount.toFixed(2)}
                                        </td>
                                        <td style={{ padding: "8px 16px" }}>
                                            <span className="badge badge-soft-secondary">
                                                {c.status}
                                            </span>
                                        </td>

                                        {/* ACTION — ONLY DELETE */}
                                        <td style={{ textAlign: "center" }}>
                                            {c.status !== "applied" && (
                                                <div className="edit-delete-action d-flex justify-content-center">
                                                    <a
                                                        className="p-2 d-flex align-items-center border rounded"
                                                        onClick={() => { setDeleteId(c._id); setShowDeleteModal(true) }}
                                                    >
                                                        <TbTrash className="feather-trash-2" />
                                                    </a>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION — INSIDE CARD */}
                <div className="px-2">
                    <Pagination
                        currentPage={page}
                        total={total}
                        itemsPerPage={limit}
                        onPageChange={setPage}
                        onItemsPerPageChange={(n) => {
                            setLimit(n);
                            setPage(1);
                        }}
                    />
                </div>
                <ConfirmDeleteModal
                    isOpen={showDeleteModal}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setDeleteId(null);
                    }}
                    onConfirm={async () => {
                        if (!deleteId) return;
                        try {
                            await api.delete(`/api/credit-notes/${deleteId}`);
                            toast.success("Credit note deleted");
                            fetchCreditNotes();
                        } catch {
                            toast.error("Delete failed");
                        }
                    }}
                />

            </div>
        </div>
    );

}

export default CreditNoteList;
