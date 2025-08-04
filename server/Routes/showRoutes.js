import express from 'express'
import { addShow, getNowPlayingMovies, getShow, getShows } from '../controller/showController.js'
import { protectAdmin } from '../middleware/auth.js'

const showRoute = express.Router()

showRoute.get('/now-playing', protectAdmin, getNowPlayingMovies)
showRoute.post('/add', protectAdmin, addShow)
showRoute.get('/all', getShows)
showRoute.get('/:movieId', getShow)

export default showRoute