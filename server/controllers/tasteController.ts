import type { Request, Response } from "express";
import TasteRepository from "../database/Taste.repository";
import type TasteModel from "../models/Taste.model";

const tasteRepository = new TasteRepository();

class TasteController {
  async getUserTastes(req: Request, res: Response): Promise<Response> {
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
  }

  async getAllTastes(req: Request, res: Response): Promise<Response> {
    let tastes: TasteModel[];
    try {
      tastes = await tasteRepository.findAll();
      return res.json({
        message: "All tastes found",
        tastes,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error finding all tastes",
      });
    }
  }

  async addTastesToUser(req: Request, res: Response): Promise<Response> {
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
  }

  async createTaste(req: Request, res: Response): Promise<Response> {
    const taste: TasteModel = req.body;
    let newTaste: TasteModel;
    try {
      newTaste = await tasteRepository.createTaste(taste);
      return res.json({
        message: "Taste created",
        newTaste,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error creating taste",
      });
    }
  }

  async addTasteToDish(req: Request, res: Response): Promise<Response> {
    const dishId: number = req.body.dishId;
    const { tastes } = req.body;
    let dishTastes: TasteModel[];
    try {
      dishTastes = await tasteRepository.addTastesToDish(dishId, tastes);
      return res.json({
        message: "Tastes added to dish",
        dishTastes,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error adding tastes to dish",
      });
    }
  }

  async getDishTaste(req: Request, res: Response): Promise<Response> {
    const dishId: number = Number(req.params.dishId); // Ajusta según cómo se espera el ID del plato en la solicitud
    try {
        const tastes: TasteModel[] = await tasteRepository.findDishTastes(dishId);
        return res.status(200).json(tastes);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Error finding dish tastes" });
    }
}
}

export default new TasteController();
