import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = () => {
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("userRole");

      if (userId && role) {
        axios.get(`http://localhost:3001/users/profile/${userId}`)
          .then((response) => {
            if (response.data.success) {
              setUser({
                userId,
                role,
                profilePicture: response.data.user.profilePicture, // โหลดรูปจากเซิร์ฟเวอร์
              });
            }
          })
          .catch((error) => console.error("Error fetching profile:", error));
      } else {
        setUser(null);
      }
    };

    fetchUserProfile();
    window.addEventListener("storage", fetchUserProfile);

    return () => {
      window.removeEventListener("storage", fetchUserProfile);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
