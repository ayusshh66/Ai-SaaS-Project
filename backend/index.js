import express from 'express';

const app = express();
const PORT = process.env.PORT ?? 8000;


app.get('/', (req,res) => {
    return res.status(200).send(`server is readyyyy`)
})

app.listen(PORT, () => {
    return console.log(`the server is up and running at ${PORT}`)
})