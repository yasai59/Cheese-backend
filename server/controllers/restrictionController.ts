import type { Request, Response } from "express";
import RestrictionRepository from "../database/Restriction.repository";
import type RestrictionModel from "../models/Restriction.model";

class RestrictionController {
  private repository: RestrictionRepository;

  constructor() {
    this.repository = new RestrictionRepository();
  }

  async getUserRestrictions(req: Request, res: Response) {
    const userId: number = req.user?.id as number;
    let restrictions: RestrictionModel[];
    try {
      restrictions = await this.repository.findUserRestrictions(userId);
      return res.json({
        message: "User restrictions found",
        restrictions,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error finding user restrictions",
      });
    }
  }

  async getAllRestrictions(req: Request, res: Response) {
    let restrictions: RestrictionModel[];
    try {
      restrictions = await this.repository.findAll();
      return res.json({
        message: "All restrictions found",
        restrictions,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error finding all restrictions",
      });
    }
  }

  async addRestrictionsToUser(req: Request, res: Response) {
    const userId: number = req.user?.id as number;
    const { restrictions } = req.body;
    let userRestrictions: RestrictionModel[];
    try {
      userRestrictions = await this.repository.addRestrictionsToUser(
        userId,
        restrictions
      );
      return res.json({
        message: "Restrictions added to user",
        userRestrictions,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error adding restrictions to user",
      });
    }
  }

  async getDishRestrictions(req: Request, res: Response) {
    const dishId: number = Number(req.params.dishId);
    let restrictions: RestrictionModel[];
    try {
      restrictions = await this.repository.findDishRestrictions(dishId);
      return res.json({
        message: "Dish restrictions found",
        restrictions,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error finding dish restrictions",
      });
    }
  }

  async addRestrictionsToDish(req: Request, res: Response) {
    const dishId: number = Number(req.params.dishId);
    const { restrictions } = req.body;
    let dishRestrictions: RestrictionModel[];
    try {
      dishRestrictions = await this.repository.addRestrictionsToDish(
        dishId,
        restrictions
      );
      return res.json({
        message: "Restrictions added to dish",
        dishRestrictions,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error adding restrictions to dish",
      });
    }
  }
}

export default new RestrictionController();
