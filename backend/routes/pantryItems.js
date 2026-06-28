import express from 'express'
import { usersTable, pantryItemsTable } from '../models/user.model.js'
import { pantryItemValidation } from '../validators/signupValidation.js';
import db from '../src/index.js';
import { authentication } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';


const pantryRouter = express.Router();

pantryRouter.post('/create', authentication,async(req,res) => {
    try {
        const request = await  pantryItemValidation.safeParseAsync(req.body);

        if(request.error){
            return res.status(400).json({error : request.error.format()})
        }

        const {name, quantity, unit , category, expirey_date, is_running_low = false } = request.data;
        
        const relatedId = req.user.id;
        const userName = req.user.name;

        const [pantryItems] = await db.insert(pantryItemsTable).values({
            userId :relatedId,
            name,
            quantity,
            unit,
            category,
            expiryDate : expirey_date,
            isRunningLow : is_running_low,
        }).returning();

        return res.status(200).json({status : `new pantry items has been created`, data : pantryItems, name : userName,})
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: "Internal server error" })
    }
})

pantryRouter.delete("/delete/:id", authentication, async(req,res) => {

    try {

        const relatedId = req.user.id;
        const userName = req.user.name;
        const request = await pantryItemValidation.safeParseAsync(req.params.id);

        // const itemId = request.data;

        if(request.error){
            return res.status(400).json({error : request.error.format()})
        }

        const itemId = request.data;

        const [deleteItems] = await db.delete(pantryItemsTable).where(and(eq(pantryItemsTable.id, itemId), eq(pantryItemsTable.userId, relatedId))).returning()

        if(!deleteItems){
            return res.status(400).json({error : `pantry item not found`})
        }

        return res.status(400).json({status : `pantry item of ${userName} has been deleted`, deleted_items : deleteItems})
    } catch (error) {
        console.error(error);
        return res.status(400).json({error : `error ${error}`})
    }


})

export default pantryRouter;