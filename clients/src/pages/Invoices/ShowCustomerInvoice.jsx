import React, { useEffect, useState, useRef } from "react";
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
import api from "../../pages/config/axiosInstance";
import CompanyLogo from "../../assets/images/kasperlogo.png";
import TaxInvoiceLogo from "../../assets/images/taxinvoice.png";
import Qrcode from "../../assets/images/qrcode.png";
import numberToWords from "number-to-words";

function ShowCustomerInvoice() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/api/invoices/${invoiceId}`);
        const data = res.data;
        console.log("ffdara", data);
        setInvoiceData(res.data.invoice);
      } catch (err) {
        toast.error("Failed to load invoice");
        navigate("/customers");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId, navigate]);

    const fetchCompanyData = async () => {
    try {
      const res = await api.get(`/api/companyprofile/get`);
      console.log("Companyss data:", res.data);
      setCompanyData(res.data.data);
    } catch (error) {
      console.error("Error fetching company profile:", error);
    }
  };

   useEffect(() => {
  fetchCompanyData();
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

    pdf.save(`invoice-${invoiceData?.invoiceNo || "invoice"}.pdf`);
    setIsDownloading(false);
  };

  if (loading) return <div>Loading invoice...</div>;
  if (!invoiceData) return <div>Invoice not found</div>;

  const customer = invoiceData.customerId || {};
  const products = invoiceData.items || [];
  const totalInWords =
    invoiceData.grandTotal != null
      ? `${numberToWords
          .toWords(invoiceData.grandTotal)
          .toUpperCase()} RUPEES ONLY`
      : "";

  return (
    <div className="px-4 py-4" style={{ height: "100vh" }}>
      <div className="">
        <div
          style={{
            height: "calc(100vh - 70px)",
            overflow: "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "16px",
              display: "flex",
              gap: 24,
              alignItems: "stretch", // 🔑 forces equal height
            }}
          >
            {/* back button */}
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
                // to='/createinvoice'
              >
                <IoIosArrowBack style={{ fontSize: "18px" }} />
              </Link>
            </div>

            {/* Left Side */}
            <div
              ref={invoiceRef}
              style={{
                // width: "100%",
                // height: "100%",
                width: "210mm", // ✅ EXACT A4 width
                // minHeight: "80%",
                margin: "0 auto",
                paddingTop: 10.37,
                paddingBottom: 20.37,
                paddingLeft: 20.37,
                paddingRight: 20.37,
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
                  padding: 0,
                  margin: 0,
                  color: "#474951",
                  visibility: isDownloading ? "hidden" : "visible",
                }}
              >
                Invoice
              </span>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                {/* tt */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
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
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ width: "100px" }}>
                          <img
                            src={CompanyLogo}
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
                          left: 31.77,
                          background: "var(--White-Stroke, #EAEAEA)",
                          marginTop: "8px",
                        }}
                      />
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "2px",
                        }}
                      >
                        <span>
                          INVOICE Date -{" "}
                          {invoiceData.invoiceDate
                            ? format(
                                new Date(invoiceData.invoiceDate),
                                "dd MMM yyyy"
                              )
                            : "N/A"}
                        </span>
                        <span style={{ marginRight: "12px" }}>
                          INVOICE No. - {invoiceData.invoiceNo}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: 0.76,
                          left: 31.77,
                          marginTop: "1px",
                          background: "var(--White-Stroke, #EAEAEA)",
                        }}
                      />
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
                            Name :{" "}
                            <span style={{ color: "black", fontWeight: "600" }}>
                             {companyData?.companyName || "N/A"}
                            </span>
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
                            Name :{" "}
                            <span style={{ color: "black", fontWeight: "600" }}>
                              {customer.name || "N/A"}
                            </span>
                          </div>
                          <div>
                            Address :{" "}
                            <span style={{ color: "black", fontWeight: "600" }}>
                              {customer.address || "N/A"}
                            </span>
                          </div>
                          <div style={{ marginTop: "8px" }}>
                            Phone :{" "}
                            <span style={{ color: "black", fontWeight: "600" }}>
                              {customer.phone || "N/A"}
                            </span>
                          </div>
                          <div style={{ marginTop: "0px" }}>
                            Email :{" "}
                            <span style={{ color: "black", fontWeight: "600" }}>
                              {customer.email || "N/A"}
                            </span>
                          </div>
                          <div style={{ marginTop: "0px" }}>
                            GSTIN :{" "}
                            <span style={{ color: "black", fontWeight: "600" }}>
                              {customer.gstin || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="table-responsive mt-3">
                        <table
                          className=""
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
                              <>
                                <tr key={i}>
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
                                    {item.taxRate} %
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
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                              left: 31.77,
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
                                Bank :{" "}
                                <span
                                  style={{ color: "black", fontWeight: "600" }}
                                >
                                  ICICI Bank
                                </span>
                              </div>
                              <div>
                                Branch :{" "}
                                <span
                                  style={{ color: "black", fontWeight: "600" }}
                                >
                                  Noida, Sector 62
                                </span>
                              </div>
                              <div>
                                Account No.:{" "}
                                <span
                                  style={{ color: "black", fontWeight: "600" }}
                                >
                                  278415630109014
                                </span>
                              </div>
                              <div>
                                IFSC :{" "}
                                <span
                                  style={{ color: "black", fontWeight: "600" }}
                                >
                                  ICINO512345
                                </span>
                              </div>
                              <div>
                                Upi :{" "}
                                <span
                                  style={{ color: "black", fontWeight: "600" }}
                                >
                                  abc@ybl
                                </span>
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
                              ₹{invoiceData.subtotal?.toFixed(2)}
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
                              ₹{invoiceData.totalTax?.toFixed(2)}
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
                              ₹{invoiceData.totalDiscount?.toFixed(2)}
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
                              ₹{invoiceData.shoppingPointsUsed || 0}
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
                              ₹{invoiceData.additionalCharges?.toFixed(2)}
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
                              ₹{invoiceData.grandTotal?.toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "1px 8px",
                            }}
                          >
                            <span>Due Amount</span>
                            <span style={{ color: "black" }}>
                              ₹{invoiceData.dueAmount?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

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
                          <u>Term & Conditions</u>
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
                              Signature
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          justifyContent: "center",
                          display: "flex",
                        }}
                      >
                        <span style={{ marginTop: "5px" }}>
                          Earned 🪙 Shopping Point on this purchase. Redeem on
                          your next purchase.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* ttend */}
              </div>
            </div>
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

export default ShowCustomerInvoice;
