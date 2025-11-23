import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import ShowResult from "./ShowResult";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "./context/UserContext";

const QuizPageDefault = ({logout}) => {
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
   fetchQuestions();
  }, []);
  

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://opentdb.com/api.php?amout=5&category=20&difficulty=medium&type=multiple"
      );
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const formatted = data.results.map((q) => {
          const options = shuffleArray([
            ...q.incorrect_answers,
            q.correct_answer,
          ]);
          return {
            question: decodeHTML(q.question),
            options: options.map(decodeHTML),
            answer: decodeHTML(q.correct_answer),
          };
        });

        setQuestions(formatted);
        setSelectedAnswers(new Array(formatted.length).fill(null));
      } else {
        console.warn("No questions from API. Using default questions.");
        await DefaultQuestions();
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      await DefaultQuestions();
    } finally{
        setLoading(false);
    }
  };

  const DefaultQuestions = async () => {
    try {
      const res = await fetch("/questions.json");
      const backupQuestions = await res.json();

      setQuestions(backupQuestions);
      setSelectedAnswers(new Array(backupQuestions.length).fill(null));
    } catch (err) {
      console.error("Failed to load dafault questions:", err);
    }
  };


  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const decodeHTML = (html) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const handleOptionSelect = (option) => {
    const updated = [...selectedAnswers];
    updated[currentIndex] = option;
    setSelectedAnswers(updated);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    
    let calculatedScore = 0;
    selectedAnswers.forEach((ans, index) => {
      if (ans === questions[index].answer) calculatedScore++;
    });

    setScore(calculatedScore);
    setShowResult(true);
  };

  const handleRestart = async () => {
    // setSelectedAnswers([]);
    setCurrentIndex(0);
    setShowResult(false);
    setScore(0);
    setSelectedAnswers([]);
    await fetchQuestions();
  };

  if (loading)
    return <Typography>Loading questions...</Typography>;

  if (showResult) {
    return (
      <ShowResult
        score={score}
        len={questions.length}
        handleRestart={handleRestart}
        questions={questions}
        selectedAnswers={selectedAnswers}
        onLogout={logout}
      />
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion || !Array.isArray(currentQuestion.options)) {
    return <Typography>Loading current question...</Typography>;
  }

  // console.log("questions in ShowResult:", questions);
  // console.log("selectedAnswers in ShowResult:", selectedAnswers);
  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">All the best, {user?.name || "Player"}!</Typography>
        <Button
          variant="outlined"
          sx={{ mr: 1 }}
          onClick={() => navigate("/welcome")}
          endIcon={<FontAwesomeIcon icon={faHouse} />}
        >
          Home
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Question {currentIndex + 1} of {questions.length}
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {currentQuestion.question}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {currentQuestion.options.map((opt, idx) => (
          <Button
            key={idx}
            variant={
              selectedAnswers[currentIndex] === opt ? "contained" : "outlined"
            }
            color={
              selectedAnswers[currentIndex] === opt ? "primary" : "inherit"
            }
            onClick={() => handleOptionSelect(opt)}
          >
            {opt}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          variant="outlined"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={selectedAnswers.includes(null)}
          >
            Submit
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QuizPageDefault;



  /*const fetchQuestions = () => {
    fetch("https://opentdb.com/api.php?amount=5&category=20&difficulty=medium&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        if(data.results){const formatted = data.results.map((q) => {
          const options = shuffleArray([...q.incorrect_answers, q.correct_answer]);
          return {
            question: decodeHTML(q.question),
            options: options.map(decodeHTML),
            answer: decodeHTML(q.correct_answer),
          };
        });
    
        setQuestions(formatted);
        setSelectedAnswers(new Array(formatted.length).fill(null)); // initialize blank answers

        }        
      });
  };
*/