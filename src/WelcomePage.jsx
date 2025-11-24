import { Box, Typography, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faHistory, faPlay } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { logoutUser } from "./cloudioApi";

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logoutUser(user);
      logout(); 
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);

      logout();
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "62vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 3,
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          padding: 5,
          backgroundColor: "white",
          borderRadius: 4,
          boxShadow: 5,
          maxWidth: 500,
          width: "100%",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Welcome to Quizlet!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Want to check your knowledge?
        </Typography>

        <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
          <Button
            onClick={() => navigate("/default-quiz")}
            variant="contained"
            color="primary"
            endIcon={<FontAwesomeIcon icon={faPlay} />}
            size="large"
            sx={{
              minWidth: 150,
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Start Quiz
          </Button>

          <Button
            onClick={() => navigate("/my-quizzes")}
            variant="contained"
            color="primary"
            endIcon={<FontAwesomeIcon icon={faHistory} />}
            size="large"
            sx={{ minWidth: 150, fontWeight: "bold", textTransform: "none" }}
          >
            My Quizzes
          </Button>

          <Button
            onClick={() => navigate("/create")}
            variant="outlined"
            color="secondary"
            endIcon={<FontAwesomeIcon icon={faEdit} />}
            size="large"
            sx={{
              minWidth: 150,
              fontWeight: "bold",
              textTransform: "none",
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
              },
            }}
          >
            Create Quiz
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            sx={{ ml: 1 }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomePage;