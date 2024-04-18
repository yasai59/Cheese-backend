import type { Request, Response } from "express";
import type ReasonModel from "../models/Reason.model";
import ReasonRepository from "../database/Reason.repository";

const reasonRepository = new ReasonRepository();

class ReasonController {
    async createReason(req: Request, res: Response): Promise<void> {
        const reason: ReasonModel = req.body;
        if (!reason.name) {
            res.status(400).json({message: "Name is required"});
            return;
        }
        try {
            const savedReason = await reasonRepository.createReason(reason);
            res.status(201).json({message: "Reason created successfully", savedReason});
        } catch (error) {
            res.status(500).json({message: "Error creating reason", error});
        }
    }

    async getAllReason(req: Request, res: Response): Promise<void> {
        try {
            const reasons = await reasonRepository.getAllReasons();
            res.status(200).json({message: "Reasons retrieved successfully", reasons});
        } catch (error) {
            res.status(500).json({message: "Error fetching reasons", error});
        }
    }
}

export default new ReasonController();