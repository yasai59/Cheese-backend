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
      username: "alexvidalcasado@gmail.com",
      password: "1234",
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

    expect(user.username).toEqual(testUser.username);
    expect(user.email).toEqual(testUser.email);
    expect(user.password).toBeUndefined();
  });

  test("Update user", async () => {
    const tkn = await login(testUser.username, testUser.password);

    try {
      const res = await axios.put(
        "/api/user",
        {
          lot_number: 2,
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
      expect(user.lot_number).toEqual(1);
    } catch (e) {
      console.log(e);
    }
  });
});
