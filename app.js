const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing'); // Assuming you have a Listing model defined in models/listing.js
const path = require('path');
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { stat } = require('fs');
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")
const { listingSchema } = require("./schema.js")


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies
app.use(methodOverride('_method')); // Middleware to support PUT and DELETE methods
app.engine('ejs', ejsMate); // Use ejsMate for EJS templating 
app.use(express.static(path.join(__dirname, "/public")));


main()
.then(() => {
    console.log("Connected to MongoDB");
})
.catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

async function main() {
  await mongoose.connect(MONGO_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.get("/" , (req,res) => {
    res.send("Hello World App");
});

const validateListing = (req, res, next) =>{
    let { error } = listingSchema.validate(req.body);
    if ( error ){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//index route
app.get("/listings" ,  wrapAsync(async(req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
    
}));

app.get("/listings/new" , (req,res) =>{
    res.render("listings/new.ejs");
})


//Show route
app.get("/listings/:id" ,  wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//Create Rojute
app.post("/listings", validateListing, wrapAsync(async (req,res,next) =>{
        let results = listingSchema.validate(req.body);
        if(results.error){
            throw new ExpressError(404, request.error);
        }

         const newListing = new Listing(req.body.listing);
         await newListing.save();
        res.redirect("/listings");
} ));

//Edit ROute
app.get("/listings/:id/edit",  wrapAsync(async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync (async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete ROute
app.delete("/listings/:id",  wrapAsync(async(req,res) => {
    let { id } = req.params;
    let deltedid = await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", deltedid);  
    res.redirect("/listings");
}));


// app.get("/testlistings" , async(req,res) => {
//     let sampleListings = new Listing({
//         title: "Sample Listing",
//         description: "This is a sample listing for testing purposes.",
//         price: 100,
//         location: "Sample Location",
//         country: "Sample Country"
//     })

//     await sampleListings.save();
//     console.log("Sample listing created:", sampleListings);
//     res.send("Sample listing created");
// })

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found"))
// });

app.use((err, req, res, next) => {
    let {statusCode=500, message="Something Went Wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, (req,res) => {
    console.log('Server is running on port 8080');
});