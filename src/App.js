import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Container, Box, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain } from "@fortawesome/free-solid-svg-icons";

import { UserProvider, useUser } from "./context/UserContext";
import LoginPage from "./LoginPage";
import WelcomePage from "./WelcomePage";
import CreateQuizPage from "./CreateQuizPage";
import UserQuizPage from "./UserQuizPage";
import QuizPage from "./QuizPage";
import QuizPageDefault from "./QuizPageDefault";

import { cloudioAuth, setCloudioTokens, clearCloudioTokens } from "./cloudioApi";


function AppContent() {
  const { user, login, loading } = useUser();

  const handleLogin = async (name, password) => {
    try {

      clearCloudioTokens();

      const auth = await cloudioAuth(name, password);

      console.log("Auth result in handleLogin:", auth);

      if (!auth?.token) {
        throw new Error("No authentication token returned from CloudIO.");
      }

      console.log("Authentication token received");


      const userObj = {
        name,
        token: auth.token,
        jwt: auth.jwt,
        csrf: auth.csrf,
        x: auth.x
      };

      console.log("User object being stored:", userObj);

      setCloudioTokens(auth.token, auth.csrf);

      login(userObj);

      return userObj;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const handleLogout = () => {
    clearCloudioTokens();
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: "center", marginTop: 7.5 }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
          <FontAwesomeIcon
            icon={faBrain}
            size="3x"
            style={{ marginRight: 10, color: "#1976d2" }}
          />
          <Typography variant="h3" fontWeight="bold" color="primary">
            Quizlet
          </Typography>
        </Box>
        <Typography variant="h6">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", marginTop: 7.5 }}>
      <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
        <FontAwesomeIcon
          icon={faBrain}
          size="3x"
          style={{ marginRight: 10, color: "#1976d2" }}
        />
        <Typography variant="h3" fontWeight="bold" color="primary">
          Quizlet
        </Typography>
      </Box>

      <Routes> 
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/welcome" replace /> : <LoginPage onLogin={handleLogin} />
          } 
        />

        <Route
          path="/welcome"
          element={
            user ? <WelcomePage onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/create"
          element={
            user ? <CreateQuizPage /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/quiz/:quizId"
          element={
            user ? <QuizPage /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/default-quiz"
          element={
            user ? <QuizPageDefault /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/my-quizzes"
          element={
            user ? <UserQuizPage /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/"
          element={<Navigate to={user ? "/welcome" : "/login"} replace />}
        />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes> 
    </Container>
  );
}

function App() {
  return (
    <Router>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </Router>
  );
}

export default App;



