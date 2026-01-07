import React, { useEffect, useState } from "react";

import "../../../styles/style.css";
import NoImg from "../../../assets/img/no_user.png";
import {
  TbAlertTriangle,
  TbBox,
  TbBrandPocket,
  TbChartPie,
  TbFileText,
  TbGift,
  TbHash,
  TbInfoCircle,
  TbLifebuoy,
  TbRepeat,
  TbShoppingCart,
  TbUserCheck,
  TbUsers,
} from "react-icons/tb";
import { RiArrowDownSLine } from "react-icons/ri";
import { FaLayerGroup } from "react-icons/fa";
import { FcExpired } from "react-icons/fc";
import { getTotalStockValue } from "../../../utils/getTotalStockValue";
import axios from "axios";
import Graph from "../../Graph";
import BASE_URL from "../../../pages/config/config";
import PaymentStatusChart from "../graph/PaymentStatusChart";
import SalesGraph from "../graph/SalesGraph";
import { Link, useNavigate } from "react-router-dom";
import { GrTransaction } from "react-icons/gr";
import { useTranslation } from "react-i18next";


// New Redesigne
import { MdUpdate } from "react-icons/md";
// import { useNavigate } from "react-router-dom";
import dashcard_icon1 from "../../../assets/images/dashcard-1.png";
import dashcard_icon2 from "../../../assets/images/dashcard-2.png";
import dashcard_icon3 from "../../../assets/images/dashcard-3.png";
import dashcard_icon4 from "../../../assets/images/dashcardd-4.png";
import dashcard_icon5 from "../../../assets/images/dashcard-5.png";
import dashcard_icon6 from "../../../assets/images/dashcard-6.png";
import dashcard_icon7 from "../../../assets/images/dashcard-7.png";
import dashcard_icon8 from "../../../assets/images/dashcard-8.png";
import advertisment_ims from "../../../assets/images/munc-dahsboard-img.png";
import i_icon from "../../../assets/images/i.png";
import time from "../../../assets/images/time.png";
import select_range_date from "../../../assets/images/select-date.png";
import p_1 from "../../../assets/images/p-1.png";
import p_2 from "../../../assets/images/p-2.png";
import p_3 from "../../../assets/images/p-3.png";
import p_4 from "../../../assets/images/p-4.png";
import p_5 from "../../../assets/images/p-5.png";
import { Line } from "react-chartjs-2";
import { Bar } from "react-chartjs-2";
import "../../../styles/Responsive.css";
import "../../../styles/Dashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { he } from "date-fns/locale";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

import api from "../../../pages/config/axiosInstance"
import { useAuth } from "../../auth/AuthContext"

const data = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Retailer",
      data: [90, 50, 150, 60, 120, 70, 150, 100], // from your image
      borderColor: "#00a76f",
      backgroundColor: "#00a76f",
      fill: false,
      pointRadius: 4,
      pointBackgroundColor: "#00a76f",
      pointBorderWidth: 0,
    },
    {
      label: "Wholesaler",
      data: [50, 80, 30, 5, 140, 170, 70], // from your image
      borderColor: "#B1EE23",
      backgroundColor: "#B1EE23",
      fill: false,
      pointRadius: 4,
    },
  ],
};
const datas = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Total Sales",
      data: [90, 50, 150, 60, 120, 70, 150, 100], // from your image
      borderColor: "#7313AA",
      backgroundColor: "#7313AA",
      fill: false,
      pointRadius: 4,
      pointBackgroundColor: "#7313AA",
      pointBorderWidth: 0,
    },
    {
      label: "Profit Earned",
      data: [50, 80, 30, 5, 140, 170, 70], // from your image
      borderColor: "#EE23B1",
      backgroundColor: "#EE23B1",
      fill: false,
      pointRadius: 4,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { display: false },
  },

  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: "#727681",
        font: { size: 14, family: "Inter", weight: 500 },
      },
    },
    y: {
      border: {
        display: false,
      },
      position: "right",
      grid: { display: false },
      min: 0,
      max: 200,
      ticks: {
        stepSize: 50,
        color: "#727681",
        font: {
          size: 14,
          weight: 500,
          family: "Inter",
        },
        callback: (value) => `₹${value}k`,
      },
    },
  },
};

const datasThree = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Purchase Orders",
      data: [90, 160, 180, 110, 100, 150, 60],
      backgroundColor: "#F9E2D9",
      borderRadius: 4,

      barPercentage: 0.8,
      categoryPercentage: 0.5,
    },
    {
      label: "Sales Orders",
      data: [140, 10, 50, 100, 200, 190, 150],
      backgroundColor: "#FF8F1F",
      borderRadius: 4,
      barPercentage: 0.8,
      categoryPercentage: 0.5,
    },
  ],
};
const datasFour = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "New Customers",
      data: [90, 160, 180, 110, 100, 150, 60],
      backgroundColor: "#DDE9F9",
      borderRadius: 4,

      barPercentage: 0.8,
      categoryPercentage: 0.5,
    },
    {
      label: "Returning Customers",
      data: [140, 10, 50, 100, 200, 190, 150],
      backgroundColor: "#1F7FFF",
      borderRadius: 4,
      barPercentage: 0.8,
      categoryPercentage: 0.5,
    },
  ],
};
const optionssThree = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false, // remove axis border
      },
      ticks: {
        color: "#6C748C",
        font: {
          size: 14,
          weight: 500,
          family: "Inter",
        },
      },
    },
    y: {
      border: {
        display: false,
      },
      position: "right",
      grid: {
        display: false,
        drawBorder: false, // remove axis border
      },
      min: 0,
      max: 200,
      ticks: {
        stepSize: 50,
        color: "#6C748C",
        font: {
          size: 14,
          weight: 500,
          family: "Inter",
        },
        callback: (value) => `₹${value}k`,
      },
    },
  },
};

const trackPurchaseOrder = [
  {
    supplier: "WeaveX Fabrics",
    deliverIn: "23 Days",
    status: "Processing",
    total: "₹ 1,485.22/-",
  },
  {
    supplier: "WeaveX Fabrics",
    deliverIn: "23 Days",
    status: "Delivered",
    total: "₹ 1,485.22/-",
  },
  {
    supplier: "WeaveX Fabrics",
    deliverIn: "23 Days",
    status: "Cancelled",
    total: "₹ 1,485.22/-",
  },
  {
    supplier: "WeaveX Fabrics",
    deliverIn: "23 Days",
    status: "Processing",
    total: "₹ 1,485.22/-",
  },
  {
    supplier: "WeaveX Fabrics",
    deliverIn: "23 Days",
    status: "Cancelled",
    total: "₹ 1,485.22/-",
  },
];
const recentOrder = [
  {
    orderId: "WeaveX Fabrics",
    customer: "Kasim Siddique",
    noOfItems: "23",
    status: "Pending",
    paymentMethod: "UPI",
    total: "₹ 1,485.22/-",
  },
  {
    orderId: "WeaveX Fabrics",
    customer: "Kasim Siddique",
    noOfItems: "23",
    status: "Pending",
    paymentMethod: "UPI",
    total: "₹ 1,485.22/-",
  },
  {
    orderId: "WeaveX Fabrics",
    customer: "Kasim Siddique",
    noOfItems: "23",
    status: "Pending",
    paymentMethod: "UPI",
    total: "₹ 1,485.22/-",
  },
  {
    orderId: "WeaveX Fabrics",
    customer: "Kasim Siddique",
    noOfItems: "23",
    status: "Success",
    paymentMethod: "UPI",
    total: "₹ 1,485.22/-",
  },
  {
    orderId: "WeaveX Fabrics",
    customer: "23 Days",
    noOfItems: "23",
    status: "Pending",
    paymentMethod: "UPI",
    total: "₹ 1,485.22/-",
  },
];

