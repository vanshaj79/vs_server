import { Router } from "express";
import {
    repeatCustomers,
  salesGrowthRate,
  shopifyCustomers,
  shopifyOrders,
  shopifyProducts,
} from "../controllers/shop.controller.js";

const router = Router();
router.get('/',(req,res)=>{
      return res.status(200).json({
        server:"server is running"
      })
})
router.get("/shopifyCustomers", shopifyCustomers);
router.get("/shopifyProducts", shopifyProducts);
router.post("/shopifyOrders", shopifyOrders);
router.post("/repeatCustomers", repeatCustomers);
router.post("/salesGrowthRate", salesGrowthRate);

export default router;
