// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import axios from "axios";

// function SearchResults() {
//   const [searchParams] = useSearchParams();
//   const query = searchParams.get("query"); // ดึงคำค้นหาจาก URL
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (query) {
//       axios
//         .get(`http://localhost:3001/search-all?search=${query}`)
//         .then((response) => {
//           if (response.data.success) {
//             setResults(response.data.data);
//           }
//         })
//         .catch((error) => {
//           console.error("Error fetching search results:", error.message);
//         })
//         .finally(() => {
//           setLoading(false);
//         });
//     }
//   }, [query]);

//   if (loading) {
//     return <p>กำลังโหลดข้อมูล...</p>;
//   }

//   return (
//     <div className="container mt-4">
//       <h3>ผลลัพธ์การค้นหา: "{query}"</h3>
//       {results.length > 0 ? (
//         <ul className="list-group">
//           {results.map((result, index) => (
//             <li key={index} className="list-group-item">
//               {result.type === "news" && (
//                 <a href={`/news/${result.id}`}>ข่าว: {result.title}</a>
//               )}
//               {result.type === "webboard" && (
//                 <a href={`/webboard/${result.id}`}>กระทู้: {result.title}</a>
//               )}
//               {result.type === "profile" && (
//                 <a href={`/profile/${result.id}`}>โปรไฟล์: {result.title}</a>
//               )}
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>ไม่พบผลลัพธ์ที่ตรงกับคำค้นหา</p>
//       )}
//     </div>
//   );
// }

// export default SearchResults;