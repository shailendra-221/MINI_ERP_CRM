import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { listProducts, getProduct, createProduct, updateProduct, addStockMovement } from "../controllers/product.controller";
import { createProductSchema, updateProductSchema, stockMovementSchema } from "../validators/product.validator";

const router = Router();

router.use(authenticate);

// All authenticated roles can view products & stock.
router.get("/", listProducts);
router.get("/:id", getProduct);

// Only Admin & Warehouse manage the product catalog and stock.
router.post("/", authorize("ADMIN", "WAREHOUSE"), validate(createProductSchema), createProduct);
router.put("/:id", authorize("ADMIN", "WAREHOUSE"), validate(updateProductSchema), updateProduct);
router.post("/:id/stock-movements", authorize("ADMIN", "WAREHOUSE"), validate(stockMovementSchema), addStockMovement);

export default router;
