import { Box, Typography, Button, Paper, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlay, faPlus } from "@fortawesome/free-solid-svg-icons";
import { cloudioQuery } from "./cloudioApi";
import { useUser } from "./context/UserContext";

const UserQuizPage = () => {
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user?.jwt) {
      fetchUserQuizzes();
    }
  }, [user]);

  const fetchUserQuizzes = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("Fetching quizzes for user:", user?.name);
      
      const queryBody = {
        QuizletUserQuiz: {
          ds: "QuizletUserQuiz",
          query: {
            filter: [
              {
                username: {
                  is: user?.name
                }
              }
            ],
            limit: 1000
          }
        }
      };

      
      const response = await cloudioQuery(queryBody, user.jwt, user.csrf, user.x);
      console.log("Quizzes response:", response);

      const quizzesData = response?.data?.QuizletUserQuiz?.data || [];
      
      setUserQuizzes(quizzesData);

    } catch (err) {
      console.error("Error fetching user quizzes:", err);
      setError("Failed to load your quizzes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startSelectedQuiz = (quiz) => {
    const quizId = quiz.id; 
    console.log("Starting quiz with ID:", quizId);
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading your quizzes...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchUserQuizzes}>
          Retry
        </Button>
      </Box>
    );
  }

  if (userQuizzes.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          No quizzes created yet.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Start by creating your first quiz!
        </Typography>
        <Button
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => navigate("/create")}
        >
          Create Your First Quiz
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Your Created Quizzes
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={() => navigate("/create")}
          >
            Create New Quiz
          </Button>
          <Button
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faHouse} />}
            onClick={() => navigate("/welcome")}
          >
            Home
          </Button>
        </Box>
      </Box>

      {userQuizzes.map((quiz, i) => (
        <Paper
          key={quiz.id}
          elevation={3}
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2, 
            cursor: "pointer",
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4
            }
          }}
          onClick={() => startSelectedQuiz(quiz)}
        >
          <Typography variant="h6">Quiz {quiz.id}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Created by: {quiz.username}
          </Typography>

          {quiz.lastResult !== undefined && quiz.lastResult !== null && quiz.lastResult >= 0 && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Last Score: <strong>{quiz.lastResult}</strong>
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faPlay} />}
            onClick={(e) => {
              e.stopPropagation();
              startSelectedQuiz(quiz);
            }}
          >
            Start Quiz
          </Button>
        </Paper>
      ))}
    </Box>
  );
};

export default UserQuizPage;