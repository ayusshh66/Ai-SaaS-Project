import express from 'express';
import userRouter from './routes/user.routes.js'
import pantryRouter from './routes/pantryItems.js';
import recipeRouter from './routes/recipe.js';

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json())

app.get('/', (req,res) => {
    return res.status(200).send(`server is readyyyy`)
})

app.use('/recipe', recipeRouter)
app.use('/user', userRouter )
app.use('/pantry', pantryRouter)

app.listen(PORT, () => {
    return console.log(`the server is up and running at ${PORT}`)
})