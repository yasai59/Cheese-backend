import axios from "axios";

import "../index";
import connection from "../server/database/connection";

beforeAll(() => {
  axios.defaults.baseURL = "http://localhost:3000";
});

describe("Test login", () => {
  test("Login success", async () => {
    try {
      const res = await axios.post("/api/user/login", {
        username: "alexvidalcasado@gmail.com",
        password: "1234",
      });
      expect(res.status).toEqual(200);
    } catch (e) {
      throw e;
    }
  });

  test("Login Fail", async () => {
    try {
      const res = await axios.post("/api/user/login", {
        username: "alexvidalcasado@gmail.com",
        password: "1",
      });
      expect(res.status).not().toEqual(200);
    } catch (error) {
      expect(error.response.status).toEqual(400);
    }
  });
});

describe("Create, update and delete users", () => {
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

  test("Create user", async () => {
    await connection
      .promise()
      .query("DELETE FROM user WHERE username = ?", [testUser.username]);
    const res = await axios.post("/api/user", testUser);

    expect(res.status).toEqual(200);
    const user = res.data.user;

    expect(user.email).toEqual(testUser.email);
    expect(user.password).toBeUndefined();
  });

  test("Update user", async () => {
    const tkn = await login(testUser.username, testUser.password);
    const lot_expected = 1;

    const res = await axios.put(
      "/api/user",
      {
        lot_number: lot_expected,
      },
      {
        headers: {
          "x-token": `${tkn}`,
        },
      }
    );
    expect(res.status).toEqual(200);
    const user = res.data.userDb;

    expect(user.username).toEqual(testUser.username);
    expect(user.email).toEqual(testUser.email);
    expect(user.password).toBeUndefined();
    expect(user.lot_number).toEqual(lot_expected);
  });

  test("should get user information", async () => {
    const response = await axios.get("/api/user/myUser", {
      headers: {
        "x-token":
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFsZXh2aWRhbGNhc2Fkb0BnbWFpbC5jb20iLCJpYXQiOjE3MTI2NTI2Mzh9.cFsTxcOB2Y8kli-e6XpW6WsB41EmVTt6rkr_9OZBPrA",
      },
    });
    const { user } = response.data;

    expect(response.status).toBe(200);
    expect(user).toHaveProperty("username");
    expect(user).toHaveProperty("email");
    // Add more assertions as needed
  });

  test("Change password", async () => {
    const tokn = await login(testUser.username, testUser.password);
    const res = await axios.post(
      "/api/user/change-password",
      {
        oldPassword: testUser.password,
        newPassword: testUser.password,
      },
      {
        headers: {
          "x-token": tokn,
        },
      }
    );

    expect(res.status).toBe(200);
    expect(res.data.message).toBe("Password updated successfully");
    expect(res.data.user.username).toBe(testUser.username);
  });

  test("Delete user", async () => {
    const tkn = await login(testUser.username, testUser.password);
    const res = await axios.delete("/api/user", {
      headers: {
        "x-token": `${tkn}`,
      },
    });

    expect(res.status).toEqual(200);
    expect(res.data.message).toEqual("User deleted successfully");
  });
});
