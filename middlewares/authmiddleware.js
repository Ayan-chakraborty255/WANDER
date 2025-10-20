module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){

        //redirectURL save
        req.session.redirectURL=req.originalUrl;

        req.flash("error","You have to log in!");
        return res.redirect("/login");

    }
    next();
}