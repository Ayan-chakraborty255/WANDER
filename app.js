require("dotenv").config();

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const port=8080;
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const path=require("path");
const session=require("express-session");
const flash=require("connect-flash");
const User=require("./models/user.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const MongoStore = require('connect-mongo');





app.use(express.static("public"));

app.use(express.json());
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public/css")));
app.use(express.static(path.join(__dirname,"/public/js")));
const listingRouter=require("./routes/listings.js");
const reviewRouter=require("./routes/reviews.js");
const userRouter=require("./routes/users.js");


async function main() {
    await mongoose.connect(process.env.ATLUSDB_URL);
}
main()
.then(res=>{console.log("CONNECTED TO DB")})
.catch(err=>{console.log(err)});

app.listen(port,()=>{
    console.log(`LISTNING THROUGH PORT ${port}`);
});

const store=MongoStore.create({
    mongoUrl:process.env.ATLUSDB_URL,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})

const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
};    

app.use(session(sessionOptions));



app.get('/', (req, res) => {
  res.redirect('/listings');
});


app.use(flash());


//Authentication


app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// **************************************************************//
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.googleMapsKey = process.env.GOOGLE_MAPS_KEY;
    next();
})

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);







//error handling
app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something Went Wrong!"}=err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message})
})





























//all other routes
app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "PAGE NOT FOUND!"));
});

































































































// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });