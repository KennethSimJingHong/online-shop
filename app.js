const express = require("express");
const ejs = require("ejs");

const bodyparser = require("body-parser");

const nodemailer = require('nodemailer');

const app = express();

const firebase = require("firebase");



// Required for side-effects
require("firebase/firestore");

app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("source"));

app.set('view engine','ejs');




var firebaseConfig = {
    apiKey: "AIzaSyBkMLZe2MyK06JAuxrh7nMIN1EkOisoTlI",
    authDomain: "online-website-3ec2c.firebaseapp.com",
    databaseURL: "https://online-website-3ec2c.firebaseio.com",
    projectId: "online-website-3ec2c",
    storageBucket: "online-website-3ec2c.appspot.com",
    messagingSenderId: "798841978093",
    appId: "1:798841978093:web:1a334c9d8c56fa9fbf60e4",
    measurementId: "G-WVKG3KJT2M"
};

firebase.initializeApp(firebaseConfig);


const db = firebase.firestore(); 

var data = [];

var event = [];

db.collection("Products").get().then(function(querySnapshot){
    if(querySnapshot == null){
       return;
    }

    querySnapshot.forEach(function(doc){
        data.push(doc.data());
    })
});

db.collection("Event").get().then(function(querySnapshot){
    if(querySnapshot == null){
       return;
    }

    querySnapshot.forEach(function(doc){
        event.push(doc.data());
    })
});



var selectedIndex = 0;
var selectedItem;
var cartSelectedItems = [];


app.get("/",function(req,res){
    res.render("index",{dataElement:data,eventElement:event});
    console.log(event);
});

app.post("/",function(req,res){
    selectedIndex = parseInt(req.body.which_tab);
    res.redirect("/desc");
});

app.get("/cart",function(req,res){
    res.render("cart",{dataElement:cartSelectedItems,eventElement:event});
});

app.get("/desc",function(req,res){
    console.log(data[selectedIndex]);
    selectedItem = data[selectedIndex]; 
    res.render("description",{dataElement:selectedItem,eventElement:event});
});

app.post("/desc",function(req,res){
    if(selectedItem.existing == "false"){
        selectedItem.existing = "true";
        selectedItem.quantity = req.body.quantity;
        var theItem = {selectedItem};
        cartSelectedItems.push(theItem);
    }else{
        cartSelectedItems.forEach((data)=>{ 
            data.selectedItem.quantity = (parseInt(data.selectedItem.quantity) + parseInt(req.body.quantity)).toString();
        });
    }
    res.redirect("/cart");
});

app.post("/cart",function(req,res){
    if(req.body.manage_item == "update"){
        cartSelectedItems[req.body.item_index].selectedItem.quantity = req.body.quantity;
    }
    if(req.body.manage_item == "remove"){
        data.forEach((doc)=>{
            if(doc.name == cartSelectedItems[req.body.item_index].selectedItem.name){
                selectedItem = doc;
            }
        });
        selectedItem.existing = "false";
        cartSelectedItems.splice([req.body.item_index],1);
    }
    res.redirect("/cart");
});


app.get("/address",function(req,res){
    res.render("address", {dataElement:cartSelectedItems});
});

app.get("/compose",function(req,res){
    res.render("compose");
})


app.post("/compose",function(req,res){



    var imgArr = req.body.secondImage.split(',');

    db.collection("Products").add({
        name: req.body.name,
        price: req.body.price,
        desc: req.body.desc,
        imageUrl:req.body.mainImage,
        images:imgArr,
        existing:"false",
    })
    .then(function() {
        console.log("Document successfully written!");
        alert("complete");
        res.redirect("/compose");
    })
    .catch(function(error) {
        alert("error");
        console.error("Error writing document: ", error);
    });
})




app.listen(process.env.PORT || 3000,function(){
    console.log("server is running on port 3000");
})