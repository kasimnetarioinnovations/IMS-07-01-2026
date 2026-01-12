import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import select_range_date from "../assets/images/select-date.png";
import { format } from "date-fns";

const dateOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_week", label: "Last Week" },
  { value: "last_15_days", label: "Last 15 Days" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom" },
];

export default function DateFilterDropdown({ padding = "8px 14px", onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]); // Add this state
  const [startDate, endDate] = dateRange; // Destructure
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayLabel = selected ? selected.label : "Select Date Range";

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (option.value === "custom") {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
      // Calculate dates for all other options
      const now = new Date();
      let startDate = null;
      let endDate = null;

      switch (option.value) {
        case "today":
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        case "yesterday":
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          startDate = new Date(yesterday);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(yesterday);
          endDate.setHours(23, 59, 59, 999);
          break;

        case "last_week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        case "last_15_days":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 15);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        case "last_month":
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;

        default:
          startDate = null;
          endDate = null;
      }
      // Call onChange with the calculated dates
      if (startDate && endDate) {
        onChange?.({
          startDate,
          endDate,
        });
      } else {
        // For "Select Date Range" or clearing filter
        onChange?.({
          startDate: null,
          endDate: null,
        });
      }
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: padding,
          border: "1px solid #D1D5DB",
          borderRadius: "12px",
          backgroundColor: "#FFFFFF",
          cursor: "pointer",
          fontSize: "15px",
          fontFamily: '"Inter", sans-serif',
          color: "#374151",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          transition: "all 0.2s",
          minWidth: "200px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)")}
      >
        <img src={select_range_date} alt="select-date" style={{ fontSize: "18px", color: "#6B7280" }} />
        <span style={{ flex: 1, textAlign: "left" }}>{displayLabel}</span>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
          {isOpen ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
        </span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "8px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            border: "1px solid #E5E7EB",
            overflow: "hidden",
            zIndex: 9999,
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {dateOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontFamily: '"Inter", sans-serif',
                color: selected?.value === option.value ? "#0E101A" : "#374151",
                fontWeight: selected?.value === option.value ? "600" : "500",
                backgroundColor:
                  selected?.value === option.value ? "#e5f0ff" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5f0ff";
                e.currentTarget.style.color = "#0E101A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  selected?.value === option.value ? "#e5f0ff" : "transparent";
                e.currentTarget.style.color =
                  selected?.value === option.value ? "#0E101A" : "#374151";
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {/* Custom Range Calendar */}
      {showCalendar && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "8px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
            border: "1px solid #E5E7EB",
            zIndex: 9999,
            padding: "12px",
          }}
        >
          <DatePicker
            selectsRange
            inline
            startDate={startDate} // Add this
            endDate={endDate}     // Add this
            onChange={(update) => {
              console.log("DatePicker update:", update);
              setDateRange(update);

              const [start, end] = update;

              // Only process when both dates are selected
              if (start && end) {
                // Set proper time boundaries
                const startDateWithTime = new Date(start);
                startDateWithTime.setHours(0, 0, 0, 0);

                const endDateWithTime = new Date(end);
                endDateWithTime.setHours(23, 59, 59, 999);

                setSelected({
                  value: "custom",
                  label: `${format(startDateWithTime, 'dd/MM/yyyy')} - ${format(endDateWithTime, 'dd/MM/yyyy')}`,
                });

                onChange?.({
                  startDate: startDateWithTime,
                  endDate: endDateWithTime,
                });

                setShowCalendar(false);
                setIsOpen(false);
                setDateRange([null, null]); // Reset for next time
              }
            }}
          />
                    {/* ADD THE APPLY BUTTON HERE - Right after DatePicker */}
          {startDate && (
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <button
                onClick={() => {
                  if (!startDate || !endDate) {
                    alert("Please select both start and end dates");
                    return;
                  }
                  
                  const startDateWithTime = new Date(startDate);
                  startDateWithTime.setHours(0, 0, 0, 0);
                  
                  const endDateWithTime = new Date(endDate);
                  endDateWithTime.setHours(23, 59, 59, 999);
                  
                  setSelected({
                    value: "custom",
                    label: `${format(startDateWithTime, 'dd/MM/yyyy')} - ${format(endDateWithTime, 'dd/MM/yyyy')}`,
                  });
                  
                  onChange?.({
                    startDate: startDateWithTime,
                    endDate: endDateWithTime,
                  });
                  
                  setShowCalendar(false);
                  setIsOpen(false);
                  setDateRange([null, null]);
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1F7FFF",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Apply Date Range
              </button>
              
              {startDate && !endDate && (
                <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                  Select end date or click Apply
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Fade In Animation */}
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
    </div>
  );
}