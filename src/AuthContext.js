import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
console.log("ssss")

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    const loginTimeStamp = new Date().getTime();
    localStorage.setItem('loginTimeStamp', loginTimeStamp);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('loginTimeStamp');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, isLoginModalOpen, setIsLoginModalOpen, handleLoginSuccess, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };