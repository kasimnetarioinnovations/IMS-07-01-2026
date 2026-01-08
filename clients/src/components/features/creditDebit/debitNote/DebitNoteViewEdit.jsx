import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import api from "../../../../pages/config/axiosInstance";
import { toast } from "react-toastify";
import DatePicker from "../../../layouts/DatePicker";
import { IoChevronDownOutline } from "react-icons/io5";
import { MdArrowBack } from "react-icons/md";
import total_orders_icon from "../../../../assets/images/totalorders-icon.png";

const DebitNoteViewEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [debitNote, setDebitNote] = useState(null);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Form state - EXACTLY SAME as creation page
    const [formData, setFormData] = useState({
        supplierId: "",
        supplierName: "",
        phone: "",
        invoiceId: "",
        invoiceNumber: "",
        date: new Date().toISOString().split("T")[0],
        items: [],
        subtotal: 0,
        discount: 0,
        shippingCharges: 0,
        autoRoundOff: false,
        roundOff: 0,
        totalAmount: 0,
        fullyReceived: false,
        notes: "",
        reason: "defective_goods",
    });

    // Fetch debit note details
    useEffect(() => {
        fetchDebitNoteDetails();
    }, [id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsInvoiceOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchDebitNoteDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/supplier-debit-notes/${id}`);
            const data = response.data.debitNote;
            
            if (!data) {
                toast.error("Debit note not found");
                navigate("/debit-notes-list");
                return;
            }
            
            setDebitNote(data);
            
            // Initialize form data exactly like creation page
            setFormData({
                supplierId: data.supplierId?._id || data.supplierId || "",
                supplierName: data.supplierName || "",
                phone: data.phone || "",
                invoiceId: data.invoiceId?._id || data.invoiceId || "",
                invoiceNumber: data.supplierInvoiceNo || "",
                date: new Date(data.date).toISOString().split("T")[0],
                items: data.items?.map((item, index) => ({
                    id: index + 1,
                    productId: item.productId?._id || item.productId,
                    name: item.name || "Product",
                    quantity: item.quantity || 1,
                    originalQuantity: item.quantity || 1,
                    unit: item.unit || "Pcs",
                    unitPrice: item.unitPrice || 0,
                    tax: `GST @ ${item.taxRate || 5}%`,
                    taxRate: item.taxRate || 5,
                    taxAmount: item.taxAmount || 0,
                    discountPercent: item.discountPercent || 0,
                    discountAmount: item.discountAmount || 0,
                    amount: item.total || 0,
                    isSelected: true,
                })) || [],
                subtotal: data.subtotal || 0,
                discount: data.totalDiscount || 0,
                shippingCharges: data.additionalCharges || 0,
                autoRoundOff: Math.abs(data.roundOff || 0) > 0,
                roundOff: data.roundOff || 0,
                totalAmount: data.totalAmount || 0,
                fullyReceived: data.status === "settled",
                notes: data.notes || "",
                reason: data.reason || "defective_goods",
            });
        } catch (error) {
            console.error("Failed to fetch debit note details:", error);
            toast.error("Failed to load debit note details");
            navigate("/debit-notes-list");
        } finally {
            setLoading(false);
        }
    };

    // Recalculate totals when items or other values change
    useEffect(() => {
        calculateTotals();
    }, [formData.items, formData.shippingCharges, formData.autoRoundOff]);

    const calculateItemTotal = (item) => {
        const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
        let discountAmount = item.discountAmount || 0;
        if (item.discountPercent > 0) {
            discountAmount = subtotal * (item.discountPercent / 100);
        }
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const taxAmount = taxableAmount * ((item.taxRate || 0) / 100);
        const total = taxableAmount + taxAmount;

        item.discountAmount = parseFloat(discountAmount.toFixed(2));
        item.taxAmount = parseFloat(taxAmount.toFixed(2));
        item.amount = parseFloat(total.toFixed(2));
        return item;
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        formData.items.forEach((item) => {
            if (item.isSelected) {
                subtotal += (item.quantity || 0) * (item.unitPrice || 0);
                totalDiscount += item.discountAmount || 0;
                totalTax += item.taxAmount || 0;
            }
        });

        let totalAmount = subtotal + totalTax - totalDiscount + (formData.shippingCharges || 0);
        let roundOff = 0;
        
        if (formData.autoRoundOff) {
            roundOff = Math.round(totalAmount) - totalAmount;
            totalAmount = Math.round(totalAmount);
        }

        setFormData((prev) => ({
            ...prev,
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount: parseFloat(totalDiscount.toFixed(2)),
            roundOff: parseFloat(roundOff.toFixed(2)),
            totalAmount: parseFloat(totalAmount.toFixed(2)),
        }));
    };

    const handleItemSelect = (index) => {
        if (!isEditMode) return;
        
        const updatedItems = [...formData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            isSelected: !updatedItems[index].isSelected,
            quantity: !updatedItems[index].isSelected ? updatedItems[index].originalQuantity : 0,
        };

        const recalculatedItem = calculateItemTotal(updatedItems[index]);
        updatedItems[index] = recalculatedItem;
        
        setFormData((prev) => ({ ...prev, items: updatedItems }));
    };

    const handleItemChange = (index, field, value) => {
        if (!isEditMode) return;
        
        const updatedItems = [...formData.items];
        let parsedValue = value;
        
        if (["quantity", "unitPrice", "taxRate", "discountPercent", "discountAmount"].includes(field)) {
            parsedValue = parseFloat(value) || 0;
        }

        updatedItems[index] = {
            ...updatedItems[index],
            [field]: parsedValue,
        };

        if (field === "quantity" && updatedItems[index].originalQuantity) {
            if (parsedValue > updatedItems[index].originalQuantity) {
                updatedItems[index].quantity = updatedItems[index].originalQuantity;
                toast.error(`Cannot return more than ${updatedItems[index].originalQuantity} items`);
            }
        }

        if (["quantity", "unitPrice", "taxRate", "discountPercent", "discountAmount"].includes(field)) {
            const recalculatedItem = calculateItemTotal(updatedItems[index]);
            updatedItems[index] = recalculatedItem;
        }

        setFormData((prev) => ({
            ...prev,
            items: updatedItems,
        }));
    };

    const handleEdit = () => {
        if (!debitNote) return;
        
        if (debitNote.status === "settled" || debitNote.status === "cancelled") {
            toast.error(`Cannot edit a ${debitNote.status} debit note`);
            return;
        }
        setIsEditMode(true);
    };

    const handleSave = async () => {
        try {
            if (!debitNote) return;
            
            setSaving(true);
            
            const selectedItems = formData.items.filter(
                (item) => item.isSelected && item.quantity > 0 && item.productId
            );

            if (selectedItems.length === 0) {
                toast.error("Please select at least one item");
                return;
            }

            // Prepare update data
            const updateData = {
                date: formData.date,
                notes: formData.notes,
                reason: formData.reason,
                additionalCharges: formData.shippingCharges,
                roundOff: formData.autoRoundOff ? formData.roundOff : 0,
                items: selectedItems.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: item.unitPrice,
                    taxRate: item.taxRate,
                    taxAmount: item.taxAmount,
                    discountPercent: item.discountPercent,
                    discountAmount: item.discountAmount,
                    total: item.amount,
                })),
                subtotal: formData.subtotal,
                totalDiscount: formData.discount,
                totalAmount: formData.totalAmount,
            };

            const response = await api.put(`/api/supplier-debit-notes/${id}`, updateData);
            
            toast.success("Debit note updated successfully");
            setIsEditMode(false);
            fetchDebitNoteDetails(); // Refresh data
        } catch (error) {
            console.error("Save error:", error);
            const errorMsg = error.response?.data?.error || 
                           error.response?.data?.details?.[0] || 
                           "Failed to update debit note";
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditMode(false);
        // Reset form data to original values
        if (debitNote) {
            setFormData({
                supplierId: debitNote.supplierId?._id || debitNote.supplierId || "",
                supplierName: debitNote.supplierName || "",
                phone: debitNote.phone || "",
                invoiceId: debitNote.invoiceId?._id || debitNote.invoiceId || "",
                invoiceNumber: debitNote.supplierInvoiceNo || "",
                date: new Date(debitNote.date).toISOString().split("T")[0],
                items: debitNote.items?.map((item, index) => ({
                    id: index + 1,
                    productId: item.productId?._id || item.productId,
                    name: item.name || "Product",
                    quantity: item.quantity || 1,
                    originalQuantity: item.quantity || 1,
                    unit: item.unit || "Pcs",
                    unitPrice: item.unitPrice || 0,
                    tax: `GST @ ${item.taxRate || 5}%`,
                    taxRate: item.taxRate || 5,
                    taxAmount: item.taxAmount || 0,
                    discountPercent: item.discountPercent || 0,
                    discountAmount: item.discountAmount || 0,
                    amount: item.total || 0,
                    isSelected: true,
                })) || [],
                subtotal: debitNote.subtotal || 0,
                discount: debitNote.totalDiscount || 0,
                shippingCharges: debitNote.additionalCharges || 0,
                autoRoundOff: Math.abs(debitNote.roundOff || 0) > 0,
                roundOff: debitNote.roundOff || 0,
                totalAmount: debitNote.totalAmount || 0,
                fullyReceived: debitNote.status === "settled",
                notes: debitNote.notes || "",
                reason: debitNote.reason || "defective_goods",
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleCancelDebitNote = async () => {
        if (!window.confirm("Are you sure you want to cancel this debit note?")) return;
        
        try {
            setSaving(true);
            await api.put(`/api/supplier-debit-notes/${id}/cancel`);
            toast.success("Debit note cancelled successfully");
            fetchDebitNoteDetails();
        } catch (error) {
            console.error("Cancel error:", error);
            toast.error(error.response?.data?.error || "Failed to cancel debit note");
        } finally {
            setSaving(false);
        }
    };

    const handleSettleDebitNote = async () => {
        if (!window.confirm("Are you sure you want to mark this debit note as settled?")) return;
        
        try {
            setSaving(true);
            await api.put(`/api/supplier-debit-notes/${id}/settle`);
            toast.success("Debit note marked as settled successfully");
            fetchDebitNoteDetails();
        } catch (error) {
            console.error("Settle error:", error);
            toast.error(error.response?.data?.error || "Failed to settle debit note");
        } finally {
            setSaving(false);
        }
    };

    const statusColors = {
        draft: { bg: "#FEF3C7", color: "#92400E", label: "Draft" },
        issued: { bg: "#DBEAFE", color: "#1E40AF", label: "Issued" },
        settled: { bg: "#D1FAE5", color: "#065F46", label: "Settled" },
        cancelled: { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" }
    };

    const statusInfo = debitNote ? statusColors[debitNote.status] || statusColors.draft : statusColors.draft;

    if (loading) {
        return (
            <div className="px-4 py-4">
                <div className="text-center py-5">Loading...</div>
            </div>
        );
    }

    if (!debitNote) {
        return (
            <div className="px-4 py-4">
                <div className="text-center py-5">Debit note not found</div>
            </div>
        );
    }

    const isReadOnly = debitNote.status === "settled" || debitNote.status === "cancelled";
    const canEdit = !isReadOnly && isEditMode;

    return (
        <div className="px-4 py-4">
            {/* Header - EXACTLY SAME as creation page */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                    <Link to="/debit-note" style={{ marginRight: "10px" }}>
                        <span
                            style={{
                                backgroundColor: "white",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                border: "1px solid #FCFCFC",
                            }}
                        >
                            <img src={total_orders_icon} alt="" />
                        </span>
                    </Link>
                    <div>
                        <h4
                            className="m-0"
                            style={{
                                fontSize: "22px",
                                color: "#0E101A",
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 500,
                                lineHeight: "120%",
                            }}
                        >
                            {isEditMode ? "Edit Debit Note" : `Debit Note #${debitNote.debitNoteNumber}`}
                        </h4>
                        <div className="d-flex align-items-center gap-2 mt-1">
                            <span
                                style={{
                                    backgroundColor: statusInfo.bg,
                                    color: statusInfo.color,
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                }}
                            >
                                {statusInfo.label}
                            </span>
                            {!isEditMode && (
                                <span style={{ color: "#727681", fontSize: "14px" }}>
                                    • Created on {new Date(debitNote.date).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn d-flex align-items-center gap-2"
                        style={{
                            background: "#fff",
                            border: "1.5px solid #1F7FFF",
                            color: "#1F7FFF",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            fontWeight: 500,
                            fontSize: "14px",
                        }}
                        onClick={handlePrint}
                    >
                        Print
                    </button>
                    
                    {!isReadOnly && !isEditMode && (
                        <button
                            className="btn d-flex align-items-center gap-2"
                            style={{
                                background: "#1F7FFF",
                                border: "1.5px solid #1F7FFF",
                                color: "white",
                                borderRadius: "8px",
                                padding: "8px 16px",
                                fontWeight: 500,
                                fontSize: "14px",
                            }}
                            onClick={handleEdit}
                        >
                            Edit
                        </button>
                    )}

                    {debitNote.status === "issued" && !isEditMode && (
                        <>
                            <button
                                className="btn d-flex align-items-center gap-2"
                                style={{
                                    background: "#28a745",
                                    border: "1.5px solid #28a745",
                                    color: "white",
                                    borderRadius: "8px",
                                    padding: "8px 16px",
                                    fontWeight: 500,
                                    fontSize: "14px",
                                }}
                                onClick={handleSettleDebitNote}
                                disabled={saving}
                            >
                                {saving ? "Processing..." : "Mark as Settled"}
                            </button>
                            <button
                                className="btn d-flex align-items-center gap-2"
                                style={{
                                    background: "#dc3545",
                                    border: "1.5px solid #dc3545",
                                    color: "white",
                                    borderRadius: "8px",
                                    padding: "8px 16px",
                                    fontWeight: 500,
                                    fontSize: "14px",
                                }}
                                onClick={handleCancelDebitNote}
                                disabled={saving}
                            >
                                {saving ? "Processing..." : "Cancel Debit Note"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content - EXACTLY SAME as creation page */}
            <div
                className="section-card"
                style={{ padding: "20px", height: "auto" }}
            >
                <h6 className="section-title">Supplier Details</h6>

                {/* Main Horizontal Wrapper */}
                <div className="d-flex justify-content-between mb-4">
                    {/* LEFT AREA (Supplier + Phone) */}
                    <div
                        style={{ display: "flex", alignItems: "center", gap: "20px" }}
                    >
                        {/* Supplier Name */}
                        <div className="col-md-7">
                            <label className="form-label supplierlabel">
                                Supplier Name <span className="text-danger">*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type="text"
                                    className="form-control supplierinput shadow-none"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        border: "1px solid #A2A8B8",
                                        backgroundColor: "#f8f9fa",
                                    }}
                                    value={formData.supplierName}
                                    readOnly
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="col-md-7">
                            <label className="form-label supplierlabel">Phone No.</label>
                            <div className="input-group">
                                <span
                                    className="input-group-text bg-white"
                                    style={{ border: "1px solid #A2A8B8", backgroundColor: "#f8f9fa" }}
                                >
                                    <img
                                        src="https://flagcdn.com/in.svg"
                                        alt="India"
                                        width="20"
                                        className="me-1"
                                    />
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    className="form-control supplierinput shadow-none"
                                    style={{
                                        border: "1px solid #A2A8B8",
                                        backgroundColor: "#f8f9fa",
                                    }}
                                    value={formData.phone}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    {/* LEFT END */}

                    {/* middle line */}
                    <div
                        style={{
                            width: "1px",
                            height: "70px",
                            backgroundColor: "#E0E0E0",
                            margin: "0 20px",
                        }}
                    ></div>

                    {/* RIGHT SIDE (Supplier Invoice No + Date) */}
                    <div className="d-flex flex-column gap-3">
                        {/* Supplier Invoice No */}
                        <div className="d-flex justify-content-end">
                            <div style={{ position: "relative", width: "100%" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "10px 14px",
                                        border: "1px solid #D1D5DB",
                                        borderRadius: "12px",
                                        backgroundColor: "#f8f9fa",
                                        fontSize: "14px",
                                        fontFamily: '"Inter", sans-serif',
                                        color: "#374151",
                                        height: "37px",
                                    }}
                                >
                                    <span style={{ flex: 1 }}>
                                        {formData.invoiceNumber || "Purchase Invoice No"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="d-flex justify-content-end gap-2">
                            <div className="" style={{ marginLeft: "-10px" }}>
                                {isEditMode ? (
                                    <DatePicker
                                        padding="6px 10px"
                                        value={formData.date}
                                        onChange={(selectedDate) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                date: selectedDate,
                                            }))
                                        }
                                    />
                                ) : (
                                    <div
                                        style={{
                                            padding: "10px 14px",
                                            border: "1px solid #D1D5DB",
                                            borderRadius: "12px",
                                            backgroundColor: "#f8f9fa",
                                            fontSize: "14px",
                                            color: "#374151",
                                        }}
                                    >
                                        {new Date(formData.date).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* RIGHT END */}
                </div>

                {/* Reason for Debit Note */}
                <div className="mb-4">
                    <h6 className="section-title">Reason for Debit Note</h6>
                    {isEditMode ? (
                        <select
                            className="form-select"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            style={{ maxWidth: "300px", border: "1px solid #A2A8B8" }}
                        >
                            <option value="defective_goods">Defective Goods</option>
                            <option value="returned_goods">Returned Goods</option>
                            <option value="short_supply">Short Supply</option>
                            <option value="over_charging">Over Charging</option>
                            <option value="price_adjustment">Price Adjustment</option>
                            <option value="quality_issue">Quality Issue</option>
                            <option value="late_delivery">Late Delivery</option>
                            <option value="wrong_items">Wrong Items</option>
                            <option value="error_correction">Error Correction</option>
                            <option value="other">Other</option>
                        </select>
                    ) : (
                        <div style={{ color: "#0E101A", fontSize: "16px", fontWeight: 500 }}>
                            {formData.reason ? formData.reason.replace(/_/g, ' ').toUpperCase() : "N/A"}
                        </div>
                    )}
                </div>

                {/* Add Products Section - EXACTLY SAME */}
                <div className="mb-4">
                    <h6 className="section-title">Add Products</h6>

                    <table className="table po-table mt-3 table-bordered-custom">
                        <thead style={{ textAlign: "center" }}>
                            <tr>
                                <th style={{ width: "70px", position: "relative" }}>
                                    Sl No.
                                </th>
                                <th style={{ textAlign: "left", position: "relative" }}>
                                    Items
                                </th>
                                <th style={{ position: "relative" }}>Qty</th>
                                <th style={{ position: "relative" }}>Unit</th>
                                <th style={{ position: "relative" }}>Unit Price</th>
                                <th style={{ position: "relative" }}>Tax</th>
                                <th style={{ position: "relative" }}>Tax Amount</th>
                                <th style={{ position: "relative" }}>Discount</th>
                                <th>Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {formData.items.length > 0
                                ? formData.items.map((item, index) => (
                                    <tr key={item.id}>
                                        <td
                                            className="numslno"
                                            style={{
                                                border: "2px solid #1F7FFF",
                                                position: "relative",
                                            }}
                                        >
                                            {isEditMode ? (
                                                <input
                                                    type="checkbox"
                                                    style={{ marginRight: "10px" }}
                                                    checked={item.isSelected}
                                                    onChange={() => handleItemSelect(index)}
                                                    disabled={!isEditMode}
                                                />
                                            ) : (
                                                <span style={{ marginRight: "10px" }}>✓</span>
                                            )}
                                            {item.id}
                                        </td>

                                        {/* Items */}
                                        <td
                                            className="itemsno items-cell"
                                            style={{ position: "relative" }}
                                        >
                                            <input
                                                type="text"
                                                className="form-control supplierinput shadow-none"
                                                style={{
                                                    outline: "none !important",
                                                    border: "none",
                                                    backgroundColor: "transparent",
                                                }}
                                                value={item.name}
                                                readOnly
                                            />
                                        </td>

                                        {/* Qty - Show as "returned/original" format */}
                                        <td
                                            className="items-cell"
                                            style={{ width: "100px", position: "relative" }}
                                        >
                                            <input
                                                type="text"
                                                className="form-control center shadow-none"
                                                style={{
                                                    width: "100%",
                                                    border: "1px solid #A2A8B8",
                                                    backgroundColor: isEditMode && item.isSelected ? "white" : "#f8f9fa",
                                                }}
                                                value={`${item.quantity}/${item.originalQuantity}`}
                                                onChange={(e) => {
                                                    if (!isEditMode) return;
                                                    const value = e.target.value;
                                                    const [returnQty] = value
                                                        .split("/")
                                                        .map((num) => parseFloat(num) || 0);
                                                    handleItemChange(index, "quantity", returnQty);
                                                }}
                                                disabled={!isEditMode || !item.isSelected}
                                            />
                                        </td>

                                        {/* Unit */}
                                        <td
                                            className="items-cell"
                                            style={{ width: "100px", position: "relative" }}
                                        >
                                            <select
                                                className="form-select form-select-sm shadow-none"
                                                style={{
                                                    width: "100%",
                                                    border: "1px solid #A2A8B8",
                                                    backgroundColor: isEditMode && item.isSelected ? "white" : "#f8f9fa",
                                                }}
                                                value={item.unit}
                                                onChange={(e) =>
                                                    handleItemChange(index, "unit", e.target.value)
                                                }
                                                disabled={!isEditMode || !item.isSelected}
                                            >
                                                <option>Pcs</option>
                                                <option>Kg</option>
                                                <option>Gram</option>
                                                <option>Liter</option>
                                                <option>Meter</option>
                                            </select>
                                        </td>

                                        {/* Unit Price */}
                                        <td
                                            className="items-cell"
                                            style={{ width: "150px", position: "relative" }}
                                        >
                                            <input
                                                type="number"
                                                className="form-control shadow-none"
                                                placeholder="₹0.00"
                                                style={{
                                                    border: "1px solid #A2A8B8",
                                                    backgroundColor: isEditMode && item.isSelected ? "white" : "#f8f9fa",
                                                }}
                                                value={item.unitPrice}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "unitPrice",
                                                        e.target.value
                                                    )
                                                }
                                                min="0"
                                                step="0.01"
                                                disabled={!isEditMode || !item.isSelected}
                                            />
                                        </td>

                                        {/* Tax */}
                                        <td
                                            className="items-cell"
                                            style={{ width: "150px", position: "relative" }}
                                        >
                                            <select
                                                className="form-select supplierselect shadow-none"
                                                style={{
                                                    border: "1px solid #A2A8B8",
                                                    backgroundColor: isEditMode && item.isSelected ? "white" : "#f8f9fa",
                                                }}
                                                value={item.tax}
                                                onChange={(e) => {
                                                    if (!isEditMode) return;
                                                    const taxRate =
                                                        parseFloat(
                                                            e.target.value.match(/\d+/)?.[0]
                                                        ) || 5;
                                                    handleItemChange(index, "tax", e.target.value);
                                                    handleItemChange(index, "taxRate", taxRate);
                                                }}
                                                disabled={!isEditMode || !item.isSelected}
                                            >
                                                <option>GST @ 5%</option>
                                                <option>GST @ 12%</option>
                                                <option>GST @ 18%</option>
                                                <option>GST @ 28%</option>
                                            </select>
                                        </td>

                                        {/* Tax Amount */}
                                        <td
                                            className="items-cell"
                                            style={{ width: "130px", position: "relative" }}
                                        >
                                            <input
                                                type="text"
                                                placeholder="₹0.00"
                                                className="form-control shadow-none"
                                                style={{
                                                    border: "1px solid #A2A8B8",
                                                    backgroundColor: "#f8f9fa",
                                                }}
                                                value={`₹${item.taxAmount.toFixed(2)}`}
                                                readOnly
                                            />
                                        </td>

                                        {/* Discount */}
                                        <td
                                            className="items-cell"
                                            style={{ width: "200px", position: "relative" }}
                                        >
                                            <div
                                                className="discount-box"
                                                style={{ display: "flex", gap: "10px" }}
                                            >
                                                <div style={{ position: "relative" }}>
                                                    <input
                                                        type="number"
                                                        className="form-control small shadow-none"
                                                        style={{
                                                            paddingRight: "30px",
                                                            width: "100%",
                                                            border: "1px solid #A2A8B8",
                                                            backgroundColor: isEditMode && item.isSelected ? "white" : "#f8f9fa",
                                                        }}
                                                        placeholder="00"
                                                        value={item.discountPercent}
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                index,
                                                                "discountPercent",
                                                                e.target.value
                                                            )
                                                        }
                                                        min="0"
                                                        max="100"
                                                        disabled={!isEditMode || !item.isSelected}
                                                    />
                                                    <div
                                                        className="symbol"
                                                        style={{
                                                            position: "absolute",
                                                            right: "0px",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            pointerEvents: "none",
                                                            color: "#555",
                                                        }}
                                                    >
                                                        %{" "}
                                                    </div>
                                                </div>
                                                <div style={{ position: "relative" }}>
                                                    <input
                                                        type="number"
                                                        className="form-control small shadow-none"
                                                        style={{
                                                            width: "100%",
                                                            border: "1px solid #A2A8B8",
                                                            backgroundColor: isEditMode && item.isSelected ? "white" : "#f8f9fa",
                                                        }}
                                                        placeholder="00"
                                                        value={item.discountAmount}
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                index,
                                                                "discountAmount",
                                                                e.target.value
                                                            )
                                                        }
                                                        min="0"
                                                        step="0.01"
                                                        disabled={!isEditMode || !item.isSelected}
                                                    />
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            right: "0px",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            pointerEvents: "none",
                                                            color: "#555",
                                                        }}
                                                        className="symbol"
                                                    >
                                                        ₹{" "}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td style={{ width: "150px" }}>
                                            <input
                                                type="text"
                                                className="form-control shadow-none"
                                                style={{
                                                    width: "100%",
                                                    border: "1px solid #A2A8B8",
                                                    backgroundColor: "#f8f9fa",
                                                }}
                                                placeholder="₹0.00"
                                                value={`₹${item.amount.toFixed(2)}`}
                                                readOnly
                                            />
                                        </td>
                                    </tr>
                                ))
                                : /* Show 1 empty row if no items */
                                [1].map((num) => (
                                    <tr key={num}>
                                        <td
                                            className="numslno"
                                            style={{
                                                border: "2px solid #1F7FFF",
                                                position: "relative",
                                            }}
                                        >
                                            {num}
                                        </td>
                                        <td colSpan="8" style={{ textAlign: "center", color: "#727681" }}>
                                            No items found
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Payment + Summary - EXACTLY SAME */}
                <div className="row">
                    {/* Payment Left */}
                    <div className="col-md-7">
                        <div className="">
                            <h6 className="section-title" style={{ color: "#0E101A" }}>
                                Payment Details
                            </h6>
                            <div className="mt-3">
                                {isEditMode ? (
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Add any notes or payment details..."
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                notes: e.target.value,
                                            }))
                                        }
                                    />
                                ) : (
                                    <div style={{ 
                                        color: "#0E101A", 
                                        fontSize: "14px",
                                        padding: "12px",
                                        backgroundColor: "#F8F9FA",
                                        borderRadius: "8px",
                                        minHeight: "80px"
                                    }}>
                                        {formData.notes || "No notes provided"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Summary Right */}
                    <div className="col-md-5">
                        <div className="p-4">
                            <div className="summary-line">
                                <span
                                    style={{
                                        color: "#0E101A",
                                        fontWeight: 400,
                                        fontSize: "16px",
                                        lineHeight: "120%",
                                        fontFamily: 'Inter", sans-serif',
                                    }}
                                >
                                    Subtotal (with GST):
                                </span>
                                <span
                                    style={{
                                        color: "#0E101A",
                                        fontWeight: 400,
                                        fontSize: "16px",
                                        lineHeight: "120%",
                                        fontFamily: 'Inter", sans-serif',
                                    }}
                                >
                                    ₹{formData.subtotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="summary-line">
                                <span
                                    style={{
                                        color: "#727681",
                                        fontWeight: 400,
                                        fontSize: "16px",
                                        lineHeight: "120%",
                                        fontFamily: 'Inter", sans-serif',
                                    }}
                                >
                                    Discount:
                                </span>
                                <span
                                    style={{
                                        color: "#727681",
                                        fontWeight: 400,
                                        fontSize: "16px",
                                        lineHeight: "120%",
                                        fontFamily: 'Inter", sans-serif',
                                    }}
                                >
                                    ₹{formData.discount.toFixed(2)}
                                </span>
                            </div>
                            <div className="summary-line">
                                <span
                                    style={{
                                        color: "#727681",
                                        fontWeight: 400,
                                        fontSize: "16px",
                                        lineHeight: "120%",
                                        fontFamily: 'Inter", sans-serif',
                                    }}
                                >
                                    Shipping Charges:
                                </span>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <span>₹</span>
                                    {isEditMode ? (
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            style={{ width: "80px", padding: "2px 8px" }}
                                            value={formData.shippingCharges}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    shippingCharges: parseFloat(e.target.value) || 0,
                                                }))
                                            }
                                            min="0"
                                            step="0.01"
                                        />
                                    ) : (
                                        <span style={{ color: "#727681", fontSize: "14px" }}>
                                            {formData.shippingCharges.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="summary-line">
                                <span>
                                    {isEditMode ? (
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={formData.autoRoundOff}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    autoRoundOff: e.target.checked,
                                                }))
                                            }
                                        />
                                    ) : (
                                        <span
                                            style={{
                                                color: "#0E101A",
                                                fontWeight: 400,
                                                fontSize: "16px",
                                                lineHeight: "120%",
                                                fontFamily: 'Inter", sans-serif',
                                                marginLeft: "10px",
                                            }}
                                        >
                                            {formData.roundOff !== 0 ? "✓" : ""}
                                        </span>
                                    )}
                                    <span
                                        style={{
                                            color: "#0E101A",
                                            fontWeight: 400,
                                            fontSize: "16px",
                                            lineHeight: "120%",
                                            fontFamily: 'Inter", sans-serif',
                                            marginLeft: "10px",
                                        }}
                                    >
                                        Auto Round-off
                                    </span>
                                </span>
                                <span
                                    style={{
                                        color: "#0E101A",
                                        fontWeight: 400,
                                        fontSize: "16px",
                                        lineHeight: "120%",
                                        fontFamily: 'Inter", sans-serif',
                                    }}
                                >
                                    {formData.roundOff >= 0 ? "+" : "-"}₹
                                    {Math.abs(formData.roundOff).toFixed(2)}
                                </span>
                            </div>
                            <hr style={{ color: "#727681" }} />
                            <div className="summary-line">
                                <h5
                                    style={{
                                        color: "#0E101A",
                                        lineHeight: "120%",
                                        fontFamily: 'Inter", sans-serif',
                                    }}
                                >
                                    Total Debit Amount :-
                                </h5>
                                <h4
                                    style={{
                                        color: "#0E101A",
                                        fontWeight: 500,
                                        fontSize: "16px",
                                        lineHeight: "120%",
                                        fontFamily: 'Inter", sans-serif',
                                    }}
                                >
                                    ₹{formData.totalAmount.toFixed(2)}
                                </h4>
                            </div>

                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={formData.fullyReceived}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            fullyReceived: e.target.checked,
                                        }))
                                    }
                                    disabled={!isEditMode || debitNote.status === "settled"}
                                />
                                <label
                                    className="form-check-label"
                                    style={{
                                        color: "#727681",
                                        fontWeight: 400,
                                        fontSize: "16px",
                                    }}
                                >
                                    {debitNote.status === "settled" ? "Fully Settled" : "Fully Received"}
                                </label>
                            </div>

                            {/* Buttons - EXACTLY SAME as creation page */}
                            {isEditMode && (
                                <div className="d-flex justify-content-end gap-2 mt-3">
                                    <button
                                        className="btn btn-outline-primary"
                                        style={{
                                            fontWeight: 500,
                                            padding: "10px",
                                            fontSize: "14px",
                                            lineHeight: "120%",
                                            fontFamily: '"Inter" sans-serif',
                                            border: "1px solid #1F7FFF",
                                            boxShadow: "rgba(0, 0, 0, 0.25)",
                                        }}
                                        onClick={handleCancel}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        style={{
                                            padding: "10px",
                                            color: "#FFFFFF",
                                            fontWeight: 500,
                                            fontSize: "14px",
                                            lineHeight: "120%",
                                            fontFamily: '"Inter" sans-serif',
                                            boxShadow: "rgba(0, 0, 0, 0.25)",
                                        }}
                                        onClick={handleSave}
                                        disabled={saving || 
                                            formData.items.filter(
                                                (item) => item.isSelected && item.quantity > 0
                                            ).length === 0
                                        }
                                    >
                                        {saving ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="mt-4" style={{ color: "#727681", fontSize: "12px" }}>
                <div>Debit Note ID: {debitNote._id}</div>
                <div>Created: {new Date(debitNote.createdAt).toLocaleString()}</div>
                {debitNote.updatedAt && debitNote.updatedAt !== debitNote.createdAt && (
                    <div>Last Updated: {new Date(debitNote.updatedAt).toLocaleString()}</div>
                )}
            </div>
        </div>
    );
};

export default DebitNoteViewEdit;