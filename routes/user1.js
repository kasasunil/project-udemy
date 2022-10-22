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
