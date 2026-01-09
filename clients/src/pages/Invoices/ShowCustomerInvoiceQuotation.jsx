import React, { useEffect, useState, useRef  } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import {
  RiFileDownloadLine,
  RiMessage2Fill,
  RiWhatsappFill,
} from "react-icons/ri";
import { PiNewspaperClipping } from "react-icons/pi";
import { ImPrinter } from "react-icons/im";
import { format } from "date-fns";
import { toast } from "react-toastify";
import api from "../config/axiosInstance";
import CompanyLogo from "../../assets/images/kasperlogo.png";
import TaxInvoiceLogo from "../../assets/images/taxinvoice.png";
import Qrcode from "../../assets/images/qrcode.png";
import { toWords } from "number-to-words";

function ShowCustomerInvoiceQuotation() {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const [quotationData, setQuotationData] = useState(null);
  const [loading, setLoading] = useState(true);
    const [companyData, setCompanyData] = useState(null);
    const [terms, setTerms] = useState(null);
    const [template, setTemplate] = useState(null);
      const invoiceRef = useRef(null);
      const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await api.get(`/api/quotations/${quotationId}`);
        setQuotationData(res.data.quotation);
      } catch (err) {
        toast.error("Failed to load quotation");
        navigate("/quotations");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [quotationId, navigate]);
   const fetchCompanyData = async () => {
    try {
      const res = await api.get(`/api/companyprofile/get`);
      console.log("Companyss data:", res.data);
      setCompanyData(res.data.data);
    } catch (error) {
      console.error("Error fetching company profile:", error);
    }
  };

   const fetchSettings = async () => {
    try {
      const res = await api.get('/api/notes-terms-settings');
     setTerms(res.data.data)
    console.log('reddd', res.data)  
    } catch (error) {
      console.error('Error fetching notes & terms settings:', error);
    }
  };

  const fetchSignature = async () => {
    try {
      const res = await api.get('/api/print-templates/all');
     setTemplate(res.data.data)
     console.log('ddrrr', res.data)
    } catch (error) {
      console.error('Error fetching tempate settings:', error);
    }
  }


   useEffect(() => {
  fetchCompanyData();
  fetchSettings();
  fetchSignature();
}, []);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);

    const { jsPDF } = await import("jspdf");
    const html2canvas = await import("html2canvas");

    const element = invoiceRef.current;

    const canvas = await html2canvas.default(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      windowWidth: element.scrollWidth,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      210, // FULL WIDTH
      297 // FULL HEIGHT
    );

    pdf.save(`invoice-${quotationData?.invoiceNo || "invoice"}.pdf`);
    setIsDownloading(false);
  };

  if (loading) return <div>Loading quotation...</div>;
  if (!quotationData) return <div>Quotation not found</div>;

  const customer = quotationData.customerId || {};
  const products = quotationData.items || [];
  const totalInWords =
    quotationData.grandTotal != null
      ? `${toWords(quotationData.grandTotal).toUpperCase()} RUPEES ONLY`
      : "";

  return (
    <div className="px-4 py-4" style={{ height: "100vh" }}>
      <div className="">
        <div style={{ height: "calc(100vh - 70px)", overflow: "auto" }}>
          <div
            style={{
              width: "100%",
              padding: "16px",
              display: "flex",
              gap: 24,
              alignItems: "stretch",
              minHeight: "100%",
            }}
          >
            {/* Back button */}
            <div
              style={{
                position: "absolute",
                top: "120px",
                left: "5px",
                zIndex: "999",
              }}
            >
              <Link
                style={{
                  padding: "8px 10px 10px 10px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  textDecoration: "none",
                  color: "gray",
                }}
                to="/quotations"
              >
                <IoIosArrowBack style={{ fontSize: "18px" }} />
              </Link>
            </div>

            {/* Left Side - Quotation Preview */}
            <div
            ref={invoiceRef}
              style={{
                // width: "100%",
                // height: "100%",
                   width: "210mm",
                   margin: "0 auto",
                paddingTop: 10.37,
                paddingBottom: 20.37,
                paddingLeft: 30.37,
                paddingRight: 30.37,
                position: "relative",
                background: "#ffff",
                // boxShadow:"-0.7576505541801453px -0.7576505541801453px 0.6818854808807373px rgba(0, 0, 0, 0.10) inset",
                borderRadius: 12.12,
                // outline: "0.76px var(--White-Stroke, #EAEAEA) solid",
                outlineOffset: "-0.76px",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: 10,
                display: "inline-flex",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#474951",
                   visibility: isDownloading ? "hidden" : "visible",
                }}
              >
                Quotation
              </span>
              <div
                style={{ width: "100%", height: "100%", position: "relative" }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    // paddingTop: 20,
                    position: "relative",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 18.18,
                    display: "inline-flex",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      fontFamily: "IBM Plex Mono",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        left: 0,
                        top: 0,
                        background: "var(--White-White-1, white)",
                        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.10)",
                        padding: "10px 30px",
                      }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ width: "100px" }}>
                          <img
                            src={companyData?.companyLogo || CompanyLogo}
                            alt="company logo"
                            style={{ width: "100%", objectFit: "contain" }}
                          />
                        </div>
                        <div style={{ width: "130px" }}>
                          <img
                            src={TaxInvoiceLogo}
                            alt="tax invoice"
                            style={{ width: "100%", objectFit: "contain" }}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: 0.76,
                          background: "var(--White-Stroke, #EAEAEA)",
                          marginTop: "8px",
                        }}
                      />

                      {/* Quotation Date and Number */}
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "2px",
                        }}
                      >
                        <span>
                          QUOTATION Date -{" "}
                          {quotationData.quotationDate
                            ? format(
                                new Date(quotationData.quotationDate),
                                "dd MMM yyyy"
                              )
                            : "N/A"}
                        </span>
                        <span style={{ marginRight: "12px" }}>
                          QUOTATION No. - {quotationData.quotationNo}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: 0.76,
                          marginTop: "1px",
                          background: "var(--White-Stroke, #EAEAEA)",
                        }}
                      />

                      {/* Validity Period
                                            {quotationData.expiryDate && (
                                                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", marginTop: "2px" }}>
                                                    <span>
                                                        Valid Until: {format(new Date(quotationData.expiryDate), "dd MMM yyyy")}
                                                    </span>
                                                </div>
                                            )} */}

                      {/* Company and Customer Details */}
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-around",
                          marginTop: "2px",
                          alignItems: "center",
                          borderBottom: "1px solid #EAEAEA",
                        }}
                      >
                        <div
                          style={{
                            borderRight: "1px solid #EAEAEA",
                            width: "50%",
                            textAlign: "center",
                          }}
                        >
                          <span>From</span>
                        </div>
                        <div style={{ width: "50%", textAlign: "center" }}>
                          <span>Customer Details</span>
                        </div>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-around",
                          marginTop: "2px",
                          alignItems: "center",
                          borderBottom: "1px solid #EAEAEA",
                        }}
                      >
                        <div
                          style={{
                            borderRight: "1px solid #EAEAEA",
                            width: "50%",
                            padding: "3px",
                          }}
                        >
                          <div>
                            <b>Name:</b>{companyData?.companyName || "N/A"}
                          </div>
                          <div>
                            <b>Address:</b> {companyData?.companyaddress || "N/A"}
                          </div>
                          <div>
                            <b>Phone:</b> {companyData?.companyphone || "N/A"}
                          </div>
                          <div>
                            <b>Email:</b> {companyData?.companyemail || "N/A"}
                          </div>
                          <div>
                            <b>GSTIN:</b> {companyData?.gstin || "N/A"}
                          </div>
                        </div>
                        <div style={{ width: "50%", padding: "3px" }}>
                          <div>
                            <b>Name:</b> {customer.name || "N/A"}
                          </div>
                          <div>
                            <b>Address:</b> {customer.address || "N/A"}
                          </div>
                          <div>
                            <b>Phone:</b> {customer.phone || "N/A"}
                          </div>
                          <div>
                            <b>Email:</b> {customer.email || "N/A"}
                          </div>
                          <div>
                            <b>GSTIN:</b> {customer.gstin || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Products Table */}
                      <div className="table-responsive mt-3">
                        <table
                          style={{
                            width: "100%",
                            border: "1px solid #EAEAEA",
                            borderCollapse: "collapse",
                          }}
                        >
                          <thead style={{ textAlign: "center" }}>
                            <tr>
                              <th
                                style={{
                                  borderRight: "1px solid #EAEAEA",
                                  borderBottom: "1px solid #EAEAEA",
                                  fontWeight: "400",
                                }}
                                rowSpan="2"
                              >
                                Sr No.
                              </th>
                              <th
                                style={{
                                  borderRight: "1px solid #EAEAEA",
                                  borderBottom: "1px solid #EAEAEA",
                                  fontWeight: "400",
                                }}
                                rowSpan="2"
                              >
                                Name of the Products
                              </th>
                              <th
                                style={{
                                  borderRight: "1px solid #EAEAEA",
                                  borderBottom: "1px solid #EAEAEA",
                                  fontWeight: "400",
                                }}
                                rowSpan="2"
                              >
                                HSN
                              </th>
                              <th
                                style={{
                                  borderRight: "1px solid #EAEAEA",
                                  borderBottom: "1px solid #EAEAEA",
                                  fontWeight: "400",
                                }}
                                rowSpan="2"
                              >
                                QTY
                              </th>
                              <th
                                style={{
                                  borderRight: "1px solid #EAEAEA",
                                  borderBottom: "1px solid #EAEAEA",
                                  fontWeight: "400",
                                }}
                                rowSpan="2"
                              >
                                Rate
                              </th>
                              <th
                                style={{
                                  borderRight: "1px solid #EAEAEA",
                                  borderBottom: "1px solid #EAEAEA",
                                  fontWeight: "400",
                                }}
                                colSpan="2"
                              >
                                Tax
                              </th>
                              <th
                                style={{
                                  borderRight: "1px solid #EAEAEA",
                                  borderBottom: "1px solid #EAEAEA",
                                  fontWeight: "400",
                                }}
                                rowSpan="2"
                              >
                                Total
                              </th>
                            </tr>
                            <tr>
                              <th
                                style={{
                                  borderRight: "1px solid #EAEAEA",
                                  borderBottom: "1px solid #EAEAEA",
                                  width: "40px",
                                  fontWeight: "400",
                                }}
                              >
                                %
                              </th>
                              <th
                                style={{
                                  borderRight: "1px solid #EAEAEA",
                                  borderBottom: "1px solid #EAEAEA",
                                  width: "40px",
                                  fontWeight: "400",
                                }}
                              >
                                ₹
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((item, i) => (
                              <React.Fragment key={i}>
                                <tr>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      height: "40px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {i + 1}
                                  </td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      padding: "0px 20px",
                                    }}
                                  >
                                    {item.itemName}
                                  </td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  >
                                    {item.hsnCode || "-"}
                                  </td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  >
                                    {item.qty}
                                  </td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  >
                                    {item.unitPrice}
                                  </td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  >
                                    {item.taxRate}%
                                  </td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  >
                                    ₹{item.taxAmount}
                                  </td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  >
                                    ₹{item.amount}
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      height: "20px",
                                      textAlign: "center",
                                    }}
                                  ></td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      padding: "0px 20px",
                                    }}
                                  ></td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  ></td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  ></td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  ></td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  ></td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  ></td>
                                  <td
                                    style={{
                                      borderRight: "1px solid #EAEAEA",
                                      textAlign: "center",
                                    }}
                                  ></td>
                                </tr>
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary Section */}
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-around",
                          marginTop: "15px",
                          borderTop: "1px solid #EAEAEA",
                          borderBottom: "1px solid #EAEAEA",
                        }}
                      >
                        <div
                          style={{
                            borderRight: "",
                            width: "50%",
                            padding: "3px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <u>Total in words</u>
                          <div
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              fontWeight: "600",
                            }}
                          >
                            {totalInWords}
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: 0.76,
                              background: "var(--White-Stroke, #EAEAEA)",
                              marginTop: "10px",
                            }}
                          />
                          <div
                            style={{
                              marginTop: "2px",
                              textDecoration: "underline",
                            }}
                          >
                            Bank Details
                          </div>
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "0px 5px",
                            }}
                          >
                            <div style={{ textAlign: "left" }}>
                              <div>
                                <b>Bank:</b> ICICI Bank
                              </div>
                              <div>
                                <b>Branch:</b> Noida, Sector 62
                              </div>
                              <div>
                                <b>Account No.:</b> 278415630109014
                              </div>
                              <div>
                                <b>IFSC:</b> ICINO512345
                              </div>
                              <div>
                                <b>Upi:</b> abc@ybl
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{ width: "90px", objectFit: "contain" }}
                              >
                                <img
                                  src={Qrcode}
                                  alt="QR Code"
                                  style={{ width: "100%" }}
                                />
                              </div>
                              <div>Pay Using Upi</div>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            width: "50%",
                            padding: "3px",
                            borderLeft: "1px solid #EAEAEA",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderBottom: "1px solid #EAEAEA",
                              padding: "2px 8px",
                            }}
                          >
                            <span>Sub-total</span>
                            <span style={{ color: "black" }}>
                              ₹{quotationData.subtotal?.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderBottom: "1px solid #EAEAEA",
                              padding: "2px 8px",
                            }}
                          >
                            <span>Tax Amount</span>
                            <span style={{ color: "black" }}>
                              ₹{quotationData.totalTax?.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderBottom: "1px solid #EAEAEA",
                              padding: "2px 8px",
                            }}
                          >
                            <span>Discount</span>
                            <span style={{ color: "black" }}>
                              ₹{quotationData.totalDiscount?.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderBottom: "1px solid #EAEAEA",
                              padding: "2px 8px",
                            }}
                          >
                            <span>🪙 Shopping Points</span>
                            <span style={{ color: "black" }}>
                              ₹{quotationData.shoppingPointsUsed || 0}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderBottom: "1px solid #EAEAEA",
                              padding: "2px 8px",
                            }}
                          >
                            <span>Additional Charges</span>
                            <span style={{ color: "black" }}>
                              ₹{quotationData.additionalCharges?.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              borderBottom: "1px solid #EAEAEA",
                              padding: "2px 8px",
                            }}
                          >
                            <span
                              style={{ fontWeight: "700", fontSize: "20px" }}
                            >
                              Total
                            </span>
                            <span
                              style={{
                                color: "black",
                                fontWeight: "600",
                                fontSize: "20px",
                              }}
                            >
                              ₹{quotationData.grandTotal?.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "1px 8px",
                            }}
                          >
                            <span>Quotation Status</span>
                            <span
                              style={{
                                color:
                                  quotationData.status === "approved"
                                    ? "green"
                                    : quotationData.status === "rejected"
                                    ? "red"
                                    : "orange",
                                fontWeight: "500",
                              }}
                            >
                              {quotationData.status?.toUpperCase() || "PENDING"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-around",
                          borderBottom: "1px solid #EAEAEA",
                        }}
                      >
                        <div
                          style={{
                            borderRight: "",
                            width: "50%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <u>Terms & Conditions</u>
                          <div
                            style={{
                              padding: "10px",
                              fontSize: "12px",
                              textAlign: "left",
                              width: "100%",
                            }}
                          > {terms?.termsText}</div>
                        </div>
                        <div
                          style={{
                            width: "50%",
                            borderLeft: "1px solid #EAEAEA",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              borderTop: "1px solid #EAEAEA",
                              padding: "1px 8px",
                              marginTop: "60px",
                            }}
                          >
                            <span
                              style={{ fontWeight: "500", fontSize: "10px" }}
                            >
                              Authorized Signature
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          display: "flex",
                          marginTop: "10px",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          Earned 🪙 Shopping Point on this quotation. Redeem on
                          your next purchase.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Side  start*/}
            {/* Right Side end */}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "150px",
                alignItems: "center",
                justifyContent: "center",
                height: 36,
                padding: 8,
                background: "var(--Blue-Blue, #1F7FFF)",
                boxShadow: "-1px -1px 4px rgba(0, 0, 0, 0.25) inset",
                borderRadius: 8,
                outline: "1.50px var(--Blue-Blue, #1F7FFF) solid",
                outlineOffset: "-1.50px",
                gap: 4,
                cursor: "pointer",
              }}
                onClick={handleDownloadPDF}
            >
              <span
                style={{
                  color: "white",
                  fontSize: 14,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  lineHeight: 5,
                  wordWrap: "break-word",
                  textDecoration: "none",
                }}
              >
                {isDownloading ? "Downloading PDF" : "Download PDF"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowCustomerInvoiceQuotation;
