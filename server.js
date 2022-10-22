const express=require('express')
const app=express()
const path=require('path')
const Product=require('./views/Product');
const User=require('./models/user');
const AppError=require('./views/AppError');
const methodoveride=require('method-override');
const ejsMate=require('ejs-mate');
const session=require('express-session');
const flash=require('connect-flash');
const passport=require('passport');
const localStrategy=require('passport-local');
//const productroute=require('./routes/product1');

//app.use('/',productroute);
app.use(methodoveride('_method'));
app.engine('ejs',ejsMate);
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.set('views',path.join(__dirname,'views'));//To make its path correct
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')))
app.use(passport.initialize());

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
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


const mongoose=require('mongoose');
const dbUrl=process.env.DB_URL||'mongodb://localhost:27017/Shop';
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    console.log('connected');
})
.catch((err)=>{
    console.log('Not connected');
})
let oldpath='/products';
const isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        console.log(req.url);
        oldpath=req.originalUrl;
        console.log(oldpath);
        req.flash('error','Sorry you must be signed in...!!!');
        return res.redirect('/login');
    }else{
    next();
    }
}

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})
app.get('/',(req,res)=>{
    res.redirect('/login');
})

app.get('/register',(req,res)=>{
    res.render('register');
})

app.post('/register',async (req,res)=>{
    try{
        const {username,password,email}=req.body;
        const user=new User({email,username});
        const register=await User.register(user,password);
        req.login(register,err=>{
            if(err){return next(err)}
            req.flash('success','Welcome to store');
            res.redirect('/products');
        })
    }
    catch(e){
        req.flash('error','user already exists');
        res.redirect('/register');
    }
})

app.get('/login',(req,res)=>{
    res.render('user');
})

app.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),async(req,res)=>{
    const redirectUrl=oldpath || '/products';
    req.flash('success','welcome back!!');
    res.redirect(redirectUrl);
})

app.get('/logout',(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success',"Good bye!!");
        res.redirect('/products');
      });
})


app.get('/products',async(req,res)=>{
    const products=await Product.find({});
    res.render('index',{products});
})

app.get('/products/new',isLoggedIn,(req,res)=>{
    res.render('post');
})

app.post('/products',(req,res)=>{
    const {name,price,category,image}=req.body;
    Product.insertMany({name:name,price:price,category:category,image:image});
    res.redirect('/products');
    console.log({name,price,category});
})

app.get('/products/:id',async(req,res)=>{
    const {id}=req.params;
    const product=await Product.findById(id);
    res.render('show',{product});
})

app.get('/products/:id/update',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    const product=await Product.findById(id)
    req.flash('success','Succesfully updating the product');
    res.render('update',{product,success:req.flash('success')}); 
})

app.patch('/products/:id',async(req,res)=>{
    const {name,price,category,image}=req.body;
    console.log(req.body);
    const {id}=req.params;
    await Product.updateOne({_id:id},{name:name,price:price,category:category,image:image})
    res.redirect('/products');
})

app.delete('/products/:id',isLoggedIn,async(req,res)=>{
    const {id}=req.params;
    try{
    await Product.deleteOne({_id:id})
    }
    catch(e){
        return new AppError('Cannot be deleted',400);
    }
    res.redirect('/products');
})


app.use((err,req,res,next)=>{
    const {sta=500,message='Something went wrong'}=err;
    res.status(sta).send(message);
});

const port=process.env.PORT || 2001;
app.listen(port,()=>{
    console.log(`Started listening on port ${port}`);
})