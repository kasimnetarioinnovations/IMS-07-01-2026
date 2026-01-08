// import React from "react";
// import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

// const SearchningFor = () => {
//   return (
//     <>
//     {showRecentSearch && filteredRoutes.length > 0 && (
//     <div
//         ref={serchingRef}
//       style={{
//         width: "550px",
//         height: "262px",
//         boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
//         backdropFilter:" blur(4.4px)",
//         WebkitBackdropFilter:"blur(4.4px)",
//         padding: "12px 14px",
//         borderRadius: "6px",
//         border: "1px solid rgba(255, 255, 255, 0.24)",
//         backgroundColor: "rgba(255, 255, 255, 0.81)",
//         position:"absolute",
//         zIndex:"999",
//         left:"37.6%",
//         right:"50%",
//         top:"6%"
//       }}
//     > 
     
//       <label htmlFor="" style={{paddingBottom:"8px", fontFamily:"Inter", fontWeight:"400", fontSize:"14px"}}>Searching for</label>
//        {filteredRoutes.map((item, index) => (
//       <div
//         key={index}
//         onClick={() => handleNavigate(item.path)}
//         style={{
//           padding: "10px 14px",
//           cursor: "pointer",
//           fontSize: "14px",
//         }}
//         className="search-item-hover"
//       >
//         {item.label}
//       </div>
//     ))}
//     </div>
//     )}
//     </>
//   );
// };

// export default SearchningFor;

import React from "react";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

const SearchningFor = ({ results, onSelect }) => {
  if (!results || results.length === 0) return null;

  return (
    <div
      style={{
        width: "550px",
        // height: "262px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(4.4px)",
        WebkitBackdropFilter: "blur(4.4px)",
        padding: "12px 14px",
        borderRadius: "6px",
        border: "1px solid rgba(255, 255, 255, 0.24)",
        backgroundColor: "rgba(255, 255, 255, 0.81)",
        position: "absolute",
        zIndex: "999",
        left: "37.6%",
        top: "6%",
      }}
    >
      <label
        style={{
          paddingBottom: "8px",
          fontFamily: "Inter",
          fontWeight: "400",
          fontSize: "14px",
          display: "block",
        }}
      >
        Searching for
      </label>

      {results.map((item, index) => (
        <div
          key={index}
          onClick={() => onSelect(item.path)}
          className="search-item-hover"
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <MdOutlineKeyboardDoubleArrowRight size={16} />
          {item.label}
        </div>
      ))}
    </div>
  );
};

export default SearchningFor;
