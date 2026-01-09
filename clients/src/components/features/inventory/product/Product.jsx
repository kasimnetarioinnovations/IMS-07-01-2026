import { toast } from "react-toastify";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../../../styles/product/product-list.css";
import DeleteAlert from "../../../../utils/sweetAlert/DeleteAlert";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Full Redesign--------------------------------------------------------------------------------------------
import "./product.css";
import Pagination from "../../../Pagination";
import DatePicker from "../../../DatePicker";
import DeleteModal from "../../../ConfirmDelete";
import "react-datepicker/dist/react-datepicker.css";

import { IoIosSearch, IoIosArrowDown } from "react-icons/io";
import { FaArrowLeft, FaBarcode, FaFileImport } from "react-icons/fa6";
import { RiListView, RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineViewSidebar, MdAddShoppingCart } from "react-icons/md";
import { TbFileImport, TbFileExport } from "react-icons/tb";
import { LuCalendarMinus2 } from "react-icons/lu";
import Barcode from "../../../../assets/images/barcode.jpg";

import edit from "../../../../assets/images/edit.png";
import viewdetails from "../../../../assets/images/view-details.png";
import stockin from "../../../../assets/images/stock-in.png";
import stockout from "../../../../assets/images/stock-out.png";
import deletebtn from "../../../../assets/images/delete.png";
import duplicate from "../../../../assets/images/duplicate.png";
import api from "../../../../pages/config/axiosInstance"
import { useAuth } from "../../../auth/AuthContext";

