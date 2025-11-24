import { Box, Typography, Button } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRedo,
  faCheckCircle,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext";
import { logoutUser } from "./cloudioApi";
//  import { user } from "./UserQuizPage";

const ShowResult = ({
  score,
  handleRestart,
  len,
  questions = [],
  selectedAnswers = [],
}) => {
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
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", ml: 50 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/welcome")}
          endIcon={<FontAwesomeIcon icon={faHouse} />}
        >
          Home
        </Button>
      </Box>
      <Box
        className="result"
        sx={{
          textAlign: "center",
          padding: 4,
          backgroundColor: "#e3f2fd",
          borderRadius: 3,
          boxShadow: 2,
          maxWidth: 500,
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        <Typography variant="h5" gutterBottom>
          <FontAwesomeIcon
            icon={faCheckCircle}
            style={{ marginRight: 10, color: "green" }}
          />
          Quiz Completed!
        </Typography>

        <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: "bold" }}>
          Your Score: {score} / {len}
        </Typography>

        <Box sx={{ mt: 3 }}>
          {questions.map((q, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === q.answer;

            return (
              <Box
                key={index}
                sx={{ mb: 3, p: 2, border: "1px solid #ccc", borderRadius: 2 }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Q{index + 1}: {q.question}
                </Typography>

                <Typography color={isCorrect ? "green" : "red"}>
                  Your Answer: {userAnswer ?? "No answer"}
                </Typography>

                {!isCorrect && (
                  <Typography color="green">
                    Correct Answer: {q.answer}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleRestart}
          className="restart-btn"
          startIcon={<FontAwesomeIcon icon={faRedo} />}
        >
          Restart Quiz
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
  );
};

export default ShowResult;

/* export const ShowResult = ({ score, handleRestart, len }) => {
  return (
    <div className="result">
      <h2>Quiz Completed! 🏆</h2>
      <p>
        Your Score: {score} / {len}
      </p>
      <button onClick={handleRestart} className="restart-btn">
        ⟳ Restart Quiz
      </button>
    </div>
  );
}; */
