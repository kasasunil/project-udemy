const express=require('express');
const route=express.Router();
const Product=require('../views/Product');
const flash=require('connect-flash');
const session=require('express-session');
const passport=require('passport');
const localStrategy=require('passport-local');
const User=require('../models/user');
const methodoveride=require('method-override');
const path=require('path');
const ejsMate=require('ejs-mate');

const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        console.log(req.url);
        oldpath=req.originalUrl;
        req.flash('error','Sorry you must be signed in...!!!');
        return res.redirect('/login');
    }else{
    next();
    }
}

const secret=process.env.SECRET||'thisisasecret';
const sessionConfig={
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now(),
        maxAge:1000*60*60*24*7
    }
}

route.engine('ejs',ejsMate);
route.use(express.urlencoded({extended:true}))
route.use(express.json());
route.set('views',path.join(__dirname,'views'));//To make its path correct
route.set('view engine','ejs');
route.use(express.static(path.join(__dirname,'public')))
route.use(methodoveride('_method'));
route.use(session(sessionConfig));
route.use(flash());
route.use(passport.initialize());
route.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
route.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

route.get('/products',async(req,res)=>{
    const products=await Product.find({});
    res.render('index',{products});
})

route.get('/products/new',isLoggedIn,(req,res)=>{
    res.render('post');
})

route.post('/products',(req,res)=>{
    const {name,price,category,image}=req.body;
    Product.insertMany({name:name,price:price,category:category,image:image});
    res.redirect('/products');
    console.log({name,price,category});
})

route.get('/products/:id',async(req,res)=>{
    const {id}=req.params;
    const product=await Product.findById(id);
    res.render('show',{product});
})

route.get('/products/:id/update',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const product=await Product.findById(id)
    req.flash('success','Succesfully updating the product');
    res.render('update',{product,success:req.flash('success')}); 
})

route.patch('/products/:id',async(req,res)=>{
    const {name,price,category,image}=req.body;
    console.log(req.body);
    const {id}=req.params;
    await Product.updateOne({_id:id},{name:name,price:price,category:category,image:image})
    res.redirect('/products');
})

route.delete('/products/:id',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    try{
    await Product.deleteOne({_id:id})
    }
    catch(e){
        return new AppError('Cannot be deleted',400);
    }
    res.redirect('/products');
})

module.exports=route;