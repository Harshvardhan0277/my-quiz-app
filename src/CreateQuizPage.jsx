import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Divider,
  Paper,
  Alert,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { cloudioWrite } from "./cloudioApi";
import { useUser } from "./context/UserContext";


const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [questions, setQuestions] = useState([
    {
      id: uuidv4(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addQuestion = () => {
    setQuestions((s) => [
      ...s,
      {
        id: uuidv4(),
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const handleQuestionChange = (qid, text) => {
    setQuestions((old) =>
      old.map((q) => (q.id === qid ? { ...q, question: text } : q))
    );
  };

  const handleOptionChange = (qid, idx, text) => {
    setQuestions((old) =>
      old.map((q) => {
        if (q.id !== qid) return q;
        const newOpts = [...q.options];
        newOpts[idx] = text;
        return { ...q, options: newOpts };
      })
    );
  };

  const handleAnswerChange = (qid, text) => {
    setQuestions((old) =>
      old.map((q) => (q.id === qid ? { ...q, correctAnswer: text } : q))
    );
  };

  const removeQuestion = (qid) => {
    if (questions.length > 1) {
      setQuestions((old) => old.filter((q) => q.id !== qid));
    }
  };

  const validate = () => {
    for (let q of questions) {
      if (!q.question.trim()) {
        setError(`Question ${questions.indexOf(q) + 1} is empty`);
        return false;
      }
      if (!q.options.every((opt) => opt.trim() !== "")) {
        setError(
          `All options must be filled for Question ${questions.indexOf(q) + 1}`
        );
        return false;
      }
      if (!q.correctAnswer.trim() || !q.options.includes(q.correctAnswer)) {
        setError(
          `Correct answer must match one of the options for Question ${
            questions.indexOf(q) + 1
          }`
        );
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSave = async () => {
  if (!validate()) {
    alert("Please fill all fields and ensure the correct answer exactly matches one option.");
    return;
  }


  if (!user?.jwt) {
    setError("Authentication token missing. Please log in again.");
    return;
  }

  setLoading(true);
  setError("");

  try {

     console.log("DEBUG - Current user authentication:");
    console.log("  User name:", user?.name);
    console.log("  JWT present:", !!user?.jwt);
    console.log("  CSRF present:", !!user?.csrf);
    console.log("  X token present:", !!user?.x);
    console.log("  JWT length:", user?.jwt?.length);
    console.log("  X token length:", user?.x?.length);
    
    if (!user?.jwt || !user?.x) {
      throw new Error("Authentication tokens missing. Please log in again.");
    }


    
    const createQuizBody = {
      QuizletUserQuizAlias: {
        ds: "QuizletUserQuiz",
        data: [
          {
            _rs: "I",
            username: user.name || "harshvardhan"
            // lastResult: -1
            // quizId: 50
          }
        ]
      }
    };

    console.log("Creating quiz with body:", createQuizBody);

    // console.log(user.x);

    const createRes = await cloudioWrite(createQuizBody, user.jwt, user.csrf, user.x);
    console.log("Create quiz response:", createRes);
    
    const createdRows =
      createRes?.data?.QuizletUserQuiz?.data ||
      createRes?.data?.QuizletUserQuizAlias?.data ||
      [];
    
    if (!createdRows || createdRows.length === 0) {
      throw new Error("Could not create quiz record (no id returned).");
    }

    

    const id = createdRows[0].quizId;
     console.log("Quiz created with ID:", id);

     
    const questionsPayload = questions.map((q) => ({
      _rs: "I",
      quizId: id,
      question: q.question,
      option1: q.options[0] || "",
      option2: q.options[1] || "",
      option3: q.options[2] || "",
      option4: q.options[3] || "",
      correctAnswer: q.correctAnswer
    }));

    const writeQuestionsBody = {
      QuizletQuestionsAlias: {
        ds: "QuizletQuestions",
        data: questionsPayload
      }
    };

    console.log("Writing questions with quizId:", id);
    await cloudioWrite(writeQuestionsBody, user.jwt, user.csrf, user.x);

    alert("Quiz saved to CloudIO!");
    navigate(`/quiz/${id}`);
  } catch (err) {
    console.error("Save quiz error:", err);
    setError("Failed to save quiz: " + err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Create Your Quiz
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {questions.map((q, idx) => (
        <Paper
          key={q.id}
          elevation={3}
          sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: "#fafafa" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Question {idx + 1}</Typography>
            {questions.length > 1 && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => removeQuestion(q.id)}
                disabled={loading}
              >
                Remove
              </Button>
            )}
          </Box>

          <TextField
            label="Question"
            variant="outlined"
            fullWidth
            value={q.question}
            onChange={(e) => handleQuestionChange(q.id, e.target.value)}
            sx={{ mb: 3 }}
            disabled={loading}
          />

          {q.options.map((opt, oidx) => (
            <TextField
              key={oidx}
              label={`Option ${oidx + 1}`}
              fullWidth
              value={opt}
              onChange={(e) => handleOptionChange(q.id, oidx, e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
          ))}

          <Button
            onClick={() => {
              const newOptions = [...q.options, ""];
              setQuestions((old) =>
                old.map((x) =>
                  x.id === q.id ? { ...x, options: newOptions } : x
                )
              );
            }}
            size="small"
            sx={{ mb: 2 }}
            disabled={loading}
          >
            Add Option
          </Button>

          <Divider sx={{ my: 2 }} />

          <TextField
            label="Correct Answer (must match one option exactly)"
            variant="outlined"
            fullWidth
            value={q.correctAnswer}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            sx={{ mt: 1 }}
            disabled={loading}
          />
        </Paper>
      ))}

      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={addQuestion}
          sx={{ mr: 2 }}
          disabled={loading}
        >
          Add Question
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          sx={{ px: 4 }}
          disabled={loading || questions.length === 0}
        >
          {loading ? "Saving..." : "Save Quiz"}
        </Button>
      </Box>
    </Box>
  );
};

export default CreateQuizPage;
