import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  submitProducerRequest,
  getMyProducerRequest,
} from "../controllers/producerRequestController.js";

const router = express.Router();

router.post("/", authMiddleware, submitProducerRequest);
router.get("/me", authMiddleware, getMyProducerRequest);

export default router;
