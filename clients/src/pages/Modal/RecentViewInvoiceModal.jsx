
import React from 'react'
import { RiFileDownloadLine } from "react-icons/ri";
import { PiNewspaperClipping } from "react-icons/pi";
import { ImPrinter } from "react-icons/im";
import { RiMessage2Fill } from "react-icons/ri";
import { RiWhatsappFill } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";
import { Link } from 'react-router-dom';

import CompanyLogo from '../../assets/images/kasperlogo.png'
import TaxInvoiceLogo from '../../assets/images/taxinvoice.png'
import Qrcode from '../../assets/images/qrcode.png';
import { toWords } from 'number-to-words';

function RecentViewInvoiceModal({ invoiceData, supplierData, customerData, type = "purchase" }) {
    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return '---';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return '---';
        }
    };

    // Helper function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount || 0);
    };

    // Calculate values from invoiceData
    const subtotal = invoiceData?.subtotal || 0;
    const totalTax = invoiceData?.totalTax || 0;
    const totalDiscount = invoiceData?.totalDiscount || 0;
    const additionalCharges = invoiceData?.additionalCharges || 0;
    const shoppingPointsUsed = invoiceData?.shoppingPointsUsed || 0;
    const pointValue = invoiceData?.pointValue || 10;
    const pointsDiscount = shoppingPointsUsed * pointValue;
    const grandTotal = invoiceData?.grandTotal || 0;
    const dueAmount = invoiceData?.dueAmount || 0;
    const paidAmount = invoiceData?.paidAmount || 0;

    // Get company info based on type
    const getCompanyInfo = () => {
        if (type === "purchase") {
            return {
                fromTitle: "From",
                toTitle: "Company Details",
                fromName: supplierData?.supplier?.supplierName || supplierData?.supplierName || 'N/A',
                fromAddress: supplierData?.supplier?.address?.addressLine || supplierData?.address?.addressLine || 'N/A',
                fromPhone: supplierData?.supplier?.phone || supplierData?.phone || 'N/A',
                fromEmail: supplierData?.supplier?.email || supplierData?.email || 'N/A',
                fromGSTIN: supplierData?.supplier?.gstin || supplierData?.gstin || 'N/A',
                toName: "Kasper Infotech Pvt. Ltd.",
                toAddress: "Your Company Address Here",
                toPhone: "Your Company Phone",
                toEmail: "Your Company Email",
                toGSTIN: "Your Company GSTIN",
                documentTitle: "PURCHASE INVOICE"
            };
        } else {
            return {
                fromTitle: "From",
                toTitle: "Company Details",
                fromName: "Kasper Infotech Pvt. Ltd.",
                fromAddress: "Your Company Address Here",
                fromPhone: "Your Company Phone",
                fromEmail: "Your Company Email",
                fromGSTIN: "Your Company GSTIN",
                toName: customerData?.customer?.name || customerData?.name || 'N/A',
                toAddress: customerData?.customer?.address || customerData?.address || 'N/A',
                toPhone: customerData?.customer?.phone || customerData?.phone || 'N/A',
                toEmail: customerData?.customer?.email || customerData?.email || 'N/A',
                toGSTIN: customerData?.customer?.gstin || customerData?.gstin || 'N/A',
                documentTitle: "TAX INVOICE"
            };
        }
    };

    const companyInfo = getCompanyInfo();

    // Get invoice items
    const invoiceItems = Array.isArray(invoiceData?.items) ? invoiceData.items : [];
    return (
        <div
            style={{
                height: "100vh",
                overflow: 'auto',
            }}>
            <div style={{
                width: "100%",
                borderRadius: "16px",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: "100px",
                display: "flex",
                height: '87vh'
            }}>

                {/* Left Side */}
                <div
                    style={{
                        width: '100%',
                        height: 'auto',
                        position: 'relative'
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            left: 0,
                            top: 0,
                            background: 'var(--White-White-1, white)',
                            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.10)',
                            padding: '10px 15px',
                            fontSize: '8px',
                            fontFamily: 'IBM Plex Mono',
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <div style={{ width: '100px' }}>
                                <img src={CompanyLogo} alt='company logo' style={{ width: '100%', objectFit: 'contain', }} />
                            </div>
                            <div style={{ width: '130px' }}>
                                <img src={TaxInvoiceLogo} alt='tax invoice' style={{ width: '100%', objectFit: 'contain', }} />
                            </div>
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: 0.76,
                                left: 31.77,
                                background: 'var(--White-Stroke, #EAEAEA)',
                                marginTop: '8px'
                            }}
                        />
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span>{companyInfo.documentTitle} Date - {formatDate(invoiceData?.invoiceDate || invoiceData?.date)}</span>
                            <span style={{ marginRight: '12px' }}>Invoice No. - {invoiceData?.invoiceNo || 'N/A'}</span>
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: 0.76,
                                left: 31.77,
                                marginTop: '1px',
                                background: 'var(--White-Stroke, #EAEAEA)',
                            }}
                        />
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '2px', alignItems: 'center', borderBottom: '1px solid #EAEAEA' }}>
                            <div style={{ borderRight: '1px solid #EAEAEA', width: '50%', textAlign: 'center' }}>
                                <span>{companyInfo.fromTitle}</span>
                            </div>
                            <div style={{ width: '50%', textAlign: 'center' }}>
                                <span>{companyInfo.toTitle}</span>
                            </div>
                        </div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '2px', alignItems: 'center', borderBottom: '1px solid #EAEAEA' }}>
                            <div style={{ borderRight: '1px solid #EAEAEA', width: '50%', padding: '3px' }}>
                                <div>Name : <span style={{ color: 'black', fontWeight: '600' }}>{companyInfo.toName}</span></div>
                                <div>Address : {companyInfo.toAddress}</div>
                                <div style={{ marginTop: '8px' }}>Phone : {companyInfo.toPhone}</div>
                                <div>Email : {companyInfo.toEmail}</div>
                                <div>GSTIN : {companyInfo.toGSTIN}</div>
                            </div>
                            <div style={{ width: '50%', padding: '3px' }}>
                                <div>Name : <span style={{ color: 'black', fontWeight: '600' }}>{companyInfo.fromName}</span></div>
                                <div>Address : {companyInfo.fromAddress} </div>
                                <div style={{ marginTop: '8px' }}>Phone :  {companyInfo.fromPhone}</div>
                                <div>Email : {companyInfo.fromEmail}</div>
                                <div>GSTIN :  {companyInfo.fromGSTIN}</div>
                            </div>
                        </div>
                        <div className='table-responsive mt-3' >
                            <table className='' style={{ width: '100%', border: '1px solid #EAEAEA', borderCollapse: 'collapse' }}>
                                <thead style={{ textAlign: 'center', }}>
                                    <tr>
                                        <th style={{ borderRight: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }} rowSpan='2'>Sr No.</th>
                                        <th style={{ borderRight: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }} rowSpan='2'>Name of the Products</th>
                                        <th style={{ borderRight: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }} rowSpan='2'>HSN</th>
                                        <th style={{ borderRight: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }} rowSpan='2'>QTY</th>
                                        <th style={{ borderRight: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }} rowSpan='2'>Rate</th>
                                        <th style={{ borderRight: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }} colSpan="2">Tax</th>
                                        <th style={{ borderRight: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }} rowSpan='2'>Total</th>
                                    </tr>
                                    <tr>
                                        <th style={{ borderRight: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }}>%</th>
                                        <th style={{ borderRight: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA' }}>%</th>
                                    </tr>
                                </thead>
                                <tbody style={{ textAlign: "center" }}>
                                    {invoiceItems.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ borderRight: '1px solid #EAEAEA', height: '30px' }}>{index + 1}</td>
                                            <td style={{ borderRight: '1px solid #EAEAEA', }}>{item.itemName || item.name || 'N/A'}</td>
                                            <td style={{ borderRight: '1px solid #EAEAEA', }}>{item.hsnCode || item.hsn || '-'}</td>
                                            <td style={{ borderRight: '1px solid #EAEAEA', }}>{item.qty || 0}</td>
                                            <td style={{ borderRight: '1px solid #EAEAEA', }}>{formatCurrency(item.unitPrice || 0)}</td>
                                            <td style={{ borderRight: '1px solid #EAEAEA', }}>{item.taxRate || 0}%</td>
                                            <td style={{ borderRight: '1px solid #EAEAEA', }}>{formatCurrency(item.taxAmount || 0)}</td>
                                            <td style={{ borderRight: '1px solid #EAEAEA', }}>{formatCurrency(item.amount || 0)}</td>
                                        </tr>
                                    ))}
                                    {/* Fill remaining rows for consistent layout */}
                                    {Array.from({ length: Math.max(0, 8 - invoiceItems.length) }).map((_, idx) => (
                                        <tr key={`empty-${idx}`}>
                                            <td style={{ borderRight: '1px solid #EAEAEA', height: '30px' }}></td>
                                            <td style={{ borderRight: '1px solid #EAEAEA' }}></td>
                                            <td style={{ borderRight: '1px solid #EAEAEA' }}></td>
                                            <td style={{ borderRight: '1px solid #EAEAEA' }}></td>
                                            <td style={{ borderRight: '1px solid #EAEAEA' }}></td>
                                            <td style={{ borderRight: '1px solid #EAEAEA' }}></td>
                                            <td style={{ borderRight: '1px solid #EAEAEA' }}></td>
                                            <td style={{ borderRight: '1px solid #EAEAEA' }}></td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', marginTop: '15px', borderTop: '1px solid #EAEAEA', borderBottom: '1px solid #EAEAEA', }}>
                            <div style={{ borderRight: '', width: '50%', padding: '3px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <u>Total in words</u>
                                <div style={{ marginTop: '5px', fontWeight: '600' }}> {toWords(Math.round(grandTotal)).toUpperCase()} RUPEES ONLY
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        height: 0.76,
                                        left: 31.77,
                                        background: 'var(--White-Stroke, #EAEAEA)',
                                        marginTop: '10px'
                                    }}
                                />
                                <div style={{ marginTop: '2px', textDecoration: 'underline' }}>Bank Details</div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0px 5px' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div>Bank : <span style={{ color: 'black', fontWeight: '600' }}>ICICI Bank</span></div>
                                        <div>Branch : <span style={{ color: 'black', fontWeight: '600' }}>Noida, Sector 62</span></div>
                                        <div>Account No.: <span style={{ color: 'black', fontWeight: '600' }}>278415630109014</span></div>
                                        <div>IFSC : <span style={{ color: 'black', fontWeight: '600' }}>ICINO512345</span></div>
                                        <div>Upi : <span style={{ color: 'black', fontWeight: '600' }}>abc@ybl</span></div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        <div style={{ width: '45px', objectFit: 'contain' }}>
                                            <img src={Qrcode} alt='QR Code' style={{ width: '100%' }} />
                                        </div>
                                        <div>Pay Using Upi</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ width: '50%', padding: '3px', borderLeft: '1px solid #EAEAEA' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EAEAEA', padding: '1px 8px' }}>
                                    <span>Sub-total</span>
                                    <span style={{ color: 'black', }}>₹{formatCurrency(subtotal)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EAEAEA', padding: '1px 8px' }}>
                                    <span>Tax Amount</span>
                                    <span style={{ color: 'black', }}>₹{formatCurrency(totalTax)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EAEAEA', padding: '2px 8px' }}>
                                    <span>Discount</span>
                                    <span style={{ color: 'black', }}>₹{formatCurrency(totalDiscount)}</span>
                                </div>
                                {type === "sales" && shoppingPointsUsed > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EAEAEA', padding: '2px 8px' }}>
                                        <span>🪙 Shopping Points ({shoppingPointsUsed} points)</span>
                                        <span style={{ color: 'black', }}>{formatCurrency(pointsDiscount)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EAEAEA', padding: '2px 8px' }}>
                                    <span>Additional Charge</span>
                                    <span style={{ color: 'black', }}>₹{formatCurrency(additionalCharges)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #EAEAEA', padding: '1px 8px', }}>
                                    <span style={{ fontWeight: '700', fontSize: '10px' }}>Total</span>
                                    <span style={{ color: 'black', fontWeight: '600', fontSize: '10px' }}>₹{formatCurrency(grandTotal)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 8px' }}>
                                    <span>Due Amount</span>
                                    <span style={{ color: dueAmount > 0 ? 'red' : 'black', fontWeight: dueAmount > 0 ? '600' : '400' }}>₹{formatCurrency(dueAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', borderBottom: '1px solid #EAEAEA', }}>
                            <div style={{ borderRight: '', width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <u>Term & Conditions</u>
                            </div>

                            <div style={{ width: '50%', borderLeft: '1px solid #EAEAEA' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid #EAEAEA', padding: '1px 8px', marginTop: '60px' }}>
                                    <span style={{ fontWeight: '500', fontSize: '10px', }}>Signature</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                            <span style={{ marginTop: '5px' }}>Earned 🪙 {Math.floor(paidAmount / 10)} Shopping Point on this purchase. Redeem on your next purchase.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecentViewInvoiceModal