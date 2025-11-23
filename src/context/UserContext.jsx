import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const storedUser = sessionStorage.getItem('quizUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

      } catch (error) {
        console.error(error);
        sessionStorage.removeItem('quizUser');
      }
    }
    setLoading(false);
  }, []);


  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem('quizUser', JSON.stringify(userData));
    console.log('User logged in:', userData.name);
  };

  const logout = () => {
    console.log('User logged out:', user?.name);
    setUser(null);
    sessionStorage.removeItem('quizUser');
    
    localStorage.removeItem('cloudio_jwt');
    localStorage.removeItem('cloudio_csrf');
    sessionStorage.removeItem('cloudio_tokens');
    
    // console.log(' logged out ');
  };

  
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    sessionStorage.setItem('quizUser', JSON.stringify(updatedUser));
  };


  const isAuthenticated = !!user?.jwt;

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;