import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Supplier.css";
import { GoChevronUp, GoChevronDown } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import api from "../../../pages/config/axiosInstance";
import { toast } from "react-toastify";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import DOMPurify from "dompurify";

const AddSupplier = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();

  const [showAddress, setShowAddress] = useState(false);
  const [showBank, setShowBank] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errors, setErrors] = useState({});

  // Country/State/City
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [form, setForm] = useState({
    supplierName: "",
    businessType: "",
    phone: "",
    email: "",
    gstin: "",
    categoryBrand: "",
    address: {
      addressLine: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
    },
    bank: {
      bankName: "",
      accountNumber: "",
      ifsc: "",
      branch: "",
    },
    status: true,
  });

  /* ================= SANITIZE ================= */
  const sanitize = (value) =>
    DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();

  /* ================= VALIDATION ================= */
  const validateField = (name, value) => {
    if (!value.trim()) {
      if (["supplierName", "phone", "businessType"].includes(name))
        return "This field is required";
      return "";
    }

    switch (name) {
      case "phone":
        return /^\d{10}$/.test(value) ? "" : "Enter valid 10-digit phone number";
      case "email":
        return /^\S+@\S+\.\S+$/.test(value) ? "" : "Invalid email address";
      case "gstin":
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value)
          ? ""
          : "Invalid GSTIN";
      case "pincode":
        return /^\d{6}$/.test(value) ? "" : "Invalid pincode";
      default:
        return "";
    }
  };

  /* ================= INPUT HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const clean = sanitize(value);
    const error = validateField(name, clean);

    setErrors((p) => ({ ...p, [name]: error }));
    setForm((p) => ({ ...p, [name]: clean }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const clean = sanitize(value);
    const error = validateField(name, clean);

    setErrors((p) => ({ ...p, [name]: error }));
    setForm((p) => ({
      ...p,
      address: { ...p.address, [name]: clean },
    }));
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      bank: { ...p.bank, [name]: sanitize(value) },
    }));
  };

  /* ================= COUNTRY / STATE / CITY ================= */
  const countryOptions = Country.getAllCountries().map((c) => ({
    value: c.isoCode,
    label: c.name,
  }));

  const stateOptions = selectedCountry
    ? State.getStatesOfCountry(selectedCountry.value).map((s) => ({
      value: s.isoCode,
      label: s.name,
    }))
    : [];

  const cityOptions = selectedState
    ? City.getCitiesOfState(
      selectedCountry.value,
      selectedState.value
    ).map((c) => ({ value: c.name, label: c.name }))
    : [];

  const handleCountryChange = (opt) => {
    setSelectedCountry(opt);
    setSelectedState(null);
    setSelectedCity(null);
    setForm((p) => ({
      ...p,
      address: { ...p.address, country: opt?.label || "", state: "", city: "" },
    }));
  };

  const handleStateChange = (opt) => {
    setSelectedState(opt);
    setSelectedCity(null);
    setForm((p) => ({
      ...p,
      address: { ...p.address, state: opt?.label || "", city: "" },
    }));
  };

  const handleCityChange = (opt) => {
    setSelectedCity(opt);
    setForm((p) => ({
      ...p,
      address: { ...p.address, city: opt?.value || "" },
    }));
  };

  /* ================= FINAL SUBMIT ================= */
  const validateForm = () => {
    const e = {};
    if (!form.supplierName) e.supplierName = "Supplier name required";
    if (!form.phone) e.phone = "Phone required";
    if (!form.businessType) e.businessType = "Business type required";
    if (!selectedCountry) e.country = "Country required";
    if (!selectedState) e.state = "State required";
    if (!selectedCity) e.city = "City required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix errors");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/suppliers", form);
      toast.success("Supplier created successfully");
      setSuccessMessage(true);
      setTimeout(() => {
        if(onSuccess) onSuccess();
        navigate("/supplier-list");
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg" style={{ marginTop: "10%" }}>
        <div className="modal-content">
          <div className="modal-header" style={{ borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "end", borderRadius: "50%", padding: "15px 15px" }}>
            <button
              style={{
                color: "#727681",
                fontSize: "10px",
                fontWeight: 800,
                border: "2px solid #727681",
                borderRadius: "50%",
                backgroundColor: "transparent",
                width: "30px",
                height: "30px",
                cursor: "pointer"
              }}
              type="button"
              onClick={onClose}
            >
              <RxCross2 style={{ color: "#727681", fontSize: "15px", fontWeight: 900 }} />
            </button>

          </div>
          <div style={{ display: "flex", alignItems: "center", margin: "10px 20px" }}>
            <h5 className="modal-title" style={{ color: "#0E101A", fontWeight: 500, fontSize: "22px", fontFamily: '"Inter", sans-serif', lineHeight: "120%" }}>Basic Details</h5>
            {/* Business Type Dropdown */}
            <div style={{ marginLeft: "inherit" }}>
              <select
                className="form-select shadow-none"
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
              >
                <option value="" disabled>Business Type</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Wholesaler">Wholesaler</option>
                <option value="add">+Add More</option>
              </select>
              {errors.businessType && (
                <small className="text-danger">{errors.businessType}</small>
              )}


            </div>
          </div>

          <div className="modal-body">
            <div className="row">
              {/* Supplier Name */}
              <div className="col-md-6 mb-3">
                <label className="form-label supplierlabel">
                  Supplier Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control supplierinput shadow-none"
                  placeholder="Enter Name"
                  name="supplierName"
                  value={form.supplierName}
                  onChange={handleChange}
                />

              </div>

              {/* GSTIN */}
              <div className="col-md-6 mb-3">
                <label className="form-label supplierlabel">GSTIN</label>
                <input
                  type="text"
                  className="form-control supplierinput shadow-none"
                  placeholder="Enter GSTIN"
                  name="gstin"
                  value={form.gstin}
                  onChange={handleChange}
                />

              </div>
            </div>

            <div className="row">
              {/* Phone No. */}
              <div className="col-md-6 mb-3">
                <label className="form-label supplierlabel">
                  Phone No. <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span
                    className="input-group-text"
                    style={{ backgroundColor: '#fff' }}
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
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                  />

                </div>
              </div>

              {/* Email ID */}
              <div className="col-md-6 mb-3">
                <label className="form-label supplierlabel">Email Id</label>
                <input
                  type="email"
                  className="form-control supplierinput shadow-none"
                  placeholder="Enter Email Id"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />

              </div>
            </div>

            {/* Category / Brand */}
            <div className="col-md-6 mb-3">
              <label className="form-label supplierlabel">Category / Brand</label>
              <input
                type="text"
                className="form-control supplierinput shadow-none"
                placeholder="Enter Category/Brand"
                name="categoryBrand"
                value={form.categoryBrand}
                onChange={handleChange}
              />

            </div>

            {/* Add Address Section */}
            <div className="mb-3 d-flex justify-content-between align-items-center " style={{ border: "1px solid #E5F0FF", borderRadius: "8px", padding: "8px 12px", backgroundColor: "#F3F8FB", cursor: "pointer" }} onClick={() => setShowAddress(!showAddress)}>
              <span className=" btn-link text-decoration-none p-0" style={{ color: '#0d6efd' }}>
                + Add Address
              </span>
              <span>
                {showAddress ? (
                  <GoChevronDown />
                ) : (
                  <GoChevronUp />
                )}
              </span>
            </div>

            {showAddress && (
              <>
                <div className="mb-3">
                  <label className="form-label supplierlabel">Address</label>
                  <textarea
                    className="form-control supplierinput shadow-none"
                    rows="2"
                    placeholder="Enter Full Address"
                    name="addressLine"
                    value={form.address.addressLine}
                    onChange={handleAddressChange}
                  />

                </div>

                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label supplierlabel">
                      Country <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={countryOptions}
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      placeholder="Select Country"
                      className="supplierinput"
                      styles={{
                        control: (base) => ({ ...base, boxShadow: "none", borderColor: "#ced4da" }),
                      }}
                    />
                    {errors.country && <small className="text-danger">{errors.country}</small>}
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label supplierlabel">
                      State <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={stateOptions}
                      value={selectedState}
                      onChange={handleStateChange}
                      placeholder="Select State"
                      isDisabled={!selectedCountry}
                      className="supplierinput"
                      styles={{
                        control: (base) => ({ ...base, boxShadow: "none", borderColor: "#ced4da" }),
                      }}
                    />
                    {errors.state && <small className="text-danger">{errors.state}</small>}
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label supplierlabel">
                      City <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={cityOptions}
                      value={selectedCity}
                      onChange={handleCityChange}
                      placeholder="Select City"
                      isDisabled={!selectedState}
                      className="supplierinput"
                      styles={{
                        control: (base) => ({ ...base, boxShadow: "none", borderColor: "#ced4da" }),
                      }}
                    />
                    {errors.city && <small className="text-danger">{errors.city}</small>}
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label supplierlabel">Pin code</label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.address.pincode}
                      onChange={handleAddressChange}
                      className="form-control supplierinput shadow-none"
                      placeholder="Enter Pin Code"
                      maxLength="6"
                    />
                    {errors.pincode && <small className="text-danger">{errors.pincode}</small>}
                  </div>
                </div>
              </>
            )}

            {/* Add Bank Details */}
            <div className="mb-3 d-flex justify-content-between align-items-center" style={{ border: "1px solid #E5F0FF", borderRadius: "8px", padding: "8px 12px", backgroundColor: "#F3F8FB", cursor: "pointer" }} onClick={() => setShowBank(!showBank)}>
              <span className=" btn-link text-decoration-none p-0" style={{ color: '#0d6efd' }}>
                + Add Bank Details
              </span>
              <span>
                {showBank ? (
                  <GoChevronDown />
                ) : (
                  <GoChevronUp />
                )}
              </span>
            </div>

            {showBank && (
              <>
                <div className="mb-3">
                  <label className="form-label supplierlabel">Bank Name</label>
                  <input
                    type="text"
                    className="form-control supplierinput shadow-none"
                    placeholder="Enter Bank Name"
                    name="bankName"
                    value={form.bank.bankName}
                    onChange={handleBankChange}
                  />

                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label supplierlabel">Account No.</label>
                    <input
                      type="text"
                      className="form-control supplierinput shadow-none"
                      placeholder="---"
                      name="accountNumber"
                      value={form.bank.accountNumber}
                      onChange={handleBankChange}
                    />


                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label supplierlabel">IFSC Code</label>
                    <input
                      type="text"
                      className="form-control supplierlabel shadow-none"
                      placeholder="---"
                      name="ifsc"
                      value={form.bank.ifsc}
                      onChange={handleBankChange}
                    />

                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label supplierlabel">Branch</label>
                    <select
                      className="form-select supplierselect shadow-none"
                      name="branch"
                      value={form.bank.branch}
                      onChange={handleBankChange}
                    >
                      <option value="">Select Branch</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                    </select>

                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer d-flex align-items-start justify-content-start" style={{ borderTop: "none" }}>
            <button onClick={handleSave} type="button" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
        {/* success message */}
        <div
          style={{
            position: "absolute",
            top: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            padding: "0 70px",
            boxSizing: "border-box",
            pointerEvents: "none",
          }}
        >
          {successMessage && (
            <div
              className="create-successfully-msg d-flex justify-content-between align-items-center mb-4"
              style={{
                border: "1px solid #0D6828",
                color: "#0D6828",
                background: "#EBFFF1",
                borderRadius: "8px",
                padding: "10px",
                margin: "15px 0",
              }}
            >
              <label style={{ fontFamily: "Inter", fontSize: "14px" }}>
                Supplier Successfully Created
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSupplier;