import React, { useState, useEffect, useRef } from "react";
// import "./CreditNote.css";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import InvoicePreviewModal from "../../../layouts/InvoicePreviewModal";
import DatePicker from "../../../layouts/DatePicker";
import total_orders_icon from "../../../../assets/images/totalorders-icon.png";
import api from "../../../../pages/config/axiosInstance";
import { toast } from "react-toastify";
import { IoChevronDownOutline } from "react-icons/io5";

const SupplierDebitNote = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { supplierId } = useParams();
    const [showPreview, setShowPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [supplierInvoices, setSupplierInvoices] = useState([]);
    const [loadingInvoices, setLoadingInvoices] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Form state - SAME STRUCTURE as customer credit note
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
    });


    // Fetch suppliers and products on component mount
    useEffect(() => {
        fetchSuppliers();
        fetchProducts();
    }, []);

    // When supplierId from URL params changes, fetch supplier details
    useEffect(() => {
        if (supplierId) {
            fetchSupplierFromId(supplierId);
        }
    }, [supplierId]);

    // Also check if supplier passed from navigation (as backup)
    useEffect(() => {
        if (location.state?.supplier) {
            handleSupplierSelect(location.state.supplier);
        }
    }, [location.state]);


    // Fetch supplier invoices when supplier changes
    useEffect(() => {
        if (formData.supplierId) {
            fetchSupplierInvoices(formData.supplierId);
        } else {
            setSupplierInvoices([]);
            setFormData((prev) => ({
                ...prev,
                invoiceId: "",
                invoiceNumber: "",
                items: [],
            }));
        }
    }, [formData.supplierId]);

    // Recalculate totals when items or other values change
    useEffect(() => {
        calculateTotals();
    }, [formData.items, formData.shippingCharges, formData.autoRoundOff]);

    const fetchSupplierFromId = async (id) => {
        try {
            setLoading(true);
            const response = await api.get(`/api/suppliers/${id}`);
            const supplier = response.data.supplier || response.data;

            if (supplier) {
                handleSupplierSelect(supplier);
            }
        } catch (error) {
            console.error("Failed to fetch supplier:", error);
            toast.error("Failed to load supplier details");
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await api.get("/api/suppliers");
            let suppliersData = [];
            if (Array.isArray(response.data)) {
                suppliersData = response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                suppliersData = response.data.data;
            }
            setSuppliers(suppliersData);
        } catch (error) {
            console.error("Failed to load suppliers:", error);
            toast.error("Failed to load suppliers");
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get("/api/products");
            let productsData = [];
            if (Array.isArray(response.data)) {
                productsData = response.data;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                productsData = response.data.data;
            } else if (response.data?.products && Array.isArray(response.data.products)) {
                productsData = response.data.products;
            }
            setProducts(productsData);
        } catch (error) {
            console.error("Failed to load products:", error);
            toast.error("Failed to load products");
        }
    };

    const fetchSupplierInvoices = async (supplierId) => {
        try {
            setLoadingInvoices(true);
            let response;
            try {
                response = await api.get(`/api/supplier-invoices/supplier/${supplierId}`);
            } catch (firstError) {
                try {
                    response = await api.get(`/api/supplier-invoices?supplierId=${supplierId}`);
                } catch (secondError) {
                    console.error("No supplier invoice endpoint found");
                    setSupplierInvoices([]);
                    return;
                }
            }

            let invoicesData = [];
            if (Array.isArray(response.data)) {
                invoicesData = response.data;
            } else if (response.data?.invoices && Array.isArray(response.data.invoices)) {
                invoicesData = response.data.invoices;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                invoicesData = response.data.data;
            }

            setSupplierInvoices(invoicesData);
        } catch (error) {
            console.error("Failed to load supplier invoices:", error);
            setSupplierInvoices([]);
        } finally {
            setLoadingInvoices(false);
        }
    };

    const handleSupplierSelect = (supplier) => {
        setFormData((prev) => ({
            ...prev,
            supplierId: supplier._id,
            supplierName: supplier.supplierName || supplier.name || supplier.company,
            phone: supplier.phone || "",
            invoiceId: "",
            invoiceNumber: "",
            items: [],
        }));
    };

    const handleInvoiceSelect = async (invoice) => {
        try {
            const invoiceResponse = await api.get(`/api/supplier-invoices/${invoice._id}`);
            const invoiceDetails = invoiceResponse.data.invoice || invoiceResponse.data;

            if (!invoiceDetails || !invoiceDetails.items) {
                toast.error("Could not load invoice items");
                return;
            }

            const itemsFromInvoice = invoiceDetails.items.map((item, index) => ({
                id: index + 1,
                productId: item.productId?._id || item.productId,
                name: item.itemName || item.name || item.productId?.productName || "Product",
                quantity: item.qty || item.quantity || 1,
                originalQuantity: item.qty || item.quantity || 1,
                unit: item.unit || "Pcs",
                unitPrice: item.unitPrice || item.purchasePrice || 0,
                tax: item.taxType || `GST @ ${item.taxRate || 5}%`,
                taxRate: item.taxRate || 5,
                taxAmount: 0,
                discountPercent: 0,
                discountAmount: 0,
                amount: 0,
                isSelected: true,
            }));

            setFormData((prev) => ({
                ...prev,
                invoiceId: invoice._id,
                invoiceNumber: invoice.invoiceNo || invoice.invoiceNumber || "",
                items: itemsFromInvoice,
            }));

            toast.success(`Loaded ${itemsFromInvoice.length} items from invoice`);
        } catch (error) {
            console.error("Failed to load invoice details:", error);
            toast.error("Failed to load invoice details");
        }
    };

    const handleItemSelect = (index) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            isSelected: !updatedItems[index].isSelected,
            quantity: !updatedItems[index].isSelected ? updatedItems[index].originalQuantity : 0,
        };

        calculateItemTotal(updatedItems[index]);
        setFormData((prev) => ({ ...prev, items: updatedItems }));
    };

    const handleItemChange = (index, field, value) => {
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
            calculateItemTotal(updatedItems[index]);
        }

        setFormData((prev) => ({
            ...prev,
            items: updatedItems,
        }));
    };

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

    const handleSubmit = async (action) => {
        try {
            const selectedItems = formData.items.filter(
                (item) => item.isSelected && item.quantity > 0 && item.productId
            );

            if (selectedItems.length === 0) {
                toast.error("Please select at least one item to return");
                return;
            }

            if (!formData.supplierId) {
                toast.error("Please select a supplier");
                return;
            }

            if (!formData.invoiceId) {
                toast.error("Please select an invoice");
                return;
            }

            setLoading(true);

            const debitNoteData = {
                supplierId: formData.supplierId,
                supplierName: formData.supplierName,
                phone: formData.phone,
                invoiceId: formData.invoiceId,
                invoiceNumber: formData.invoiceNumber,
                date: formData.date,
                reason: "defective_goods", // Default reason for supplier debit note
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
                shippingCharges: formData.shippingCharges,
                roundOff: formData.roundOff,
                totalAmount: formData.totalAmount,
                status: action === "save" ? "draft" : "issued",
                notes: formData.notes,
            };

            const response = await api.post("/api/supplier-debit-notes", debitNoteData);

            toast.success(
                `Debit note ${action === "save" ? "saved as draft" : "issued successfully"}`
            );

            if (action === "saveAndPrint") {
                navigate("/skeleton?redirect=/supplier-list");
            } else if (action === "issued") {
                navigate("/skeleton?redirect=/supplier-list");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error(
                error.response?.data?.error || "Failed to save debit note"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsInvoiceOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleManualSupplierSelect = (supplier) => {
        handleSupplierSelect(supplier);
        // Update URL if needed (optional)
        navigate(`/create-supplier-debitnote/${supplier._id}`, { replace: true });
    };
    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="">
                    {/* Header - SAME UI */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center">
                            <Link to="/supplier-list" style={{ marginRight: "10px" }}>
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
                                    <img src={total_orders_icon} alt="total_orders_icon" />
                                </span>
                            </Link>
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
                                Create Debit Notes
                            </h4>
                        </div>
                    </div>

                    {/* Supplier Details Section - EXACT SAME UI as customer */}
                    <div
                        className="section-card"
                        style={{ padding: "20px", height: "auto" }}
                    >
                        <h6 className="section-title">Supplier Details</h6>

                        {/* Main Horizontal Wrapper - SAME */}
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
                                            placeholder="Select Supplier"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                border: "1px solid #A2A8B8",
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
                                            style={{ border: "1px solid #A2A8B8" }}
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
                                            placeholder="Enter Phone"
                                            style={{
                                                border: "1px solid #A2A8B8",
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
                                    <div ref={dropdownRef} style={{ position: "relative", width: "100%" }}>
                                        <div
                                            onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "10px 14px",
                                                border: "1px solid #D1D5DB",
                                                borderRadius: "12px",
                                                backgroundColor: "#FFFFFF",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                fontFamily: '"Inter", sans-serif',
                                                color: "#374151",
                                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                transition: "all 0.2s",
                                                height: "37px",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)")
                                            }
                                        >
                                            <span style={{ flex: 1 }}>
                                                {formData.invoiceId
                                                    ? supplierInvoices.find(i => i._id === formData.invoiceId)?.invoiceNo
                                                    : "Supplier Invoice No"}
                                            </span>

                                            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                                                <IoChevronDownOutline />
                                            </span>
                                        </div>
                                        {isInvoiceOpen && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "100%",
                                                    left: 0,
                                                    right: 0,
                                                    marginTop: "8px",
                                                    backgroundColor: "#FFFFFF",
                                                    borderRadius: "12px",
                                                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                                    border: "1px solid #E5E7EB",
                                                    overflow: "hidden",
                                                    zIndex: 9999,
                                                    animation: "fadeIn 0.2s ease-out",
                                                    maxHeight: "240px",
                                                    overflowY: "auto",
                                                    scrollbarWidth: "none",
                                                    msOverflowStyle: "none",
                                                }}
                                            >
                                                {supplierInvoices.map((invoice) => (
                                                    <div
                                                        key={invoice._id}
                                                        onClick={() => {
                                                            handleInvoiceSelect(invoice);
                                                            setIsInvoiceOpen(false);
                                                        }}
                                                        style={{
                                                            padding: "12px 16px",
                                                            fontSize: "12px",
                                                            fontFamily: '"Inter", sans-serif',
                                                            cursor: "pointer",
                                                            color:
                                                                formData.invoiceId === invoice._id
                                                                    ? "#0E101A"
                                                                    : "#374151",
                                                            fontWeight:
                                                                formData.invoiceId === invoice._id ? "600" : "500",
                                                            backgroundColor:
                                                                formData.invoiceId === invoice._id
                                                                    ? "#e5f0ff"
                                                                    : "transparent",
                                                            transition: "all 0.2s ease",
                                                        }}
                                                        onMouseEnter={(e) =>
                                                            (e.currentTarget.style.backgroundColor = "#e5f0ff")
                                                        }
                                                        onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor =
                                                            formData.invoiceId === invoice._id
                                                                ? "#e5f0ff"
                                                                : "transparent")
                                                        }
                                                    >
                                                        {invoice.invoiceNo || invoice.invoiceNumber}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <style jsx>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>
                                </div>

                                {/* Date */}
                                <div className="d-flex justify-content-end gap-2">
                                    <div className="" style={{ marginLeft: "-10px" }}>
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
                                    </div>
                                </div>
                            </div>
                            {/* RIGHT END */}
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
                                    {/* If invoice selected and has items, show them */}
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
                                                    <input
                                                        type="checkbox"
                                                        style={{ marginRight: "10px" }}
                                                        checked={item.isSelected}
                                                        onChange={() => handleItemSelect(index)}
                                                    />
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
                                                        }}
                                                        value={item.name}
                                                        readOnly
                                                    />
                                                </td>

                                                {/* Qty - Show as "returned/original" format (0/2) */}
                                                <td
                                                    className="items-cell"
                                                    style={{ width: "100px", position: "relative" }}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control center shadow-none"
                                                        placeholder="0/0"
                                                        style={{
                                                            width: "100%",
                                                            border: "1px solid #A2A8B8",
                                                            backgroundColor: item.isSelected
                                                                ? "white"
                                                                : "#f8f9fa",
                                                        }}
                                                        value={`${item.quantity}/${item.originalQuantity}`}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            const [returnQty] = value
                                                                .split("/")
                                                                .map((num) => parseFloat(num) || 0);
                                                            handleItemChange(index, "quantity", returnQty);
                                                        }}
                                                        disabled={!item.isSelected}
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
                                                            backgroundColor: item.isSelected
                                                                ? "white"
                                                                : "#f8f9fa",
                                                        }}
                                                        value={item.unit}
                                                        onChange={(e) =>
                                                            handleItemChange(index, "unit", e.target.value)
                                                        }
                                                        disabled={!item.isSelected}
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
                                                            backgroundColor: item.isSelected
                                                                ? "white"
                                                                : "#f8f9fa",
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
                                                        disabled={!item.isSelected}
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
                                                            backgroundColor: item.isSelected
                                                                ? "white"
                                                                : "#f8f9fa",
                                                        }}
                                                        value={item.tax}
                                                        onChange={(e) => {
                                                            const taxRate =
                                                                parseFloat(
                                                                    e.target.value.match(/\d+/)?.[0]
                                                                ) || 5;
                                                            handleItemChange(index, "tax", e.target.value);
                                                            handleItemChange(index, "taxRate", taxRate);
                                                        }}
                                                        disabled={!item.isSelected}
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
                                                                    backgroundColor: item.isSelected
                                                                        ? "white"
                                                                        : "#f8f9fa",
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
                                                                disabled={!item.isSelected}
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
                                                                    backgroundColor: item.isSelected
                                                                        ? "white"
                                                                        : "#f8f9fa",
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
                                                                disabled={!item.isSelected}
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
                                        : /* Show 1 empty row by default (skeleton) */
                                        [1].map((num) => (
                                            <tr key={num}>
                                                <td
                                                    className="numslno"
                                                    style={{
                                                        border: "2px solid #1F7FFF",
                                                        position: "relative",
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        style={{ marginRight: "10px" }}
                                                    />
                                                    {num}
                                                </td>

                                                {/* Items */}
                                                <td
                                                    className="itemsno items-cell"
                                                    style={{ position: "relative" }}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control supplierinput shadow-none"
                                                        placeholder="Select invoice to load products"
                                                        style={{
                                                            outline: "none !important",
                                                            border: "none",
                                                        }}
                                                        readOnly
                                                    />
                                                </td>

                                                {/* Qty */}
                                                <td
                                                    className="items-cell"
                                                    style={{ width: "100px", position: "relative" }}
                                                >
                                                    <input
                                                        type="text"
                                                        className="form-control center shadow-none"
                                                        placeholder="0/0"
                                                        style={{
                                                            width: "100%",
                                                            border: "1px solid #A2A8B8",
                                                        }}
                                                        readOnly
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
                                                        }}
                                                        disabled
                                                    >
                                                        <option>Pcs</option>
                                                        <option>Kg</option>
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
                                                        style={{ border: "1px solid #A2A8B8" }}
                                                        readOnly
                                                    />
                                                </td>

                                                {/* Tax */}
                                                <td
                                                    className="items-cell"
                                                    style={{ width: "150px", position: "relative" }}
                                                >
                                                    <select
                                                        className="form-select supplierselect shadow-none"
                                                        style={{ border: "1px solid #A2A8B8" }}
                                                        disabled
                                                    >
                                                        <option>GST @ 5%</option>
                                                        <option>GST @ 12%</option>
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
                                                        style={{ border: "1px solid #A2A8B8" }}
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
                                                                }}
                                                                placeholder="00"
                                                                readOnly
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
                                                                }}
                                                                placeholder="00"
                                                                readOnly
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
                                                        }}
                                                        placeholder="₹0.00"
                                                        readOnly
                                                    />
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
                                        </div>
                                    </div>

                                    <div className="summary-line">
                                        <span>
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
                                        />
                                        <label
                                            className="form-check-label"
                                            style={{
                                                color: "#727681",
                                                fontWeight: 400,
                                                fontSize: "16px",
                                            }}
                                        >
                                            Fully Settled
                                        </label>
                                    </div>

                                    {/* Buttons */}
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
                                            onClick={() => handleSubmit("save")}
                                            disabled={
                                                loading ||
                                                !formData.supplierId ||
                                                !formData.invoiceId ||
                                                formData.items.filter(
                                                    (item) => item.isSelected && item.quantity > 0
                                                ).length === 0
                                            }
                                        >
                                            {loading ? "Saving..." : "Save"}
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
                                            onClick={() => handleSubmit("saveAndPrint")}
                                            disabled={
                                                loading ||
                                                !formData.supplierId ||
                                                !formData.invoiceId ||
                                                formData.items.filter(
                                                    (item) => item.isSelected && item.quantity > 0
                                                ).length === 0
                                            }
                                        >
                                            {loading ? "Saving..." : "Save & Print"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDebitNote;