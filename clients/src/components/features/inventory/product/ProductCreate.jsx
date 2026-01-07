import React, { useEffect, useState, useRef } from "react";
import "./product.css";
import Select from "react-select";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../../../../pages/config/config";
import axios from "axios";
import { toast } from "react-toastify";
import { MdImageSearch } from "react-icons/md";
import { TbTrash } from "react-icons/tb";
import CategoryModal from "../../../../pages/Modal/categoryModals/CategoryModal";
import { TbChevronUp, TbEye, TbRefresh } from "react-icons/tb";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";

//Full Redesign-------------------------------------------------------------------------------------------------
import { NavLink } from "react-router-dom";

import { FaArrowLeft } from "react-icons/fa6";
import { FiUpload, FiCheck, FiChevronDown } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { FcAddImage } from "react-icons/fc";
import { MdLockOutline } from "react-icons/md";

import AiLogo from "../../../../assets/images/AI.png";
import api from "../../../../pages/config/axiosInstance"
import { useAuth } from "../../../auth/AuthContext";
import CreateCategoryModal from "../../category/CreateCategoryModel"


const ProductForm = () => {
  const { t } = useTranslation();

  const [isOn, setIsOn] = useState(false);
  const [showAddCategoryModel, setShowAddCategoryModel] = useState(false);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [errors, setErrors] = useState({});

  const lotColumns = [
    { label: "Lot No.", editableValue: "12" },
    { label: "Lot MRP", editableValue: "₹ 2,367.08/-" },
    { label: "Fabric Batch No.", editableValue: "MO123" },
    { label: "Production Date", editableValue: "22/09/2023", opacity: 0.69 },
    { label: "Design Code", editableValue: "DC-0123" },
    { label: "Quantity", editableValue: "112" },
    { label: "Size", editableValue: "S, M, L, XL, XXL" },
    { label: "Color", editableValue: "Red, Green, Yellow", opacity: 0.83 },
  ];

  // Lot No. state (array for each column)
  const [lotData, setLotData] = useState(
    lotColumns.map((col) => ({
      ...col,
      label: col.label,
      editableValue: col.value,
    }))
  );

  const lotFieldKeys = [
    "lotNo",
    "lotmrp",
    "fabricBatchNo",
    "productionDate",
    "designCode",
    "quantity",
    "size",
    "color",
  ];

  const [lotDetails, setLotDetails] = useState({
    lotNo: "",
    lotmrp: "",
    fabricBatchNo: "",
    productionDate: "",
    designCode: "",
    quantity: "",
    size: "",
    color: "",
  });

  const validationPatterns = {
    productName: /^[A-Za-z0-9\s\-]{2,50}$/,
    price: /^\d+(\.\d{1,2})?$/,
    quantity: /^(?:[1-9]\d*)$/,
    description: /^[\w\s.,!?\-]{0,300}$/,
    seoTitle: /^[a-zA-Z0-9\s\-]{2,60}$/,
    seoDescription: /^[a-zA-Z0-9\s\-,.]{2,160}$/,
    leadTime: /^\d{1,4}$/,
    reorderLevel: /^\d{1,6}$/,
    initialStock: /^\d{1,6}$/,
    serialNumber: /^[A-Z0-9\-]{1,50}$/,
    batchNumber: /^[A-Z0-9\-]{1,50}$/,
    discountValue: /^\d+(\.\d{1,2})?$/,
    categoryName: /^[A-Za-z\s]{2,50}$/,
    categorySlug: /^[a-z0-9\-]{2,50}$/,
    variantValue: /^[a-zA-Z0-9\s,]{1,100}$/,
  };

  const sanitizeInput = (value, preserveSpaces = false) => {
    if (typeof value !== "string") return value;
    let input = value;
    // Remove HTML tags
    input = input.replace(/<[^>]*>?/gm, "");
    // Normalize whitespace
    input = preserveSpaces
      ? input.replace(/\s+/g, " ")
      : input.trim().replace(/\s+/g, " ");
    // Remove dangerous characters (optional)
    input = input.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
    // DOMPurify fallback for extra safety
    input = DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    return input;
  };

  const steps = [
    t("descriptionAndMedia"),
    t("pricing"),
    t("images"),
    t("variants"),
  ];

  const variantTabs = [
    t("color"),
    t("size"),
    t("expiry"),
    t("material"),
    t("model"),
    t("weight"),
    t("skinType"),
    t("packagingType"),
    t("flavour"),
  ];
  // const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [stepStatus, setStepStatus] = useState(
    Array(steps.length).fill("pending")
  );
  const [activeTab, setActiveTab] = useState("Color");
  // const [images, setImages] = useState([]); // Removed unused global images
  // const variantImageInputRef = useRef(null); // Removed unused ref
  const objectUrlsRef = useRef([]);
  const [formErrors, setFormErrors] = useState({});
  const [variants, setVariants] = useState([
    { selectedVariant: "", selectedValue: "", valueDropdown: [] },
  ]);

  const inputChange = (key, value) => {
    // setFormData((prev) => ({ ...prev, [key]: value }));
    const sanitizedValue = sanitizeInput(value, true);
    const error = validateField(key, sanitizedValue);
    setFormErrors((prev) => ({ ...prev, [key]: error }));
    setFormData((prev) => ({ ...prev, [key]: sanitizedValue }));
  };

  useEffect(() => {
    return () => {
      // Cleanup object URLs
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const validateStep = () => {
    const newErrors = {};

    // Step 0: Basic Info
    if (!formData.productName)
      newErrors.productName = "Product Name is required";
    if (
      formData.productName &&
      !validationPatterns.productName.test(formData.productName)
    )
      newErrors.productName = "Invalid Product Name";
    if (!selectedCategory) newErrors.category = "Category is required";
    if (!selectedsubCategory)
      newErrors.subCategory = "Subcategory is required";
    if (!formData.store) newErrors.store = "Store is required";
    if (!selectedWarehouse) newErrors.warehouse = "Warehouse is required";
    if (!selectedHSN) newErrors.hsn = "HSN Code is required";
    if (formData.itemType === "Good" && !selectedBrands)
      newErrors.brand = "Brand is required";
    if (formData.isAdvanced) {
      if (!formData.leadTime) newErrors.leadTime = "Lead Time is required";
      if (
        formData.leadTime &&
        !validationPatterns.leadTime.test(formData.leadTime)
      )
        newErrors.leadTime = "Invalid Lead Time";
      if (!formData.reorderLevel) newErrors.reorderLevel = "Reorder Level is required";
      if (
        formData.reorderLevel &&
        !validationPatterns.reorderLevel.test(formData.reorderLevel)
      )
        newErrors.reorderLevel = "Invalid Reorder Level";
      if (!formData.initialStock) newErrors.initialStock = "Initial Stock is required";
      if (
        formData.initialStock &&
        !validationPatterns.initialStock.test(formData.initialStock)
      )
        newErrors.initialStock = "Invalid Initial Stock format";
      if (formData.trackType === "serial" && !formData.serialNumber)
        newErrors.serialNumber = "Serial Number is required";
      if (
        formData.serialNumber &&
        !validationPatterns.serialNumber.test(formData.serialNumber)
      )
        newErrors.serialNumber = "Invalid Serial Number";
      if (formData.trackType === "batch" && !formData.batchNumber)
        newErrors.batchNumber = "Batch Number is required";
      if (
        formData.batchNumber &&
        !validationPatterns.batchNumber.test(formData.batchNumber)
      )
        newErrors.batchNumber = "Invalid Batch Number";
    }
    // Step 1: Pricing
    if (!formData.mrp) newErrors.purchasePrice = "Purchase Price is required";
    if (
      formData.mrp &&
      !validationPatterns.price.test(formData.mrp)
    )
      newErrors.purchasePrice = "Purchase Price must be a positive number with up to 2 decimal places";
    if (!formData.quantity) newErrors.quantity = "Quantity must be at least 1";
    if (
      formData.quantity &&
      !validationPatterns.quantity.test(formData.quantity)
    )
      newErrors.quantity = "Quantity atleast should be 1";
    if (!formData.tax) newErrors.sellingPrice = "Selling Price is required";
    if (
      formData.tax &&
      !validationPatterns.price.test(formData.tax)
    )
      newErrors.sellingPrice = "Selling Price must be a positive number with up to 2 decimal places";
    if (!formData.wholesalePrice)
      newErrors.wholesalePrice = "Wholesale Price must be a positive number with up to 2 decimal places";
    if (
      formData.wholesalePrice &&
      !validationPatterns.price.test(formData.wholesalePrice)
    )
      newErrors.wholesalePrice = "Wholesale Price is required";
    if (!formData.retailPrice) newErrors.retailPrice = "Retail Price must be a positive number with up to 2 decimal places";
    if (
      formData.retailPrice &&
      !validationPatterns.price.test(formData.retailPrice)
    )
      newErrors.retailPrice = "Retail Price is required";
    if (!selectedUnits) newErrors.unit = "Unit is required";
    if (!formData.taxType) newErrors.taxType = "Tax Type is required";
    if (!formData.tax) newErrors.tax = "Tax Rate is required";
    if (!formData.discountType) newErrors.discountType = "Discount Type is required";
    if (!formData.discountValue) newErrors.discountValue = "Discount Value must be a positive number with up to 2 decimal places";
    if (
      formData.discountValue &&
      !validationPatterns.discountValue.test(formData.discountValue)
    )
      newErrors.discountValue = "Discount Value must be a positive number with up to 2 decimal places";

    if (!formData.description) newErrors.description = "Description is required";
    if (
      formData.description &&
      !validationPatterns.description.test(formData.description)
    )
      newErrors.description = "Invalid Description";
    if (
      formData.seoTitle &&
      !validationPatterns.seoTitle.test(formData.seoTitle)
    )
      newErrors.seoTitle = "Invalid SEO Title";
    if (
      formData.seoDescription &&
      !validationPatterns.seoDescription.test(formData.seoDescription)
    )
      newErrors.seoDescription = "Invalid SEO Description";
    // Optional: Add image validation if required
    // if (images.length === 0) newErrors.images = t("atLeastOneImageRequired");

    // Step 3: Variants
    const hasValidVariant = variants.some(
      (variant) => variant.selectedVariant && variant.selectedValue
    );
    if (!hasValidVariant) {
      newErrors.variants = "At least one variant with a valid value is required";
    }
    variants.forEach((variant, index) => {
      if (
        variant.selectedValue &&
        !validationPatterns.variantValue.test(variant.selectedValue)
      ) {
        newErrors[`variantValue_${index}`] = t("invalidVariantFormat");
      }
    });

    // Update formErrors state with new validation errors
    setFormErrors(newErrors);

    // Return array of error messages for toast notifications
    return Object.values(newErrors).filter(Boolean);
  };

  const handleNext = () => {
    const errors = validateStep();
    const updatedStatus = [...stepStatus];
    updatedStatus[step] = errors.length === 0 ? "complete" : "incomplete";
    setStepStatus(updatedStatus);

    if (errors.length === 0 && step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
    }
  };
  const handlePrev = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleVariantImageChange = (index, event) => {
    const files = Array.from(event.target.files || []);
    const maxSize = 1 * 1024 * 1024;
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const validFiles = [];
    const invalidFiles = [];
    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        invalidFiles.push({
          file,
          error: `Invalid file type for ${file.name}. Only JPEG, PNG, or JPG allowed.`,
        });
      } else if (file.size > maxSize) {
        invalidFiles.push({
          file,
          error: `Image ${file.name} exceeds 1MB limit.`,
        });
      } else {
        const url = URL.createObjectURL(file);
        objectUrlsRef.current.push(url);
        validFiles.push(Object.assign(file, { preview: url }));
      }
    });
    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ error }) => toast.error(error));
      setFormErrors((prev) => ({
        ...prev,
        [`variantImages_${index}`]: "Image size should not exceeded 1MB.",
      }));
    }
    if (validFiles.length > 0) {
      setVariants((prev) => {
        const updated = [...prev];
        const variant = { ...updated[index] };
        variant.images = [...(variant.images || []), ...validFiles];
        updated[index] = variant;
        return updated;
      });

      setFormErrors((prev) => ({ ...prev, [`variantImages_${index}`]: "" }));
    }
    event.target.value = "";
  };

  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedsubCategory, setSelectedsubCategory] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState(null);
  const [selectedUnits, setSelectedUnits] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [, setSelectedSubcategory] = useState(null);
  const [unitsOptions, setUnitsOptions] = useState([]);
  const [options, setOptions] = useState([]);
  const [optionsware, setOptionsWare] = useState([]);
  // const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const [formData, setFormData] = useState({
    productName: "",
    itemBarcode: "",   // ✅ ADD
    purchasePrice: "",
    mrp: "",
    sellingPrice: "",
    tax: "",
    size: "",
    color: "",
    openingQuantity: "",
    minStockToMaintain: "",
    discountType: "",  // ✅ ADD
    discountValue: "", // ✅ ADD
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value, true);
    const error = validateField(name, sanitizedValue);
    setFormErrors((prev) => ({ ...prev, [name]: error }));

    // If switching itemType, reset fields specific to the other type
    if (name === "itemType") {
      if (value === "Service") {
        // Clear all Good-specific fields
        setFormData((prev) => ({
          ...prev,
          itemType: value,
          mrp: "",
          wholesalePrice: "",
          retailPrice: "",
          quantity: "",
          unit: "",
          taxType: "",
          tax: "",
          discountType: "",
          discountValue: "",
          description: "",
          seoTitle: "",
          seoDescription: "",
          sellingType: "",
          barcodeSymbology: "",
          productType: "Single",
          isAdvanced: false,
          trackType: "serial",
          isReturnable: false,
          leadTime: "",
          reorderLevel: "",
          initialStock: "",
          serialNumber: "",
          batchNumber: "",
          returnable: false,
          expirationDate: "",
        }));
      } else if (value === "Good") {
        // Clear all Service-specific fields (if any in future)
        setFormData((prev) => ({
          ...prev,
          itemType: value,
          // Add service-specific fields here if needed
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setVariants(updatedVariants);
  };

  const validateField = (name, value) => {
    if (
      !value &&
      [
        "productName",
        "quantity",
        "discountValue",
      ].includes(name)
    ) {
      return t("fieldRequired");
    }

    switch (name) {
      case "productName":
        return validationPatterns.productName.test(value)
          ? ""
          : t("invalidProductName");
      // case "itemBarcode":
      //   return validationPatterns.itemBarcode.test(value) ? "" : t("invalidBarcodeFormat");
      case "purchasePrice":
      case "sellingPrice":
      case "wholesalePrice":
      case "retailPrice":
        return validationPatterns.price.test(value)
          ? ""
          : t("invalidPriceFormat");
      case "quantity":
        return validationPatterns.quantity.test(value)
          ? ""
          : t("invalidQuantityFormat");
      case "description":
        return validationPatterns.description.test(value)
          ? ""
          : t("invalidDescriptionFormat");
      case "seoTitle":
        return validationPatterns.seoTitle.test(value)
          ? ""
          : t("invalidSeoTitleFormat");
      case "seoDescription":
        return validationPatterns.seoDescription.test(value)
          ? ""
          : t("invalidSeoDescriptionFormat");
      case "leadTime":
        return validationPatterns.leadTime.test(value)
          ? ""
          : t("invalidLeadTimeFormat");
      case "reorderLevel":
        return validationPatterns.reorderLevel.test(value)
          ? ""
          : t("invalidReorderLevelFormat");
      case "initialStock":
        return validationPatterns.initialStock.test(value)
          ? ""
          : t("invalidInitialStockFormat");
      case "serialNumber":
        return validationPatterns.serialNumber.test(value)
          ? ""
          : t("invalidSerialNumberFormat");
      case "batchNumber":
        return validationPatterns.batchNumber.test(value)
          ? ""
          : t("invalidBatchNumberFormat");
      case "discountValue":
        return validationPatterns.discountValue.test(value)
          ? ""
          : t("invalidDiscountValueFormat");
      case "categoryName":
        return validationPatterns.categoryName.test(value)
          ? ""
          : t("invalidCategoryName");
      case "categorySlug":
        return validationPatterns.categorySlug.test(value)
          ? ""
          : t("invalidCategorySlug");
      case "variantValue":
        return validationPatterns.variantValue.test(value)
          ? ""
          : t("invalidVariantFormat");
      default:
        return "";
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();

    let newErrors = {};
    const hasSelectedCategory = !!selectedCategory?.value;

    if (hasSelectedCategory && !categoryName.trim()) {
      if (!subCategoryName.trim()) {
        newErrors.subCategoryName = "Subcategory name is required";
      }
    } else {
      newErrors.categoryName = validateField("categoryName", categoryName);
    }
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) return;

    try {
      if (hasSelectedCategory && !categoryName.trim() && subCategoryName.trim()) {
        await api.post(
          `/api/subcategory/categories/${selectedCategory.value}/subcategories`,
          { name: subCategoryName.trim() }
        );
        toast.success("Subcategory created successfully!");
      } else {
        await api.post("/api/category/categories", {
          categoryName: categoryName.trim(),
          subCategoryName: subCategoryName?.trim() || "",
        });
        toast.success("Category created successfully!");
      }

      setCategoryName("");
      setSubCategoryName("");
      setErrors({});
      fetchCategories();
      if (selectedCategory?.value) {
        await fetchSubcategoriesByCategory(selectedCategory.value);
      }
      setShowAddCategoryModel(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Error creating category/subcategory"
      );
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/category/categories");
      const data = res.data;

      // Ensure only active categories
      const activeCategories = (Array.isArray(data) ? data : data?.categories || [])
        .filter(cat => cat.isDelete !== true);

      const options = activeCategories.map((category) => ({
        value: category._id,
        label: sanitizeInput(category.categoryName, true),
      }));

      setCategories(options);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategoriesByCategory(selectedCategory.value);
    } else {
      setSubcategories([]);
      setSelectedsubCategory(null); // ← Important!
    }
  }, [selectedCategory]);

  const fetchSubcategoriesByCategory = async (categoryId) => {
    try {
      const res = await api.get(`/api/subcategory/by-category/${categoryId}`);
      const data = res.data;

      // Extra safety: filter client-side too
      const activeSubcats = (Array.isArray(data) ? data : data?.subcategories || [])
        .filter(sub => sub.isDelete !== true);

      const options = activeSubcats.map((subcat) => ({
        value: subcat._id,
        label: sanitizeInput(subcat.name, true),
      }));

      setSubcategories(options);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      toast.error("Failed to load subcategories");
      setSubcategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const subCategoryChange = (selectedOption) => {
    setSelectedsubCategory(selectedOption);
    // console.log("Selected subcategory:", selectedOption);
  };

  const validateFinalSubmit = () => {
    const newErrors = {};

    // REQUIRED FIELDS ONLY (Global)
    if (!formData.productName) newErrors.productName = "Product Name is required";
    if (!selectedCategory) newErrors.category = "Category is required";
    if (!selectedsubCategory) newErrors.subCategory = "Sub-category is required";
    if (!selectedHSN) newErrors.hsn = "HSN is required";

    // Validate Variants
    if (!variants.length) {
      newErrors.variants = "At least one variant is required";
    } else {
      variants.forEach((variant, index) => {
        if (!variant.mrp) newErrors[`variant_${index}_mrp`] = `MRP is required for variant ${index + 1}`;
        if (!variant.sellingPrice) newErrors[`variant_${index}_sellingPrice`] = `Selling Price is required for variant ${index + 1}`;
        if (!variant.tax) newErrors[`variant_${index}_tax`] = `Tax is required for variant ${index + 1}`;
        if (!variant.size) newErrors[`variant_${index}_size`] = `Size is required for variant ${index + 1}`;
        if (!variant.color) newErrors[`variant_${index}_color`] = `Color is required for variant ${index + 1}`;
        if (!variant.openingQuantity) newErrors[`variant_${index}_openingQuantity`] = `Opening Quantity is required for variant ${index + 1}`;
        if (!variant.minStockToMaintain) newErrors[`variant_${index}_minStockToMaintain`] = `Minimum stock is required for variant ${index + 1}`;
      });
    }

    setFormErrors(newErrors);
    return Object.values(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateFinalSubmit();

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    const formPayload = new FormData();

    formPayload.append("productName", sanitizeInput(formData.productName, true));
    formPayload.append("brand", selectedBrands?.value || "");
    formPayload.append("category", selectedCategory.value);
    formPayload.append("subCategory", selectedsubCategory.value);
    formPayload.append("hsn", selectedHSN.value);

    // Append discount fields
    formPayload.append("discountType", formData.discountType);
    if (formData.discountType === "Fixed") {
      formPayload.append("discountAmount", formData.discountValue);
    } else {
      formPayload.append("discountPercent", formData.discountValue);
    }

    // Append variants data with image counts for backend processing
    const variantsPayload = variants.map(v => ({
      ...v,
      imageCount: v.images ? v.images.length : 0
    }));
    formPayload.append("variants", JSON.stringify(variantsPayload));

    // Aggregate images from all variants in order
    const allImages = variants.flatMap(v => v.images || []);
    allImages.forEach((img) => formPayload.append("images", img));

    formPayload.append(
      "lotDetails",
      JSON.stringify({
        lotNo: lotDetails.lotNo,
        lotmrp: lotDetails.lotmrp,
        fabricBatchNo: lotDetails.fabricBatchNo,
        productionDate: lotDetails.productionDate || null,
        designCode: lotDetails.designCode,
        quantity: lotDetails.quantity,
        size: lotDetails.size,
        color: lotDetails.color,
      })
    );

    try {
      await api.post("/api/products/create", formPayload);
      toast.success("Product created successfully");
      navigate("/product");
    } catch (err) {
      console.error("Backend error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Validation failed");
    }
  };

  const [categoryName, setCategoryName] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        // const token = localStorage.getItem("token");
        const res = await api.get("/api/warehouse/active");
        if (res.data.success) {

          const formatted = res.data.data.map((wh) => ({
            value: wh._id,
            label: sanitizeInput(wh.warehouseName, true),
          }));
          setOptionsWare(formatted);
        }
      } catch (err) {
        console.error("Error fetching warehouses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  const handleWarehouseChange = (selectedOption) => {
    setSelectedWarehouse(selectedOption);
  };

  const [optionsHsn, setOptionsHsn] = useState([]);
  const [selectedHSN, setSelectedHSN] = useState(null);
  const [showHSNModal, setShowHSNModal] = useState(false);

  useEffect(() => {
    const fetchHSN = async () => {
      try {
        // const token = localStorage.getItem("token");
        const res = await api.get("/api/hsn/all");
        if (res.data.success) {

          const formatted = res.data.data.map((item) => ({
            value: item._id,
            label: sanitizeInput(
              `${item.hsnCode} - ${item.description || ""}`,
              true
            ),
          }));
          setOptionsHsn(formatted);
        }
      } catch (err) {
        console.error("Error fetching HSN:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHSN();
  }, []);

  const handleHSNChange = (selectedOption) => {
    setSelectedHSN(selectedOption);
  };

  return (
   
          <>

        <div className="py-4 px-4">
          {/* back, header, view style */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0px 0px 16px 0px",
            }}
          >
            {/* Title + Icon */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
              }}
            >
              {/* Icon Container */}
              <Link
                to="/product"
                style={{
                  width: 32,
                  height: 32,
                  background: "white",
                  borderRadius: 53,
                  border: "1.07px solid #EAEAEA",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Icon (placeholder) */}
                <FaArrowLeft style={{ color: "#A2A8B8" }} />
              </Link>

              {/* Title */}
              <h2
                style={{
                  margin: 0,
                  color: "black",
                  fontSize: 22,
                  // fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  lineHeight: "26.4px",
                }}
              >
                Add New Product
              </h2>
            </div>
            <div>
              <div
                style={{
                  padding: "6px 10px",
                  background: "#1F7FFF",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "400",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  textDecoration: "none",
                  boxShadow:
                    "0 8px 20px rgba(31, 127, 255, 0.3), inset -1px -1px 6px rgba(0,0,0,0.2)",
                  transition: "all 0.3s ease",
                }}
              >
                <img
                  src={AiLogo}
                  alt="Ai Logo"
                  style={{ filter: "grayscale(100%) brightness(500%)" }}
                />
                Add With AI
                <MdLockOutline style={{ fontSize: "20px" }} />
              </div>
            </div>
          </div>

          {/* body */}
          <div style={{
            // overflowY: "auto",
            // height: "83vh",
          }}>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "var(--White, white)",
                  borderRadius: "16px",
                  border: "1px var(--Stroke, #EAEAEA) solid",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  gap: "24px",
                  display: "flex",
                  overflowX: 'auto',
                  overflowY: "auto",
                  height: "79vh",
                }}
              >
                {/* General Details */}
                <div style={{ width: "1832px" }}>
                  <div
                    style={{
                      color: "black",
                      fontSize: "16px",
                      fontFamily: "Inter",
                      fontWeight: "500",
                      lineHeight: "19.20px",
                    }}
                  >
                    General Details
                  </div>
                  <div
                    style={{
                      gap: "24px",
                      width: "100%",
                      marginTop: "16px",
                      display: "flex",
                    }}
                  >
                    {/* Product Name */}
                    <div
                      style={{
                        minWidth: "440px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--Black-Grey, #727681)",
                            fontSize: "12px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            lineHeight: "14.40px",
                          }}
                        >
                          Product Name
                        </span>
                        <span
                          style={{
                            color: "var(--Danger, #D00003)",
                            fontSize: "12px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            lineHeight: "14.40px",
                          }}
                        >
                          *
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "0 12px",
                          background: "white",
                          borderRadius: "8px",
                          border: "1px var(--White-Stroke, #EAEAEA) solid",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "8px",
                          display: "flex",
                        }}
                      >
                        <input
                          type="text"
                          name="productName"
                          placeholder="Enter Name"
                          value={formData.productName}
                          onChange={handleChange}
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            color: "var(--Black-Black, #0E101A)",
                            fontSize: "14px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* category + sub-category */}
                    <div
                      style={{
                        width: "440px",
                        display: "flex",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          width: "440px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                            width: '210px'
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Category
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          {/* <select
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      color: "var(--Black-Black, #0E101A)",
                      fontSize: "14px",
                      fontFamily: "Inter",
                      fontWeight: "400",
                      outline: "none",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="">Hoodie</option>
                  </select> */}
                          {/* <Select
                            name="category"
                            options={categories}
                            value={selectedCategory}
                            onChange={(selected) => {
                              setSelectedCategory(selected);
                              setSelectedSubcategory(null);
                              setFormErrors((prev) => ({ ...prev, category: "" }));
                            }}
                            placeholder="Select Category"
                            style={{
                              width: "100%",
                              border: "1px solid red",
                              background: "transparent",
                              color: "var(--Black-Black, #0E101A)",
                              fontSize: "14px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              outline: "none",
                            }}
                          /> */}
                          <select
                            value={selectedCategory?.value || ""}
                            onChange={(e) => {
                              const selected = categories.find(
                                (cat) => cat.value === e.target.value
                              ) || null;

                              setSelectedCategory(selected);
                              setSelectedSubcategory(null);
                              setFormErrors((prev) => ({ ...prev, category: "" }));
                            }}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              color: "var(--Black-Black, #0E101A)",
                              fontSize: "14px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              outline: "none",
                            }}
                          >
                            <option value="">Select Category</option>

                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>

                        </div>
                      </div>

                      <div
                        style={{
                          width: "440px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                            width: '210px',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Sub - Category <span
                              style={{
                                color: "var(--Danger, #D00003)",
                                fontSize: "12px",
                                fontFamily: "Inter",
                                fontWeight: "400",
                                lineHeight: "14.40px",
                              }}
                            >
                              *
                            </span>
                          </span>
                          <div
                            title="Add New Category"
                            onClick={() => setShowAddCategoryModel(true)}
                            style={{
                              color: "var(--Danger, #1F7FFF)",
                              fontSize: "15px",
                              fontFamily: "Inter",
                              fontWeight: "500",
                              lineHeight: "13px",
                              padding: '0px 2px',
                              borderRadius: '4px',
                              border: '1px solid var(--Danger, #1F7FFF)',
                              cursor: 'pointer',
                            }}
                          >
                            +
                          </div>

                        </div>
                        <div
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          {/* <select
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      color: "var(--Black-Black, #0E101A)",
                      fontSize: "14px",
                      fontFamily: "Inter",
                      fontWeight: "400",
                      outline: "none",
                    }}
                  >
                    <option value="">Select</option>
                    <option value="">Hoodie</option>
                  </select> */}
                          {/* <Select
                            name="subCategory"
                            options={subcategories}
                            value={selectedsubCategory}
                            onChange={subCategoryChange}
                            placeholder="Select Sub-Category"
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              color: "var(--Black-Black, #0E101A)",
                              fontSize: "14px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              outline: "none",
                            }}
                          /> */}
                          <select
                            value={selectedsubCategory?.value || ""}
                            onChange={(e) => {
                              const selected =
                                subcategories.find(
                                  (sub) => sub.value === e.target.value
                                ) || null;

                              // keep same behavior as react-select
                              subCategoryChange(selected);
                            }}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              color: "var(--Black-Black, #0E101A)",
                              fontSize: "14px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              outline: "none",
                            }}
                          >
                            <option value="">Select Sub-Category</option>

                            {subcategories.map((sub) => (
                              <option key={sub.value} value={sub.value}>
                                {sub.label}
                              </option>
                            ))}
                          </select>

                        </div>
                      </div>

                    </div>

                    {/* item code / bar code */}
                    <div
                      style={{
                        minWidth: "440px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--Black-Grey, #727681)",
                            fontSize: "12px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            lineHeight: "14.40px",
                          }}
                        >
                          Item code / Bar code
                        </span>
                        <span
                          style={{
                            color: "var(--Danger, #D00003)",
                            fontSize: "12px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            lineHeight: "14.40px",
                          }}
                        >
                          *
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "0 12px",
                          background: "white",
                          borderRadius: "8px",
                          border: "1px var(--White-Stroke, #EAEAEA) solid",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "8px",
                          display: "flex",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Enter Code"
                          name="itemBarcode"
                          value={formData.itemBarcode || ""}
                          onChange={handleChange}
                          style={{
                            flex: 1,
                            border: "none",
                            background: "transparent",
                            color: "var(--Black-Black, #0E101A)",
                            fontSize: "14px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            outline: "none",
                          }}
                        />
                        {/* <button
                          type="button"
                          style={{
                            padding: "4px 6px",
                            background: "var(--Blue, #1F7FFF)",
                            borderRadius: "4px",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--White, white)",
                              fontSize: "14px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                            }}
                          >
                            Generate
                          </span>
                        </button> */}
                      </div>
                    </div>

                    {/* hsn code */}
                    <div
                      style={{
                        minWidth: "440px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--Black-Grey, #727681)",
                            fontSize: "12px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            lineHeight: "14.40px",
                          }}
                        >
                          HSN
                        </span>
                        <span
                          style={{
                            color: "var(--Danger, #D00003)",
                            fontSize: "12px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            lineHeight: "14.40px",
                          }}
                        >
                          *
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "0 12px",
                          background: "white",
                          borderRadius: "8px",
                          border: "1px var(--White-Stroke, #EAEAEA) solid",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "8px",
                          display: "flex",
                        }}
                      >
                        {/* <select
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      color: "var(--Black-Black, #0E101A)",
                      fontSize: "14px",
                      fontFamily: "Inter",
                      fontWeight: "400",
                      outline: "none",
                    }}
                  >
                    <option value="">Select HSN</option>
                    <option value="">100101</option>
                  </select> */}
                        {/* <Select
                          name="hsn"
                          options={optionsHsn}
                          isLoading={loading}
                          value={selectedHSN}
                          isSearchable
                          placeholder="Select HSN..."
                          onChange={handleHSNChange}
                          styles={{
                            control: (base) => ({
                              ...base,
                              maxWidth: "100%",
                              minWidth: 0,
                              overflow: "hidden",
                            }),
                            singleValue: (base) => ({
                              ...base,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "100%",
                            }),
                          }}
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            color: "var(--Black-Black, #0E101A)",
                            fontSize: "14px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            outline: "none",
                          }}
                        /> */}
                        <select
                          value={selectedHSN?.value || ""}
                          onChange={(e) => {
                            const selected =
                              optionsHsn.find(
                                (hsn) => hsn.value === e.target.value
                              ) || null;

                            handleHSNChange(selected);
                          }}
                          disabled={loading}
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            color: "var(--Black-Black, #0E101A)",
                            fontSize: "14px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            outline: "none",
                          }}
                        >
                          <option value="">
                            {loading ? "Loading HSN..." : "Select HSN"}
                          </option>

                          {optionsHsn.map((hsn) => (
                            <option key={hsn.value} value={hsn.value}>
                              {hsn.label}
                            </option>
                          ))}
                        </select>

                      </div>
                    </div>
                  </div>
                </div>

                {/* Lot No. Section */}
                <div style={{ width: "1832px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "8px",
                    }}
                  >
                    <label
                      onClick={() => setIsOn(!isOn)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "16px",
                        // fontFamily: "Inter",
                        fontWeight: "500",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                    >
                      {/* Toggle Switch */}
                      <div
                        style={{
                          width: "40px",
                          height: "22px",
                          borderRadius: "50px",
                          backgroundColor: isOn ? "#1F7FFF" : "#ccc",
                          position: "relative",
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: isOn ? "20px" : "2px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: "white",
                            transition: "left 0.3s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                          }}
                        ></div>
                      </div>

                      {/* Label Text */}
                      <span style={{ color: "#212436" }}>Lot No</span>
                    </label>
                  </div>

                  {isOn && (
                    <>
                      <div
                        style={{
                          width: "100%",
                          padding: "10px 30px",
                          background: "white",
                          borderRadius: "8px",
                          justifyContent: "center",
                          alignItems: "flex-start",
                          display: "flex",
                          overflowX: "auto",
                          backgroundColor: "#E5F0FF",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${lotColumns.length}, minmax(100px, 1fr))`,
                            gap: "0 8px",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          {lotColumns.map((col, index) => (
                            <div
                              key={index}
                              style={{
                                height: "auto",
                                padding: "8px 0px",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "0px",
                                display: "flex",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  width: "100%",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    padding: "4px",
                                  }}
                                >
                                  {col.label}
                                </span>
                                <div
                                  style={{
                                    borderTopLeftRadius:
                                      index < lotColumns.length - 7 ? "8px" : "none",
                                    borderBottomLeftRadius:
                                      index < lotColumns.length - 7 ? "8px" : "none",
                                    borderTopRightRadius:
                                      index < lotColumns.length - 1 ? "" : "8px",
                                    borderBottomRightRadius:
                                      index < lotColumns.length - 1 ? "" : "8px",
                                    backgroundColor: "white",
                                    width: "200px",
                                    padding: "8px 16px",
                                  }}
                                >
                                  <div
                                    style={{
                                      padding: "0 12px",
                                      borderRadius: "8px",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      display: "flex",
                                      border: "1px solid gray",
                                    }}
                                  >
                                    <input
                                      type="text"
                                      name={lotFieldKeys[index]}
                                      value={lotDetails[lotFieldKeys[index]] || ""}
                                      onChange={(e) =>
                                        setLotDetails((prev) => ({
                                          ...prev,
                                          [lotFieldKeys[index]]: e.target.value,
                                        }))
                                      }
                                      style={{
                                        color: "var(--Black, #212436)",
                                        fontSize: "18px",
                                        outline: "none",
                                        fontFamily: "Inter",
                                        fontWeight: "500",
                                        textAlign: "center",
                                        border: "none",
                                        background: "transparent",
                                        width: "100%",
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div
                        style={{
                          width: "1832px",
                          height: "1px",
                          background: "var(--Stroke, #EAEAEA)",
                          marginTop: "15px",
                        }}
                      />
                    </>
                  )}
                </div>

                {/* Pricing & Variants */}
                <div style={{ width: "1832px" }} className="delete-hover">
                  <div
                    style={{
                      color: "black",
                      fontSize: "16px",
                      fontFamily: "Inter",
                      fontWeight: "500",
                      lineHeight: "19.20px",
                      marginBottom: "16px",
                    }}
                  >
                    Pricing & Variants
                  </div>

                  {/* variant section */}
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "4px",
                      }}
                      className="row"
                    >
                      {/* Purchasing Price*/}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "195px",
                        }}
                        className="col-1"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Purchasing Price
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div
                          style={{
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <input
                              type="number"
                              placeholder="0.00"
                              name="purchasePrice"
                              value={variant.purchasePrice || ""}
                              onChange={(e) => handleVariantChange(index, "purchasePrice", e.target.value)}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "transparent",
                                color: "var(--Black-Black, #0E101A)",
                                fontSize: "14px",
                                fontFamily: "Inter",
                                fontWeight: "400",
                                outline: "none",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* MRP */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "195px",
                        }}
                        className="col-1"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            MRP
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div
                          style={{
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <input
                              type="number"
                              placeholder="0.00"
                              name="mrp"
                              value={variant.mrp || ""}
                              onChange={(e) => handleVariantChange(index, "mrp", e.target.value)}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "transparent",
                                color: "var(--Black-Black, #0E101A)",
                                fontSize: "14px",
                                fontFamily: "Inter",
                                fontWeight: "400",
                                outline: "none",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Selling Price */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "195px",
                        }}
                        className="col-1"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Selling Price
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div
                          style={{
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <input
                              type="number"
                              placeholder="0.00"
                              name="sellingPrice"
                              value={variant.sellingPrice || ""}
                              onChange={(e) => handleVariantChange(index, "sellingPrice", e.target.value)}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "transparent",
                                color: "var(--Black-Black, #0E101A)",
                                fontSize: "14px",
                                fontFamily: "Inter",
                                fontWeight: "400",
                                outline: "none",
                              }}
                            />
                          </div>
                        </div>
                        <span
                          style={{
                            color: "var(--Black-Black, #0E101A)",
                            fontSize: "11px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            lineHeight: "14.40px",
                          }}
                        >
                          Profit -{" "}
                          <span
                            style={{
                              color: "var(--Black-Black, green)",
                              fontSize: "11px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            ₹ {(variant.sellingPrice - variant.purchasePrice).toFixed(2)} (
                            {(((variant.sellingPrice - variant.purchasePrice) / variant.purchasePrice) * 100).toFixed(2)}%)
                          </span>
                        </span>
                      </div>

                      {/* TAX */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "195px",
                        }}
                        className="col-1"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Tax
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div
                          style={{
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          <select
                            name="tax"
                            value={variant.tax || ""}
                            onChange={(e) => handleVariantChange(index, "tax", e.target.value)}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              color: "var(--Black-Black, #0E101A)",
                              fontSize: "14px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              outline: "none",
                            }}
                          >
                            <option value="">Select GST</option>
                            <option value="5">5%</option>
                            <option value="18">18%</option>
                          </select>
                        </div>
                        <span
                          style={{
                            color: "var(--Black-Black, #0E101A)",
                            fontSize: "11px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            lineHeight: "14.40px",
                          }}
                        >
                          TAX amount -{" "}
                          <span
                            style={{
                              color: "var(--Black-Black, red)",
                              fontSize: "11px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            ₹{(variant.sellingPrice * variant.tax / 100).toFixed(2)}/-
                          </span>
                        </span>
                      </div>

                      {/* Size */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "195px",
                        }}
                        className="col-1"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Size
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div
                          style={{
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          <select
                            name="size"
                            value={variant.size || ""}
                            onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              color: "var(--Black-Black, #0E101A)",
                              fontSize: "14px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              outline: "none",
                            }}
                          >
                            <option value="">Select Size</option>
                            <option value="XS">Extra Small (XS)</option>
                            <option value="S">Small (S)</option>
                            <option value="M">Medium (M)</option>
                            <option value="L">Large (L)</option>
                            <option value="XL">Extra Large (XL)</option>
                          </select>
                        </div>
                      </div>

                      {/* Color */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "195px",
                        }}
                        className="col-1"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Color
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div
                          style={{
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          <select
                            name="color"
                            value={variant.color || ""}
                            onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                            style={{
                              width: "100%",
                              border: "none",
                              background: "transparent",
                              color: "var(--Black-Black, #0E101A)",
                              fontSize: "14px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              outline: "none",
                            }}
                          >
                            <option value="">Select Color</option>
                            <option value="Red">Red</option>
                            <option value="Yellow">yellow</option>
                            <option value="Black">black</option>
                            <option value="Green">green</option>
                          </select>
                        </div>
                      </div>

                      {/* Opening Quantity */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "195px",
                        }}
                        className="col-1"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Opening Quantity
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div
                          style={{
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <input
                              type="number"
                              placeholder="00"
                              name="openingQuantity"
                              value={variant.openingQuantity || ""}
                              onChange={(e) => handleVariantChange(index, "openingQuantity", e.target.value)}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "transparent",
                                color: "var(--Black-Black, #0E101A)",
                                fontSize: "14px",
                                fontFamily: "Inter",
                                fontWeight: "400",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Min. Stock to Maintain */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "195px",
                        }}
                        className="col-1"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Min. Stock to Maintain
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div
                          style={{
                            height: "40px",
                            padding: "0 12px",
                            background: "white",
                            borderRadius: "8px",
                            border: "1px var(--White-Stroke, #EAEAEA) solid",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "8px",
                            display: "flex",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <input
                              type="number"
                              placeholder="00"
                              name="minStockToMaintain"
                              value={variant.minStockToMaintain || ""}
                              onChange={(e) => handleVariantChange(index, "minStockToMaintain", e.target.value)}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "transparent",
                                color: "var(--Black-Black, #0E101A)",
                                fontSize: "14px",
                                fontFamily: "Inter",
                                fontWeight: "400",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Discount Section */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "195px",
                        }}
                        className="col-2"
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              color: "var(--Black-Grey, #727681)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            Discount Price
                          </span>
                          <span
                            style={{
                              color: "var(--Danger, #D00003)",
                              fontSize: "12px",
                              fontFamily: "Inter",
                              fontWeight: "400",
                              lineHeight: "14.40px",
                            }}
                          >
                            *
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }} className="">
                          <div
                            style={{
                              height: "40px",
                              paddingLeft: "8px",
                              background: "var(--White, white)",
                              borderRadius: "8px",
                              border: "1px var(--Stroke, #EAEAEA) solid",
                              justifyContent: "space-between",
                              display: "flex",
                              position: "relative",
                            }}
                          >
                            <input
                              type="number"
                              placeholder="00"
                              name="discountAmount"
                              value={variant.discountAmount || ""}
                              onChange={(e) => handleVariantChange(index, "discountAmount", e.target.value)}
                              style={{
                                width: "100%",
                                border: "none",
                                background: "transparent",
                                color: "var(--Black-Black, #0E101A)",
                                fontSize: "14px",
                                fontFamily: "Inter",
                                fontWeight: "400",
                                overflow: "hidden",
                                outline: "none",
                              }}
                            />
                            <div
                              style={{
                                paddingRight: "4px",
                                background: "var(--Spinning-Frame, #E9F0F4)",
                                borderTopRightRadius: "8px",
                                borderBottomRightRadius: "8px",
                                border: "1px var(--Stroke, #C2C9D1) solid",
                                justifyContent: "center",
                                alignItems: "center",
                                display: "flex",
                                padding: "6px",
                              }}
                            >
                              <span
                                style={{
                                  color: "var(--Black-Secondary, #6C748C)",
                                  fontSize: "14px",
                                  fontFamily: "Poppins",
                                  fontWeight: "400",
                                }}
                              >
                                <select
                                  name="discountType"
                                  value={variant.discountType || ""}
                                  onChange={(e) => handleVariantChange(index, "discountType", e.target.value)}
                                  style={{
                                    color: "var(--Black-Secondary, #6C748C)",
                                    fontSize: "14px",
                                    fontFamily: "Poppins",
                                    fontWeight: "400",
                                    border: "none",
                                    background: "transparent",
                                  }}
                                >
                                  <option value="">₹/%</option>
                                  <option value="Fixed">₹</option>
                                  <option value="Percentage">%</option>
                                </select>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Delete button */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                          width: "50px",
                        }}
                        className="col-1"
                      >
                        <div
                          className=""
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                          }}
                          onClick={() => {
                            if (index === 0) return;
                            if (variants.length <= 1) return;
                            setVariants(variants.filter((_, i) => i !== index));
                          }}
                        >
                          <RiDeleteBinLine className="delete-hover-icon text-danger fs-5" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* add variant button */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginTop: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        overflow: "hidden",
                        border: "2px solid var(--Blue, #1F7FFF)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        borderRadius: "4px",
                      }}
                      onClick={() => setVariants([...variants, {}])}
                    >
                      <div
                        style={{
                          color: "#1F7FFF",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        +
                      </div>
                    </div>
                    <span
                      style={{
                        color: "var(--Black, #212436)",
                        fontSize: "16px",
                        fontFamily: "Inter",
                        fontWeight: "400",
                        lineHeight: "19.20px",
                      }}
                    >
                      Add New Variant
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: "1832px",
                    height: "1px",
                    background: "var(--Stroke, #EAEAEA)",
                  }}
                />

                {/* Import Images */}
                <div
                  style={{
                    width: "auto",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    border: "1px solid #EAEAEA",
                    padding: "16px",
                  }}
                >
                  <div className="d-flex justify-content-start align-items-center gap-4">
                    <div
                      style={{
                        color: "black",
                        fontSize: "16px",
                        fontFamily: "Inter",
                        fontWeight: "500",
                        marginBottom: "20px",
                      }}
                    >
                      Import Images
                    </div>
                    <div
                      style={{
                        color: "black",
                        fontSize: "16px",
                        fontFamily: "Inter",
                        fontWeight: "500",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          padding: "6px 10px",
                          background: "#1F7FFF",
                          color: "white",
                          fontSize: "16px",
                          fontWeight: "400",
                          border: "none",
                          borderRadius: "12px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          textDecoration: "none",
                          boxShadow:
                            "0 8px 20px rgba(31, 127, 255, 0.3), inset -1px -1px 6px rgba(0,0,0,0.2)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <img
                          src={AiLogo}
                          alt="Ai Logo"
                          style={{ filter: "grayscale(100%) brightness(500%)" }}
                        />
                        Generate
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                      gap: "24px",
                      width: "100%",
                      flexWrap: "wrap",
                    }}
                  >
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        <span
                          style={{
                            color: "black",
                            fontSize: "14px",
                            fontFamily: "Inter",
                            fontWeight: "400",
                            lineHeight: "16.80px",
                          }}
                        >
                          {`Variant ${index + 1}`}
                        </span>

                        <label
                          htmlFor={`variant-image-${index}`}
                          style={{
                            width: "350px",
                            height: "200px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: "2px dashed #EAEAEA",
                            borderRadius: "8px",
                          }}
                        >
                          {/* Preview OR placeholder */}
                          {variant.images?.length ? (
                            variant.images.map((f, i) => (
                              <img
                                key={i}
                                src={f.preview}
                                alt="preview"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  pointerEvents: "none",
                                }}
                              />
                            ))
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 8,
                                color: "#727681",
                                pointerEvents: "none",
                              }}
                            >
                              <FcAddImage size={30} />
                              <span style={{ color: "#727681" }}>
                                Drag image here or <span style={{ color: "#1F7FFF" }}>browse</span>
                              </span>
                              <span style={{ fontSize: 12, color: "#727681" }}>
                                JPEG, PNG, JPG (max 1MB)
                              </span>
                            </div>
                          )}
                          <input
                            id={`variant-image-${index}`}
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={(e) => handleVariantImageChange(index, e)}
                            style={{ display: "none" }}
                          />
                        </label>


                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* cancel and Save Button */}
              <div
                style={{
                  width: "100%",
                  justifyContent: "end",
                  alignItems: "center",
                  display: "flex",
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    paddingLeft: 47,
                    paddingRight: 47,
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 8,
                    display: "inline-flex",
                  }}
                >
                  <Link
                    to="/product"
                    style={{
                      height: 36,
                      padding: 8,
                      background: "var(--White-Universal-White, white)",
                      boxShadow: "-1px -1px 4px rgba(0, 0, 0, 0.25) inset",
                      borderRadius: 8,
                      outline: "1.50px var(--Blue-Blue, #1F7FFF) solid",
                      outlineOffset: "-1.50px",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 4,
                      display: "flex",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        color: "var(--Blue-Blue, #1F7FFF)",
                        fontSize: 14,
                        fontFamily: "Inter",
                        fontWeight: "500",
                        lineHeight: 5,
                        wordWrap: "break-word",
                      }}
                    >
                      Cancel
                    </div>
                  </Link>
                  <button
                    type="submit"
                    style={{
                      height: 36,
                      padding: 8,
                      background: "var(--Blue-Blue, #1F7FFF)",
                      boxShadow: "-1px -1px 4px rgba(0, 0, 0, 0.25) inset",
                      borderRadius: 8,
                      outline: "1.50px var(--Blue-Blue, #1F7FFF) solid",
                      outlineOffset: "-1.50px",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 4,
                      display: "flex",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        color: "white",
                        fontSize: 14,
                        fontFamily: "Inter",
                        fontWeight: "500",
                        lineHeight: 5,
                        wordWrap: "break-word",
                      }}
                    >
                      Save{" "}
                    </div>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>

        {showAddCategoryModel && (
          <CreateCategoryModal
            closeModal={() => setShowAddCategoryModel(false)}
            modalId="categoryModal"
            title={[t("Add Category")]}
            categoryName={categoryName}
            onCategoryChange={(e) => setCategoryName(e.target.value)}
            subCategoryName={subCategoryName} // ✅ ADD THIS
            onSubCategoryChange={(e) => setSubCategoryName(e.target.value)}
            onSubmit={handleSubmitCategory}
            submitLabel={[t("Save")]}
            errors={errors}
          />
        )}

  </>
    
  );
};

export default ProductForm;
