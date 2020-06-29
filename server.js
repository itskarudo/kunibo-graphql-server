const express = require('express');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Schema = require('./schema/schema');
const isAuth = require('./middlewares/is-auth');
const { createAccessToken } = require('./helpers/auth');

require('dotenv').config();
require('./database/db');

const app = express();

app.use(cookieParser());

app.use(cors());

app.use(isAuth);

app.post("/access_token", async (req, res) => {
    const token = req.cookies.rtid;
    if (!token) {
        return res.send({ ok: false, accessToken: "" });
    }

    let payload = null;
    try {
        payload = jwt.verify(token, process.env.REFRESH_SECRET);
    } catch (err) {
        return res.send({ ok: false, accessToken: "" });
    }

    const user = await User.findById(payload.userId);

    if (!user) {
        return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
        return res.send({ ok: false, accessToken: "" });
    }

    return res.send({ ok: true, accessToken: createAccessToken(user)});
});

app.use('/graphql', (req, res) => {
    return graphqlHTTP({
        schema: Schema,
        graphiql: true,
        context: { req, res }
    })(req, res);
});

const { PORT } = process.env;
app.listen(PORT, () => {
    console.info(`Server listening on http://localhost:${PORT}`)
})

