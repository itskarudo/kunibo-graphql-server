const express = require('express');

require('dotenv').config();

const app = express();


const { PORT } = process.env;
app.listen(PORT, () => {
    console.info(`Server listening on http://localhost:${PORT}`)
})

