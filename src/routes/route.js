import { Router } from "express";
import {
    repeatCustomers,
  salesGrowthRate,
  shopifyCustomers,
  shopifyOrders,
  shopifyProducts,
} from "../controllers/shop.controller.js";

const router = Router();

router.get("/shopifyCustomers", shopifyCustomers);
router.get("/shopifyProducts", shopifyProducts);
router.post("/shopifyOrders", shopifyOrders);
router.post("/repeatCustomers", repeatCustomers);
router.post("/salesGrowthRate", salesGrowthRate);

export default router;
