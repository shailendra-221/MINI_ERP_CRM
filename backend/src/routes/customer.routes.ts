import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  addFollowUp,
} from "../controllers/customer.controller";
import { createCustomerSchema, updateCustomerSchema, addFollowUpSchema } from "../validators/customer.validator";

const router = Router();

router.use(authenticate);

// All authenticated roles can view customers.
router.get("/", listCustomers);
router.get("/:id", getCustomer);

// Only Admin & Sales can create/edit customer records.
router.post("/", authorize("ADMIN", "SALES"), validate(createCustomerSchema), createCustomer);
router.put("/:id", authorize("ADMIN", "SALES"), validate(updateCustomerSchema), updateCustomer);
router.post("/:id/follow-ups", authorize("ADMIN", "SALES"), validate(addFollowUpSchema), addFollowUp);

export default router;
