import type { Request, Response } from "express";
import type ReportModel from "../models/Report.model";
import ReportRepository from "../database/Report.repository";

const reportRepository = new ReportRepository();

class ReportController {
  async createReport(req: Request, res: Response) {
    const report = req.body as ReportModel;
    let restaurantId = Number(req.params.restaurantId);
    report.restaurant_id = restaurantId;
    console.log(report);
    try {
      const reportSaved = await reportRepository.createReport(report);
      res.status(201).json(reportSaved);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new ReportController();