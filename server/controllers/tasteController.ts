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
}

export default new TasteController();


/* 
editar tecer usuario como admin (editar eliminar)
crear taste y crear restriccion
ruta de los reports
*/