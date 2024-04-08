import connection from "./connection";
import type UserModel from "../models/User.model";
import type { RowDataPacket } from "mysql2";

interface IUserRepository {
  save(user: UserModel): Promise<UserModel>;
  findByEmail(email: string): Promise<UserModel>;
  verify(user: UserModel): Promise<UserModel>;
  update(user: UserModel): Promise<UserModel>;
  findByUsername(username: string): Promise<UserModel>;
  delete(id: number): Promise<void>;
  getAllInfoUserFromOtherTables(user: UserModel): Promise<UserModel>;
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
      console.log(error);
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
          await Bun.password.hash(user.password as string),
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

  public async getAllInfoUserFromOtherTables(
    user: UserModel
  ): Promise<UserModel> {
    let subQueryUserRestaurants = `
    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', rest.id, 'name', rest.name, 'address', rest.address, 'phone', rest.phone, 'photo', rest.photo))
    FROM restaurant rest
    JOIN user u ON rest.owner_id = u.id
    WHERE rest.owner_id = u.id
    `;

    let subQueryFavoriteRestaurants = `
    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', fr.restaurant_id, 'name', rest.name))
    FROM favorite_restaurant fr
    JOIN restaurant rest ON fr.restaurant_id = rest.id
    WHERE fr.user_id = u.id
    `;

    let subQueryLikedRestaurants = `
    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', lr.restaurant_id, 'name', rest.name))
    FROM liked_restaurant lr
    JOIN restaurant rest ON lr.restaurant_id = rest.id
    WHERE lr.user_id = u.id
    `;

    let subQueryUserRestrictions = `
    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ur.restriction_id, 'name', re.name))
    FROM user_restriction ur
    JOIN restriction re ON ur.restriction_id = re.id
    WHERE ur.user_id = u.id
    `;

    let subQueryUserTastes = `
    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', ut.taste_id, 'name', t.name))
    FROM user_taste ut
    JOIN taste t ON ut.taste_id = t.id
    WHERE ut.user_id = u.id
    `;

    const query = `
    SELECT 
        u.id, u.username, u.email, u.role_id, u.lot_number, u.photo, 
        r.name as role_name, 
        (${subQueryUserRestaurants}) as user_restaurants,
        (${subQueryFavoriteRestaurants}) as favorite_restaurants,
        (${subQueryLikedRestaurants}) as liked_restaurants,
        (${subQueryUserRestrictions}) as restrictions,
        (${subQueryUserTastes}) as tastes
    FROM 
        user u
        INNER JOIN role r ON u.role_id = r.id
    WHERE 
        u.id = ?`;

    try {
      const result = await connection.promise().query(query, [user.id]);
      const users: RowDataPacket[] = result[0] as RowDataPacket[];
      const dbUser = users[0] as UserModel;

      dbUser.user_restaurants = JSON.parse(dbUser.user_restaurants);
      dbUser.favorite_restaurants = JSON.parse(dbUser.favorite_restaurants);
      dbUser.liked_restaurants = JSON.parse(dbUser.liked_restaurants);
      dbUser.restrictions = JSON.parse(dbUser.restrictions);
      dbUser.tastes = JSON.parse(dbUser.tastes);

      return dbUser;
    } catch (error) {
      throw new Error("Error getting info from user");
    }
  }
}
