export const ShowResult = ({ score, handleRestart, len }) => {
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
};
