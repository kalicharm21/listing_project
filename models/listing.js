const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
    title: {
        type : String,
        required: true,
    },
    description :{
        type : String
    },
    image:{
        type : String,
        default: 
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRubQnbQb02HIWyXGjqoHkz6rCU793Td9ejfVW0fIEFSkuVgxPYfDqHbgMS&s=10",
        set : (v) => 
            v === ""
                 ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRubQnbQb02HIWyXGjqoHkz6rCU793Td9ejfVW0fIEFSkuVgxPYfDqHbgMS&s=10" 
                    : v, // Set a default value if the image is empty
    },
    price : Number,
    location : String,
    country : String,

});

const Listing = mongoose.model('Listing', ListingSchema);
module.exports = Listing;