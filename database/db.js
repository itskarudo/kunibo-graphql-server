const mongoose = require('mongoose');

const { MONGO_URI } = process.env;

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
}

mongoose.connect(MONGO_URI, mongoOptions).then(() => {
    console.log(`Connected to database`);
}).catch(() => {throw new Error("Failed to connect to database")});