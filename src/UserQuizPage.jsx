import { Box, Typography, Button, Paper, CircularProgress, Alert, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlay, faPlus, faTrash, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { cloudioQuery, logoutUser } from "./cloudioApi";
import { useUser } from "./context/UserContext";

const UserQuizPage = () => {
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();

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

  const handleDeleteClick = (quiz, e) => {
    e.stopPropagation(); // Prevent card click
    setQuizToDelete(quiz);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    
    setDeleting(true);
    try {
     
      const fetchBody = {
        QuizletUserQuiz: {
          ds: "QuizletUserQuiz",
          query: {
            filter: [{ id: { is: Number(quizToDelete.id) } }],
            projection: {
              id: 1,
              lastUpdateDate: 1
            },
            limit: 1,
            offset: 0,
          },
        },
      };

      console.log("DELETE Request Body:", JSON.stringify(fetchBody, null, 2));

      const fetchRes = await fetch(
        `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(user.x)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Application": "training",
            Authorization: user.jwt,
          },
          body: JSON.stringify(fetchBody),
        }
      );

      if (!fetchRes.ok) {
        const txt = await fetchRes.text().catch(() => "");
        throw new Error(`Failed to fetch quiz for deletion: ${txt || fetchRes.status}`);
      }

      const fetchJson = await fetchRes.json();
      const row = fetchJson?.data?.QuizletUserQuiz?.data?.[0];
      
      if (!row) throw new Error("Quiz not found on server");

      console.log("Fetched quiz data for deletion:", row);

      const deleteBody = {
        QuizletUserQuiz: {
          ds: "QuizletUserQuiz",
          data: [
            {
              _rs: "D", 
              id: quizToDelete.id,
              lastUpdateDate: row.lastUpdateDate
            },
          ],
        },
      };

      console.log("DELETE Request Body:", JSON.stringify(deleteBody, null, 2));

      const deleteRes = await fetch(
        `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(user.x)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Application": "training",
            Authorization: user.jwt,
          },
          body: JSON.stringify(deleteBody),
        }
      );

      if (!deleteRes.ok) {
        const txt = await deleteRes.text().catch(() => "");
        throw new Error(`Delete failed: ${txt || deleteRes.status}`);
      }

      const deleteJson = await deleteRes.json();
      
      if (deleteJson?.status && deleteJson.status !== "OK") {
        throw new Error(deleteJson?.message ?? deleteJson?.title ?? "Delete failed");
      }

      console.log("DELETE API Response:", deleteJson);

      setUserQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
      setDeleteConfirmOpen(false);
      setQuizToDelete(null);
      
      console.log("Quiz deleted successfully");
    } catch (err) {
      console.error("Failed to delete quiz:", err);
      setError("Failed to delete quiz: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setQuizToDelete(null);
  };

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

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Quiz</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Quiz {quizToDelete?.id}? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <FontAwesomeIcon icon={faTrash} />}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, ml:-2 }}>
        <Typography variant="h5" fontWeight="bold">
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
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            startIcon={<FontAwesomeIcon icon={faSignOutAlt} />}
            sx={{ ml: 1 }}
          >
            Logout
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
            },
            position: 'relative' // For delete button positioning
          }}
          onClick={() => startSelectedQuiz(quiz)}
        >

          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white'
              }
            }}
            onClick={(e) => handleDeleteClick(quiz, e)}
            size="small"
          >
            <FontAwesomeIcon icon={faTrash} />
          </IconButton>

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
