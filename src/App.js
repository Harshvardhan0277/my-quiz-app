import React, { useEffect, useState } from "react";
import { ShowResult } from "./ShowResult";
import { StartQuiz } from "./StartQuiz";
import { WelcomePage } from "./WelcomePage";
// import questions from "./questions";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showStartPage, setShowStartPage] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
  //   fetch("/questions.json")
  //     .then((res) => res.json())
  //     .then((data) => setQuestions(data))
  //     .catch((err) => console.error("Facing error to load questions:", err));
  // }, []);


    formatted();  
  }, []);

  const formatted = () => {
    fetch("https://opentdb.com/api.php?amount=5&category=20&difficulty=medium&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        const formattedQues = data.results.map((q) => {
          const options = shuffleArray([...q.incorrect_answers, q.correct_answer]);
          // const randomIdx = Math.floor(Math.random()*4);
          // options.splice(randomIdx, 0, q.correct_answer);

          return{
            question: decodeHTML(q.question),
            options: options.map(decodeHTML),
            answer: decodeHTML(q.correct_answer)
          };
        });

        const randomized = shuffleArray(formattedQues);

        setQuestions(randomized);
      })
      .catch((err) => console.error("Error while fetching API:", err));
  };

  const decodeHTML = (html) => {
    const text = document.createElement("textarea");
    text.innerHTML = html;
    return text.value;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for(let i = shuffled.length - 1; i>0; i--){
      const j = Math.floor(Math.random() * (i+1)); 
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  if (questions.length === 0) {
    return <div>Loading questions....</div>;
  }

  const handleStartQuiz = () => {
    setShowStartPage(false);
  };
  const currentQuestion = questions[currentIndex];

  const handleAnswerClick = (option) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);

    if (option === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const handleNextClick = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setShowStartPage(true);
    formatted();
  };

  return (
    <div className="App">
      <h1 className="abc">Quizlet🧠</h1>
      {showStartPage ? (
        <WelcomePage 
          handleStartQuiz={handleStartQuiz}
        />
      ) : showResult ? (
        <ShowResult
          score={score}
          handleRestart={handleRestart}
          len={questions.length}
        />
      ) : (
        <StartQuiz
          currentIndex={currentIndex}
          len={questions.length}
          currentQuestion={currentQuestion}
          selectedOption={selectedOption}
          handleAnswerClick={handleAnswerClick}
          handleNextClick={handleNextClick}
        />
      )}
    </div>
  );
}

export default App;
