import { createContext, useState, useEffect } from "react";

// Create login context
export const logincontext = createContext();

export const LoginProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userLoginStatus, setUserLoginStatus] = useState(false);

  // Load user from localStorage on component mount
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("LoggedInUser"));
    if (storedUser) {
      setCurrentUser(storedUser);
      setUserRole(storedUser.role);  // Assuming "role" is stored in localStorage
      setUserLoginStatus(true);
    }
  }, []);

  // Login function
  const loginUser = (user) => {
    localStorage.setItem("LoggedInUser", JSON.stringify(user));
    setCurrentUser(user);
    setUserRole(user.role);
    setUserLoginStatus(true);
  };

  // Logout function
  const logoutUser = () => {
    localStorage.removeItem("LoggedInUser");
    setCurrentUser(null);
    setUserRole(null);
    setUserLoginStatus(false);
  };

  // Role-based flags
  const isUser = userRole === "User";
  const isRecruiter = userRole === "Recruiter";
  const isAdmin = userRole === "Admin";

  return (
    <logincontext.Provider value={{ 
      currentUser, 
      userRole, 
      userLoginStatus, 
      isUser, 
      isRecruiter, 
      isAdmin, 
      loginUser, 
      logoutUser 
    }}>
      {children}
    </logincontext.Provider>
  );
};