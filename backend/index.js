import express from 'express';
import userRouter from './routes/user.routes.js'

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json())

app.get('/', (req,res) => {
    return res.status(200).send(`server is readyyyy`)
})

app.use('/user', userRouter )

app.listen(PORT, () => {
    return console.log(`the server is up and running at ${PORT}`)
})