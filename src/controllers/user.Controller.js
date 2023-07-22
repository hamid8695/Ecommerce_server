const createHttpError = require("http-errors");
const User = require("../models/user.Modal");

module.exports.createAuser = async (req, res,next) => {
    try {
        const newUser = new User(req.body);
        const user = await newUser.save()
        res.status(200).json({
            message: "success",
            result: user
        })
    } catch (error) {
       next(error)
    }
}

module.exports.getAllUser = async (req, res,next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const searchRegExp = new RegExp('.*'+search +".*", 'i');
        const filter = {
            isAdmin: {$ne: true},
            $or:[
                {name: {$regex: searchRegExp}},
                {email: {$regex: searchRegExp}}
            ]
        }
        
        const users = await User.find(filter).limit(limit).skip((page-1)*limit)
        const count =await User.find(filter).countDocuments();
        if(!users) throw createHttpError(404, 'no users found');

        res.status(200).json({
            message: "success",
            result: users,
            pagination: {
                totalPages: Math.ceil(count/limit),
                currentPage: page,
                previousPage: page-1>0 ? page-1 : null,
                nextPage: page+1 <=Math.ceil(count/limit)? page+1 : null
            }   
        })
    } catch (error) {
       next(error)
    }
}