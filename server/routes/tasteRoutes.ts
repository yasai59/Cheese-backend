import express, { Router } from "express";
import type { Request, Response } from "express";

import TasteRepository from "../database/Taste.repository";
import type TasteModel from "../models/Taste.model";
import { verifyJWT } from "../middlewares/verifyJWT";

const tasteRepository = new TasteRepository();

const tasteRouter: Router = express.Router();

// GET /api/taste/
tasteRouter.get("/", [verifyJWT], async (req: Request, res: Response) => {
  const userId: number = req.user?.id as number;
  let tastes: TasteModel[];
  try {
    tastes = await tasteRepository.findUserTastes(userId);
    return res.json({
      message: "User tastes found",
      tastes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error finding user tastes",
    });
  }
});

// POST /api/taste
tasteRouter.post("/", [verifyJWT], async (req: Request, res: Response) => {
  const userId: number = req.user?.id as number;
  const { tastes } = req.body;
  let userTastes: TasteModel[];
  try {
    userTastes = await tasteRepository.addTastesToUser(userId, tastes);
    return res.json({
      message: "Tastes added to user",
      userTastes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error adding tastes to user",
    });
  }
});

export default tasteRouter;
