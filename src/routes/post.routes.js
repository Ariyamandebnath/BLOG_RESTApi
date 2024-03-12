import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {

    createPosts,
    getPosts,
    deletePosts,
    updatePost

} from '../controllers/posts.controlles.js'

const router = express.Router()

router.post('/create', verifyJWT, createPosts)
router.get('/getposts', getPosts)
router.delete('/deletepost/:postId/:userId', verifyJWT, deletePosts)
router.put('/updatepost/:postId/:userId', verifyJWT, updatePost)


export default router;