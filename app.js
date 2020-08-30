//jshint esversion:6
require('dotenv').config();
const dotenv = require("dotenv")
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const _ = require("lodash");


mongoose.connect("mongodb+srv://admin-eshika:"+process.env.PASS+"@cluster0.gcxrb.mongodb.net/creditDB?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const contentSchema = mongoose.Schema({
  name: String,
  email: String,
  credits: Number

});
const User = mongoose.model("User", contentSchema);

const historySchema = mongoose.Schema({
  fromUser: String,
  ToUSer: String,
  creditTransferred: Number,
  timestamp:String
});
const Transaction = mongoose.model("Transaction", historySchema);

app.get("/", function(req, res) {
  res.render("home");
});
app.get("/add", function(req, res) {
  res.render("add");
});
app.get("/users", function(req, res) {
  User.find({}, function(err, users) {
    if (!err) {
      res.render("users", {
        users: users
      });

    }
  })

});
app.get("/delete", function(req, res) {
  User.find({}, function(err, users) {
    if (!err) {
      res.render("delete", {
        users: users
      });

    }
  })
});
app.get("/amt", function(req, res) {
  res.render("amt");
});
app.get("/history", function(req, res) {
  Transaction.find({}, function(err, transactions) {
    if (!err) {
      res.render("history", {
        transactions: transactions
      });
    }
  });
});
app.get("/success", function(req, res) {
  res.render("success");
})
app.get("/failure", function(req, res) {
  res.render("failure");
})
app.get("/existinguser",function(req,res){
  res.render("existinguser")
})
app.post("/delete", function(req, res) {
  User.deleteOne({
    _id: req.body.id
  }, function(err) {

    res.redirect("/users");
  });
});
app.post("/add", function(req, res) {
  User.find({name:req.body.name, name:_.capitalize(req.body.name),name:_.startCase(req.body.name)},function(err,user){
    if(!err){
      if(!user[0]){
        const newuser = new User({
          name: req.body.name,
          email: req.body.email,
          credits: req.body.credit
        });
        newuser.save();
        res.redirect("/users");
      }else{
        console.log(user)
        res.redirect("/existinguser");
      }
    }
  })
});
app.post("/users", function(req, res) {
  a = req.body;
  aname = req.body.aname;
  res.redirect("/transfer");

});
app.get("/transfer", function(req, res) {
  User.find({}, function(err, users) {
    if (!err) {
      res.render("transfer", {
        users: users,
        a:a
      });

    }
  })
});

app.post("/transfer", function(req, res) {
  b = req.body;
  bname = req.body.bname;
  res.render("amt");

});
app.post("/amt", function(req, res) {
  User.find({
    _id: a.fromid
  }, function(err, userr) {
    if (!err) {
      if (userr[0].credits >= req.body.amount) {
        User.findOneAndUpdate({
          _id: a.fromid
        }, {
          $inc: {
            credits: -req.body.amount
          }
        }, function(req, res) {});
        User.findOneAndUpdate({
          _id: b.toid
        }, {
          $inc: {
            credits: req.body.amount
          }
        }, function(req, res) {});
        var today = new Date();
        var date =today.getDate()+'-'+(today.getMonth()+1) +'-'+today.getFullYear();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = time+" , "+date;
        const transaction = new Transaction({
          fromUser: aname,
          ToUSer: bname,
          creditTransferred: req.body.amount,
          timestamp:dateTime
        });
        transaction.save();
        res.redirect("/success");
      } else {
        res.redirect("/failure");
      }
    }
  })
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
