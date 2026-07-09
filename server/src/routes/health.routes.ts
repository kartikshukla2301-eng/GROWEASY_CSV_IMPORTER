import { Router } from "express";
import { handleHealthCheck } from "../controllers/csv.controller";

const router = Router();

router.get("/health", handleHealthCheck);

export default router;
