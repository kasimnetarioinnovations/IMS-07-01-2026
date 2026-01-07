// utils/roleDefaults.js
export const ALL_MODULES = {
  // Main
  "Dashboard": "Dashboard",
  
  // Connect
  "Chat": "Chat",
  "Mail": "Mail",
  "Whatsapp": "Whatsapp",
  
  // Inventory
  "Product": "Product",
  "Category": "Category",
  "SubCategory": "SubCategory",
  "Brand": "Brand",
  "Unit": "Unit",
  "HSN": "HSN",
  "VariantAttributes": "VariantAttributes",
  "Warranty": "Warranty",
  "Barcode": "Barcode",
  
  // Peoples
  "Customer": "Customer",
  "Supplier": "Supplier",
  
  // Warehouse
  "Warehouse": "Warehouse",
  "StockMovementLog": "StockMovementLog", // Added
  
  // Purchases
  "Purchase": "Purchase",
  "DebitNote": "DebitNote",
  
  // Stock
  "Stock": "Stock",
  "StockAdjustment": "StockAdjustment",
  
  // Sales
  "Sales": "Sales",
  "CreditNote": "CreditNote",
  "POS": "POS",
  "Invoices": "Invoices",
  "Quotation": "Quotation",
  
  // Promo
  "Coupons": "Coupons",
  "GiftCards": "GiftCards",
  "PointsRewards": "PointsRewards", // Added for Points & Rewards
  
  // Location
  "Location": "Location", // Added for location section header
  "Country": "Country",
  "State": "State",
  "City": "City",
  
  // User Management
  "Users": "Users",
  "Roles": "Roles",
  
  // Settings
  "Settings": "Settings",
  "Profile": "Profile",
  "Security": "Security",
  "Website": "Website",
  "CompanySettings": "CompanySettings",
  "Localization": "Localization",
  
  // Reports
  "Reports": "Reports",
  "PurchaseReport": "PurchaseReport", // Added
  
  // Finance & Accounts
  "Finance": "Finance",
  "SalesReport": "SalesReport", // Added
  "InventoryReport": "InventoryReport", // Added
  "SupplierReport": "SupplierReport", // Added
  "ReturnDamageReport": "ReturnDamageReport", // Added
  "CreditDebitNoteReport": "CreditDebitNoteReport", // Added
  "OverdueReport": "OverdueReport", // Added
  "ExpenseReport": "ExpenseReport", // Added
  
  // Special sections (for warehouse sub-items)
  "AllWarehouse": "AllWarehouse",
  "StockMovementLog": "StockMovementLog",
  
  // Activity & Trash (always visible)
  "Activity": "Activity",
  "Trash": "Trash"
};

export const DEFAULT_PERMISSIONS = {
  create: false,
  read: false,
  update: false,
  delete: false
};