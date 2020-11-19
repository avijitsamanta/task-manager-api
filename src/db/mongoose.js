const mongoose = require('mongoose')

MONGODB_URL = process.env.MONGODB_URL

mongoose.connect(process.env.MONGODB_URL,{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex:true
})