const AdminDashboard = () => {
  const { users } = useAuth()
  const { t } = useTranslation();
  //transaction
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sale");
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [activeTransactionTab, setActiveTransactionTab] = useState("sales");
  // const [recentPurchases, setRecentPurchases] = useState([]);
  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const userObj = users
  const userId = userObj?.id || userObj?._id; // Handle both id and _id


  const [totalInvoiceDue, setTotalInvoiceDue] = useState(0);
  const [invoiceDueCount, setInvoiceDueCount] = useState(0);
  const [invoiceDueGrowth, setInvoiceDueGrowth] = useState(0);
  const [totalPurchaseReturnValue, setTotalPurchaseReturnValue] = useState(0);
  const [totalSupplier, setTotalSupplier] = useState(0);
  const [totalCustomer, setTotalCustomer] = useState(0);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [totalReturnAmount, setTotalReturnAmount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [totalSaleValue, setTotalSaleValue] = useState(0);
  const [totalSalesReturnValue, setTotalSalesReturnValue] = useState(0);
  const [totalDebitNoteAmount, setTotalDebitNoteAmount] = useState(0);
  const [totalDebitNoteCount, setTotalDebitNoteCount] = useState(0);
  const [totalExpensesAmount, setTotalExpensesAmount] = useState(0);
  const [totalExpensesCount, setTotalExpensesCount] = useState(0);
  const [products, setProducts] = useState([]);
  //Total Inventry Value
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [warned, setWarned] = useState(false);

  const [allSales, setAllSales] = useState([]);
  const [allPurchases, setAllPurchases] = useState([]);
  // console.log("All Sales:", allPurchases);
  const [allSalesReturns, setAllSalesReturns] = useState([]);
  const [allPurchaseReturns, setAllPurchaseReturns] = useState([]);

  // Separate time filters for each section
  const [recentSalesFilter, setRecentSalesFilter] = useState("weekly");
  const [topSellingFilter, setTopSellingFilter] = useState("weekly");
  const [recentTransactionsFilter, setRecentTransactionsFilter] =
    useState("weekly");
  const [newlyAddedProducts, setNewlyAddedProducts] = useState([]);
  const [avgSelling, setAvgSelling] = useState(0);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);




  console.log(recentSales, "recentSales before filtering");
  console.log(
    recentSales.map((s) => s.createdAt),
    "createdAt values"
  );
  console.log(recentSalesFilter, "recentSalesFilter value");




  const filteredSales = recentSales.filter((sale) => {
    if (!sale.createdAt) return false;
    const saleDate = new Date(sale.createdAt);
    const now = new Date();
    if (recentSalesFilter === "today") {
      return saleDate.toDateString() === now.toDateString();
    }
    if (recentSalesFilter === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return saleDate >= oneWeekAgo && saleDate <= now;
    }
    if (recentSalesFilter === "monthly") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return saleDate >= oneMonthAgo && saleDate <= now;
    }
    return true;
  });

  // Helper to get absolute loss value
  const getLoss = () => {
    const profit = getProfit();
    return profit < 0 ? Math.abs(profit) : 0;
  };

  // Profit/Loss calculation based on price and quantity
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        const products = res.data.products || res.data || [];
        console.log("dfdf", products);

        // ⭐ TOTAL INVENTORY VALUE
        const totalValue = products.reduce((sum, p) => {
          const qty = Number(p.quantity) || 0;
          const price = Number(p.sellingPrice) || 0;
          return sum + qty * price;
        }, 0);
        setTotalInventoryValue(totalValue);

        // ⭐ EXPIRED PRODUCT LOGIC
        const expired = products.filter((product) => {
          const expiryArr =
            product.variants?.get?.("Expire") || product.variants?.["Expire"];

          if (!expiryArr || expiryArr.length === 0) return false;

          return expiryArr.some((dateStr) => {
            const [day, month, year] = dateStr.split("-").map(Number);
            if (!day || !month || !year) return false;

            const expDate = new Date(year, month - 1, day);
            const today = new Date();

            return expDate < today;
          });
        });
        setExpiredProducts(expired);

        // ⭐ NEWLY ADDED PRODUCTS (Last 3 Days)
        const today = new Date();
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(today.getDate() - 3);

        const newlyAdded = products.filter((p) => {
          if (!p.createdAt) return false;
          const created = new Date(p.createdAt);
          return created >= threeDaysAgo && created <= today;
        });
        setNewlyAddedProducts(newlyAdded);

        // ⭐ AVERAGE SELLING PRICE
        let count = products.length;
        let totalSellingPrice = products.reduce((sum, p) => {
          return sum + (Number(p.sellingPrice) || 0);
        }, 0);
        let average = count > 0 ? totalSellingPrice / count : 0;
        setAvgSelling(Math.round(average));

        // ⭐ OUT OF STOCK PRODUCTS
        const outOfStock = products.filter((p) => Number(p.quantity) === 0);
        setOutOfStockProducts(outOfStock);

      } catch (err) {
        setExpiredProducts([]);
        setNewlyAddedProducts([]);
        setOutOfStockProducts([]);
      } finally {
        setExpiredLoading(false);
      }
    };

    fetchProducts();
  }, []);



  const filteredPurchases = recentPurchases.filter((purchase) => {
    if (!purchase.createdAt) return false;
    const purchaseDate = new Date(purchase.createdAt);
    const now = new Date();
    if (recentTransactionsFilter === "today") {
      return purchaseDate.toDateString() === now.toDateString();
    }
    if (recentTransactionsFilter === "weekly") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return purchaseDate >= oneWeekAgo && purchaseDate <= now;
    }
    if (recentTransactionsFilter === "monthly") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return purchaseDate >= oneMonthAgo && purchaseDate <= now;
    }
    return true;
  });
  const getProfit = () => {
    // Calculate total purchase cost
    let totalPurchase = 0;
    if (Array.isArray(filteredPurchases)) {
      filteredPurchases.forEach((purchase) => {
        if (Array.isArray(purchase.products)) {
          purchase.products.forEach((prod) => {
            totalPurchase +=
              (Number(prod.purchasePrice) || 0) * (Number(prod.quantity) || 0);
          });
        }
      });
    }
    // Calculate total sales revenue
    let totalSales = 0;
    if (Array.isArray(filteredSales)) {
      filteredSales.forEach((sale) => {
        if (Array.isArray(sale.products)) {
          sale.products.forEach((prod) => {
            totalSales +=
              (Number(prod.sellingPrice) || 0) * (Number(prod.saleQty) || 0);
          });
        }
      });
    }
    // Profit = Total Sales - Total Purchase
    return totalSales - totalPurchase;
  };

  const topSellingProducts = (() => {
    const productSales = {};
    console.log("all sales", allSales);

    const filteredTopSales = allSales.filter((sale) => {
      if (!sale.createdAt) return false;
      const saleDate = new Date(sale.createdAt);
      const now = new Date();
      if (topSellingFilter === "today") {
        return saleDate.toDateString() === now.toDateString();
      }
      if (topSellingFilter === "weekly") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return saleDate >= oneWeekAgo && saleDate <= now;
      }
      if (topSellingFilter === "monthly") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return saleDate >= oneMonthAgo && saleDate <= now;
      }
      return true;
    });

    filteredTopSales.forEach((sale) => {
      sale.products?.forEach((prod) => {
        const id =
          prod.productId?._id ||
          prod.productId ||
          prod._id ||
          prod.sku ||
          prod.productName;

        const name = prod.productName || prod.name || "N/A";
        const sku = prod.sku || prod.productId?.sku || "N/A";
        const sellingPrice = Number(prod.sellingPrice || prod.unitCost || 0);
        const image =
          prod.productImage ||
          prod.productId?.images?.[0]?.url ||
          "assets/img/products/product-01.jpg";
        const sellQuantity = Number(
          prod.saleQty || prod.sellQuantity || prod.quantity || 0
        );
        const availableQuantity = Number(
          prod.availableQuantity ??
          prod.availableQty ??
          prod.productId?.availableQty ??
          0
        );

        if (!productSales[id]) {
          productSales[id] = {
            id,
            name,
            sku,
            sellingPrice,
            sellQuantity,
            image,
            availableQuantity,
          };
        } else {
          productSales[id].sellQuantity += sellQuantity;
        }
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.sellQuantity - a.sellQuantity)
    // .slice(0, 5);
  })();
  //   console.log("fdfdfrecentsales", recentSales[0]?.products[0]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        setProducts(res.data);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!loading && products.length > 0 && !warned) {
      const today = new Date();
      const tenDaysLater = new Date(today);
      tenDaysLater.setDate(today.getDate() + 10);
      const soonToExpire = products.filter((product) => {
        const expiryArr =
          product.variants?.get?.("Expire") || product.variants?.["Expire"];
        if (!expiryArr || expiryArr.length === 0) return false;
        return expiryArr.some((dateStr) => {
          // Accept formats like '30-08-2025'
          const [day, month, year] = dateStr.split("-").map(Number);
          if (!day || !month || !year) return false;
          const expDate = new Date(year, month - 1, day);
          return expDate >= today && expDate <= tenDaysLater;
        });
      });
      if (soonToExpire.length > 0) {
        window.toast &&
          window.toast.warn("Some products are expiring within 10 days!");
        setWarned(true);
      }
    }
  }, [loading, products, warned]);

  // Expired products state
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [expiredLoading, setExpiredLoading] = useState(true);

  useEffect(() => {
    // Fetch all products and filter for expiry within next 10 days (same as ExpriedProduct.jsx)
    api.get("/api/products")
      .then((res) => {
        const data = res.data;
        const today = new Date();
        const tenDaysLater = new Date();
        tenDaysLater.setDate(today.getDate() + 10);
        const soonToExpire = Array.isArray(data)
          ? data.filter((product) => {
            const expiryArr =
              product.variants?.get?.("Expiry") ||
              product.variants?.["Expiry"];
            if (!expiryArr || expiryArr.length === 0) return false;
            return expiryArr.some((dateStr) => {
              const [day, month, year] = dateStr.split("-").map(Number);
              if (!day || !month || !year) return false;
              const expDate = new Date(year, month - 1, day);
              return expDate >= today && expDate <= tenDaysLater;
            });
          })
          : [];
        setExpiredProducts(soonToExpire);
        setExpiredLoading(false);
      })

      .catch(() => {
        setExpiredProducts([]);
        setExpiredLoading(false);
      });
  }, []);

  useEffect(() => {
    // Fetch recent purchases
    api.get("/api/purchases?limit=5&sort=desc")
      .then((res) => {
        const data = res.data;
        setRecentPurchases(Array.isArray(data.purchases) ? data.purchases : []);
      })

    // Fetch debit note summary
    api.get("/api/debit-notes/summary")
      .then((res) => {
        const data = res.data;
        setTotalDebitNoteAmount(data.totalAmount || 0);
        setTotalDebitNoteCount(data.totalCount || 0);
      });
  }, [])

  useEffect(() => {
    // Fetch expenses summary
    api.get("/api/expenses/summary")
      .then((res) => {
        const data = res.data;
        setTotalExpensesAmount(data.totalAmount || 0);
        setTotalExpensesCount(data.totalCount || 0);
      });
  }, [])
  useEffect(() => {
    // Fetch purchase returns
    api.get("/api/purchase-returns?limit=1000000")
      .then((res) => {
        const data = res.data;
        const returns = data.returns || [];
        const totalReturnValue = returns.reduce(
          (acc, ret) => acc + (ret.grandTotal || 0),
          0
        );
        setTotalPurchaseReturnValue(totalReturnValue);
      });
  }, [])

  useEffect(() => {
    // Fetch suppliers
    api.get("/api/suppliers")
      .then((res) => {
        const data = res.data;
        setTotalSupplier(Array.isArray(data) ? data.length : 0)
      });

    // Fetch customers
    api.get("/api/customers")
      .then((res) => {
        const data = res.data;
        setTotalCustomer(Array.isArray(data) ? data.length : 0)
      });
  }, []);
  useEffect(() => {
    // Fetch purchases & returns summary
    api.get("/api/purchases/report")
      .then((res) => {
        const data = res.data;
        setTotalPurchaseAmount(data?.totals?.purchase || 0);
        setTotalReturnAmount(data?.totals?.return || 0);
      });
  }, [])

  // Fetch stock value
  useEffect(() => {
    getTotalStockValue().then((val) => setTotalStockValue(val));
  }, []);

  useEffect(() => {
    // Fetch low stock products
    api.get("/api/products?limit=1000000")
      .then((res) => {
        const data = res.data;
        const allProducts = data.products || data || [];
        const lowStock = allProducts
          .map((p) => {
            let availableQty = 0;
            if (typeof p.availableQty === "number") {
              availableQty = p.availableQty;
            } else {
              const quantity = Number(p.quantity ?? 0);
              let newQuantitySum = 0;
              if (Array.isArray(p.newQuantity)) {
                newQuantitySum = p.newQuantity.reduce((acc, n) => {
                  const num = Number(n);
                  return acc + (isNaN(num) ? 0 : num);
                }, 0);
              } else if (typeof p.newQuantity === "number") {
                newQuantitySum = Number(p.newQuantity);
              }
              availableQty = quantity + newQuantitySum;
            }
            return { ...p, availableQty };
          })
          .filter(
            (p) =>
              typeof p.quantityAlert === "number" &&
              p.availableQty <= p.quantityAlert &&
              p.availableQty > 0
          );

        setLowStockProducts(lowStock.slice(0, 5));
      });
  }, [])

  useEffect(() => {
    // Fetch recent sales
    api.get("/api/sales?limit=5&sort=desc")
      .then((res) => {
        const data = res.data;
        setRecentSales((data.sales || []).slice(0, 5));
        // console.log('daattasale', data.sales)
        const totalValue = (data.sales || []).reduce(
          (acc, sale) => acc + (sale.grandTotal || 0),
          0
        );
        setTotalSaleValue(totalValue);
        setTotalOrderCount(data.sales?.length);

      });
  }, [])

  useEffect(() => {
    // Fetch sales return value
    api.get("/api/sales-returns?limit=1000000")
      .then((res) => {
        const data = res.data;
        const returns = data.returns || [];
        const totalReturnValue = returns.reduce(
          (acc, ret) => acc + (ret.grandTotal || 0),
          0
        );
        setTotalSalesReturnValue(totalReturnValue);
      });
  }, [])

  const [invoiceCount, setInvoiceCount] = useState(0);
  // const [totalInvoiceDue, setTotalInvoiceDue] = useState(0);
  const [totalInvoicePaid, setTotalInvoicePaid] = useState(0);

  useEffect(() => {
    // Helper to fetch all paginated invoices and sum paid/due
    const fetchAllInvoices = async () => {
      let allInvoices = [];
      let page = 1;
      let hasMore = true;

      let totalDue = 0;
      let totalPaid = 0;

      while (hasMore) {
        const res = await api.get(
          `/api/invoice/allinvoice?page=${page}&limit=100`);
        const data = await res.data;
        const invoices = Array.isArray(data.invoices) ? data.invoices : [];
        allInvoices = allInvoices.concat(invoices);

        invoices.forEach((row) => {
          const inv = row.invoice || {};
          const sale = row.sale || {};
          totalDue += Number(inv.dueAmount || sale.dueAmount || 0);
          totalPaid += Number(inv.paidAmount || sale.paidAmount || 0);
        });

        hasMore = invoices.length === 100;
        page += 1;
      }

      setInvoiceCount(allInvoices.length);
      setTotalInvoiceDue(totalDue);
      setTotalInvoicePaid(totalPaid);
    };

    fetchAllInvoices();
  }, [])


  const [totalCreditNoteAmount, setTotalCreditNoteAmount] = useState(0);

  useEffect(() => {
    // Fetch all credit notes and sum their amounts
    api("/api/credit-notes/all")
      .then((res) => {
        const notes = Array.isArray(res.data.data) ? res.data.data : [];
        const totalCredit = notes.reduce(
          (acc, note) =>
            acc +
            (Number(note.total) ||
              Number(note.amount) ||
              Number(note.grandTotal) ||
              0),
          0
        );
        setTotalCreditNoteAmount(totalCredit);
      })
      .catch(() => setTotalCreditNoteAmount(0));
  }, []);

  // console.log("Total Credit Note Amount:", totalCreditNoteAmount);
  const fetchData = async (url) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (err) {
      console.error(err);
      return {};
    }
  };

  // Example usage for sales returns (match route to backend)
  const fetchSalesReturns = async () => {
    const url = `${BASE_URL}/api/sales/returns`; // Ensure this matches your backend route
    const data = await fetchData(url);
    setAllSalesReturns(Array.isArray(data) ? data : []);
  };

  // Example usage for purchase returns (match route to backend)
  const fetchPurchaseReturns = async () => {
    const url = `${BASE_URL}/api/purchases/returns`; // Ensure this matches your backend route
    const data = await fetchData(url);
    setAllPurchaseReturns(Array.isArray(data) ? data : []);
  };

  // ...existing code...

  // 🔹 fetch all sales
  const fetchSales = async () => {
    const data = await fetchData(`${BASE_URL}/api/sales?limit=1000000`);

    const sales = data.sales || [];
    setAllSales(sales);
    setRecentSales(sales.slice(0, 5));
    const totalValue = sales.reduce(
      (acc, sale) => acc + (sale.grandTotal || 0),
      0
    );
    setTotalSaleValue(totalValue);
  };
  useEffect(() => {
    setTotalSaleValue(
      filteredSales.reduce((acc, sale) => acc + (sale.grandTotal || 0), 0)
    );
  }, [filteredSales]);

  // 🔹 fetch all purchases
  const fetchPurchases = async () => {
    const data = await fetchData(`${BASE_URL}/api/purchases?limit=1000000`);
    setAllPurchases(data.purchases || []);
  };

  // 🔹 useEffect
  useEffect(() => {
    fetchSales();
    fetchPurchases();
    fetchSalesReturns();
    fetchPurchaseReturns();
  }, []);

  // Calculate total purchase and return values from allPurchases and allPurchaseReturns
  useEffect(() => {
    if (allPurchases.length > 0) {
      setTotalPurchaseAmount(
        allPurchases.reduce(
          (acc, purchase) => acc + (purchase.grandTotal || 0),
          0
        )
      );
    }

    if (allPurchaseReturns.length > 0) {
      setTotalReturnAmount(
        allPurchaseReturns.reduce((acc, ret) => acc + (ret.grandTotal || 0), 0)
      );
    }
  }, [allPurchases, allPurchaseReturns]);


  // Nwe Redesign
  //  const navigate = useNavigate();
  const goToLowStocksPage = () => {
    navigate("/m/lowstocks");
  };
  const goTotalOrders = () => {
    navigate("/m/total-orders");
  };

  const styles = {
    Graphcard: {
      background: "white",
      border: "1px solid rgb(223 225 227 / 70%)",
      boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
      padding: "24px",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      width: "100%",
      minWidth: "525.67px",
      height: "457px",
    },
    Graphcardrecentorders: {
      background: "white",
      border: "1px solid rgb(223 225 227 / 70%)",
      boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
      padding: "24px",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      width: "100%",
      minWidth: "1083px",
      height: "457px",
    },
    Graphheader: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
    },
    Graphtitle: {
      fontWeight: "500",
      fontSize: "16px",
      color: "#0E101A",
      fontFamily: "Inter",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    Graphbadge: {
      background: "#E5F0FF",
      color: "#1F7FFF",
      padding: "4px 8px",
      borderRadius: "50px",
      fontSize: "16px",
      fontFamily: "Inter",
      fontWeight: "400",
    },
    Graphsubtext: {
      fontSize: "14px",
      color: "#6C748C",
      margin: "4px 0 16px 0",
      fontFamily: "Inter",
    },
    GraphsalesRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
    },
    Graphamount: {
      fontSize: "16px",
      fontWeight: "600",
      margin: "0",
    },
    Graphcurrency: {
      fontSize: "12px",
      fontWeight: "400",
    },
    Graphlabel: {
      fontSize: "12px",
      margin: "0",
    },
    Graphfooter: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "20px",
      fontSize: "14px",
      color: "#666",
      fontFamily: "Inter",
    },
    Graphlink: {
      color: "#1F7FFF",
      textDecoration: "none",
      fontFamily: "Inter",
      fontSize: "14px",
    },
    Graphupdate: {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      //  fontFamily:'"Poppins", sans-serif',
    },
  };


  return (
  
    
        <div className="dashboard px-4 py-4  d-flex flex-column gap-4" style={{ overflowY: "auto", height: "calc(100vh - 60px)" }}>
          {/* Dashboard-header */}
          <div className="dashboard-header-mobile">
            <h1
              className="dashboard-title-mobile d-none"
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: "30px",
                marginBottom: "0",
              }}
            >
              Dashbaord
            </h1>
            <div
              className="dashbaord-header d-flex justify-content-between align-items-center"
              style={{
                borderBottom: "1px solid rgb(194, 201, 209)",
                paddingBottom: "24px",
              }}
            >
              <div className="d-flex align-items-center" style={{ gap: "19px" }}>
                <h1
                  className="dashboard-title"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: "30px",
                    marginBottom: "0",
                    color: 'black',
                  }}
                >
                  Dashbaord
                </h1>
                <div
                  style={{
                    backgroundColor: "white",
                    border: "1px solid rgb(224, 222, 222)",
                    borderRadius: "8px",
                    fontFamily: "Inter",

                    fontSize: "14px",
                    padding: "4px 12px",
                    width: "180px",
                    height: "30px",
                    display: "flex",
                    justifyItems: "center",
                    alignItems: "center",
                    fontFamily: "Inter",
                  }}
                >
                  <img src={select_range_date} alt="select_range_date" />
                  <select
                    name=""
                    id=""
                    style={{
                      backgroundColor: "transparent",
                      width: "100%",
                      outline: "none",
                      border: "none",
                      color: "#0e101aab",
                    }}
                  >
                    <option style={{ width: "300px" }} value="">
                      Select Date Range
                    </option>
                    <option style={{ width: "300px" }} value="">
                      Today
                    </option>
                    <option style={{ width: "300px" }} value="">
                      Yesterday
                    </option>
                    <option style={{ width: "300px" }} value="">
                      Last Month
                    </option>
                    <option style={{ width: "300px" }} value="">
                      Last Week
                    </option>
                    <option style={{ width: "300px" }} value="">
                      Last 15 Days
                    </option>
                    <option style={{ width: "300px" }} value="">
                      Custom
                    </option>
                  </select>
                </div>
              </div>
              <button
                className=""
                style={{
                  backgroundColor: "white",
                  border: "1px solid rgb(224, 222, 222)",
                  borderRadius: "8px",
                  color: "hsla(0, 1%, 36%, 1.00)",
                  fontFamily: "Inter",
                  fontSize: "15px",
                  padding: "4px 12px",
                }}
              >
                Last Updated 20 min ago <MdUpdate />
              </button>
            </div>
          </div>
          {/* <div className="all-page-scrollbar-y d-flex flex-column gap-4"> */}
          {/* Dashboard Card */}
          <div className="dashboard-card">
            <div className="dhaboard-card-1-container d-flex justify-content-between" style={{ gap: "30px", }}>
              {/* Total Inventory Value */}
              <div
                className="dash-card d-flex justify-content-between align-items-center bg-white position-relative"
                style={{

                  height: "86px",
                  paddingRight: "24px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  fontFamily: "Inter",
                  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.10)",
                  border: "1px solid #E5F0FF",
                  borderRadius: "8px",
                }}
              >
                <div className="d-flex align-items-center" style={{ gap: "24px" }}>
                  <span
                    style={{
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px",
                      borderLeft: "4px solid #1F7FFF",
                      width: "3px",
                      height: "50px",
                    }}
                  ></span>
                  <div className="d-flex flex-column " style={{ gap: "11px" }}>
                    <h6
                      className="mb-0 dash-card-title"
                      style={{ fontSize: "14px", color: "#727681" }}
                    >
                      Total Inventory Value
                    </h6>
                    <div className="d-flex align-items-end gap-2">
                      <h5
                        className="mb-0 dash-card-title"
                        style={{ fontSize: "22px", color: "#0E101A" }}
                      >
                        {totalInventoryValue.toLocaleString()}
                        <span style={{ color: "grey", fontSize: "20px" }}>
                          {String(totalInventoryValue).length > 7 && ".."}
                        </span>
                      </h5>
                      <span
                        className=""
                        style={{ fontSize: "14px", color: "#0E101A" }}
                      >
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5F0FF",
                  }}
                >
                  <img
                    src={dashcard_icon1}
                    alt=""
                    style={{ objectFit: "contain", width: "100%", height: "40px" }}
                  />
                </div>
              </div>
              {/* Total Order Amount */}
              <div
                className="dash-card d-flex justify-content-between align-items-center bg-white position-relative"
                onClick={goTotalOrders}
                style={{
                  height: "86px",
                  paddingRight: "24px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  fontFamily: "Inter",
                  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.10)",
                  border: "1px solid #E5F0FF",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                <div className="d-flex align-items-center" style={{ gap: "24px" }}>
                  <span
                    style={{
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px",
                      borderLeft: "4px solid #1F7FFF",
                      width: "3px",
                      height: "50px",
                    }}
                  ></span>
                  <div className="d-flex flex-column " style={{ gap: "11px" }}>
                    <h6
                      className="mb-0 dash-card-title"
                      style={{ fontSize: "14px", color: "#727681" }}
                    >
                      Total Order Amount
                    </h6>
                    <div className="d-flex align-items-end gap-2">
                      <h5
                        className="mb-0 dash-card-title"
                        style={{ fontSize: "22px", color: "#0E101A" }}
                      >
                        {totalSaleValue.toLocaleString()}
                        <span style={{ color: "grey", fontSize: "20px" }}>
                          {String(totalSaleValue).length > 7 && ".."}
                        </span>



                      </h5>
                      <span
                        className=""
                        style={{ fontSize: "14px", color: "#0E101A" }}
                      >
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5F0FF",
                  }}
                >
                  <img
                    src={dashcard_icon2}
                    alt=""
                    style={{ objectFit: "contain", width: "100%", height: "40px" }}
                  />
                </div>
              </div>
              {/* Average Selling */}
              <div
                className="dash-card d-flex justify-content-between align-items-center bg-white position-relative"
                style={{


                  height: "86px",
                  paddingRight: "24px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  fontFamily: "Inter",
                  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.10)",
                  border: "1px solid #E5F0FF",
                  borderRadius: "8px",
                }}
              >
                <div className="d-flex align-items-center" style={{ gap: "24px" }}>
                  <span
                    style={{
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px",
                      borderLeft: "4px solid #1F7FFF",
                      width: "3px",
                      height: "50px",
                    }}
                  ></span>
                  <div className="d-flex flex-column " style={{ gap: "11px" }}>
                    <h6
                      className="mb-0 dash-card-title"
                      style={{ fontSize: "14px", color: "#727681" }}
                    >
                      Average Selling
                    </h6>
                    <div className="d-flex align-items-end gap-2">
                      <h5
                        className="mb-0 dash-card-title"
                        style={{ fontSize: "22px", color: "#0E101A" }}
                      >
                        {avgSelling.toLocaleString()}
                        <span style={{ color: "grey", fontSize: "20px" }}>
                          {String(avgSelling).length > 7 && ".."}
                        </span>

                      </h5>
                      <span
                        className=""
                        style={{ fontSize: "14px", color: "#0E101A" }}
                      >
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5F0FF",
                  }}
                >
                  <img
                    src={dashcard_icon3}
                    alt=""
                    style={{ objectFit: "contain", width: "100%", height: "40px" }}
                  />
                </div>
              </div>
              {/* Due Payments */}
              <div
                className="dash-card d-flex justify-content-between align-items-center bg-white position-relative"
                style={{

                  height: "86px",
                  paddingRight: "24px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  fontFamily: "Inter",
                  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.10)",
                  border: "1px solid #E5F0FF",
                  borderRadius: "8px",
                }}
              >
                <div className="d-flex align-items-center" style={{ gap: "24px" }}>
                  <span
                    style={{
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px",
                      borderLeft: "4px solid #1F7FFF",
                      width: "3px",
                      height: "50px",
                    }}
                  ></span>
                  <div className="d-flex flex-column " style={{ gap: "11px" }}>
                    <h6
                      className="mb-0 dash-card-title"
                      style={{ fontSize: "14px", color: "#727681" }}
                    >
                      Due Payments
                    </h6>
                    <div className="d-flex align-items-end gap-2">
                      <h5
                        className="mb-0 dash-card-title"
                        style={{ fontSize: "22px", color: "#0E101A" }}
                      >
                        {totalInvoiceDue.toLocaleString()}
                        <span style={{ color: "grey", fontSize: "20px" }}>{String(totalInvoiceDue).length > 7 && ".."}</span>
                      </h5>
                      <span
                        className=""
                        style={{ fontSize: "14px", color: "#0E101A" }}
                      >
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5F0FF",
                  }}
                >
                  <img
                    src={dashcard_icon4}
                    alt=""
                    style={{ objectFit: "contain", width: "100%", height: "40px" }}
                  />
                </div>
              </div>
            </div>
            <div className="dashboard-card-2-container d-flex justify-content-between" style={{ gap: "30px", }}>
              {/* Newly Added */}
              <div
                className="dash-card d-flex justify-content-between align-items-center bg-white position-relative"
                style={{

                  //  width:"100%",
                  // minWidth: "372.25px",
                  height: "86px",
                  paddingRight: "24px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  fontFamily: "Inter",
                  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.10)",
                  border: "1px solid #E5F0FF",
                  borderRadius: "8px",
                }}
              >
                <div className="d-flex align-items-center" style={{ gap: "24px" }}>
                  <span
                    style={{
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px",
                      borderLeft: "4px solid #1F7FFF",
                      width: "3px",
                      height: "50px",
                    }}
                  ></span>
                  <div className="d-flex flex-column " style={{ gap: "11px" }}>
                    <h6
                      className="mb-0 dash-card-title"
                      style={{ fontSize: "14px", color: "#727681" }}
                    >
                      Newly Added
                    </h6>
                    <div className="d-flex align-items-end gap-2">
                      <h5
                        className="mb-0 dash-card-title"
                        style={{ fontSize: "22px", color: "#0E101A" }}
                      >
                        {newlyAddedProducts.length}
                        <span style={{ color: "grey", fontSize: "20px" }}>
                          {String(newlyAddedProducts.length).length > 2 && ".."}
                        </span>

                      </h5>
                      <span
                        className=""
                        style={{ fontSize: "14px", color: "#0E101A" }}
                      >

                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5F0FF",
                  }}
                >
                  <img
                    src={dashcard_icon5}
                    alt=""
                    style={{ objectFit: "contain", width: "100%", height: "40px" }}
                  />
                </div>
              </div>
              {/*  Low Stocks */}
              <div
                onClick={goToLowStocksPage}
                className="dash-card d-flex justify-content-between align-items-center bg-white position-relative cursor-pointer"
                style={{

                  //  width:"100%",
                  // minWidth: "372.25px",
                  height: "86px",
                  paddingRight: "24px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  fontFamily: "Inter",
                  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.10)",
                  border: "1px solid #E5F0FF",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                <div className="d-flex align-items-center" style={{ gap: "24px" }}>
                  <span
                    style={{
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px",
                      borderLeft: "4px solid #1F7FFF",
                      width: "3px",
                      height: "50px",
                    }}
                  ></span>
                  <div className="d-flex flex-column " style={{ gap: "11px" }}>


                    <h6
                      className="mb-0 dash-card-title"
                      style={{ fontSize: "14px", color: "#727681" }}
                    >
                      Low Stocks
                    </h6>
                    <div className="d-flex align-items-end gap-2">
                      {/* {lowStockProducts.map((prod, idx)=> ( */}
                      <h5

                        className="mb-0 dash-card-title"
                        style={{ fontSize: "22px", color: "#0E101A" }}
                      >
                        {lowStockProducts.reduce((sum, item) => sum + (item.availableQty || 0), 0)}
                        <span style={{ color: "grey", fontSize: "20px" }}>
                          {String(lowStockProducts.reduce((sum, item) => sum + (item.availableQty || 0), 0)).length > 7 && ".."}
                        </span>

                      </h5>
                      {/* ))} */}

                      {/* <span
                  className=""
                  style={{ fontSize: "14px", color: "#0E101A" }}
                >
                  INR
                </span> */}
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5F0FF",
                  }}
                >
                  <img
                    src={dashcard_icon6}
                    alt=""
                    style={{ objectFit: "contain", width: "100%", height: "40px" }}
                  />
                </div>
              </div>
              {/*  Out Of Stocks */}
              <div
                className="dash-card d-flex justify-content-between align-items-center bg-white position-relative"
                style={{

                  //  width:"100%",
                  // minWidth: "372.25px",
                  height: "86px",
                  paddingRight: "24px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  fontFamily: "Inter",
                  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.10)",
                  border: "1px solid #E5F0FF",
                  borderRadius: "8px",
                }}
              >
                <div className="d-flex align-items-center" style={{ gap: "24px" }}>
                  <span
                    style={{
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px",
                      borderLeft: "4px solid #1F7FFF",
                      width: "3px",
                      height: "50px",
                    }}
                  ></span>
                  <div className="d-flex flex-column " style={{ gap: "11px" }}>
                    <h6
                      className="mb-0 dash-card-title"
                      style={{ fontSize: "14px", color: "#727681" }}
                    >
                      Out Of Stocks
                    </h6>
                    <div className="d-flex align-items-end gap-2">
                      <h5
                        className="mb-0 dash-card-title"
                        style={{ fontSize: "22px", color: "#0E101A" }}
                      >
                        {outOfStockProducts.length}
                      </h5>
                      {/* <span
                  className=""
                  style={{ fontSize: "14px", color: "#0E101A" }}
                >
                  INR
                </span> */}
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5F0FF",
                  }}
                >
                  <img
                    src={dashcard_icon7}
                    alt=""
                    style={{ objectFit: "contain", width: "100%", height: "40px" }}
                  />
                </div>
              </div>
              {/*  Total Order */}
              <div
                className="dash-card d-flex justify-content-between align-items-center bg-white position-relative"
                style={{

                  //  width:"100%",
                  // minWidth: "372.25px",
                  //  maxWidth: "372.25px",  
                  height: "86px",
                  paddingRight: "24px",
                  paddingTop: "16px",
                  paddingBottom: "16px",
                  fontFamily: "Inter",
                  boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.10)",
                  border: "1px solid #E5F0FF",
                  borderRadius: "8px",
                }}
              >
                <div className="d-flex align-items-center" style={{ gap: "24px" }}>
                  <span
                    style={{
                      borderTopRightRadius: "4px",
                      borderBottomRightRadius: "4px",
                      borderLeft: "4px solid #1F7FFF",
                      width: "3px",
                      height: "50px",
                    }}
                  ></span>
                  <div className="d-flex flex-column " style={{ gap: "11px" }}>
                    <h6
                      className="mb-0 dash-card-title"
                      style={{ fontSize: "14px", color: "#727681" }}
                    >
                      Total Order
                    </h6>
                    <div className="d-flex align-items-end gap-2">
                      <h5
                        className="mb-0 dash-card-title"
                        style={{ fontSize: "22px", color: "#0E101A" }}
                      >
                        {totalOrderCount}
                        <span style={{ color: "grey", fontSize: "20px" }}>
                          {String(totalOrderCount).length > 7 && ".."}
                        </span>
                      </h5>
                      {/* <span
                  className=""
                  style={{ fontSize: "14px", color: "#0E101A" }}
                >
                  INR
                </span> */}
                    </div>
                  </div>
                </div>

                <div
                  className="d-flex justify-content-center align-items-center rounded-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5F0FF",
                  }}
                >
                  <img
                    src={dashcard_icon8}
                    alt=""
                    style={{ objectFit: "contain", width: "100%", height: "40px" }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="graph-main-dashboard" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Graph Container */}
            <div className="graph-container">
              {/* Retail vs Wholesale Sales */}
              <div className="graph-1-dash" style={styles.Graphcard}>

                <div style={{ objectFit: "content", width: "100$" }}>
                  <div style={{ borderBottom: "1px solid #C2C9D1" }}>
                    <div style={styles.Graphheader}>
                      <span style={styles.Graphtitle}>
                        Retail vs Wholesale Sales <img src={i_icon} alt="i_icon" />
                      </span>
                      <span style={styles.Graphbadge}>+20%</span>
                    </div>
                    <p style={styles.Graphsubtext}>Last 7 days</p>
                  </div>

                  <div style={styles.GraphsalesRow}>
                    <div
                      className=" w-100"
                      style={{
                        padding: "16px 0",
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#727681",
                        borderBottom: "1px solid #C2C9D1",
                      }}
                    >
                      <div className="d-flex flex-column gap-2">
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: "57px" }}
                        >
                          <span
                            className="d-flex align-items-center gap-2"
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#13AA64",
                                width: "20px",
                                height: "4px",
                              }}
                            ></span>
                            Reatailer
                          </span>
                          <span
                            className="d-flex align-items-center gap-2"
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#B1EE23",
                                width: "20px",
                                height: "4px",
                              }}
                            ></span>
                            Wholesaler
                          </span>
                        </div>
                        <div
                          className="d-flex"
                          style={{ marginLeft: "25px", gap: "57px" }}
                        >
                          <span
                            style={{
                              color: "#0E101A",
                              fontSize: "20px",
                              fontWeight: "500",
                              fontFamily: "Inter",
                            }}
                          >
                            78,980
                          </span>
                          <span
                            style={{
                              color: "#0E101A",
                              fontSize: "20px",
                              fontWeight: "500",
                              fontFamily: "Inter",
                            }}
                          >
                            78,980
                          </span>
                        </div>
                      </div>
                    </div>
                    <div></div>
                  </div>

                  <div
                    className="dashboard-card-graph-scroll"
                    style={{
                      width: "100%",
                      height: "200px",
                      borderBottom: "1px solid rgb(194, 201, 209)",
                      paddingBottom: "15px",
                      paddingTop: "15px",
                      // overflowY:"auto"
                    }}
                  >
                    <Line
                      data={data}
                      options={{ ...options, maintainAspectRatio: false }}
                    />
                  </div>

                  <div style={styles.Graphfooter}>
                    <a href="/" style={styles.Graphlink}>
                      View All
                    </a>
                    <span style={styles.Graphupdate}>
                      <img src={time} alt="time" />
                      Updated 30 mins ago
                    </span>
                  </div>
                </div>

              </div>
              {/* Sales Report */}
              <div className="graph-2-dash" style={styles.Graphcard}>

                <div style={{ objectFit: "content", width: "100%" }}>
                  <div style={{ borderBottom: "1px solid #C2C9D1" }}>
                    <div style={styles.Graphheader}>
                      <span style={styles.Graphtitle}>
                        Sales Report <img src={i_icon} alt="i_icon" />
                      </span>
                      <span style={styles.Graphbadge}>+20%</span>
                    </div>
                    <p style={styles.Graphsubtext}>Last 7 days</p>
                  </div>

                  <div style={styles.GraphsalesRow}>
                    <div
                      className=" w-100"
                      style={{
                        padding: "16px 0",
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#727681",
                        borderBottom: "1px solid #C2C9D1",
                      }}
                    >
                      <div className="d-flex flex-column gap-2">
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: "57px" }}
                        >
                          <span
                            className="d-flex align-items-center gap-2"
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#FFC9B4",
                                width: "20px",
                                height: "4px",
                              }}
                            ></span>
                            Purchase Orders
                          </span>
                          <span
                            className="d-flex align-items-center gap-2"
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#FF8F1F",
                                width: "20px",
                                height: "4px",
                              }}
                            ></span>
                            Sales Orders
                          </span>
                        </div>
                        <div
                          className="d-flex"
                          style={{ marginLeft: "25px", gap: "57px" }}
                        >
                          <span
                            style={{
                              color: "#0E101A",
                              fontSize: "20px",
                              fontWeight: "500",
                              fontFamily: "Inter",
                            }}
                          >
                            78,980
                          </span>
                          <span
                            style={{
                              color: "#0E101A",
                              fontSize: "20px",
                              fontWeight: "500",
                              fontFamily: "Inter",
                            }}
                          >
                            78,980
                          </span>
                        </div>
                      </div>
                    </div>
                    <div></div>
                  </div>

                  <div
                    className="dashboard-card-graph-scroll"
                    style={{
                      width: "100%",
                      height: "200px",
                      borderBottom: "1px solid rgb(194, 201, 209)",
                      paddingBottom: "15px",
                      // overflowY:"auto"
                    }}
                  >
                    <Bar
                      data={datasThree}
                      options={{ ...optionssThree, maintainAspectRatio: false }}
                    />
                  </div>

                  <div style={styles.Graphfooter}>
                    <a href="/" style={styles.Graphlink}>
                      View All
                    </a>
                    <span style={styles.Graphupdate}>
                      <img src={time} alt="time" />
                      Updated 30 mins ago
                    </span>
                  </div>
                </div>

              </div>

              {/*ims-advertisment-app-banner*/}
              <div
                className="ims-advertisment-app-banner position-relative"
                style={styles.Graphcard}
              >
                <div>
                  <h1
                    style={{
                      fontSize: "40px",
                      fontFamily: "Poppins",
                      color: "#1F7FFF",
                      marginBottom: "0",
                    }}
                  >
                    One app for all <br /> your{" "}
                    <span style={{ color: "#26005B" }}>
                      inventory <br />
                    </span>
                    needs!
                  </h1>
                </div>
                <div
                  className="dashboard-card-graph-scroll"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "end",
                    position: "absolute",
                    top: "90px",
                    height: "300px"
                    // overflowY:"auto"
                  }}
                >
                  <button
                    className="button-color"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white",
                      fontFamily: "Inter",
                      fontSize: "16px",
                      width: "140px",
                      height: "35px",
                      padding: "8px 16px",
                    }}
                  >
                    Coming Soon
                  </button>
                  <img style={{ width: "100%", maxWidth: "311px" }} src={advertisment_ims} alt="advertisment_ims" />
                </div>
              </div>
            </div>
            {/* Graph container two */}
            <div className="graph-container-two">
              {/* Top Selling Products */}
              <div className="top-selling-dash" style={styles.Graphcard}>
                <div style={{ objectFit: "content", width: "100%", }}>
                  <div className="d-flex justify-content-between" >
                    <div>
                      <div style={styles.Graphheader}>
                        <span style={styles.Graphtitle}>
                          Top Selling Products <img src={i_icon} alt="i_icon" />
                        </span>
                        <span style={styles.Graphbadge}>+20%</span>
                      </div>
                      <p style={styles.Graphsubtext}>Last 7 days</p>
                    </div>
                    {/* Filter Date Button */}
                    <div className="">
                      <button
                        className="dropdown-toggle btn btn-sm btn-white"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="ti ti-calendar me-1" />
                        {topSellingFilter === "today"
                          ? [t("Today")]
                          : topSellingFilter === "weekly"
                            ? [t("Weekly")]
                            : [t("Monthly")]}
                      </button>
                      <ul className="dropdown-menu p-3">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setTopSellingFilter("today")}
                          >
                            {t("Today")}
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setTopSellingFilter("weekly")}
                          >
                            {t("Weekly")}
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setTopSellingFilter("monthly")}
                          >
                            {t("Monthly")}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div
                    className="dashboard-card-graph-scroll"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      fontFamily: "Inter",
                      height: "300px",
                      //  overflowY:"auto"

                    }}
                  >
                    {topSellingProducts.map((p) => (
                      <div

                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "5px 0px",
                          // borderRadius: "8px",
                          fontFamily: "Inter",
                          borderTop: "1px solid rgb(194, 201, 209)",


                        }}
                      >

                        <img
                          src={p.image}
                          alt={p.name}
                          style={{
                            width: "40px",
                            height: "30px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            marginRight: "12px",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 400,
                              fontSize: "13px",
                              color: "#0E101A",
                            }}
                          >
                            {p.name}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 400,
                              color: "#0D6828",
                              fontFamily: "Inter",
                            }}
                          >
                            {p.sellQuantity}{" "}
                            <span style={{ color: "#6C748C", fontWeight: 400 }}>
                              Unit sold
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontFamily: "Inter",
                              fontWeight: 400,
                              fontSize: "13px",
                            }}
                          >
                            ₹ {p.sellingPrice}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#0D6828",
                              fontWeight: 400,
                            }}
                          >
                            {p.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={styles.Graphfooter}>
                    <a href="/" style={styles.Graphlink}>
                      View All
                    </a>
                    <span style={styles.Graphupdate}>
                      <img src={time} alt="time" />
                      Updated 30 mins ago
                    </span>
                  </div>
                </div>
              </div>
              {/* Daily Earning */}
              <div className="graph-5-dash" style={styles.Graphcard}>
                <div style={{ objectFit: "content", width: "100$" }}>
                  <div style={{ borderBottom: "1px solid #C2C9D1" }}>
                    <div style={styles.Graphheader}>
                      <span style={styles.Graphtitle}>
                        Daily Earning <img src={i_icon} alt="i_icon" />
                      </span>
                      <span style={styles.Graphbadge}>+20%</span>
                    </div>
                    <p style={styles.Graphsubtext}>Last 7 days</p>
                  </div>

                  <div style={styles.GraphsalesRow}>
                    <div
                      className=" w-100"
                      style={{
                        padding: "16px 0",
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#727681",
                        borderBottom: "1px solid #C2C9D1",
                      }}
                    >
                      <div className="d-flex flex-column gap-2">
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: "57px" }}
                        >
                          <span
                            className="d-flex align-items-center gap-2"
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#7313AA",
                                width: "20px",
                                height: "4px",
                              }}
                            ></span>
                            Total Sales
                          </span>
                          <span
                            className="d-flex align-items-center gap-2"
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#EE23B1",
                                width: "20px",
                                height: "4px",
                              }}
                            ></span>
                            Profit Earned
                          </span>
                        </div>
                        <div
                          className="d-flex"
                          style={{ marginLeft: "25px", gap: "57px" }}
                        >
                          <span
                            style={{
                              color: "#0E101A",
                              fontSize: "20px",
                              fontWeight: "500",
                              fontFamily: "Inter",
                            }}
                          >
                            78,980
                          </span>
                          <span
                            style={{
                              color: "#0E101A",
                              fontSize: "20px",
                              fontWeight: "500",
                              fontFamily: "Inter",
                            }}
                          >
                            78,980
                          </span>
                        </div>
                      </div>
                    </div>
                    <div></div>
                  </div>

                  <div
                    className="dashboard-card-graph-scroll"
                    style={{
                      width: "100%",
                      height: "200px",
                      borderBottom: "1px solid rgb(194, 201, 209)",
                      paddingBottom: "15px",
                      paddingTop: "15px",

                    }}
                  >
                    <Line
                      data={datas}
                      options={{ ...options, maintainAspectRatio: false }}
                    />
                  </div>

                  <div style={styles.Graphfooter}>
                    <a href="/" style={styles.Graphlink}>
                      View All
                    </a>
                    <span style={styles.Graphupdate}>
                      <img src={time} alt="time" />
                      Updated 30 mins ago
                    </span>
                  </div>
                </div>
              </div>
              {/* Track Purchase Order */}
              <div className="graph-6-dash" style={styles.Graphcard}>
                <div style={{ borderBottom: "1px solid #C2C9D1" }}>
                  <div style={styles.Graphheader}>
                    <span style={styles.Graphtitle}>
                      Track Purchase Order <img src={i_icon} alt="i_icon" />
                    </span>
                    <span style={styles.Graphbadge}>+20%</span>
                  </div>
                  <p style={styles.Graphsubtext}>Last 7 days</p>
                </div>
                <div className="dashboard-card-graph-scroll" style={{ borderBottom: "1px solid #C2C9D1", height: "300px" }}>
                  <table style={{ fontFamily: "Inter", width: "100%" }}>
                    <thead style={{ backgroundColor: "#F3F8FB" }}>
                      <tr style={{ color: "#727681", fontSize: "14px" }}>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          Supplier
                        </th>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          Deliver In
                        </th>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          Status
                        </th>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trackPurchaseOrder.map((item, idx) => (
                        <tr key={idx} style={{ fontSize: "14px" }}>
                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            {item.supplier}
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            {item.deliverIn}
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            {/* <span style={{textAlign:"center", padding:"4px 6px", borderRadius:"50px", backgroundColor:"red"}}>{item.status}</span> */}
                            <span
                              style={{
                                // display: "inline-flex",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                textAlign: "center",
                                padding: "1px 6px",
                                borderRadius: "50px",
                                backgroundColor:
                                  item.status === "Processing"
                                    ? "#F7F7C7"
                                    : item.status === "Delivered"
                                      ? "#D4F7C7"
                                      : item.status === "Cancelled"
                                        ? "#F7C7C9"
                                        : "transparent",

                                color:
                                  item.status === "Processing"
                                    ? "#7E7000"
                                    : item.status === "Delivered"
                                      ? "#01774B"
                                      : item.status === "Cancelled"
                                        ? "#A80205"
                                        : "#000",
                              }}
                            >
                              <span style={{ fontSize: "12px" }}>
                                {item.status === "Processing"
                                  ? "•"
                                  : item.status === "Delivered"
                                    ? "✓"
                                    : item.status === "Cancelled"
                                      ? "✕"
                                      : ""}
                              </span>

                              {item.status}
                            </span>
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            {item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={styles.Graphfooter}>
                  <a href="/" style={styles.Graphlink}>
                    View All
                  </a>
                  <span style={styles.Graphupdate}>
                    <img src={time} alt="time" />
                    Updated 30 mins ago
                  </span>
                </div>
              </div>
            </div>
            {/* graph container three */}
            <div className="graph-container-three">
              {/* Recent Orders */}
              <div className="graph-7-dash" style={styles.Graphcardrecentorders}>
                <div style={{ borderBottom: "1px solid #C2C9D1" }}>
                  <div style={styles.Graphheader}>
                    <span style={styles.Graphtitle}>
                      Recent Orders <img src={i_icon} alt="i_icon" />
                    </span>
                    <span style={styles.Graphbadge}>+20%</span>
                  </div>
                  <p style={styles.Graphsubtext}>Last 7 days</p>
                </div>
                <div className="dashboard-card-graph-scroll" style={{ borderBottom: "1px solid #C2C9D1", height: "300px", }}>
                  <table style={{ fontFamily: "Inter", width: "100%", height: "200px" }}>
                    <thead style={{ backgroundColor: "#F3F8FB" }}>
                      <tr style={{ color: "#727681", fontSize: "14px" }}>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          Order ID
                        </th>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          Customer
                        </th>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          No. Of Items
                        </th>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          Status
                        </th>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          Payment Method
                        </th>
                        <th style={{ padding: "10px 16px", fontWeight: "400" }}>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrder.map((item, idx) => (
                        <tr key={idx} style={{ fontSize: "14px" }}>
                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            {item.orderId}
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            {item.customer}
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            {item.noOfItems}
                          </td>

                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            <span
                              style={{
                                // display: "inline-flex",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                                textAlign: "center",
                                padding: "1px 6px",
                                borderRadius: "50px",
                                backgroundColor:
                                  item.status === "Pending"
                                    ? "#FFF2D5"
                                    : item.status === "Success"
                                      ? "#D4F7C7"
                                      : "",

                                color:
                                  item.status === "Pending"
                                    ? "#CF4F00"
                                    : item.status === "Success"
                                      ? "#01774B"
                                      : "",
                              }}
                            >
                              <span style={{ fontSize: "12px" }}>
                                {item.status === "Pending"
                                  ? "!"
                                  : item.status === "Success"
                                    ? "✓"
                                    : ""}
                              </span>

                              {item.status}
                            </span>
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            {item.paymentMethod}
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: "400" }}>
                            {item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={styles.Graphfooter}>
                  <a href="/" style={styles.Graphlink}>
                    View All
                  </a>
                  <span style={styles.Graphupdate}>
                    <img src={time} alt="time" />
                    Updated 30 mins ago
                  </span>
                </div>
              </div>
              {/* New Customer Vs Returning Customer */}
              <div className="graph-8-dash" style={styles.Graphcard}>
                <div style={{ objectFit: "content", width: "100%" }}>
                  <div style={{ borderBottom: "1px solid #C2C9D1" }}>
                    <div style={styles.Graphheader}>
                      <span style={styles.Graphtitle}>
                        New Customer Vs Returning Customer{" "}
                        <img src={i_icon} alt="i_icon" />
                      </span>
                      <span style={styles.Graphbadge}>+20%</span>
                    </div>
                    <p style={styles.Graphsubtext}>Last 7 days</p>
                  </div>

                  <div style={styles.GraphsalesRow}>
                    <div
                      className=" w-100"
                      style={{
                        padding: "16px 0",
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: "500",
                        fontSize: "14px",
                        color: "#727681",
                        borderBottom: "1px solid #C2C9D1",
                      }}
                    >
                      <div className="d-flex flex-column gap-2">
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: "57px" }}
                        >
                          <span
                            className="d-flex align-items-center gap-2"
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#C8DFFF",
                                width: "20px",
                                height: "4px",
                              }}
                            ></span>
                            New Customers
                          </span>
                          <span
                            className="d-flex align-items-center gap-2"
                            style={{
                              fontFamily: "Inter",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            <span
                              style={{
                                backgroundColor: "#1F7FFF",
                                width: "20px",
                                height: "4px",
                              }}
                            ></span>
                            Returning Customers
                          </span>
                        </div>
                        <div
                          className="d-flex"
                          style={{ marginLeft: "25px", gap: "57px" }}
                        >
                          <span
                            style={{
                              color: "#0E101A",
                              fontSize: "20px",
                              fontWeight: "500",
                              fontFamily: "Inter",
                            }}
                          >
                            78,980
                          </span>
                          <span
                            style={{
                              color: "#0E101A",
                              fontSize: "20px",
                              fontWeight: "500",
                              fontFamily: "Inter",
                            }}
                          >
                            78,980
                          </span>
                        </div>
                      </div>
                    </div>
                    <div></div>
                  </div>

                  <div
                    className="dashboard-card-graph-scroll"
                    style={{
                      width: "100%",
                      height: "200px",
                      borderBottom: "1px solid rgb(194, 201, 209)",
                      paddingBottom: "15px",
                      // overflowY:"auto"
                    }}
                  >
                    <Bar
                      data={datasFour}
                      options={{ ...optionssThree, maintainAspectRatio: false }}
                    />
                  </div>

                  <div style={styles.Graphfooter}>
                    <a href="/" style={styles.Graphlink}>
                      View All
                    </a>
                    <span style={styles.Graphupdate}>
                      <img src={time} alt="time" />
                      Updated 30 mins ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    
    
  );
};

export default AdminDashboard;
