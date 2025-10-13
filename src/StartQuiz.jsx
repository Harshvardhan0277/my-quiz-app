export const StartQuiz = ({
  currentIndex,
  len,
  currentQuestion,
  selectedOption,
  handleAnswerClick,
  handleNextClick,
}) => {
  return (
    <div className="quiz">
      <h4>
        Question {currentIndex + 1} of {len}
      </h4>
      <h2>{currentQuestion.question}</h2>
      <div className="options-container">
        {currentQuestion.options.map((option, index) => {
          let className = "option";

          if (selectedOption !== null) {
            if (option === currentQuestion.answer) {
              className += " correct";
            } else if (option === selectedOption) {
              className += " wrong";
            } else {
              className += " disabled";
            }
          }

          return (
            <button
              key={index}
              className={className}
              onClick={() => handleAnswerClick(option)}
              disabled={selectedOption !== null}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selectedOption !== null && (
        <button onClick={handleNextClick} className="next-btn">
          Next
        </button>
      )}
    </div>
  );
};
