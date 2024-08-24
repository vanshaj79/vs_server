import { connectDB } from "../utils/index.js";
 
const shopifyCustomers = async (req, res) => {
    try {
        const db = await connectDB();
 
        const newCustomers = await db.collection('shopifyCustomers')
        .aggregate([
            {
                $match: {
                    created_at: { $ne: null },
                    email: { $exists: true }
                }
            },
            {
                $addFields: {
                    createdAtDate: { $toDate: "$created_at" } // Convert created_at to Date object
                }
            },
            {
                $group: {
                    _id: { day: { $dayOfMonth: "$createdAtDate" } },
                    count: { $sum: 1 } // Count the number of new customers per day
                }
            },
            {
                $sort: { "_id.day": 1 }
            }
        ]).limit(10).toArray();
 
        return res.status(200).json({
            success: true,
            data: newCustomers,
        });
    } catch (error) {
        console.error("Error fetching shopifyCustomers:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
 
const shopifyProducts = async (req, res) => {
    try {
        const db = await connectDB();
        const products = await db.collection('shopifyProducts').find().toArray()
        return res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
 
const shopifyOrders = async (req, res) => {
    try {
        const  interval  = req.body.interval;
        const db = await connectDB();
 
        let groupBy;
        if (interval === 'daily') {
            groupBy = {
                day: { $dayOfMonth: "$createdAtDate" },
                month: { $month: "$createdAtDate" },
                year: { $year: "$createdAtDate" }
            };
        } else if (interval === 'monthly') {
            groupBy = {
                month: { $month: "$createdAtDate" },
                year: { $year: "$createdAtDate" }
            };
        } else if (interval === 'yearly') {
            groupBy = {
                year: { $year: "$createdAtDate" }
            };
        } else {
            return res.status(400).json({
                success: false,
                message: "Please specify 'daily', 'monthly', or 'yearly' for the interval."
            });
        }
 
        const orders = await db.collection('shopifyOrders')
            .aggregate([
                {
                    $match: {
                        "total_price_set.presentment_money.amount": { $ne: null, $exists: true }
                    }
                },
                {
                    $addFields: {
                        createdAtDate: { $toDate: "$created_at" }
                    }
                },
                {
                    $group: {
                        _id: groupBy,
                        totalAmount: { $sum: { $toDouble: "$total_price_set.presentment_money.amount" } },
                    }
                },
                {
                    $sort: {
                        "_id.year": 1, // Sort by year
                        "_id.month": 1, // Sort by month
                        "_id.day": 1    // Sort by day
                    }
                }
            ]).limit(6).toArray();
 
        return res.status(200).json({
            success: true,
            data: orders,
        });
    } catch (error) {
        console.error("Error aggregating shopifyOrders:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
 
const repeatCustomers = async (req, res) => {
    try {
        const db = await connectDB();
        const interval =  req.body.interval; 
        let groupBy;
 
        if (interval === 'daily') {
            groupBy = {
                day: { $dayOfMonth: "$firstOrderDate" },
                month: { $month: "$firstOrderDate" },
                year: { $year: "$firstOrderDate" }
            };
        } else if (interval === 'monthly') {
            groupBy = {
                month: { $month: "$firstOrderDate" },
                year: { $year: "$firstOrderDate" }
            };
        } else if (interval === 'yearly') {
            groupBy = {
                year: { $year: "$firstOrderDate" }
            };
        } else {
            return res.status(400).json({
                success: false,
                message: "Please specify 'daily', 'monthly', or 'yearly' for the interval."
            });
        }
 
        const repeatCustomers = await db.collection('shopifyOrders').aggregate([
            {
                $match: {
                    "customer.email": { $exists: true },
                    "customer.id": { $exists: true },    
                    "created_at": { $exists: true }      
                }
            },
            {
                $group: {
                    _id: "$customer.id",                
                    email: { $first: "$customer.email" },
                    ordersCount: { $sum: 1 },
                    firstOrderDate: { $min: { $toDate: "$created_at" } }
                }
            },
            {
                $match: {
                    ordersCount: { $gt: 1 }            
                }
            },
            {
                $group: {
                    _id: groupBy,
                    totalcount: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1
                }
            }
        ]).limit(6).toArray();
 
        return res.status(200).json({
            success: true,
            data: repeatCustomers,
        });
    } catch (error) {
        console.error("Error fetching repeat customers by time:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
 
const salesGrowthRate = async (req, res) => {
    try {
        const interval = req.body.interval;
        const db = await connectDB();

        let groupBy;
        if (interval === 'daily') {
            groupBy = {
                day: { $dayOfMonth: "$createdAtDate" },
                month: { $month: "$createdAtDate" },
                year: { $year: "$createdAtDate" }
            };
        } else if (interval === 'monthly') {
            groupBy = {
                month: { $month: "$createdAtDate" },
                year: { $year: "$createdAtDate" }
            };
        } else if (interval === 'yearly') {
            groupBy = {
                year: { $year: "$createdAtDate" }
            };
        } else {
            return res.status(400).json({
                success: false,
                message: "Please specify 'daily', 'monthly', or 'yearly' for the interval."
            });
        }

        // Step 1: Group orders by the specified interval and calculate total sales amount
        const groupedOrders = await db.collection('shopifyOrders')
            .aggregate([
                {
                    $match: {
                        "total_price_set.presentment_money.amount": { $ne: null, $exists: true }
                    }
                },
                {
                    $addFields: {
                        createdAtDate: { $toDate: "$created_at" }
                    }
                },
                {
                    $group: {
                        _id: groupBy,
                        totalAmount: { $sum: { $toDouble: "$total_price_set.presentment_money.amount" } }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                        "_id.day": 1
                    }
                }
            ]).toArray();

        // Step 2: Calculate the growth rate
        const ordersWithGrowthRate = groupedOrders.map((order, index) => {
            if (index === 0) {
                // No previous order, so no growth rate for the first period
                return { ...order, growthRate: null };
            }

            const previousOrder = groupedOrders[index - 1];
            const growthRate = previousOrder.totalAmount > 0
                ? ((order.totalAmount - previousOrder.totalAmount) / previousOrder.totalAmount) * 100
                : null;

            return { ...order,  growthRate: growthRate !== null ? parseFloat(growthRate.toFixed(2)) : null  };
        });

        return res.status(200).json({
            success: true,
            data: ordersWithGrowthRate.slice(0, 6),  // Limit to the first 6 results
        });
    } catch (error) {
        console.error("Error aggregating shopifyOrders:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export {
  shopifyOrders,
  shopifyCustomers,
  shopifyProducts,
  repeatCustomers,
  salesGrowthRate,
};