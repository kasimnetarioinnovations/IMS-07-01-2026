import React, { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import { FiSend, FiEdit } from "react-icons/fi";
import { IoPrintOutline } from "react-icons/io5";
import Supplierrr from "../../assets/images/suppimg.png";
import { TbInvoice } from "react-icons/tb";
import { GoDownload } from "react-icons/go";
import DatePicker from "../../components/DatePicker";
import RecentViewInvoiceModal from "../../pages/Modal/RecentViewInvoiceModal";
import { Link } from "react-router-dom";
import total_orders_icon from "../../assets/images/totalorders-icon.png";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../pages/config/axiosInstance"


const iconMap = {
  "Send Invoice": <FiSend size={16} style={{ color: "#6C748C" }} />,
  "Edit Invoice": <FiEdit size={16} style={{ color: "#6C748C" }} />,
  Print: <IoPrintOutline size={16} style={{ color: "#6C748C" }} />,
};

const RecentViewInvoice = ({ type = "purchase" }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [invoiceData, setInvoiceData] = useState(null);
  const [supplierData, setSupplierData] = useState(null);
  const [loading, setLoading] = useState(true);
    const [customerData, setCustomerData] = useState(null);

  // Fetch invoice data
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);

        if (id && id !== "undefined") {
          console.log(`📡 Fetching ${type} invoice from API with ID:`, id);

          let apiUrl;
          if (type === "purchase") {
            apiUrl = `/api/purchase-orders/${id}`;
          } else if (type === "sales") {
            apiUrl = `/api/invoices/${id}`; // Customer invoices endpoint
          }

          const response = await api.get(apiUrl);
          console.log("✅ API Response:", response.data);

          if (response.data.success && response.data.invoice) {
            const fullInvoice = response.data.invoice;
            console.log("🛒 Invoice items:", fullInvoice.items?.length || 0);

            setInvoiceData(fullInvoice);

            // Handle supplier/customer data based on type
            if (type === "purchase") {
              // For purchase orders, we have supplier
              if (fullInvoice.supplierId) {
                if (typeof fullInvoice.supplierId === 'object') {
                  setSupplierData(fullInvoice.supplierId);
                } else {
                  await fetchSupplier(fullInvoice.supplierId);
                }
              }
            } else if (type === "sales") {
              // For sales invoices, we have customer
              if (fullInvoice.customerId) {
                if (typeof fullInvoice.customerId === 'object') {
                  setCustomerData(fullInvoice.customerId);
                } else {
                  await fetchCustomer(fullInvoice.customerId);
                }
              }
            }
          } else {
            throw new Error("Invalid API response");
          }
        } else {
          console.error("❌ Invalid invoice ID");
          toast.error("Invalid invoice URL");
          navigate(type === "purchase" ? "/supplier-list" : "/customer-list");
        }
      } catch (error) {
        console.error("❌ Error fetching invoice:", error);
        toast.error("Failed to load invoice details");
        navigate(type === "purchase" ? "/supplier-list" : "/customer-list");
      } finally {
        setLoading(false);
      }
    };

    const fetchSupplier = async (supplierId) => {
      try {
        const response = await api.get(`/api/suppliers/${supplierId}`);
        setSupplierData(response.data);
      } catch (error) {
        console.error("Failed to fetch supplier:", error);
      }
    };

    const fetchCustomer = async (customerId) => {
      try {
        const response = await api.get(`/api/customers/${customerId}`);
        setCustomerData(response.data);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
      }
    };

    fetchInvoiceData();
  }, [id, type, navigate]);

  // Get status color based on type
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'received':
        return { bg: "#D4F7C7", text: "#01774B" };
      case 'pending':
      case 'draft':
      case 'sent':
        return { bg: "#FFFAC7", text: "#7E7000" };
      case 'overdue':
        return { bg: "#FFE7E7", text: "#DC2626" };
      case 'partial':
        return { bg: "#E0F2FE", text: "#0369A1" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  // Get status text based on type
  const getStatusText = (status) => {
    if (type === "purchase") {
      return status === 'received' ? 'Received' :
        status === 'draft' ? 'Draft' :
          status === 'partial' ? 'Partial' :
            status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    } else {
      return status === 'paid' ? 'Paid' :
        status === 'draft' ? 'Draft' :
          status === 'sent' ? 'Sent' :
            status === 'partial' ? 'Partial' :
              status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  // Get breadcrumb navigation based on type
  const getBreadcrumb = () => {
    if (type === "purchase") {
      return {
        backLink: "/supplier-list",
        backText: "Total Orders",
        currentText: invoiceData?.invoiceNo || `PO-${invoiceData?._id?.slice(-6)}`
      };
    } else {
      return {
        backLink: "/customers",
        backText: "Sales Orders",
        currentText: invoiceData?.invoiceNo || `INV-${invoiceData?._id?.slice(-6)}`
      };
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        fontFamily: "Inter, sans-serif"
      }}>
        Loading invoice details...
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div style={{
        padding: "40px",
        textAlign: "center",
        fontFamily: "Inter, sans-serif"
      }}>
        Invoice not found.
      </div>
    );
  }

  const statusColors = getStatusColor(invoiceData.status);
  const statusText = getStatusText(invoiceData.status);
  const breadcrumb = getBreadcrumb();


  return (
    <div className="page-wrapper">
      <div className="content">
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            background: "#F9F9F9",
            minHeight: "100vh",
          }}
        >
          {/* Main Container */}
          <div
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            {/* Breadcrumb */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#727681",
                fontSize: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Link to={breadcrumb.backLink}>
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
                <span
                  style={{
                    color: "#727681",
                    fontWeight: 400,
                    fontSize: "14px",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Dashboard
                </span>
                <span
                  style={{
                    color: "#727681",
                    fontWeight: 400,
                    fontSize: "14px",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  /
                </span>
                <span
                  style={{
                    color: "#727681",
                    fontWeight: 400,
                    fontSize: "14px",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  {breadcrumb.backText}
                </span>
                <span
                  style={{
                    color: "#727681",
                    fontWeight: 400,
                    fontSize: "14px",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  /
                </span>
                <span
                  style={{
                    color: "#0E101A",
                    fontWeight: 400,
                    fontSize: "14px",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  {breadcrumb.currentText}
                </span>
              </div>
            </div>

            {/* Header Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "500",
                    color: "#0E101A",
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  {invoiceData.invoiceNo || (type === "purchase" ? `Purchase Order ${invoiceData._id?.slice(-6)}` : `Sales Invoice ${invoiceData._id?.slice(-6)}`)}

                </h1>

                {/* Date Picker (mock) */}
                <div className="d-flex align-items-center gap-4">
                  <DatePicker />
                </div>
              </div>

              {/* Status + Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <span
                    style={{
                      padding: "0px 12px",
                      background: "#D4F7C7",
                      color: "#01774B",
                      borderRadius: "50px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: invoiceData.status === 'received' || invoiceData.status === 'paid' ? "500" : "400",
                    }}
                  >
                    {(invoiceData.status === 'received' || invoiceData.status === 'paid') ? (
                      <>
                        <FaCheck style={{ fontSize: "10px", fontWeight: 300 }} />
                        {statusText}
                      </>
                    ) : (
                      <>
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            background: statusColors.text,
                            borderRadius: "50%",
                          }}
                        />
                        {statusText}
                      </>
                    )}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  {["Send Invoice", "Edit Invoice", "Print"].map((text) => (
                    <button
                      key={text}
                      style={{
                        padding: "4px 12px",
                        background: "white",
                        border: "1px solid #FCFCFC",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#0E101A",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      {text}
                      {iconMap[text]}
                    </button>
                  ))}
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  height: "1px",
                  background: "#D9D9D9",
                  margin: 0,
                }}
              />
            </div>

            {/* Main Content: Invoice Card + Notes */}
            <div style={{ display: "flex", gap: "20px" }}>
              {/* LEFT — Original Invoice */}
              <div
                style={{
                  width: "600px",
                  maxHeight: "600px",
                  // overflowY: "scroll",
                  // scrollbarWidth: "none",
                  border: "1px solid #EAEAEA",
                  position: "relative",
                  cursor: zoom ? "zoom-in" : "default",
                }}
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => {
                  setZoom(false);
                  setMousePos({ x: 0, y: 0 });
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePos({
                    x: (e.clientX - rect.left) / rect.width,
                    y: (e.clientY - rect.top) / rect.height,
                  });
                }}
              >
                <RecentViewInvoiceModal
                  invoiceData={invoiceData}
                  supplierData={supplierData}
                  customerData={customerData}
                  type={type}
                />
              </div>

              {/* RIGHT — Zoomed Preview */}
              {/* RIGHT — Zoomed Preview */}
              <div
                style={{
                  width: "485px",
                  height: "600px",
                  border: "1px solid #EAEAEA",
                  background: "#fff",
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Clip Zoom Area */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    // overflow: "hidden",          // <-- keeps zoom inside
                    position: "relative",
                  }}
                >
                  {/* Zoomable Content */}
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      transform: zoom
                        ? `scale(2.1) translate(${-(mousePos.x * 50)}%, ${-(mousePos.y * 50)}%)`
                        : "scale(2) translate(0, 0)",
                      transformOrigin: "top left",
                      transition: zoom ? "transform 0.05s" : "transform 0.3s ease-out",
                      pointerEvents: "none",
                    }}
                  >
                    <RecentViewInvoiceModal
                      invoiceData={invoiceData}
                      supplierData={supplierData}
                      customerData={customerData}
                      type={type}
                    />
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

export default RecentViewInvoice;