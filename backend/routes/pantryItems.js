import express from 'express'
import { usersTable, pantryItemsTable } from '../models/user.model.js'
import { pantryItemValidation } from '../validators/signupValidation.js';


const pantryRouter = express.Router();

pantryRouter.post('/create', async(req,res) => {
    try {
        const request = await  pantryItemValidation.safeParseAsync(req.body);


        const {name, quantity, unit , category, expirey_date, is_running_low = false } = request.data;
        
        const {relatedId} = req.user.id;

        const [pantryItem] = await db.insert(pantryItemsTable).values({
            userId :relatedId,
            name,
            quantity,
            unit,
            category,
            expirey_date,
            is_running_low,
        }).returning();

        return res.status(200).json({status : `new pantry items has been created`})
    } catch (error) {
        return console.error(error)
    }
})

export default pantryRouter;