const Product = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef();
  const [products, setProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [activeTabs, setActiveTabs] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [total, setTotal] = useState(0);
  const [brandOptions, setBrandOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [hsnOptions, setHsnOptions] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedHsn, setSelectedHsn] = useState(null);
  const [search, setSearch] = useState("");
  const [leftSearch, setLeftSearch] = useState("");
  const [listTab, setListTab] = useState("All Products");
  const [barcodeModal, setBarcodeModal] = useState(null);

    const [activeRow, setActiveRow] = useState(null);

    const toggleRow = (index) => {
        const newOpen = openRow === index ? null : index;
        setOpenRow(newOpen);
        if (newOpen === null && activeRow === index) {
            setActiveRow(null);
        } else if (newOpen !== null) {
            setActiveRow(index);
        }
    };

  const handleClick = () => {
    navigate("/add-product")
  }

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d)) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "pm" : "am";
    h = h % 12;
    if (h === 0) h = 12;
    const hh = String(h).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${m} ${ampm}`;
  };

  const [viewMode, setViewMode] = useState(false);

  const [viewBarcode, setViewBarcode] = useState([]);
  const [viewOptions, setViewOptions] = useState([]);

  const [viewManageOptions, setViewManageOptions] = useState(false);
  const handleViewManage = () => {
    setViewManageOptions(true);
  };

  const buttonRefs = useRef([]);
  const modelRef = useRef(null); // reference to modal area
  const manageRef = useRef(null);

  const [dropdownPos, setDropdownPos] = useState({ x: 0, y: 0 });
  const [openUpwards, setOpenUpwards] = useState(false);

  const handleViewMode = () => {
    setViewMode((prevMode) => !prevMode);
  };

  const [openMenus, setOpenMenus] = useState([]); // <-- per-row toggle

  const toggleMenu = (index) => {
    setOpenMenus(
      (prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index) // close
          : [...prev, index] // open
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideModel =
        modelRef.current && modelRef.current.contains(event.target);
      const isClickInsideBarcodeButton =
        buttonRefs.current[viewBarcode] &&
        buttonRefs.current[viewBarcode].contains(event.target);
      const isClickInsideOptionsButton =
        buttonRefs.current[viewOptions] &&
        buttonRefs.current[viewOptions].contains(event.target);
      const isClickInsideManage =
        manageRef.current && manageRef.current.contains(event.target);

      if (
        !isClickInsideModel &&
        !isClickInsideBarcodeButton &&
        !isClickInsideOptionsButton &&
        !isClickInsideManage
      ) {
        setViewBarcode(false);
        setViewOptions(false);
        setViewManageOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [viewBarcode, viewOptions, viewManageOptions]);

  useEffect(() => {
    // const token = localStorage.getItem("token");
    // Brands
    api
      .get("/api/brands/active-brands")
      .then((res) =>
        setBrandOptions(
          res.data.brands.map((b) => ({ value: b._id, label: b.brandName }))
        )
      )
      .catch(() => setBrandOptions([]));
    // Categories
    api
      .get("/api/category/categories")
      .then((res) =>
        setCategoryOptions(
          res.data.map((c) => ({ value: c._id, label: c.categoryName }))
        )
      )
      .catch(() => setCategoryOptions([]));
    // HSN
    api
      .get("/api/hsn/all")
      .then((res) =>
        setHsnOptions(
          res.data.map((h) => ({
            value: h._id,
            label: h.code || h.hsnCode || h.name,
          }))
        )
      )
      .catch(() => setHsnOptions([]));
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setSubcategoryOptions([]);
      setSelectedSubcategory(null);
      return;
    }
    // const token = localStorage.getItem("token");
    api
      .get(
        `/api/subcategory/by-category/${selectedCategory.value}`)
      .then((res) =>
        setSubcategoryOptions(
          res.data.map((s) => ({ value: s._id, label: s.subCategoryName }))
        )
      )
      .catch(() => setSubcategoryOptions([]));
  }, [selectedCategory]);

  const fetchProducts = React.useCallback(async () => {
    // const token = localStorage.getItem("token");
    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };
    if (selectedBrand) params.brand = selectedBrand.value;
    if (selectedCategory) params.category = selectedCategory.value;
    if (selectedSubcategory) params.subcategory = selectedSubcategory.value;
    if (selectedHsn) params.hsn = selectedHsn.value;
    if (search) params.search = search;
    try {
      const res = await api.get(`/api/products`, {
        // headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setProducts(res.data.products);
      setTotal(res.data.total);
      // Initialize all to "general"
      const initialTabs = res.data.products.reduce((acc, product) => {
        acc[product._id] = "general";
        return acc;
      }, {});
      setActiveTabs(initialTabs);
    } catch (err) {
      setProducts([]);
      setTotal(0);
      console.error("Failed to fetch products", err);
    }
  }, [
    selectedBrand,
    selectedCategory,
    selectedSubcategory,
    selectedHsn,
    search,
    currentPage,
    itemsPerPage,
  ]);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleTabClick = (productId, tab) => {
    setActiveTabs((prev) => ({ ...prev, [productId]: tab }));
  };

  const getExpiryStatus = (expiryValue) => {
    const qtyString =
      Array.isArray(expiryValue) && expiryValue.length > 0
        ? expiryValue[0]
        : expiryValue;

    if (
      typeof qtyString === "string" &&
      qtyString.match(/^\d{2}-\d{2}-\d{4}$/)
    ) {
      const [day, month, year] = qtyString.split("-").map(Number);
      const expiryDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);

      if (!isNaN(expiryDate.getTime())) {
        const diffTime = expiryDate - today;
        const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysDiff <= 0) return "Expired";
        if (daysDiff <= 2) return "Expiring Soon";
      }
    }
    return "";
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        const list = res.data.products || [];

        setProducts(list);

        const count = list.reduce((acc, product) => {
          if (product.variants && product.variants.Expiry) {
            const status = getExpiryStatus(product.variants.Expiry);
            if (status === "Expired" || status === "Expiring Soon") {
              acc++;
            }
          }
          return acc;
        }, 0);

        setExpiringCount(count);

        setExpiringProducts(names);

        // Initialize tabs
        const initialTabs = res.data.reduce((acc, product) => {
          acc[product._id] = "general";
          return acc;
        }, {});
        setActiveTabs(initialTabs);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  const [popup, setPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // store product
  const formRef = useRef(null);

  const handlePopupOpen = (product) => {
    setSelectedProduct(product); // set product
    setPopup(true); // open popup
  };

  const handlePopupClose = () => {
    setPopup(false); // open popup
  };

  const closeForm = () => {
    setPopup(false);
    setSelectedProduct(null); // clear selected product
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        closeForm();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // const token = localStorage.getItem("token");
    const loadAll = async () => {
      try {
        const res = await api.get("/api/products", {
          // headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          params: { page: 1, limit: 1000 },
        });
        const list = res.data.products || res.data || [];
        setAllProducts(list);
        setActiveTabs((prev) => {
          const next = { ...prev };
          list.forEach((p) => {
            if (!next[p._id]) next[p._id] = "general";
          });
          return next;
        });
        if (!selectedProduct && list.length) {
          setSelectedProduct(list[0]);
        }
      } catch (e) {
        setAllProducts([]);
      }
    };
    loadAll();
  }, []);

  useEffect(() => {
    if (viewMode && !selectedProduct && allProducts.length) {
      setSelectedProduct(allProducts[0]);
    }
  }, [viewMode, allProducts, selectedProduct]);

  const filteredAllProducts = React.useMemo(() => {
    const q = leftSearch.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter((p) => {
      const name = (p.productName || "").toLowerCase();
      const sku = (p.sku || "").toLowerCase();
      const brand = (p.brand?.brandName || "").toLowerCase();
      const category = (p.category?.categoryName || "").toLowerCase();
      return (
        name.includes(q) ||
        sku.includes(q) ||
        brand.includes(q) ||
        category.includes(q)
      );
    });
  }, [leftSearch, allProducts]);

  useEffect(() => {
    if (!viewMode) return;
    const exists = filteredAllProducts.some(
      (p) => p._id === (selectedProduct?._id || "")
    );
    if (!exists) {
      if (filteredAllProducts.length)
        setSelectedProduct(filteredAllProducts[0]);
      else setSelectedProduct(null);
    }
  }, [leftSearch, filteredAllProducts, viewMode]);

  const listCounts = React.useMemo(() => {
    const totalAll = allProducts.length;
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const newStocks = allProducts.filter((p) => {
      const d = new Date(p.updatedAt);
      return !isNaN(d) && d >= monthAgo;
    }).length;
    const lowStocks = allProducts.filter((p) => {
      const q = Number(p.openingQuantity);
      const alert = Number(p.minStockToMaintain);
      return !isNaN(q) && !isNaN(alert) && q < alert;
    }).length;
    const oldStocks = Math.max(0, totalAll - newStocks);
    return {
      totalAll,
      lowStocks,
      newStocks,
      oldStocks,
    };
  }, [allProducts]);

  const visibleProducts = React.useMemo(() => {
    if (listTab === "Low Stocks") {
      return products.filter((p) => {
        const q = Number(p.openingQuantity);
        const alert = Number(p.minStockToMaintain);
        return !isNaN(q) && !isNaN(alert) && q < alert;
      });
    }
    if (listTab === "New Stocks") {
      const now = new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(now.getDate() - 3);

      return products.filter((p) => {
        const d = new Date(p.updatedAt);
        return !isNaN(d) && d >= threeDaysAgo;
      });
    }
    if (listTab === "Old Stock") {
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return products.filter((p) => {
        const d = new Date(p.updatedAt);
        return isNaN(d) || d < monthAgo;
      });
    }
    return products;
  }, [products, listTab]);
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((p) => selectedRowIds.has(p._id));

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/api/products/pro/${deleteTargetId}`);
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      await fetchProducts();
    } catch (err) {
      setShowDeleteModal(false);
      console.error("Delete product error:", err);
    }
  };

  const handlePdf = () => {
    const doc = new jsPDF();
    doc.text("Product Data", 14, 15);
    const tableColumns = [
      "Product Name",
      "Category",
      "Quantity",
      "Item Code",
      "Purchasing Price",
      "Selling Price",
    ];

    const visibleRows = selectedRowIds.size > 0
      ? visibleProducts.filter((e) => selectedRowIds.has(e._id))
      : visibleProducts;

    const tableRows = visibleRows.map((e) => [
      e.productName,
      e.category?.categoryName,
      e.openingQuantity,
      e.itemBarcode,
      e.purchasePrice,
      e.sellingPrice,
    ]);

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [155, 155, 155],
        textColor: "white",
      },
      theme: "striped",
    });

    doc.save("products.pdf");
  };

  const handleExcel = () => {
    const tableColumns = [
      "Product Name",
      "SKU",
      "Category",
      "Brand",
      "Quantity",
      "Unit",
      "Price",
    ];

    const tableRows = products.map((e) => [
      e.productName,
      e.sku,
      e.category?.categoryName,
      e.brand?.brandName,
      e.quantity,
      e.unit,
      // e.trackType,
      e.sellingPrice,
    ]);

    const data = [tableColumns, ...tableRows];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    XLSX.writeFile(workbook, "products.xlsx");
  };

  const handleCSV = () => {
    const tableHeader = ["Product Name", "SKU", "Quantity", "Status", "Price"];
    const csvRows = [
      tableHeader.join(","),
      ...products.map((e) =>
        [e.productName, e.sku, e.quantity, e.trackType, e.sellingPrice].join(
          ","
        )
      ),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".xlsx")) {
      alert("Please select a valid .xlsx file");
      e.target.value = "";
      return;
    }

    try {
      // Create FormData and append the file
      const formData = new FormData();
      formData.append("file", file);

      // Send to backend
      // const token = localStorage.getItem("token");
      // if (!token) {
      //   throw new Error("No token found in localStorage");
      // }
      await api.post("/api/products/import", formData);
      toast.success("Imported successfully!");
    } catch (err) {
      console.error("Import Error:", err.response?.data || err.message || err);
      alert(
        "Error while Import: " +
        (err.response?.data?.message || err.message || "Unknown error")
      );
    } finally {
      e.target.value = ""; // Clear input
    }
  };

  const transactions = [
    {
      date: "14/09/2025",
      type: "Sales",
      id: "INV-109",
      party: "Alok Ranjan",
      stock: -4,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Purchase",
      id: "SUP-109",
      party: "Aman",
      stock: +22,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Pos",
      id: "INV-109",
      party: "Jethalal",
      stock: -1,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Transfer",
      id: "INV-109",
      party: "Sundarlal",
      stock: -10,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Added (Manually)",
      id: "INV-109",
      party: "---",
      stock: +12,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Removed (Manually)",
      id: "INV-109",
      party: "---",
      stock: -3,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Removed (Manually)",
      id: "INV-109",
      party: "---",
      stock: -3,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Removed (Manually)",
      id: "INV-109",
      party: "---",
      stock: -3,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Removed (Manually)",
      id: "INV-109",
      party: "---",
      stock: -3,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Removed (Manually)",
      id: "INV-109",
      party: "---",
      stock: -3,
      amount: "₹3,200/-",
    },
    {
      date: "14/09/2025",
      type: "Removed (Manually)",
      id: "INV-109",
      party: "---",
      stock: -3,
      amount: "₹3,200/-",
    },
  ];

  const [isOn, setIsOn] = useState(false);
  const [detailsTab, setDetailsTab] = useState("Basic Details");

  const [date, setDate] = useState(null);

  return (
    <>
      <div className="p-4">
        {/* back, header, view style */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0px 0px 16px 0px", // Optional: padding for container
          }}
        >
          {/* Left: Title + Icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              height: "33px",
            }}
          >
            {/* <div style={{
                width: 32,
                height: "33px",
                background: 'white',
                borderRadius: 53,
                border: '1.07px solid #EAEAEA',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <FaArrowLeft style={{ color: '#A2A8B8' }} />
              </div> */}

            <h2
              style={{
                margin: 0,
                color: "black",
                fontSize: 22,
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                lineHeight: "26.4px",
              }}
            >
              All Products
            </h2>
          </div>

          {/* Right: Action Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              height: "33px",
            }}
          >
            <button
              title="Minimum Details"
              style={{
                padding: "8px",
                background: viewMode ? "white" : "#1F7FFF",
                color: viewMode ? "gray" : "white",
                borderRadius: 8,
                border: "1px solid #A2A8B8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                height: "33px",
              }}
              onClick={handleViewMode}
            >
              <RiListView className="" style={{ fontSize: "20px" }} />
            </button>

            <button
              title="Full Detail"
              style={{
                padding: "8px",
                background: viewMode ? "#1F7FFF" : "white",
                color: viewMode ? "white" : "gray",
                borderRadius: 8,
                border: "1px solid #A2A8B8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                height: "33px",
              }}
              onClick={handleViewMode}
            >
              <MdOutlineViewSidebar
                className=""
                style={{ transform: "rotate(180deg)", fontSize: "20px" }}
              />
            </button>

            {/* <NavLink
                to="/add-product"
                style={{
                  padding: "8px 16px",
                  background: "white",
                  border: "2px solid #1F7FFF",
                  borderRadius: 8,
                  textDecoration: "none",
                  fontSize: "14px",
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  height: "33px",
                }}
              >
                <MdAddShoppingCart
                  style={{
                    color: "#1F7FFF",
                    fontSize: "16px",
                  }}
                />
                <span
                  className=""
                  style={{
                    color: "#1F7FFF",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Add Product
                </span>
              </NavLink> */}
            <button
              title="Add Product Button"
              className="button-hover"
              onClick={handleClick}
              style={{
                borderRadius: "8px",
                padding: "5px 16px",
                border: "1px solid #1F7FFF",
                color: "rgb(31, 127, 255)",
                fontFamily: "Inter",
                backgroundColor: "white",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            > <MdAddShoppingCart /> Add Products</button>
          </div>
        </div>

        {/* view mode */}
        {!viewMode ? (
          <>
            {/* verticle section */}
            <div
              style={{
                width: "100%",
                minHeight: "auto",
                maxHeight: "calc(100vh - 160px)",
                padding: 16,
                background: "white",
                borderRadius: 16,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                fontFamily: "Inter, sans-serif",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {/* Tabs */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    padding: 2,
                    background: "#F3F8FB",
                    borderRadius: 8,
                    flexWrap: "wrap",
                    height: "38px",
                    width: "auto",
                  }}
                >
                  {[
                    { label: "All Products", count: listCounts.totalAll },
                    { label: "Bestseller", count: 0 },
                    { label: "Low Stocks", count: listCounts.lowStocks },
                    { label: "Old Stock", count: listCounts.oldStocks },
                    { label: "New Stocks", count: listCounts.newStocks },
                  ].map((tab) => (
                    <div
                      key={tab.label}
                      style={{
                        padding: "6px 12px",
                        background: listTab === tab.label ? "white" : "transparent",
                        borderRadius: 8,
                        boxShadow:
                          listTab === tab.label
                            ? "0px 1px 4px rgba(0, 0, 0, 0.10)"
                            : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 14,
                        color: "#0E101A",
                        cursor: "pointer",
                      }}
                      onClick={() => setListTab(tab.label)}
                    >
                      {tab.label}
                      <span style={{ color: "#727681" }}>{tab.count}</span>
                    </div>
                  ))}
                </div>

                {/* Search Bar & export import */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    gap: "24px",
                    height: "33px",
                    width: "50%",
                  }}
                >
                  <div
                    style={{
                      width: "50%",
                      position: "relative",
                      padding: "8px 16px 8px 20px",
                      display: "flex",
                      borderRadius: 8,
                      alignItems: "center",
                      background: "#FCFCFC",
                      border: "1px solid #EAEAEA",
                      gap: "5px",
                      color: "rgba(19.75, 25.29, 61.30, 0.40)",
                    }}
                  >
                    <IoIosSearch className="fs-4" />
                    <input
                      type="search"
                      placeholder="Search"
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        fontSize: 14,
                        background: "#FCFCFC",
                        color: "rgba(19.75, 25.29, 61.30, 0.40)",
                      }}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div
                    style={{
                      display: "inline-flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    {/* Export Button */}
                    <button
                      title="Export"
                      onClick={handlePdf}
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 9,
                        padding: "8px 16px",
                        background: "#FCFCFC",
                        borderRadius: 8,
                        outline: "1px solid #EAEAEA",
                        outlineOffset: "-1px",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        fontSize: 14,
                        fontWeight: 400,
                        color: "#0E101A",
                        height: "33px",
                      }}
                    >
                      <TbFileExport className="fs-5 text-secondary" />
                      Export
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div
                className="table-responsive"
                style={{
                  overflowY: "auto",
                  maxHeight: "510px",
                }}
              >
                <table
                  className="table-responsive"
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    overflowX: "auto",
                  }}
                >
                  {/* Header */}
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      height: "38px",
                    }}
                  >
                    <tr style={{ background: "#F3F8FB" }}>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "4px 16px",
                          color: "#727681",
                          fontSize: 14,
                          width: "auto",
                          fontWeight: "400",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <input
                            type="checkbox"
                            style={{ width: 18, height: 18 }}
                            checked={allVisibleSelected}
                            onChange={(e) => {
                              const next = new Set(selectedRowIds);
                              if (e.target.checked) {
                                visibleProducts.forEach((row) => row._id && next.add(row._id));
                              } else {
                                visibleProducts.forEach((row) => row._id && next.delete(row._id));
                              }
                              setSelectedRowIds(next);
                            }}
                          />
                          Product Name & Category
                        </div>
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "4px 16px",
                          color: "#727681",
                          fontSize: 14,
                          width: "auto",
                          fontWeight: "400",
                        }}
                      >
                        Quantity
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "4px 16px",
                          color: "#727681",
                          fontSize: 14,
                          width: "auto",
                          fontWeight: "400",
                        }}
                      >
                        Item Code
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "4px 16px",
                          color: "#727681",
                          fontSize: 14,
                          width: "auto",
                          fontWeight: "400",
                        }}
                      >
                        Purchase Price
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "4px 16px",
                          color: "#727681",
                          fontSize: 14,
                          width: "auto",
                          fontWeight: "400",
                        }}
                      >
                        Selling Price
                      </th>
                      <th
                        style={{
                          textAlign: "center",
                          padding: "4px 16px",
                          color: "#727681",
                          fontSize: 14,
                          width: "auto",
                          fontWeight: "400",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody style={{ overflowY: "auto" }}>
                    {visibleProducts.length === 0 ? (
                      <>
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              padding: "12px 16px",
                              verticalAlign: "middle",
                              textAlign: "center",
                              fontSize: 14,
                              color: "#6C748C",
                              fontStyle: "italic",
                            }}
                          >
                            No Product Data Available
                          </td>
                        </tr>
                      </>
                    ) : (
                      <>
                        {visibleProducts.map((product, index) => (
                          <tr
                            key={index}
                            style={{
                              borderBottom: "1px solid #EAEAEA",
                              height: "46px",
                            }}
                            className={`table-hover ${activeRow === index ? "active-row" : ""}`}
                          >
                            {/* Product Name & Category */}
                            <td
                              style={{
                                padding: "4px 16px",
                                verticalAlign: "middle",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  style={{ width: 18, height: 18 }}
                                  checked={selectedRowIds.has(product._id)}
                                  onChange={(e) => {
                                    const next = new Set(selectedRowIds);
                                    if (e.target.checked) {
                                      if (product._id) next.add(product._id);
                                    } else {
                                      if (product._id) next.delete(product._id);
                                    }
                                    setSelectedRowIds(next);
                                  }}
                                />
                                <a className="avatar avatar-md">
                                  {product?.images?.[0] ? (
                                    <img src={product.images[0].url} alt={product.productName} className="media-image" />
                                  ) : (
                                    <div className="avatar-content">
                                      <span className="avatar-letter" style={{ backgroundColor: "#e0eaffff", color: "#0051aeff", padding: '8px 12px', borderRadius: 4 }}>{product.productName.charAt(0).toUpperCase()}</span>
                                    </div>
                                  )}
                                </a>
                                <div>
                                  <div
                                    style={{
                                      fontSize: 14,
                                      color: "#0E101A",
                                      whiteSpace: "nowrap",
                                      display: "flex",
                                      gap: "5px",
                                      justifyContent: "center",
                                      alignItems: "center",
                                      cursor: "pointer",
                                    }}
                                    // onClick={() => {
                                    //   handleViewMode(true);
                                    //   setSelectedProduct(product)
                                    // }
                                    // }
                                    onClick={() =>
                                      navigate(
                                        `/product/view/${product._id}`, { state: { from: location.pathname } }
                                      )
                                    }
                                  >
                                    <div>
                                      {product.productName}{" "}
                                    </div>
                                    <span
                                      style={{
                                        display: "inline-block",
                                        padding: "4px 8px",
                                        background: "#FFE0FC",
                                        color: "#AE009B",
                                        borderRadius: 36,
                                        fontSize: 12,
                                        marginTop: 4,
                                      }}
                                    >
                                      {product.category?.categoryName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Quantity */}
                            <td
                              style={{
                                padding: "4px 16px",
                                fontSize: 14,
                                color: "#0E101A",
                                cursor: "pointer",
                              }}
                              // onClick={() => {
                              //   handleViewMode(true);
                              //   setSelectedProduct(product)
                              // }
                              // }
                              onClick={() =>
                                navigate(
                                  `/product/view/${product._id}`, { state: { from: location.pathname } }
                                )
                              }
                            >
                              <span style={{ color: product.openingQuantity < product.minStockToMaintain ? "#D8484A" : "#727681" }}>{product.openingQuantity}</span>
                            </td>

                            {/* Item Code */}
                            <td
                              style={{
                                padding: "4px 16px",
                                fontSize: 14,
                                color: "#0E101A",
                              }}
                            >
                              {product.itemBarcode ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    cursor: "pointer",
                                    position: "relative",
                                  }}
                                  onClick={() =>
                                    setViewBarcode(
                                      viewBarcode === index ? false : index
                                    )
                                  }
                                  ref={(el) =>
                                    (buttonRefs.current[index] = el)
                                  }
                                >
                                  {product.itemBarcode}
                                  {product.itemBarcode ? (
                                    <FaBarcode className="fs-6 text-secondary" />
                                  ) : (
                                    "-"
                                  )}
                                </div>
                              ) : (
                                "-"
                              )}
                              {viewBarcode === index && (
                                <>
                                  <div
                                    style={{
                                      position: "fixed",
                                      inset: 0,
                                      background: "rgba(0,0,0,0.5)",
                                      zIndex: 999999,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <div
                                      ref={modelRef}
                                      style={{
                                        width: "70%",
                                        backgroundColor: "#f5f4f4ff",
                                        borderRadius: 16,
                                        padding: 24,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "400px",
                                          height: "auto",
                                          backgroundColor: "white",
                                          outfit: "contain",
                                          boxShadow:
                                            "10px 10px 40px rgba(0,0,0,0.10)",
                                          borderRadius: 16,
                                          padding: 16,
                                          border: "2px solid #dbdbdbff",
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: 8,
                                        }}
                                      >
                                        <span>
                                          {product.productName} /{" "}
                                          {product.purchasePrice}
                                        </span>
                                        <img
                                          src={Barcode}
                                          alt="Barcode"
                                          style={{ width: "100%" }}
                                        />
                                        <div className="d-flex justify-content-center align-items-center">
                                          <span className="fs-2">
                                            {product.itemBarcode}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </td>

                            {/* Purchase Price */}
                            <td
                              style={{
                                padding: "4px 16px",
                                fontSize: 14,
                                color: "#0E101A",
                                cursor: "pointer",
                              }}
                              // onClick={() => {
                              //   handleViewMode(true);
                              //   setSelectedProduct(product)
                              // }
                              // }
                              onClick={() =>
                                navigate(
                                  `/product/view/${product._id}`, { state: { from: location.pathname } }
                                )
                              }
                            >
                              ₹{product.purchasePrice}/-
                            </td>

                            {/* Selling Price */}
                            <td
                              style={{
                                padding: "4px 16px",
                                fontSize: 14,
                                color: "#0E101A",
                                cursor: "pointer",
                              }}
                              // onClick={() => {
                              //   handleViewMode(true);
                              //   setSelectedProduct(product)
                              // }
                              // }
                              onClick={() =>
                                navigate(
                                  `/product/view/${product._id}`, { state: { from: location.pathname } }
                                )
                              }
                            >
                              ₹{product.sellingPrice}/-
                            </td>

                            {/* Actions */}
                            <td
                              style={{
                                padding: "4px 16px",
                                position: "relative",
                                overflow: "visible",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  position: "relative",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  setViewOptions(
                                    viewOptions === index ? false : index
                                  )
                                }
                                ref={(el) => (buttonRefs.current[index] = el)}
                              >
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                  onClick={(e) => {
                                    const rect =
                                      e.currentTarget.getBoundingClientRect();

                                    const dropdownHeight = 260; // your menu height
                                    const spaceBelow =
                                      window.innerHeight - rect.bottom;
                                    const spaceAbove = rect.top;

                                    // decide direction
                                    if (
                                      spaceBelow < dropdownHeight &&
                                      spaceAbove > dropdownHeight
                                    ) {
                                      setOpenUpwards(true);
                                      setDropdownPos({
                                        x: rect.left,
                                        y: rect.top - 6, // position above button
                                      });
                                    } else {
                                      setOpenUpwards(false);
                                      setDropdownPos({
                                        x: rect.left,
                                        y: rect.bottom + 6, // position below button
                                      });
                                    }

                                    setViewOptions(
                                      viewOptions === index ? false : index
                                    );
                                  }}
                                  ref={(el) =>
                                    (buttonRefs.current[index] = el)
                                  }
                                >
                                  <div
                                    style={{
                                      width: 4,
                                      height: 4,
                                      background: "#6C748C",
                                      borderRadius: 2,
                                    }}
                                  />
                                  <div
                                    style={{
                                      width: 4,
                                      height: 4,
                                      background: "#6C748C",
                                      borderRadius: 2,
                                    }}
                                  />
                                  <div
                                    style={{
                                      width: 4,
                                      height: 4,
                                      background: "#6C748C",
                                      borderRadius: 2,
                                    }}
                                  />
                                </div>
                                {viewOptions === index && (
                                  <>
                                    <div
                                      style={{
                                        position: "fixed",
                                        top: openUpwards
                                          ? dropdownPos.y - 190
                                          : dropdownPos.y,
                                        left: dropdownPos.x - 80,
                                        zIndex: 999999,
                                      }}
                                    >
                                      <div
                                        ref={modelRef}
                                        style={{
                                          background: "white",
                                          padding: 8,
                                          borderRadius: 12,
                                          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                          minWidth: 180,
                                          height: "auto", // height must match dropdownHeight above
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: 4,
                                        }}
                                      >
                                        <div
                                          onClick={() =>
                                            navigate(
                                              `/product/edit/${product._id}`, { state: { from: location.pathname } }
                                            )
                                          }
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "none",
                                            cursor: "pointer",
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: 16,
                                            fontWeight: 400,
                                            color: "#6C748C",
                                            textDecoration: "none",
                                          }}
                                          className="button-action"
                                        >
                                          <img src={edit} alt="" />
                                          <span style={{ color: "black" }}>
                                            Edit
                                          </span>
                                        </div>
                                        <div
                                          // onClick={() => {
                                          //   handleViewMode();
                                          //   setSelectedProduct(product);
                                          // }}
                                          onClick={() =>
                                            navigate(
                                              `/product/view/${product._id}`, { state: { from: location.pathname } }
                                            )
                                          }
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "none",
                                            cursor: "pointer",
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: 16,
                                            fontWeight: 400,
                                            color: "#6C748C",
                                            textDecoration: "none",
                                          }}
                                          className="button-action"
                                        >
                                          <img src={viewdetails} alt="" />
                                          <span style={{ color: "black" }}>
                                            View Details
                                          </span>
                                        </div>
                                        <div
                                          to="/m/editproduct"
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "none",
                                            cursor: "pointer",
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: 16,
                                            fontWeight: 400,
                                            color: "#6C748C",
                                            textDecoration: "none",
                                          }}
                                          className="button-action"
                                        >
                                          <img src={stockin} alt="" />
                                          <span style={{ color: "black" }}>
                                            Stock In
                                          </span>
                                        </div>
                                        <div
                                          to="/m/editproduct"
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "none",
                                            cursor: "pointer",
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: 16,
                                            fontWeight: 400,
                                            color: "#6C748C",
                                            textDecoration: "none",
                                          }}
                                          className="button-action"
                                        >
                                          <img src={stockout} alt="" />
                                          <span style={{ color: "black" }}>
                                            Stock Out
                                          </span>
                                        </div>
                                        <div
                                          to="/m/editproduct"
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "none",
                                            cursor: "pointer",
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: 16,
                                            fontWeight: 400,
                                            color: "#6C748C",
                                            textDecoration: "none",
                                          }}
                                          className="button-action"
                                        >
                                          <img src={duplicate} alt="" />
                                          <span style={{ color: "black" }}>
                                            Duplicate
                                          </span>
                                        </div>
                                        <div
                                          onClick={() =>
                                            handleDelete(product._id)
                                          }
                                          style={{
                                            display: "flex",
                                            justifyContent: "flex-start",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            border: "none",
                                            cursor: "pointer",
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: 16,
                                            fontWeight: 400,
                                            color: "#6C748C",
                                            textDecoration: "none",
                                          }}
                                          className="button-action"
                                        >
                                          <img src={deletebtn} alt="" />
                                          <span style={{ color: "black" }}>
                                            Delete
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="page-redirect-btn px-2">
                <Pagination
                  currentPage={currentPage}
                  total={total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(p) => setCurrentPage(p)}
                  onItemsPerPageChange={(n) => {
                    setItemsPerPage(n);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* horizontal section */}
            <div
              style={{
                display: "flex",
                gap: 16,
                fontFamily: "Inter, sans-serif",
                height: "calc(100vh - 155px)",
              }}
            >
              {/* Left Sidebar */}
              <div
                style={{
                  width: 300,
                  background: "white",
                  borderRadius: 16,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  overflowY: "auto",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
                  All Products
                </h3>

                <div
                  style={{
                    position: "relative",
                    padding: "8px 16px 8px 10px",
                    background: "#FCFCFC",
                    border: "1px solid #EAEAEA",
                    borderRadius: 8,
                  }}
                >
                  <IoIosSearch />
                  <input
                    type="text"
                    placeholder="Search"
                    value={leftSearch}
                    onChange={(e) => setLeftSearch(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: 14,
                      color: "#727681",
                      background: 'transparent'
                    }}
                  />
                </div>

                <hr style={{ border: "1px solid #EAEAEA", margin: 0 }} />

                {/* Product List */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  {(filteredAllProducts.length
                    ? filteredAllProducts
                    : allProducts
                  ).map((p) => (
                    <div
                      key={p._id}
                      style={{
                        padding: "8px 12px",
                        background:
                          selectedProduct && selectedProduct._id === p._id
                            ? "#F6FAFF"
                            : "white",
                        borderBottom: "1px solid #EAEAEA",
                        borderRadius: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                      onClick={() => setSelectedProduct(p)}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          color: "#0E101A",
                          fontWeight: 400,
                        }}
                      >
                        {p.productName}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 14,
                          color: "#727681",
                        }}
                      >
                        <span>₹{p.sellingPrice}/-</span>
                        <span>Qty - <span style={{ color: p.openingQuantity < p.minStockToMaintain ? "#D8484A" : "#727681" }}>{p.openingQuantity}</span></span>
                      </div>
                    </div>
                  ))}
                  {filteredAllProducts.length === 0 ? (
                    <div style={{ padding: "0px 10px", color: "#727681", fontStyle: "italic" }}>
                      No products found
                    </div>
                  ) : allProducts.length === 0 ? (
                    <div style={{ padding: "0px 10px", color: "#727681", fontStyle: "italic" }}>
                      No products found
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Right Main Content */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  overflowY: "auto",
                }}
              >
                {selectedProduct ? (
                  <>
                    {/* Overview Card */}
                    <div
                      style={{
                        background: "white",
                        borderRadius: 16,
                        padding: 16,
                        border: "1px solid #EAEAEA",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <h3
                          style={{ margin: 0, fontSize: 16, fontWeight: 500 }}
                        >
                          Overview
                        </h3>
                        <div
                          style={{
                            padding: "4px 6px",
                            background: "#1F7FFF",
                            color: "white",
                            borderRadius: 4,
                            border: "none",
                            fontSize: 14,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            cursor: "pointer",
                            justifyContent: "center",
                            position: "relative",
                          }}
                          onClick={handleViewManage}
                        >
                          <div
                            style={{
                              background: "#1F7FFF",
                              color: "white",
                              border: "none",
                              outline: "none",
                            }}
                          >
                            <span>Manage </span>
                            <IoIosArrowDown />
                          </div>
                          {viewManageOptions && (
                            <>
                              <div
                                style={{
                                  position: "absolute",
                                  top: "40px",
                                  left: "-90px",
                                  zIndex: 999999,
                                }}
                              >
                                <div
                                  ref={manageRef}
                                  style={{
                                    background: "white",
                                    padding: 8,
                                    borderRadius: 12,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    minWidth: 180,
                                    height: "auto", // height must match dropdownHeight above
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                  }}
                                >
                                  <div
                                    onClick={() =>
                                      selectedProduct &&
                                      navigate(
                                        `/product/edit/${selectedProduct._id}`, { state: { from: location.pathname } }
                                      )
                                    }
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-start",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "8px 12px",
                                      borderRadius: 8,
                                      border: "none",
                                      cursor: "pointer",
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: 16,
                                      fontWeight: 400,
                                      color: "#6C748C",
                                      textDecoration: "none",
                                    }}
                                    className="button-action"
                                  >
                                    <img src={edit} alt="" />
                                    <span style={{ color: "black" }}>
                                      Edit
                                    </span>
                                  </div>
                                  <div
                                    to="/m/editproduct"
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-start",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "8px 12px",
                                      borderRadius: 8,
                                      border: "none",
                                      cursor: "pointer",
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: 16,
                                      fontWeight: 400,
                                      color: "#6C748C",
                                      textDecoration: "none",
                                    }}
                                    className="button-action"
                                  >
                                    <img src={stockin} alt="" />
                                    <span style={{ color: "black" }}>
                                      Stock In
                                    </span>
                                  </div>
                                  <div
                                    to="/m/editproduct"
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-start",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "8px 12px",
                                      borderRadius: 8,
                                      border: "none",
                                      cursor: "pointer",
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: 16,
                                      fontWeight: 400,
                                      color: "#6C748C",
                                      textDecoration: "none",
                                    }}
                                    className="button-action"
                                  >
                                    <img src={stockout} alt="" />
                                    <span style={{ color: "black" }}>
                                      Stock Out
                                    </span>
                                  </div>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(selectedProduct._id);
                                    }}
                                    style={{
                                      display: "flex",
                                      justifyContent: "flex-start",
                                      alignItems: "center",
                                      gap: 8,
                                      padding: "8px 12px",
                                      borderRadius: 8,
                                      border: "none",
                                      cursor: "pointer",
                                      fontFamily: "Inter, sans-serif",
                                      fontSize: 16,
                                      fontWeight: 400,
                                      color: "#6C748C",
                                      textDecoration: "none",
                                    }}
                                    className="button-action"
                                  >
                                    <img src={deletebtn} alt="" />
                                    <span style={{ color: "black" }}>
                                      Delete
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 4,
                          padding: 4,
                          border: "1px solid #EAEAEA",
                          borderRadius: 8,
                        }}
                      >
                        {[
                          [
                            "Total Revenue",
                            "₹" + (selectedProduct.sellingPrice - selectedProduct.purchasePrice) * selectedProduct.openingQuantity,
                          ],
                          ["Total Order", "-"],
                          ["Available Quantity", selectedProduct.openingQuantity < selectedProduct.minStockToMaintain ? <span style={{ color: "#D8484A" }}>{selectedProduct.openingQuantity}</span> : <span style={{ color: "black" }}>{selectedProduct.openingQuantity}</span>],
                          [
                            "Profit Per Items",
                            "₹" +
                            (selectedProduct.sellingPrice -
                              selectedProduct.purchasePrice),
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            style={{
                              padding: 12,
                              background: "white",
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                              borderRight: "1px solid #EAEAEA",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "start",
                                textAlign: "left",
                                width: "100%",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 22,
                                  fontWeight: 500,
                                  color: "#0E101A",
                                  width: "10%",
                                }}
                              ></div>
                              <div
                                style={{
                                  fontSize: 22,
                                  fontWeight: 500,
                                  color: "#0E101A",
                                  width: "50%",
                                }}
                              >
                                <div
                                  style={{ color: "#727681", fontSize: 14 }}
                                >
                                  {label}
                                </div>
                                <span>{value || "-"}</span>
                              </div>
                              {/* <div style={{ fontSize: 14, color: 'black', width: '40%', position: 'relative', top: '10px' }}>+15%</div> */}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tabs + Details + Images */}
                      <div style={{ display: "flex", gap: 16 }}>
                        {/* Left: Tabs & Details */}
                        <div style={{ flex: 1 }}>
                          {/* tabs */}
                          <div
                            style={{
                              display: "flex",
                              borderBottom: "1px solid #EAEAEA",
                              marginBottom: 16,
                            }}
                          >
                            {[
                              "Basic Details",
                              "Other Details",
                              "Pricing",
                            ].map((tab) => (
                              <div
                                key={tab}
                                style={{
                                  padding: "6px 12px",
                                  borderBottom:
                                    tab === detailsTab
                                      ? "1px solid #1F7FFF"
                                      : "none",
                                  color:
                                    tab === detailsTab
                                      ? "#1F7FFF"
                                      : "#727681",
                                  fontSize: 16,
                                  cursor: "pointer",
                                }}
                                onClick={() => setDetailsTab(tab)}
                              >
                                {tab}
                              </div>
                            ))}
                          </div>

                          {detailsTab === "Basic Details" && (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: 16,
                                flexWrap: "wrap",
                              }}
                            >
                              {[
                                ["Name:", selectedProduct.productName],
                                [
                                  "Category:",
                                  selectedProduct.category?.categoryName + " -> " + selectedProduct.subcategory?.name,
                                ],
                                ["HSN:", selectedProduct.hsn?.hsnCode || "-"],
                                [
                                  "Item Code:",
                                  <span
                                    key="code"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}

                                  >
                                    <div
                                      style={{ cursor: "pointer" }}
                                      onClick={() => setBarcodeModal(selectedProduct)}
                                    >
                                      {selectedProduct.itemBarcode}
                                    </div>
                                    {barcodeModal && (
                                      <div
                                        style={{
                                          position: "fixed",
                                          inset: 0,
                                          background: "rgba(0,0,0,0.5)",
                                          zIndex: 999999,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                        onClick={() => setBarcodeModal(null)}
                                      >
                                        <div style={{
                                          width: "70%",
                                          backgroundColor: "#f5f4f4ff",
                                          borderRadius: 16,
                                          padding: 24,
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}>
                                          <div
                                            style={{
                                              width: "400px",
                                              height: "auto",
                                              backgroundColor: "white",
                                              outfit: "contain",
                                              boxShadow:
                                                "10px 10px 40px rgba(0,0,0,0.10)",
                                              borderRadius: 16,
                                              padding: 16,
                                              border: "2px solid #dbdbdbff",
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: 8,
                                            }}
                                          >
                                            <span>
                                              {barcodeModal.productName} /{" "}
                                              {barcodeModal.purchasePrice}
                                            </span>
                                            <img
                                              src={Barcode}
                                              alt="Barcode"
                                              style={{ width: "100%" }}
                                            />
                                            <div className="d-flex justify-content-center align-items-center">
                                              <span className="fs-2">
                                                {barcodeModal.itemBarcode}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {selectedProduct.itemBarcode ? (
                                      <FaBarcode className="fs-6 text-secondary" />
                                    ) : (
                                      <span>-</span>
                                    )}
                                  </span>,
                                ],
                                [
                                  "Available Qty:",
                                  selectedProduct.openingQuantity < selectedProduct.minStockToMaintain ? <span style={{ color: "#D8484A" }}>{selectedProduct.openingQuantity}</span> : <span style={{ color: "black" }}>{selectedProduct.openingQuantity}</span>,
                                ],
                                [
                                  "Min. Stock to Maintain:",
                                  selectedProduct.minStockToMaintain,
                                ],
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 16,
                                  }}
                                >
                                  <span style={{ color: "#727681" }}>
                                    {label}
                                  </span>
                                  <span style={{ color: "#0E101A" }}>
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {detailsTab === "Other Details" && (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 1fr",
                                gap: 16,
                                flexWrap: "wrap",
                              }}
                            >
                              {[
                                [
                                  "MRP:",
                                  "₹" + selectedProduct.mrp + "/-",
                                ],
                                ["Batch No.:", selectedProduct.lotDetails?.fabricBatchNo],
                                ["Model No.:", selectedProduct.lotDetails?.lotNo],
                                [
                                  "Mfg Date:",
                                  <span
                                    key="code"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                    }}
                                  >
                                    {(
                                      selectedProduct.lotDetails?.productionDate
                                    )}
                                  </span>,
                                ],
                                ["Design Code:", selectedProduct.lotDetails?.designCode],
                                ["Quantity:", selectedProduct.lotDetails?.quantity],
                              ].map(([label, value]) => (
                                <div
                                  key={label}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    fontSize: 16,
                                  }}
                                >
                                  <span style={{ color: "#727681" }}>
                                    {label}
                                  </span>
                                  <span style={{ color: "#0E101A" }}>
                                    {value || "-"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {detailsTab === "Pricing" && (
                            <>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr 1fr",
                                  gap: 16,
                                  flexWrap: "wrap",
                                }}
                              >
                                {[
                                  [
                                    "Purchase Pricing:",
                                    selectedProduct.purchasePrice,
                                  ],
                                  [
                                    "Selling Price:",
                                    selectedProduct.sellingPrice,
                                  ],
                                  [
                                    "Profit:",
                                    selectedProduct.sellingPrice -
                                    selectedProduct.purchasePrice,
                                  ],
                                  [
                                    "Profit Margin:",
                                    selectedProduct.sellingPrice -
                                    selectedProduct.purchasePrice,
                                  ],
                                ].map(([label, value]) => (
                                  <div
                                    key={label}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      fontSize: 16,
                                    }}
                                  >
                                    <span style={{ color: "#727681" }}>
                                      {label}
                                    </span>
                                    <span style={{ color: "#0E101A" }}>
                                      ₹{value || "-"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div
                                style={{
                                  borderTop: "1px solid #EAEAEA",
                                  marginTop: "10px",
                                }}
                              >
                                <div
                                  style={{
                                    marginTop: "10px",
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    gap: 16,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      fontSize: 16,
                                    }}
                                  >
                                    <span style={{ color: "#727681" }}>
                                      Tax:{" "}
                                    </span>
                                    <span style={{ color: "#0E101A" }}>
                                      GST @ {selectedProduct.tax} %
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      fontSize: 16,
                                    }}
                                  >
                                    <span style={{ color: "#727681" }}>
                                      Discount:{" "}
                                    </span>
                                    <span style={{ color: "#0E101A" }}>
                                      {selectedProduct.discountType === "Percentage" ? (
                                        `${selectedProduct.discountAmount}%`
                                      ) : selectedProduct.discountType === "Fixed" ? (
                                        `₹${selectedProduct.discountAmount}`
                                      ) : (
                                        "-"
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Right: Images */}
                        <div style={{ display: "flex", gap: 20 }}>
                          {selectedProduct.images?.[0] && (
                            <div
                              style={{
                                width: "160px",
                                height: "160px",
                                borderRadius: 8,
                                objectFit: "cover",
                                border: "1px solid #EAEAEA",
                              }}
                            >
                              <img
                                src={selectedProduct.images[0].url}
                                alt={selectedProduct.productName}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: 8,
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          )}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)",
                              gap: 8,
                              width: "150px",
                            }}
                          >
                            {selectedProduct.images?.[1] && (
                              <div
                                style={{
                                  width: "70px",
                                  height: "70px",
                                  borderRadius: 8,
                                  border: "1px solid #EAEAEA",
                                }}
                              >
                                <img
                                  src={selectedProduct.images[1].url}
                                  alt={selectedProduct.productName}
                                  style={{
                                    borderRadius: 6,
                                    outFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                  }}
                                />
                              </div>
                            )}
                            {selectedProduct.images?.[2] && (
                              <div
                                style={{
                                  width: "70px",
                                  height: "70px",
                                  borderRadius: 8,
                                  border: "1px solid #EAEAEA",
                                }}
                              >
                                <img
                                  src={selectedProduct.images[2].url}
                                  alt={selectedProduct.productName}
                                  style={{
                                    borderRadius: 6,
                                    outFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                  }}
                                />
                              </div>
                            )}
                            {selectedProduct.images?.[3] && (
                              <div
                                style={{
                                  width: "70px",
                                  height: "70px",
                                  borderRadius: 8,
                                  border: "1px solid #EAEAEA",
                                }}
                              >
                                <img
                                  src={selectedProduct.images[3].url}
                                  alt={selectedProduct.productName}
                                  style={{
                                    borderRadius: 6,
                                    outFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                  }}
                                />
                              </div>
                            )}
                            <div
                              style={{
                                position: "relative",
                                borderRadius: 6,
                                height: "70px",
                                overflow: "hidden",
                              }}
                            >
                              {selectedProduct.images?.[4] && (
                                <img
                                  src={selectedProduct.images[4].url}
                                  alt={selectedProduct.productName}
                                  style={{
                                    borderRadius: 6,
                                    outFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                  }}
                                />
                              )}
                              {selectedProduct.images?.length > 4 ? (
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "rgba(0,0,0,0.22)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontSize: 32,
                                    fontWeight: 500,
                                  }}
                                >
                                  {selectedProduct.images?.length - 4 > 4
                                    ? "+"(selectedProduct.images?.length - 4)
                                    : ""}
                                </div>
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transactions */}
                    <div
                      style={{
                        flex: 1,
                        background: "white",
                        borderRadius: 16,
                        padding: 16,
                        border: "1px solid #EAEAEA",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <h3
                        style={{ margin: 0, fontSize: 16, fontWeight: 500 }}
                      >
                        Transactions
                      </h3>

                      {/* Tabs */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            background: "#E5F0FF",
                            borderRadius: 8,
                            padding: 2,
                            gap: 8,
                            flexWrap: "wrap",
                            height: "38px",
                          }}
                        >
                          {[
                            "Inventory timeline",
                            "Sales-wise",
                            "Purchase-wise",
                            "Added & Removed",
                          ].map((tab, i) => (
                            <div
                              key={tab}
                              style={{
                                padding: "6px 12px",
                                background: i === 0 ? "white" : "transparent",
                                borderRadius: 8,
                                boxShadow:
                                  i === 0
                                    ? "0px 1px 4px rgba(0,0,0,0.1)"
                                    : "none",
                                fontSize: 14,
                                color: "#0E101A",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              {tab.split(" ")[0]}
                              <span style={{ color: "#727681" }}>
                                {[156, 91, 52, 10][i]}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div
                          className="position-relative"
                          style={{ width: "210px" }}
                        >
                          {/* Calendar Icon */}
                          <span
                            style={{
                              position: "absolute",
                              left: "13px",
                              top: "45%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                              zIndex: 10,
                              fontSize: "18px",
                              color: "black",
                            }}
                          >
                            <LuCalendarMinus2 />
                          </span>

                          {/* Date Input */}
                          <DatePicker
                            selected={date}
                            onChange={(d) => setDate(d)}
                            placeholderText="15 Mar - 22 Mar"
                            dateFormat="dd/MM/yyyy"
                            className="form-select supplierinput  duedateinput shadow-none"
                            popperPlacement="bottom-start"
                          />
                        </div>
                      </div>

                      {/* Table */}
                      <div style={{ overflowY: "auto" }}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: 800,
                          }}
                        >
                          <thead
                            style={{ background: "#E5F0FF", height: "38px" }}
                          >
                            <tr>
                              {[
                                "Date",
                                "Transaction Type",
                                "Transaction ID",
                                "Customer / Supplier",
                                "Stock In / Out",
                                "Amount",
                              ].map((h) => (
                                <th
                                  key={h}
                                  style={{
                                    textAlign: "left",
                                    padding: "4px 16px",
                                    color: "#727681",
                                    fontSize: 14,
                                    fontWeight: "500",
                                  }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((t, i) => (
                              <tr
                                key={i}
                                style={{ borderBottom: "1px solid #FCFCFC" }}
                              >
                                <td
                                  style={{
                                    padding: "8px 16px",
                                    fontSize: 14,
                                    color: "#0E101A",
                                  }}
                                >
                                  {t.date}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 16px",
                                    fontSize: 14,
                                    color: "#0E101A",
                                  }}
                                >
                                  {t.type}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 16px",
                                    fontSize: 14,
                                    color: "#0E101A",
                                  }}
                                >
                                  {t.id}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 16px",
                                    fontSize: 14,
                                    color: "#0E101A",
                                  }}
                                >
                                  {t.party}
                                </td>
                                <td
                                  style={{
                                    padding: "8px 16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 16,
                                      fontWeight: 600,
                                      color:
                                        t.stock > 0 ? "#0D6828" : "#D00003",
                                    }}
                                  >
                                    {Math.abs(t.stock)}
                                  </span>
                                  <span
                                    style={{ fontSize: 14, color: "#0E101A" }}
                                  >
                                    {t.stock > 0 ? "Stock In" : "Stock Out"}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "8px 16px",
                                    fontSize: 14,
                                    color: "#0E101A",
                                  }}
                                >
                                  {t.amount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: 16,
                      border: "1px solid #EAEAEA",
                      color: "#727681",
                    }}
                  >
                    No product selected
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        itemName="product"
      />

    </>
  );
};

export default Product;
