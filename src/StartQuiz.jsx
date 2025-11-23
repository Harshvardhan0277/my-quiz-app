import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Typography, Button, Paper } from "@mui/material";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

 const StartQuiz = ({ currentIndex, len, currentQuestion, selectedOption, handleAnswerClick, handleNextClick }) => {
  return (
    <Box
      sx={{
        py: 5,
        px: 3,
        maxWidth: 800,
        mx: "auto",
        background: "linear-gradient(145deg, #e3f2fd, #ffffff)",
        borderRadius: 5,
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
      }}
    >

      <Typography
        variant="subtitle1"
        color="text.secondary"
        textAlign="center"
        mb={1}
      >
        Question {currentIndex + 1} of {len}
      </Typography>


      <Typography
        variant="h4"
        fontWeight="bold"
        textAlign="center"
        mb={4}
        sx={{ color: "#1a237e" }}
      >
        {currentQuestion.question}
      </Typography>


      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 2,
        }}
      >
        {currentQuestion.options.map((option, index) => {
          let color = "primary";
          let icon = null;
          let bgColor = "#ffffff";
          let border = "1px solid #ccc";

          // if (selectedOption !== null) {
          //   if (option === currentQuestion.answer) {
          //     color = "success";
          //     icon = <FontAwesomeIcon icon={faCheck} style={{ marginRight: 10 }} />;
          //     bgColor = "#e8f5e9"; 
          //     border = "2px solid #66bb6a";
          //   } else if (option === selectedOption) {
          //     color = "error";
          //     icon = <FontAwesomeIcon icon={faTimes} style={{ marginRight: 10 }} />;
          //     bgColor = "#ffebee";
          //     border = "2px solid #ef5350";
          //   } else {
          //     color = "inherit";
          //     bgColor = "#f5f5f5";
          //     border = "1px dashed #ccc";
          //   }
          // }

          return (
            <Paper
              key={index}
              elevation={3}
              onClick={() => handleAnswerClick(option)}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border,
                backgroundColor: bgColor,
                cursor: selectedOption === null ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow:
                    selectedOption === null ? "0 4px 10px rgba(0,0,0,0.1)" : "",
                },
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color:
                    color === "error"
                      ? "#c62828"
                      : color === "success"
                      ? "#2e7d32"
                      : "#212121",
                  fontWeight: selectedOption && option === selectedOption ? "bold" : "normal",
                }}
              >
                {icon}
                {option}
              </Typography>
            </Paper>
          );
        })}
      </Box>


      {selectedOption !== null && (
        <Box textAlign="center" mt={5}>
          <Button
            variant="contained"
            onClick={handleNextClick}
            sx={{
              px: 5,
              py: 1.3,
              fontSize: "1rem",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: 2,
              background: "linear-gradient(to right, #3f51b5, #1e88e5)",
              "&:hover": {
                background: "linear-gradient(to right, #3949ab, #1565c0)",
              },
            }}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default StartQuiz;

