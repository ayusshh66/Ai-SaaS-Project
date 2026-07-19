import express from 'express';
import userRouter from './routes/user.routes.js'
import pantryRouter from './routes/pantryItems.js';
import recipeRouter from './routes/recipe.js';
import mealPlanRouter from './routes/mealPlans.js';
import shoppingListRouter from './routes/shoppingListItems.js';
import cors from 'cors'

const app = express();
const PORT = process.env.PORT ?? 8000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend.vercel.app",
];

app.use(cors({
    origin : allowedOrigins,
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({extended : true }))

app.get('/', (req,res) => {
    return res.status(200).send(`server is readyyyy`)
})

app.get('/api/test', (req, res) => {
    res.json({ message: "Backend is connected and working!" });
});

app.use('/api/meal-plans',mealPlanRouter)
app.use('/api/recipes', recipeRouter)
app.use('/api/users', userRouter);
app.use('/api/pantry', pantryRouter)
app.use("/api/shopping-list", shoppingListRouter)

app.listen(PORT, () => {
    return console.log(`the server is up and running at ${PORT}`)
})