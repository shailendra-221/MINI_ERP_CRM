import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { listChallans, getChallan, createChallan, changeChallanStatus } from "../controllers/challan.controller";
import { createChallanSchema, changeChallanStatusSchema } from "../validators/challan.validator";

const router = Router();

router.use(authenticate);

// All authenticated roles can view challans.
router.get("/", listChallans);
router.get("/:id", getChallan);

// Sales creates challans; Admin/Sales/Warehouse can confirm or cancel them
// (Warehouse typically confirms once goods are physically dispatched).
router.post("/", authorize("ADMIN", "SALES"), validate(createChallanSchema), createChallan);
router.patch(
  "/:id/status",
  authorize("ADMIN", "SALES", "WAREHOUSE"),
  validate(changeChallanStatusSchema),
  changeChallanStatus
);

export default router;
