import express from 'express'
import db from '../src/index.js'
import { usersTable } from '../models/user.model.js'
import { eq, or } from 'drizzle-orm'