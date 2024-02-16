import express, { Router } from "express";
import type { Request, Response } from "express";

import RestrictionRepository from "../database/Restriction.repository";
import type RestrictionModel from "../models/Restriction.model";

const tasteRepository = new RestrictionRepository();

const repositoryRouter: Router = express.Router();

// GET /api/restriction/:userId
repositoryRouter.get("/", async (req: Request, res: Response) => {
    const userId = Number(req.query.userId);
    let restrictions: RestrictionModel[];
    
})