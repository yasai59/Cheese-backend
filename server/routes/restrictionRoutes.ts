import express, { Router } from "express";
import type { Request, Response } from "express";

import RestrictionRepository from "../database/Restriction.repository";
import type RestrictionModel from "../models/Restriction.model";
import { verifyJWT } from "../middlewares/verifyJWT";

const restrictionRepository = new RestrictionRepository();

const restrictionRouter: Router = express.Router();

// GET /api/restriction/:userId
restrictionRouter.get("/", [verifyJWT], async (req: Request, res: Response) => {
  const userId: number = req.user?.id as number;
  let restrictions: RestrictionModel[];
  try {
    restrictions = await restrictionRepository.findUserRestrictions(userId);
    return res.json({
      message: "User restrictions found",
      restrictions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error finding user restrictions",
    });
  }
});

// GET /api/restriction/all
restrictionRouter.get(
  "/all",
  [verifyJWT],
  async (req: Request, res: Response) => {
    let restrictions: RestrictionModel[];
    try {
      restrictions = await restrictionRepository.findAll();
      return res.json({
        message: "All restrictions found",
        restrictions,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Error finding all restrictions",
      });
    }
  }
);

// POST /api/restriction/:userId
restrictionRouter.post(
  "/",
  [verifyJWT],
  async (req: Request, res: Response) => {
    const userId: number = req.user?.id as number;
    const { restrictions } = req.body;
    let userRestrictions: RestrictionModel[];
    try {
      userRestrictions = await restrictionRepository.addRestrictionsToUser(
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
);

// GET /api/restriction/dish/:dishId
restrictionRouter.get(
  "/dish/:dishId",
  [verifyJWT],
  async (req: Request, res: Response) => {
    const dishId: number = Number(req.params.dishId);
    let restrictions: RestrictionModel[];
    try {
      restrictions = await restrictionRepository.findDishRestrictions(dishId);
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
);

// POST /api/restriction/dish/:dishId
restrictionRouter.post(
  "/dish/:dishId",
  [verifyJWT],
  async (req: Request, res: Response) => {
    const dishId: number = Number(req.params.dishId);
    const { restrictions } = req.body;
    let dishRestrictions: RestrictionModel[];
    try {
      dishRestrictions = await restrictionRepository.addRestrictionsToDish(
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
  });

export default restrictionRouter;
