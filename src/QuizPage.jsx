import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import ShowResult from "./ShowResult";
import { cloudioQuery, cloudioWrite } from "./cloudioApi";
import { useUser } from "./context/UserContext";

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId) {
      setError("No quiz ID provided");
      setLoading(false);
      return;
    }
    loadQuiz(quizId);
  }, [quizId, user]);

  async function loadQuiz(quizId) {
    setLoading(true);
    try {
      const body = {
        QuizletQuestionsAlias: {
          ds: "QuizletQuestions",
          query: {
            filter: [
              {
                quizId: {
                  is: parseInt(quizId),
                },
              },
            ],
            limit: 1000,
          },
        },
      };

      const res = await cloudioQuery(body, user?.jwt, user?.csrf, user?.x);
      console.log("Questions response:", res);

      const rows =
        res?.data?.QuizletQuestions?.data ||
        res?.data?.QuizletQuestionsAlias?.data ||
        [];

      if (rows.length === 0) {
        setError("No questions found for this quiz.");
        setQuestions([]);
        return;
      }

      const formatted = rows.map((r) => ({
        id: r.id,
        question: r.question,
        options: [
          r.option1 || "",
          r.option2 || "",
          r.option3 || "",
          r.option4 || "",
        ].filter((opt) => opt && opt.trim() !== ""),
        answer: r.correctAnswer,
      }));

      setQuestions(formatted);
      setSelectedAnswers(new Array(formatted.length).fill(null));
    } catch (err) {
      console.error("Load quiz error:", err);
      setError("Failed to load quiz questions: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSelect = (opt) => {
    const copy = [...selectedAnswers];
    copy[currentIndex] = opt;
    setSelectedAnswers(copy);
  };

  const handleSubmit = async () => {
  let calc = 0;
  selectedAnswers.forEach((a, i) => {
    if (a === questions[i].answer) calc++;
  });

  setScore(calc);
  setShowResult(true);

  try {
   
    const fetchBody = {
      QuizletUserQuizAlias: {
        ds: "QuizletUserQuiz",
        query: {
          filter: [{ id: { is: Number(quizId) } }],
          projection: {
            id: 1,
            quizId: 1,
            username: 1,
            lastResult: 1,
            creationDate: 1,
            createdBy: 1,
            lastUpdateDate: 1,
            lastUpdatedBy: 1
          },
          limit: 1,
          offset: 0,
        },
      },
    };

    console.log("UPDATE Request Body:", JSON.stringify(fetchBody, null, 2));

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
      throw new Error(`Failed to fetch quiz: ${txt || fetchRes.status}`);
    }

    const fetchJson = await fetchRes.json();
    const row = fetchJson?.data?.QuizletUserQuiz?.data?.[0] || 
                fetchJson?.data?.QuizletUserQuizAlias?.data?.[0];
    
    if (!row) throw new Error("Quiz not found on server");

    console.log("Fetched quiz data for update:", row);

    const updateData = {
      _rs: "U",
      id: row.id,
      quizId: row.quizId,
      username: row.username,
      lastResult: Number(calc), // updating
      creationDate: row.creationDate,        
      createdBy: row.createdBy,              
      lastUpdateDate: row.lastUpdateDate,   
      lastUpdatedBy: row.lastUpdatedBy,      
    };

    const updateBody = {
      QuizletUserQuizAlias: {
        ds: "QuizletUserQuiz",
        data: [updateData],
      },
    };

    console.log("UPDATE Request Body:", JSON.stringify(updateBody, null, 2));

    const updateRes = await fetch(
      `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(user.x)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Application": "training",
          Authorization: user.jwt,
        },
        body: JSON.stringify(updateBody),
      }
    );

    if (!updateRes.ok) {
      const txt = await updateRes.text().catch(() => "");
      throw new Error(`Update failed: ${txt || updateRes.status}`);
    }

    const updateJson = await updateRes.json();
    
    if (updateJson?.status && updateJson.status !== "OK") {
      throw new Error(updateJson?.message ?? updateJson?.title ?? "Update failed");
    }

    console.log("UPDATE API Response:", updateJson);
    console.log("Score updated successfully to:", calc);

  } catch (error) {
    console.error("UPDATE API Error:", error);
    console.error("UPDATE API Error Response:", error.response?.data);
  }
};

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowResult(false);
    setScore(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
  };

  const handleRetry = () => {
    loadQuiz(quizId);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">Loading questions...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6" color="error">
          Error
        </Typography>
        <Typography sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="contained" onClick={handleRetry}>
          Retry
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate("/welcome")}
          sx={{ ml: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    );
  }

  if (questions.length === 0) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h6">No questions found</Typography>
        <Typography sx={{ mb: 2 }}>
          This quiz doesn't have any questions yet.
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/welcome")}>
          Back to Home
        </Button>
      </Box>
    );
  }

  if (showResult) {
    return (
      <ShowResult
        score={score}
        len={questions.length}
        handleRestart={handleRestart}
        questions={questions}
        selectedAnswers={selectedAnswers}
      />
    );
  }

  const current = questions[currentIndex];
  return (
    <Box sx={{ mt: 2, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">
          All the best, {user?.name || "Player"}!
        </Typography>
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
        {current.question}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {current.options.map((opt, idx) => (
          <Button
            key={idx}
            variant={
              selectedAnswers[currentIndex] === opt ? "contained" : "outlined"
            }
            onClick={() => handleSelect(opt)}
            sx={{ justifyContent: "flex-start" }}
          >
            {opt}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
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
          <Button
            variant="contained"
            onClick={() =>
              setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
            }
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default QuizPage;