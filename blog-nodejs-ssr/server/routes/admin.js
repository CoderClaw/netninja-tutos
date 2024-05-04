const express= require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


const adminLayout = '../views/layouts/admin'

const jwtSecret = process.env.JWT_SECRET

/*
    Check login middleware
    
*/

const authMiddleware = (req,res,next) =>{
    const token = req.cookies.token
    if(!token){
        return res.status(401).json({message: "Unauthorized access"})
    }

    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({message: "Unauthorized access"})
    }
}

/*
    GET
    Admin -login
    
*/

router.get('/admin', async (req,res)=>{
    try {

        const locals = {
            title: "Admin",
            description: "simple blog app"
        }       

        res.render('admin/index',{
            locals,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }    
})

/*
    POST
    Admin -login
    
*/
router.post('/admin', async (req,res)=>{
    try {

        const {username,password} = req.body;

        const user = await User.findOne({username})
        if(!user){
            return res.status(401).json({message: "Invalid credentials"})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid credentials"})
        }

        const token = jwt.sign({userId : user.id}, jwtSecret)
        res.cookie('token', token, {httpOnly: true})

        res.redirect('dashboard')
        
    } catch (error) {
        console.log(error)
    }    
})

/*
    POST
    Admin -register
    
*/
router.post('/register', async (req,res)=>{
    try {

        const {username,password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({username,password: hashedPassword})
            res.status(201).json({message: "user created",user})
        } catch (error) {
            if(error.code === 11000){
                res.status(409).json({message: "user already in use"})
            }
            res.status(500).json({message: "internal server error"})
        }
        

        
    } catch (error) {
        console.log(error)
    }    
})


/*
    GET
    Admin -dashboard
    
*/

router.get('/dashboard',authMiddleware, async (req,res)=>{
    try {

        const locals = {
            title: "Admin",
            description: "simple blog app"
        }  

        const data = await Post.find();

        res.render('admin/dashboard',{
            locals,
            data,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }
    
})

/*
    GET
    Admin -create new post
    
*/

router.get('/add-post',authMiddleware, async (req,res)=>{
    try {

        const locals = {
            title: "Add Post",
            description: "simple blog app"
        }  

        const data = await Post.find();

        res.render('admin/add-post',{
            locals,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }
    
})

/*
    Post
    Admin -create new post
    
*/

router.post('/add-post',authMiddleware, async (req,res)=>{
    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            })
            res.redirect("/dashboard")
            await Post.create(newPost)
            
        } catch (error) {
            console.log(error)
        }       

    } catch (error) {
        console.log(error)
    }
    
})

/*
    GET
    Admin -edit post
    
*/

router.get('/edit-post/:id',authMiddleware, async (req,res)=>{
    try {

        const locals = {
            title: "Edit Post",
            description: "simple blog app"
        }  

        const data = await Post.findOne({_id: req.params.id})

        res.render('admin/edit-post',{
            locals,
            data,
            layout: adminLayout
        })
    } catch (error) {
        console.log(error)
    }
    
})

/*
    Put
    Admin -edit post
    
*/

router.put('/edit-post/:id',authMiddleware, async (req,res)=>{
    try {
        await Post.findByIdAndUpdate(req.params.id,{
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })
        res.redirect(`/edit-post/${req.params.id}`)
    } catch (error) {
        console.log(error)
    }
    
})

/*
    Delete
    Admin -delete post
    
*/

router.delete('/delete-post/:id',authMiddleware, async (req,res)=>{
    try {
        await Post.deleteOne({_id:req.params.id})
        res.redirect("/dashboard")
    } catch (error) {
        console.log(error)
    }
    
})


/*
    get
    Admin -Logout
    
*/

router.get('/logout',authMiddleware, async (req,res)=>{
    try {
        res.clearCookie('token')
        res.redirect("/login")
    } catch (error) {
        console.log(error)
    }
    
})
module.exports = router
