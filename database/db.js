const mongoose = require('mongoose');

const { MONGO_URI } = process.env;

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

mongoose.connect(MONGO_URI, mongoOptions).then(() => {
    console.log(`Connected to database`);
}).catch((e) => console.log(e));