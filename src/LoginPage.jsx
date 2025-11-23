import React, { useState } from "react";
import { Box, Container, Paper, Typography, TextField, Button, Alert } from "@mui/material";


const LoginPage = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const auth = await onLogin(name, password);
    
    if (auth?.token) {
      // Navigation will be handled by the route protection in App.js
      // The context update will trigger re-render and navigation
    } else {
      setError("Invalid login");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("Login failed: " + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <Box sx={{ minHeight: "68vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
            Let's Start!
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: "text.secondary", mb: 3 }}>
            Please login to your account
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              type="text"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login / Register"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;

































// // LoginPage.jsx
// import React, { useState } from "react";
// import { Box, Container, Paper, Typography, TextField, Button, Alert } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// const LoginPage = ({ onLogin }) => {
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//   setError("");

//   try {
//     const auth = await onLogin(name, password);

//     if (auth?.token) {
//       navigate("/welcome");
//     } else {
//       setError("Invalid login");
//     }

//   } catch (err) {
//     console.error("Login error:", err);
//     setError("Login failed");
//   }
//   };

//   return (
//     <Box sx={{ minHeight: "68vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
//       <Container maxWidth="xs">
//         <Paper elevation={6} sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
//           <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
//             Let's Start!
//           </Typography>
//           <Typography variant="body1" gutterBottom sx={{ color: "text.secondary", mb: 3 }}>
//             Please login to your account
//           </Typography>

//           <Box component="form" onSubmit={handleSubmit}>
//             <TextField
//               label="Username"
//               variant="outlined"
//               type="input"
//               fullWidth
//               required
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               sx={{ mb: 2 }}
//             />

//             <TextField
//               label="Password"
//               type="password"
//               variant="outlined"
//               fullWidth
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               sx={{ mb: 2 }}
//             />

//             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//             <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5, fontWeight: "bold" }}>
//               Login / Register
//             </Button>
//           </Box>
//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// export default LoginPage;









// import { useState } from "react";
// import { Box, Button, TextField, Typography, Container, Alert, Paper } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// export const LoginPage = ({ onLogin }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   // const validUsers = {
//   //   Raghav: "Janaki",
//   //   Madhav: "Radha"
//   // };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!username.trim() || !password.trim()) {
//       setError("Please enter both username and password.");
//       return;
//     }

//     if (validUsers[username] && validUsers[username] === password) {
//       onLogin(username);
//       navigate("/welcome");
//     } else {
//       setError("Invalid username or password.");
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "68vh",
//         background: "linear-gradient(135deg)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         p: 2,
//       }}
//     >
//       <Container maxWidth="xs">
//         <Paper elevation={6} sx={{ borderRadius: 3, p: 4, textAlign: "center" }}>
//           <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
//             Let's Start!
//           </Typography>
//           <Typography variant="body1" gutterBottom sx={{ color: "text.secondary", mb: 3 }}>
//             Please login to your account
//           </Typography>

//           <Box component="form" onSubmit={handleSubmit}>
//             <TextField
//               label="Username"
//               variant="outlined"
//               fullWidth
//               required
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               sx={{ mb: 2 }}
//             />

//             <TextField
//               label="Password"
//               type="password"
//               variant="outlined"
//               fullWidth
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               sx={{ mb: 2 }}
//             />

//             {error && (
//               <Alert severity="error" sx={{ mb: 2 }}>
//                 {error}
//               </Alert>
//             )}

//             <Button
//               type="submit"
//               variant="contained"
//               fullWidth
//               size="Medium"
//               disabled={!username.trim()}
//               sx={{
//                 mt: 2,
//                 py: 1.5,
//                 fontWeight: "bold",
//                 letterSpacing: 1,
//                 textTransform: "uppercase",
//               }}
//             >
//               Login
//             </Button>
//           </Box>
//         </Paper>
//       </Container>
//     </Box>
//   );
// };





















// // import React, { useState } from "react";
// // import { Box, Button, TextField, Typography, Container, Alert } from "@mui/material";
// // import { useNavigate } from "react-router-dom";

// // export const LoginPage = ({ onLogin }) => {
// //   const [username, setUsername] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [error, setError] = useState("");
// //   const navigate = useNavigate();

// //   const validUsers = {
// //     user1: "pass123",
// //     admin: "admin123",
// //     guest: "guest",
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
    
// //     if (!username.trim() || !password.trim()) {
// //       setError("Please enter both username and password.");
// //       return;
// //     }

// //     if (validUsers[username] && validUsers[username] === password) {
// //       onLogin(username);    
// //       navigate("/welcome");        
// //     } else {
// //       setError("Invalid username or password.");
// //     }
// //   };

// //   return (
// //     <Container maxWidth="xs" sx={{ mt: 10, textAlign: "center" }}>
// //       <Typography variant="h4" gutterBottom>
// //         Login
// //       </Typography>

// //       <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
// //         <TextField
// //           label="Username"
// //           variant="outlined"
// //           fullWidth
// //           required
// //           value={username}
// //           onChange={(e) => setUsername(e.target.value)}
// //           sx={{ mb: 2 }}
// //         />

// //         <TextField
// //           label="Password"
// //           type="password"
// //           value={password}
// //           onChange={(e) => setPassword(e.target.value)}
// //           fullWidth
// //           required
// //           sx={{ mb: 2 }}
// //         />

// //         {error && (
// //           <Alert severity="error" sx={{ mb: 2 }}>
// //             {error}
// //           </Alert>
// //         )}

// //         <Button
// //           type="submit"
// //           variant="contained"
// //           fullWidth
// //           sx={{ mt: 3 }}
// //           disabled={!username.trim()}
// //         >
// //           Login
// //         </Button>
// //       </Box>
// //     </Container>
// //   );
// // };
