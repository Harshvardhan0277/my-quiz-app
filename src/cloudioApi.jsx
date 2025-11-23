import { ulid } from "ulid";

const AUTH_URL = "https://dev.cloudio.io/v1/auth";
const API_URL = "https://dev.cloudio.io/v1/api";
// const API_KEY = "01KAA533E6244AD6G9SJZ17R"; 

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

export {
  cloudioAuth,
  cloudioQuery,
  cloudioWrite,
  setCloudioTokens,
  clearCloudioTokens,
  getCurrentTokens,
};