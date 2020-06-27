const express = require('express');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const Schema = require('./schema/schema');
const isAuth = require('./middlewares/is-auth');

require('dotenv').config();
require('./database/db');

const app = express();

app.use(cors());

app.use(isAuth);

app.use('/graphql', graphqlHTTP({
    schema: Schema,
    graphiql: true,
}));

const { PORT } = process.env;
app.listen(PORT, () => {
    console.info(`Server listening on http://localhost:${PORT}`)
})

