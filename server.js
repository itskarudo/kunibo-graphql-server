const express = require('express');
const graphqlHTTP = require('express-graphql');
const Schema = require('./schema/schema');

require('dotenv').config();
require('./database/db');

const app = express();

app.use(graphqlHTTP({
    schema: Schema,
    graphiql: true,
}));

const { PORT } = process.env;
app.listen(PORT, () => {
    console.info(`Server listening on http://localhost:${PORT}`)
})

