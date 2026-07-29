import { Router } from "express";
import { SwapRequestController } from "../controllers/swap-request.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const swapRequestController = new SwapRequestController();

// All swap request routes require authentication
router.use(authorizedMiddleware);

router.post("/", swapRequestController.sendRequest);
router.get("/received", swapRequestController.getReceivedRequests);
router.get("/sent", swapRequestController.getSentRequests);
router.patch("/:id/status", swapRequestController.respondToRequest);

// Admin routes
router.get("/admin/all", adminMiddleware, swapRequestController.getAllRequests);

export const swapRequestRouter = router;
