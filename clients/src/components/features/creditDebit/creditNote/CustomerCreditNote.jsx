import React, { useState, useEffect, useRef } from "react";
import "./CreditNote.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import InvoicePreviewModal from "../../../layouts/InvoicePreviewModal";
import DatePicker from "../../../layouts/DatePicker";
import total_orders_icon from "../../../../assets/images/totalorders-icon.png";
import api from "../../../../pages/config/axiosInstance";
import { toast } from "react-toastify";
import { IoChevronDownOutline } from "react-icons/io5";
import AddCustomers from "../../../../pages/Modal/customerModals/AddCustomerModal";
import { FiSearch } from "react-icons/fi";

const CustomerCreditNote = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State for customer selection/selection
  const [customerSearch, setCustomerSearch] = useState("");
  const [allCustomers, setAllCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  // modal state
  const [openAddModal, setOpenAddModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Check if we're in "create from navbar" mode
  const isFromNavbar = !location.state?.customer;

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    phone: "",
    invoiceId: "", // This will store the actual invoice ID
    invoiceNumber: "", // This will store the invoice number for display
    date: new Date().toISOString().split("T")[0],
    items: [], // Start empty - will auto-fill when invoice is selected
    subtotal: 0,
    discount: 0,
    shippingCharges: 0,
    autoRoundOff: false,
    roundOff: 0,
    totalAmount: 0,
    fullyReceived: false,
    notes: "",
  });

  // Fetch customers and products on component mount
  useEffect(() => {
    fetchCustomers();
    fetchProducts();

    // If customer passed from navigation
    if (location.state?.customer) {
      handleCustomerSelect(location.state.customer);
    }
  }, []);

  // Fetch customer invoices when customer changes
  useEffect(() => {
    if (formData.customerId) {
      fetchCustomerInvoices(formData.customerId);
    } else {
      setCustomerInvoices([]);
      setFormData((prev) => ({
        ...prev,
        invoiceId: "",
        invoiceNumber: "",
        items: [],
      }));
    }
  }, [formData.customerId]);

  // Recalculate totals when items or other values change
  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.shippingCharges, formData.autoRoundOff]);
  // fetch customers for search (when in navbar mode)
  useEffect(() => {
    if (isFromNavbar) {
      fetchCustomers();
    }
  }, [isFromNavbar]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get("/api/customers");
      // Handle different response structures
      let customersData = [];
      if (Array.isArray(response.data)) {
        customersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        customersData = response.data.data;
      }
      setCustomers(customersData);
      setAllCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error("Failed to load customers:", error);
      toast.error("Failed to load customers");
    }
  };

  // Handle customer search
  useEffect(() => {
    if (!customerSearch.trim()) {
      setFilteredCustomers(allCustomers);
      return;
    }
    const searchTerm = customerSearch.toLowerCase();
    const filtered = allCustomers.filter((cust) => cust.name?.toLowerCase().includes(searchTerm) || cust.phone?.includes(customerSearch) || cust.email?.toLowerCase().includes(searchTerm));
    setFilteredCustomers(filtered);
  }, [customerSearch, allCustomers]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/products");
      // Handle different response structures
      let productsData = [];
      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (
        response.data?.products &&
        Array.isArray(response.data.products)
      ) {
        productsData = response.data.products;
      }
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast.error("Failed to load products");
    }
  };

  const fetchCustomerInvoices = async (customerId) => {
    try {
      setLoadingInvoices(true);
      // Try different endpoints
      let response;
      try {
        response = await api.get(`/api/invoices/customer/${customerId}`);
      } catch (firstError) {
        try {
          response = await api.get(`/api/invoices?customerId=${customerId}`);
        } catch (secondError) {
          console.error("No invoice endpoint found");
          setCustomerInvoices([]);
          return;
        }
      }

      // Handle response structure
      let invoicesData = [];
      if (Array.isArray(response.data)) {
        invoicesData = response.data;
      } else if (
        response.data?.invoices &&
        Array.isArray(response.data.invoices)
      ) {
        invoicesData = response.data.invoices;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        invoicesData = response.data.data;
      }

      const validInvoices = invoicesData.filter(
        (invoice) =>
          invoice.status !== 'cancelled' &&
          invoice.status !== 'draft' &&
          invoice.status !== 'void'
      );

      // Sort by date (newest first)
      const sortedInvoices = validInvoices.sort((a, b) =>
        new Date(b.invoiceDate || b.createdAt) - new Date(a.invoiceDate || a.createdAt)
      );
      // Filter for unpaid invoices
      const unpaidInvoices = invoicesData.filter(
        (invoice) =>
          invoice.dueAmount > 0 || (invoice.status && invoice.status !== "paid")
      );

      setCustomerInvoices(sortedInvoices);
      // Show info if no invoices found
      if (sortedInvoices.length === 0) {
        toast.info("No invoices found for this customer");
      }
    } catch (error) {
      console.error("Failed to load customer invoices:", error);
      setCustomerInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setFormData((prev) => ({
      ...prev,
      customerId: customer._id,
      customerName: customer.name,
      phone: customer.phone || "",
      invoiceId: "",
      invoiceNumber: "",
      items: [],
    }));
    if (isFromNavbar) {
      setCustomerSearch(customer.name);
      setShowCustomerDropdown(false);
    };
  }

  const handleClearCustomer = () => {
    setFormData((prev) => ({
      ...prev,
      customerId: "",
      customerName: "",
      phone: "",
      invoiceId: "",
      invoiceNumber: "",
      items: [],
    }));
    if (isFromNavbar) {
      setCustomerSearch("");
    };
  }
  const handleNewCustomerCreated = (newCustomer) => {
    fetchCustomers();
    // Auto select the newly created customer
    handleCustomerSelect(newCustomer);
    toast.success('Customer created successfully!');
  };

  const handleInvoiceSelect = async (invoice) => {
    try {
      // Fetch full invoice details with items
      const invoiceResponse = await api.get(`/api/invoices/${invoice._id}`);
      const invoiceDetails =
        invoiceResponse.data.invoice || invoiceResponse.data;

      if (!invoiceDetails || !invoiceDetails.items) {
        toast.error("Could not load invoice items");
        return;
      }

      // Auto-fill items from invoice
      const itemsFromInvoice = invoiceDetails.items.map((item, index) => ({
        id: index + 1,
        productId: item.productId?._id || item.productId,
        name:
          item.itemName ||
          item.name ||
          item.productId?.productName ||
          "Product",
        description: item.description || "",
        quantity: item.qty || item.quantity || 1,
        originalQuantity: item.qty || item.quantity || 1, // Store original for max
        unit: item.unit || "Pcs",
        unitPrice: item.unitPrice || 0,
        tax: item.taxType || `GST @ ${item.taxRate || 5}%`,
        taxRate: item.taxRate || 5,
        taxAmount: 0, // Will calculate
        discountPercent: 0,
        discountAmount: 0,
        amount: 0, // Will calculate
        isSelected: true, // Default all items selected
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
      quantity: !updatedItems[index].isSelected
        ? updatedItems[index].originalQuantity
        : 0,
    };

    calculateItemTotal(updatedItems[index]);
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    // Parse numeric values
    let parsedValue = value;
    if (
      [
        "quantity",
        "unitPrice",
        "taxRate",
        "discountPercent",
        "discountAmount",
      ].includes(field)
    ) {
      parsedValue = parseFloat(value) || 0;
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: parsedValue,
    };

    // Validate quantity doesn't exceed original
    if (field === "quantity" && updatedItems[index].originalQuantity) {
      if (parsedValue > updatedItems[index].originalQuantity) {
        updatedItems[index].quantity = updatedItems[index].originalQuantity;
        toast.error(
          `Cannot return more than ${updatedItems[index].originalQuantity} items`
        );
      }
    }

    // Recalculate item totals for affected fields
    if (
      [
        "quantity",
        "unitPrice",
        "taxRate",
        "discountPercent",
        "discountAmount",
      ].includes(field)
    ) {
      calculateItemTotal(updatedItems[index]);
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const calculateItemTotal = (item) => {
    const subtotal = (item.quantity || 0) * (item.unitPrice || 0);

    // Calculate discount amount
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

    let totalAmount =
      subtotal + totalTax - totalDiscount + (formData.shippingCharges || 0);

    // Apply round off if enabled
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
      // check if customer is selected
      if (!formData.customerId) {
        toast.error("Please select a customer");
        return;
      }
      // Filter selected items with quantity > 0
      const selectedItems = formData.items.filter(
        (item) => item.isSelected && item.quantity > 0 && item.productId
      );

      if (selectedItems.length === 0) {
        toast.error("Please select at least one item to return");
        return;
      }

      if (!formData.customerId) {
        toast.error("Please select a customer");
        return;
      }

      if (!formData.invoiceId) {
        toast.error("Please select an invoice");
        return;
      }

      setLoading(true);

      // ✅ FIX: Calculate total tax from selected items
      const calculatedTotalTax = selectedItems.reduce(
        (sum, item) => sum + (item.taxAmount || 0),
        0
      );

      // ✅ FIX: Calculate total discount from selected items
      const calculatedTotalDiscount = selectedItems.reduce(
        (sum, item) => sum + (item.discountAmount || 0),
        0
      );

      // ✅ FIX: Change invoiceNumber to supplierInvoiceNo to match model
      const creditNoteData = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        phone: formData.phone || "",
        invoiceId: formData.invoiceId,
        invoiceNumber: formData.invoiceNumber, // ✅ Changed to match model
        date: formData.date,
        reason: "returned_goods", // Default reason
        items: selectedItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          description: item.description || "",
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
        totalTax: calculatedTotalTax, // ✅ Use calculated value
        totalDiscount: calculatedTotalDiscount, // ✅ Use calculated value
        shippingCharges: formData.shippingCharges,
        roundOff: formData.roundOff,
        totalAmount: formData.totalAmount,
        status: action === "save" ? "draft" : "issued",
        notes: formData.notes || "",
      };

      // Debug log to see what's being sent
      console.log("📤 Submitting credit note data:", creditNoteData);

      const response = await api.post("/api/credit-notes", creditNoteData);

      console.log("✅ Server response:", response.data);

      toast.success(
        `Credit note ${action === "save" ? "saved as draft" : "issued successfully"}`
      );

      if (action === "saveAndPrint") {
        navigate("/skeleton?redirect=/customers");
      } else if (action === "issued") {
        navigate("/customers");
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to save credit note";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsInvoiceOpen(false);
      }
      // for customer dropdown (close when clicking outside)
      if (!event.target.closest('.customer-search-container')) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-4" style={{ overflowY: "auto", height: "100vh" }}>
      <div className="">
        <div className="">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <Link to="/customers" style={{ marginRight: "10px" }}>
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
                Create Credit Notes
              </h4>
            </div>

            <button
              style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 500,
                fontSize: "15px",
                lineHeight: "120%",
                color: "#FFFFFF",
                backgroundColor: "#1F7FFF",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #1F7FFF",
              }}
              onClick={() => setShowPreview(true)}
              disabled={!formData.customerId || formData.items.length === 0}
            >
              View Invoice
            </button>
          </div>

          {/* Customer Section */}
          <div
            className="section-card"
            style={{ padding: "20px", overflow: "auto", maxHeight: "calc(100vh - 160px)" }}
          >
            <h6 className="section-title">Customer Details</h6>

            {/* Main Horizontal Wrapper */}
            <div className="d-flex justify-content-between mb-4">
              {/* LEFT AREA (Customer + Phone) */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                {/* Customer Name */}
                <div className="col-md-7">
                  <label className="form-label supplierlabel">
                    Customer Name <span className="text-danger">*</span>
                  </label>
                  <div className="customer-search-container" style={{ position: "relative" }}>
                    <div
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #EAEAEA",
                        padding: "6px 8px",
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                      }}
                    >
                      {/* Input field */}
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                        {isFromNavbar && (
                          <FiSearch
                            style={{
                              color: "#666",
                              cursor: "pointer",
                              fontSize: "16px"
                            }}
                            onClick={() => setShowCustomerDropdown(true)}
                          />
                        )}
                        <input
                          type="text"
                          placeholder={isFromNavbar ? "Search or select customer..." : "Enter Name"}
                          style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            fontSize: "14px",
                            cursor: isFromNavbar ? "pointer" : "text",
                          }}
                          value={isFromNavbar ? customerSearch : formData.customerName}  //vvi
                          onChange={(e) => {
                            if (isFromNavbar) {
                              setCustomerSearch(e.target.value);
                              setShowCustomerDropdown(true);
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                customerName: e.target.value
                              }))
                            }
                          }}
                          onFocus={() => isFromNavbar && setShowCustomerDropdown(true)}
                          readOnly={isFromNavbar && formData.customerId} // Read-only when customer is selected
                        />
                      </div>

                      {/* Action buttons */}
                      {isFromNavbar && (
                        <div style={{ display: "flex", gap: "4px" }}>
                          {formData.customerId ? (
                            // When customer is selected - show clear button
                            <button
                              onClick={handleClearCustomer}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#dc3545",
                                cursor: "pointer",
                                fontSize: "12px",
                                padding: "2px 6px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Change
                            </button>
                          ) : (
                            // When no customer - show add button
                            <button
                              onClick={() => setOpenAddModal(true)}
                              style={{
                                background: "#1F7FFF",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                                padding: "4px 8px",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Customer Dropdown */}
                    {isFromNavbar && showCustomerDropdown && (
                      <div style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        border: "1px solid #EAEAEA",
                        borderRadius: "8px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        zIndex: 1000,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        marginTop: "4px",
                      }}>
                        {filteredCustomers.length === 0 ? (
                          <div style={{ padding: "12px", color: "#666", textAlign: "center" }}>
                            No customers found
                            <div style={{ marginTop: "8px" }}>
                              <button
                                onClick={() => {
                                  setOpenAddModal(true);
                                  setShowCustomerDropdown(false);
                                }}
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#1F7FFF",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                }}
                              >
                                + Add New Customer
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{
                              padding: "8px 12px",
                              borderBottom: "1px solid #f0f0f0",
                              backgroundColor: "#f8f9fa",
                              fontSize: "12px",
                              color: "#666",
                            }}>
                              Select customer or <button
                                onClick={() => {
                                  setOpenAddModal(true);
                                  setShowCustomerDropdown(false);
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "#1F7FFF",
                                  cursor: "pointer",
                                  fontWeight: "500",
                                }}
                              >
                                add new
                              </button>
                            </div>
                            {filteredCustomers.map((cust) => (
                              <div
                                key={cust._id}
                                onClick={() => handleCustomerSelect(cust)}
                                style={{
                                  padding: "12px 16px",
                                  borderBottom: "1px solid #f0f0f0",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  transition: "background-color 0.2s",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "white"}
                              >
                                <div style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  backgroundColor: "#e0f0ff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: "bold",
                                  color: "#1F7FFF",
                                  fontSize: "14px",
                                }}>
                                  {cust.name?.charAt(0).toUpperCase() || "C"}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: "500" }}>{cust.name}</div>
                                  <div style={{ fontSize: "12px", color: "#666" }}>
                                    {cust.phone} {cust.email && `• ${cust.email}`}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
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

              {/* RIGHT SIDE (Customer Invoice No + Date) */}
              <div className="d-flex flex-column gap-3">
                {/* Customer Invoice No */}
                <div className="d-flex justify-content-end">
                  {/* customer invoice selector start*/}
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
                          ? customerInvoices.find(i => i._id === formData.invoiceId)?.invoiceNo
                          : "Customer Invoice No"}
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
                        {customerInvoices.map((invoice) => (
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
                            {invoice.invoiceNo}
                            {invoice.dueAmount > 0 &&
                              ` — Due ₹${invoice.dueAmount.toFixed(2)}`}
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

                  {/* customer invoice selector end */}
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

            {/* Add Products Section - ALWAYS SHOW */}
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
                              // Parse the input to get return quantity
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
                    : /* Show 2 empty rows by default (skeleton) */
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

            {/* Payment + Summary */}
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
                      Total Credit Amount :-
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
                      Fully Received
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
                        !formData.customerId ||
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
                        !formData.customerId ||
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
          {/* Add Customer Modal */}
          {openAddModal && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
              backgroundColor: "rgba(0,0,0,0.27)", backdropFilter: "blur(1px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 99999999,
            }}
              onClick={() => setOpenAddModal(false)}
            >
              <div onClick={(e) => e.stopPropagation()} className="">
                <AddCustomers
                  onClose={() => {
                    setOpenAddModal(false);
                    fetchCustomers();
                  }}
                  onSuccess={(newCustomer) => {
                    if (isFromNavbar) {
                      handleCustomerSelect(newCustomer)
                    }
                    toast.success('customer created successfully!')
                  }} //Auto selected new customer
                />
              </div>
            </div>
          )}
          <InvoicePreviewModal
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
            data={formData}
            type="credit-note"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerCreditNote;
