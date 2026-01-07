import React, { useState,useRef, useEffect} from "react";
import nav_logo from "../../assets/images/kasper-logo.png";
import { CiSearch } from "react-icons/ci";
import vector from "../../assets/images/Vector.png";
import { IoSettingsOutline } from "react-icons/io5";
import { PiBellThin } from "react-icons/pi";
import "../../styles/Navbar.css";
import { GoPlus } from "react-icons/go";
import pos_icon from "../../assets/images/pos-icon.png"
import CreateModel from "../CreateModel";
import { GiHamburgerMenu } from "react-icons/gi";

import "../../styles/Responsive.css"
import { Link, useNavigate } from "react-router-dom";
import { RiMenu2Line } from "react-icons/ri";
import ai from "../../assets/images/AI.png"
import AI_Model from "./AI_Model";
import SearchningFor from "./SearchningFor";





const Navbar = () => {
  const [ShowCreateModel, setShowCreateModel] = useState(false);
    const [sidebarActive, setSidebarActive] = useState(false);
   const modelRef = useRef(null); // reference to modal area
  const buttonRef = useRef(null); // reference to Create button
  const [showAiModel, setShowAiModel]= useState(false)
  const aiModelRef = useRef(null);
  const serchingRef = useRef(null);
    const serchingBtnRef = useRef(null);
  const [showRecentSearch, setShowRecentSearch] = useState(false);
  const navigate = useNavigate();


const settingGoToPage = () => {
    navigate("/m/settings/user-profile-settings");
  };
  
   // handle button click
 const handleCreateClick = () => {
  setShowCreateModel(prev => !prev); // toggles open/close
};
 

  
  // ✅ close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modelRef.current &&
        !modelRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowCreateModel(false);
      }
       if (
        showRecentSearch &&
        serchingRef.current &&
        !serchingRef.current.contains(event.target) &&
        !serchingBtnRef.current.contains(event.target)
      ) {
        setShowRecentSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRecentSearch, ShowCreateModel]);

 // Handle sidebar toggle
  const handleSidebarToggle = () => {
    const sidebar = document.querySelector(".sidebarmenu-container");
    sidebar?.classList.toggle("sidebar-active");
    setSidebarActive((prev) => !prev);
  };



  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "white",
        // height: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom:"1px solid #e0dedeff"
      }}
    >
      <nav
        style={{
          width: "100%",
          height:"60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
        }}
      >
           {/*Mobile Toggle Button  */}
           <div  className={`mobile-toggle-btn d-none ${sidebarActive ? "active" : ""}`}
          id="mobileToggleBtn"
          onClick={handleSidebarToggle} style={{border:"2px solid rgb(31, 127, 255)"}}>
             <RiMenu2Line className="open-icon" size={25} color="rgb(31, 127, 255)" />
             
           </div>
        <div className="nav-logo">
          <img src={nav_logo} alt="nav_logo" style={{width:"100%", objectFit:"contain"}}/>
        </div>
        <div
       
          className="nav-search-input border-hover d-flex align-items-center gap-1"
          style={{
            backgroundColor: "#FCFCFC",
            border: "1px solid #EAEAEA",
            width: "550px",
            padding: "5px 16px",
            borderRadius: "8px",
          }}
        >
          <CiSearch size={20} style={{ color: "#6C748C", fontWeight:"500" }} />
          <input
            ref={serchingBtnRef}
        onClick={() => setShowRecentSearch(true)}
            type="search"
            placeholder="Search"
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              backgroundColor: "transparent",
            }}
          />
          <div onClick={setShowAiModel} className="ai d-flex justify-content-center align-items-center" style={{backgroundColor:"#E9F0F4", borderRadius:"4px", padding:"4px 4px", cursor:"pointer"}}>
            <img style={{width:"100%"}} src={ai} alt="ai" />
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="nav-user-info  d-flex align-items-center gap-3">
           
            <div className="icon-hover" onClick={settingGoToPage}>
              <IoSettingsOutline size={24} />
            </div>
            <div className="icon-hover">
              <PiBellThin size={26} />
            </div>
           
          </div>
         
           <button className="button-color button-hover d-flex justify-content-center align-items-center" style={{padding:"8px", width:"65px", height:"36px", gap:"4px"}}>
              <img src={pos_icon} alt="pos_icon" />
              <Link to="/pos" style={{textDecoration:"none", color:"white", fontFamily:"Inter",fontSize: "14px"}}>POS</Link>
           </button>
          <button
          ref={buttonRef}
            onClick={handleCreateClick}
             className="create-btn button-hover button-color"
            style={{
            
              color: "white",
              border: "none",
              fontFamily: 'Inter',
              fontSize: "14px",
              
              padding: "8px",
              borderRadius: "8px",
              width:"89px",
              height:"36px",
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              gap:"4px"
              
            }}
          >
            <GoPlus size={20} />
            Create
          </button>
           {/* <span>+</span> */}
        </div>
      </nav>
            {ShowCreateModel && (
        <div ref={modelRef}>
          <CreateModel />
        </div>
      )}
       {showAiModel &&
        <div ref={aiModelRef}>
        <AI_Model  onClose={() => setShowAiModel(false)} />
       </div>
       }
      
   {showRecentSearch && 
   <div ref={serchingRef}>
   <SearchningFor/>
   </div>
   }
    </div>
  );
};

export default Navbar;
