import connection from "./connection";
import type UserModel from "../models/User.model";
import type { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";

interface IUserRepository {
  save(user: UserModel): Promise<UserModel>;
  findByEmail(email: string): Promise<UserModel>;
  verify(user: UserModel): Promise<UserModel>;
  update(user: UserModel): Promise<UserModel>;
  findByUsername(username: string): Promise<UserModel>;
  delete(id: number): Promise<void>;
}

export default class UserRepository implements IUserRepository {
  public async findByEmail(email: string): Promise<UserModel> {
    const query = "SELECT * FROM user WHERE email = ? AND active = 1";
    try {
      const result = await connection.promise().query(query, [email]);
      const users: RowDataPacket[] = result[0] as RowDataPacket[];
      const user = users[0] as UserModel;
      return user;
    } catch (error) {
      throw new Error("Error finding user by email");
    }
  }

  public async findByUsername(username: string): Promise<UserModel> {
    const query = "SELECT * FROM user WHERE username = ? AND active = 1";
    try {
      const result = await connection.promise().query(query, [username]);
      const users: RowDataPacket[] = result[0] as RowDataPacket[];
      const user = users[0] as UserModel;
      return user;
    } catch (error) {
      throw new Error("Error finding user by username");
    }
  }

  public async verify(user: UserModel): Promise<UserModel> {
    const query = "UPDATE user SET verified = 1 WHERE id = ? AND active = 1";

    try {
      await connection.promise().query(query, [user.id]);

      const result = await connection
        .promise()
        .query("SELECT * FROM user WHERE id = ?", [user.id]);

      const users: RowDataPacket[] = result[0] as RowDataPacket[];
      const dbUser = users[0] as UserModel;

      return dbUser;
    } catch (error) {
      throw new Error("Error verifying user");
    }
  }

  public async update(user: UserModel): Promise<UserModel> {
    let query =
      "UPDATE user SET username = ?, email = ?, password = ?, role_id = ?, lot_number = ?, photo = ? WHERE id = ?";

    if (!user.password) {
      query =
        "UPDATE user SET username = ?, email = ?, role_id = ?, lot_number = ?, photo = ? WHERE id = ?";
    }
    try {
      let campos = [
        user.username,
        user.email,
        user.role_id,
        user.lot_number,
        user.photo,
        user.id,
      ];
      if (user.password) {
        campos = [
          user.username,
          user.email,
          bcrypt.hashSync(user.password as string, 10),
          user.role_id,
          user.lot_number,
          user.photo,
          user.id,
        ];
      }
      await connection.promise().query(query, campos);

      const result = await connection
        .promise()
        .query("SELECT * FROM user WHERE id = ?", [user.id]);

      const users: RowDataPacket[] = result[0] as RowDataPacket[];
      const dbUser: UserModel = users[0] as UserModel;
      return dbUser;
    } catch (error) {
      if ((error as any)["errno"] === 1062) {
        throw new Error("duplicate entry");
      }
      throw new Error("Error updating user");
    }
  }

  public async save(user: UserModel): Promise<UserModel> {
    // if a user exists with the same email, throw an error
    const query =
      "INSERT INTO user (username, email, password, role_id) VALUES (?, ?, ?, ?)";

    try {
      await connection
        .promise()
        .query(query, [user.username, user.email, user.password, user.role_id]);

      const result = await connection
        .promise()
        .query("SELECT * FROM user WHERE email = ?", [user.email]);

      const users: RowDataPacket[] = result[0] as RowDataPacket[];
      const dbUser = users[0] as UserModel;
      return dbUser;
    } catch (error) {
      console.log(error);
      throw new Error("Error saving user");
    }
  }

  public async saveGoogle(user: UserModel): Promise<UserModel> {
    const query =
      "INSERT INTO user (username, email, role_id, google, password) VALUES (?, ?, ?, 1, '')";
    try {
      await connection
        .promise()
        .query(query, [user.username, user.email, user.role_id]);

      const result = await connection
        .promise()
        .query("SELECT * FROM user WHERE email = ?", [user.email]);
      const users: RowDataPacket[] = result[0] as RowDataPacket[];
      const dbUser = users[0] as UserModel;
      return dbUser;
    } catch (error) {
      console.log(error);
      throw new Error("Error saving user");
    }
  }

  public async saveAction(
    user: UserModel,
    verificationCode: number | null,
    action: string | null
  ): Promise<UserModel> {
    const query =
      "UPDATE user SET action = ?, verification_code = ? WHERE id = ? AND active = 1";
    try {
      await connection
        .promise()
        .query(query, [action, verificationCode, user.id]);

      const result = await connection
        .promise()
        .query("SELECT * FROM user WHERE id = ?", [user.id]);

      const users: RowDataPacket[] = result[0] as RowDataPacket[];
      const dbUser = users[0] as UserModel;
      return dbUser;
    } catch (error) {
      throw new Error("Error saving user action");
    }
  }

  public async delete(id: number): Promise<void> {
    const query = "UPDATE user SET active = 0 WHERE id = ? AND active = 1";
    try {
      await connection.promise().query(query, [id]);
    } catch (error) {
      console.log(error);
      throw new Error("Error deleting user");
    }
  }
}
