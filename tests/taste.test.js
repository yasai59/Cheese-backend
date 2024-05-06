import axios from "axios";

import "../index";
import connection from "../server/database/connection";

beforeAll(() => {
  axios.defaults.baseURL = "http://localhost:3000";
});

describe("Test sobre los Gustos", () => {
  let token = "";
  let testUser = {
    username: "testuser",
    password: "12345",
    email: "testing@testing.testing",
  };

  const login = async (user, password) => {
    const res = await axios.post("/api/user/login", {
      username: user,
      password: password,
    });
    token = res.data.token;
    return token;
  };

  test("Obtener los gustos de una persona", async () => {
    try {
      const res = await axios.get("/api/taste", {
        headers: {
          "x-token":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsZXh2aWRhbGNhc2Fkb0BnbWFpbC5jb20iLCJpYXQiOjE3MTI2NTI2Mzh9.cFsTxcOB2Y8kli-e6XpW6WsB41EmVTt6rkr_9OZBPrA",
        },
      });
      expect(res.status).toEqual(200);
    } catch (e) {
      throw e;
    }
  });

  test("Obtener todos los gustos de la base de datos", async () => {
    try {
      const res = await axios.get("/api/taste/all", {
        headers: {
          "x-token":
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsZXh2aWRhbGNhc2Fkb0BnbWFpbC5jb20iLCJpYXQiOjE3MTI2NTI2Mzh9.cFsTxcOB2Y8kli-e6XpW6WsB41EmVTt6rkr_9OZBPrA",
        },
      });
      expect(res.status).toEqual(200);
    } catch (e) {
      throw e;
    }
  });

  test("Añadir un gusto a un usuario", async () => {
    try {
      const res = await axios.post(
        "api/taste",
        {
          tastes: [1],
        },
        {
          headers: {
            "x-token":
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsZXh2aWRhbGNhc2Fkb0BnbWFpbC5jb20iLCJpYXQiOjE3MTI2NTI2Mzh9.cFsTxcOB2Y8kli-e6XpW6WsB41EmVTt6rkr_9OZBPrA",
          },
        }
      );
      expect(res.status).toBe(200);
      expect(res.data.message).toBe("Tastes added to user");
    } catch (e) {
      throw e;
    }
  });
});
