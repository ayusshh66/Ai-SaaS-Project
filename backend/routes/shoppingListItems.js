import express from 'express';
import { authentication } from '../middleware/auth.js';

const shoppingListRouter = express.Router();

shoppingListRouter.post('/generate', authentication, async(req,res) => {

    try {
        
        const userId = req.user.id;

        

    } catch (error) {
        return res.status(400).json({error : `Internal Server Error`})
    }

})

export default shoppingListRouter;