import type { Request, Response } from "express";
import type ReportModel from "../models/Report.model";
import type UserModel from "../models/User.model";
import type RestaurantModel from "../models/Restaurant.model";
import ReportRepository from "../database/Report.repository";

const reportRepository = new ReportRepository();

class ReportController {
  async createReport(req: Request, res: Response) {
    const report: ReportModel = req.body;
    const user: UserModel = req.user as UserModel;
    if (!user) {
      res.status(404).json({message: "User not found"})
      return;
    }
    report.user_id = Number(user.id);
    const restaurantId = Number(req.params.restaurantId);
    if (!restaurantId) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }
    report.restaurant_id = restaurantId;

    try {
      const reportSaved = await reportRepository.createReport(report);
      console.log(reportSaved);
      res.status(201).json({message: "Report sended", reportSaved});
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async findRestaurantReports(req: Request, res: Response) {
    const restaurantId = Number(req.params.restaurantId);
    if (!restaurantId) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }
    try {
      const reports = await reportRepository.findRestaurantReports(restaurantId);
      res.status(200).json({message: "Reports found successfully", reports});
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async findAllReports(req: Request, res: Response) {
    try {
      const reports = await reportRepository.findAllReports();
      res.status(200).json({message: "Reports found successfully", reports});
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new ReportController();