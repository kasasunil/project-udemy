const mongoose=require('mongoose')
const schema=new mongoose.Schema({
    name:{
        type:String,
        lowerCase:true,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        lowerCase:true,
        enum:['fruit','vegetable','dairy','needs']
    },
    image:String
})
const Product=mongoose.model('Product',schema);
module.exports=Product;