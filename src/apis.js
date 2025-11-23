import { ulid } from "ulid";
const AUTH_URL = "https://dev.cloudio.io/v1/auth";
const API_URL = "https://dev.cloudio.io/v1/api";

let jwt = null;
let csrf = null;

const token = `X${ulid()}`;
const preValidateResponse = await fetch(`https://dev.cloudio.io/v1/x`, {
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

console.log("Received x-token:", xToken);

async function cloudioAuth(username, password) {
  const url = "https://dev.cloudio.io/v1/auth";

  const encrypt = (input) => {
    return btoa(input);
  };

  const res = await fetch(url, {
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
    // CloudIO requires raw empty JSON
  });

  const r = await res.json();
  console.log("auth response:", r);

//   if (r.status !== "OK") {
//     throw new Error("Login failed");
//   }

  
//   return {
//     token: `${token}${xToken}`, // OR r.jwt if CloudIO uses JWT
//     jwt: r.jwt || null,
//     csrf: r.csrf || null,
//     x: r.x || null,
//   };
}

// async function cloudioAuth(username, password) {
//   const token = btoa(`${username}:${password}`); // base64

//   const res = await fetch(AUTH_URL, {
//     method: "POST",
//     headers: {
//       Authorization: `Token ${token}`,
//       "x-csrf-token": csrf,
//       "Content-Type": "application/json",
//       "x-api-key": "01KAAS33E624J4ADRGPJ5DZ17R",
//       "X-Application": "Training"
//     },
//     body: JSON.stringify({
//       QuizletUsersAlias: {
//         ds: "QuizletUsers",
//         query: {
//           filter: [{ name: { is: "Raghav" } }, { password: { is: "Janaki" } }],
//           offset: 0,
//           limit: 10,
//         },
//       },
//     }),
//   });
//   console.log(res);
//   //{"cc":"","ck":"","un":btoa(username),"pw":btoa(password),"is_admin_url":false,"is_native_login":true}
//   const text = await res.text();

//   if (!res.ok) {
//     throw new Error(`CloudIO auth failed: ${res.status} ${text}`);
//   }

//   const data = JSON.parse(text);
//   jwt = data.jwt;
//   csrf = data.csrf;

//   return { jwt, csrf };
// }

// function getJwt() {
//   return jwt;
// }

// function getCsrf() {
//   return csrf;
// }

async function cloudioQuery(queryBody) {
  if (!jwt || !csrf)
    throw new Error("Not authenticated. Call cloudioAuth first.");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "x-csrf-token": csrf,
      "Content-Type": "application/json",
      "x-api-key": "01KAAS33E624J4ADRGPJ5DZ17R",
      "X-Application": "Training",
    },
    body: JSON.stringify(queryBody),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Query failed: ${res.status} ${text}`);
  }

  return await res.json();
}

async function cloudioWrite(writeBody) {
  if (!jwt || !csrf)
    throw new Error("Not authenticated. Call cloudioAuth first.");
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "x-csrf-token": csrf,
      "Content-Type": "application/json",
      "x-api-key": "01KAAS33E624J4ADRGPJ5DZ17R",
      "X-Application": "Training",
    },
    body: JSON.stringify(writeBody),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Write failed: ${res.status} ${text}`);
  }

  return await res.json();
}

async function findUser(name, password, token) {
  return cloudioQuery(
    {
      ds: "QuizletUsers",
      query: {
        filter: [{ name: { eq: name } }, { password: { eq: password } }],
      },
    },
    token
  );
}

async function createUser(name, password, token) {
  return cloudioUpdate(
    {
      QuizletUsersAlias: {
        ds: "QuizletUsers",
        data: [{ _rs: "I", name, password, id: 0 }],
      },
    },
    token
  );
}

async function cloudioUpdate(payload, token) {
  const res = await fetch("https://next.cloudio.io/v1/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("CloudIO update error:", data);
    throw new Error("CloudIO update failed");
  }

  return data;
}

export {
  cloudioAuth,
  cloudioQuery,
  cloudioWrite,
  findUser,
  createUser,
  cloudioUpdate,
  //   getCsrf,
  //   getJwt,
};
