import { ulid } from "ulid";

const AUTH_URL = "https://dev.cloudio.io/v1/auth";
const API_URL = "https://dev.cloudio.io/v1/api";


let jwt = null;
let csrf = null;  
let savedToken = null;
let savedXToken = null;


const encrypt = (input) => btoa(input);

async function cloudioAuth(username, password) {
  try {
    const token = `X${ulid()}`;
    savedToken = token;

    const preValidateResponse = await fetch("https://dev.cloudio.io/v1/x", {
      method: "POST",
      credentials: "include",
      headers: {
        "X-Application": "SignIn",
        "Content-Type": "application/json",
        "X-Token": token,
      },
      body: JSON.stringify({ x: token }),
    });

    if (!preValidateResponse.ok) {
      const text = await preValidateResponse.text();
      throw new Error(`Pre-validation failed: ${text}`);
    }

    const preValidateData = await preValidateResponse.json();
    const xToken = preValidateData.x;
    savedXToken = xToken;
   

    const authResponse = await fetch(AUTH_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-Application": "SignIn",
        "Content-Type": "application/json",
        "X-Token": `${token}${xToken}`,
      },
      body: JSON.stringify({
        un: encrypt(username.trim()),
        pw: encrypt(password.trim()),
        is_admin_url: false,
        is_native_login: true,
      }),
    });

    const authData = await authResponse.json();
    
    console.log(" FULL AUTH RESPONSE:", authData);

    if (authData.status !== "OK") {
      throw new Error(authData.message || "Login failed");
    }

    jwt = authData.jwt;
    csrf = authData.csrf || null;

    return {
      token: `${token}${xToken}`,
      jwt: authData.jwt,
      csrf: authData.csrf,
      x: authData.x,
      authResponse: authData,
    };
  } catch (error) {
    console.error(" cloudioAuth error:", error);
    throw error;
  }
}

async function cloudioQuery(queryBody, jwtToken, csrfToken, xToken) {
  const authJwt = jwtToken || jwt;
  const authCsrf = csrfToken || csrf;
  const useX = xToken;

  if (!authJwt) throw new Error("Not authenticated. Authentication token required.");

  console.log(" Making query with token");

  const headers = {
    "Content-Type": "application/json",
    "X-Application": "Training",
    // "x-api-key": API_KEY, 
    // "X-Token": authJwt,  
    "Authorization": authJwt
  };


  // if (authCsrf) {
  //   headers["x-csrf-token"] = authCsrf;
  // }

  let url = API_URL;
  if (useX) {
    url = `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(useX)}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(queryBody) 
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(" Query failed:", res.status, text);
    throw new Error(`Query failed: ${res.status} ${text}`);
  }

  return await res.json();
}

async function cloudioWrite(writeBody, jwtToken, csrfToken, xToken) {
  const authJwt = jwtToken ||  jwt;
  console.log(authJwt)
  const authCsrf = csrfToken || csrf;

  const useX = xToken;

  if (!authJwt) throw new Error("Not authenticated. Authentication token required.");

  console.log(" Making write request with body:",  !!authJwt, "CSRF:", !!authCsrf, "X:", useX);

  const headers = {
    "Content-Type": "application/json",
    "X-Application": "Training",
   // "x-api-key": API_KEY, 
    "Authorization":authJwt,   
  };

  if (authCsrf) {
    headers["x-csrf-token"] = authCsrf;
  }
//  console.log(repx);
  const res = await fetch(`https://dev.cloudio.io/v1/api?x=${encodeURIComponent(useX)}`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(writeBody), 
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(" Write failed:", res.status, text);
    throw new Error(`Write failed: ${res.status} ${text}`);
  }


  return await res.json();
}


function setCloudioTokens(jwtToken, csrfToken) {
  jwt = jwtToken;
  csrf = csrfToken;
  console.log(" CloudIO tokens set in module");
}

function clearCloudioTokens() {
  jwt = null;
  csrf = null;
  savedToken = null;
  savedXToken = null;
  console.log(" CloudIO tokens cleared from module");
}

function getCurrentTokens() {
  return { jwt, csrf };
}

async function deleteQuiz (quizId, user) {
  if (!quizId) throw new Error("Missing quiz id");
  if (!user?.x || !user?.jwt) {
    throw new Error("User session missing. Please login again.");
  }

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

    console.log("Delete Request Body:", JSON.stringify(fetchBody, null, 2));

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
      throw new Error(`Failed to fetch quiz for deletion: ${txt || fetchRes.status}`);
    }

    const fetchJson = await fetchRes.json();
    const row = fetchJson?.data?.QuizletUserQuiz?.data?.[0] || 
                fetchJson?.data?.QuizletUserQuizAlias?.data?.[0];
    
    if (!row) throw new Error("Quiz not found on server");

    console.log("Fetched quiz for deletion:", row);

    const deleteData = {
      _rs: "D",  
      id: row.id, 
      lastUpdateDate: row.lastUpdateDate
    };

    const deleteBody = {
      QuizletUserQuizAlias: {
        ds: "QuizletUserQuiz",
        data: [deleteData],
      },
    };

    console.log("Delete Request Body:", JSON.stringify(deleteBody, null, 2));

    const deleteRes = await fetch(
      `https://dev.cloudio.io/v1/api?x=${encodeURIComponent(user.x)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Application": "training",
          Authorization: user.jwt,
        },
        body: JSON.stringify(deleteBody),
      }
    );

    if (!deleteRes.ok) {
      const txt = await deleteRes.text().catch(() => "");
      throw new Error(`Delete failed: ${txt || deleteRes.status}`);
    }

    const deleteJson = await deleteRes.json();
    
    if (deleteJson?.status && deleteJson.status !== "OK") {
      throw new Error(deleteJson?.message ?? deleteJson?.title ?? "Delete failed");
    }

    return deleteJson;

  } catch (error) {
    console.error("DELETE API Error:", error);
    console.error("DELETE API Error Response:", error.response?.data);
    throw error;
  }
};

const logoutUser = async (user) => {
  if (!user?.x) return;

  try {
    const response = await fetch(`https://dev.cloudio.io/v1/signout?x=${encodeURIComponent(user.x)}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-Application": "SignIn",
        "Content-Type": "application/json",
      },
    });
    
    console.log("Logout API Response:", response);
    return response;
  } catch (err) {
    console.error("Signout error:", err);
    throw err;
  }
};

export {
  cloudioAuth,
  cloudioQuery,
  cloudioWrite,
  setCloudioTokens,
  clearCloudioTokens,
  getCurrentTokens,
  deleteQuiz,
  logoutUser
};