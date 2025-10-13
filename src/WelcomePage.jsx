export const WelcomePage = ({handleStartQuiz}) => {
  return (
    <div className="start-pg">
      <h1>Welcome to the Quizlet! 👋</h1>
      <p>Want to check your Knowledge?</p>
      <button onClick={handleStartQuiz} className="start-btn">
        Start Quiz
      </button>
    </div>
  );
};
