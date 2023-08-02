const Order = require('../models/orderModel');
//---------------------------------------------


// fetching total amount for all orders.
const totalRevenue = async ()=>{
    const revenue = await Order.aggregate([
        {
            $match : { status : { $ne : "pending"}}
        },
        {
            $group : 
            {
                _id : null,
                 revenue : { $sum : "$totalAmount"}
            }
        }
    ])
    const totalRevenue = revenue.length > 0 ? revenue[0].revenue : 0
    return totalRevenue
}


// Fetching payment method amount.
const paymentMethod = async ()=>{
    const totalPayment = await Order.aggregate([
        {
            $match: { status : { $ne : "pending"}}
        },
        {
            $group : {
                _id: "$paymentMethod",
                amount : { $sum : "$totalAmount"}
            }
        }
    ])
    const result = totalPayment.length > 0 ? totalPayment : 0
    return result
}


// daily chart
const dailyChart = async ()=>{
    const dailyOrders = await Order.aggregate([
        {
            $match: { status : { $ne : "pending"}}
        },
        {
            $group : {
                _id : { $dateToString : { format : "%Y-%m-%d", date : "$date" } },
                dailyRevenue : { $sum : "$totalAmount" }
            }
        },
        {
            $sort : { _id : 1}
        },
        {
            $limit : 14
        }
    ])
    const result =  dailyOrders || 0
    return result
}


// Sales by categorie.
const categorySales = async () => { 
    const catSales = await Order.aggregate([
        {
            $match : { status : { $ne : "pending"} }
        },
        {
            $unwind : "$products"
        },
        {
            $lookup :
            {
                from: "products",
                localField : "products.productId",
                foreignField: "_id",
                as: "productsData"
            }
        },
        {
            $unwind : "$productsData"
        },
        {
            $lookup : 
            {
                from: "categories",
                localField : "productsData.category",
                foreignField : "_id",
                as: "category"
            }
        },
        {
            $unwind : "$category"
        },
        {
            $group : 
            {
                _id: "$category.categorieName",
                qty : { $sum : "$products.count"}
            }
        }
    ])
    return catSales
}


// Monthly total revenue
const monthTotalRevenue = async ( currentMonthStartDate, now ) =>{
    const monthTotalRevenue = await Order.aggregate([
        {
            $match : 
            {
                date : 
                {
                    $gte : currentMonthStartDate,
                    $lt : now
                },
                orderStatus :
                {
                    $ne : "pending"
                }
            }
        },
        {
            $group : 
            {
                _id : null,
                monthTotalRevenue : 
                {
                    $sum : "$totalAmount"
                }
            }
        }
    ])
    const result = monthTotalRevenue.length > 0 ? monthTotalRevenue[0].monthTotalRevenue : 0
    return result
}

module.exports = {
    totalRevenue,
    paymentMethod,
    dailyChart,
    categorySales,
    monthTotalRevenue
}