//jshint esversion:6
const dotenv = require("dotenv")
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);


mongoose.connect("process.env.MONGODB_URI || mongodb://localhost:27017/creditDB", {
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
  creditTransferred: Number
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
app.get("/transfer", function(req, res) {
  User.find({}, function(err, users) {
    if (!err) {
      res.render("transfer", {
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

app.post("/delete", function(req, res) {
  User.deleteOne({
    _id: req.body.id
  }, function(err) {

    res.redirect("/users");
  });
});
app.post("/add", function(req, res) {
  const newuser = new User({
    name: req.body.name,
    email: req.body.email,
    credits: req.body.credit
  });
  newuser.save();
  res.redirect("/users");
});
app.post("/users", function(req, res) {
  a = req.body;
  aname = req.body.aname;
  res.redirect("/transfer");

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
        const transaction = new Transaction({
          fromUser: aname,
          ToUSer: bname,
          creditTransferred: req.body.amount
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
