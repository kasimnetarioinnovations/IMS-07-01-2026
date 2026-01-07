import React, { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import select_range_date from "../assets/images/select-date.png";

const dateOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last_week", label: "Last Week" },
  { value: "last_15_days", label: "Last 15 Days" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom" },
];

export default function DateFilterDropdown({padding="8px 14px"}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
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
        <img src={select_range_date} alt="select-date" style={{fontSize:"18px", color:"#6B7280"}} />
        <span style={{ flex: 1, textAlign: "left" }}>{displayLabel}</span>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
          {isOpen ? <IoChevronUpOutline/> : <IoChevronDownOutline/>}
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
            onChange={(range) => {
              const [start, end] = range || [null, null];
              if (start && end) {
                setSelected({
                  value: "custom",
                  label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
                });
                setShowCalendar(false);
                setIsOpen(false);
              }
            }}
          />
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