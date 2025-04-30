import React from "react";
import { useLocation, Link } from "react-router-dom";

function SearchResult() {
    const location = useLocation();
    const message = location.state?.message || "ไม่มีผลการค้นหานี้";

    return (
        <div className="search-result">
            <h3>{message}</h3>
        </div>
    );
}

export default SearchResult;