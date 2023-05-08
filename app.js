//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
    cookie: { _expires: 100000000000000000000000000000000000000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(
  "mongodb+srv://azerty123:w6nTCAY9DNcBJA6p@cluster1.dp3aos9.mongodb.net/projet_Agile?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

const userSchema = new mongoose.Schema({
  mode: String,
  email: String,
  password: String,
  name: String,
  secret: String,
});

const ideaSchema = new mongoose.Schema({
  title: String,
  idee: String,
  type: String,
  user: String,
  user_id: String,
});

const defiSchema = new mongoose.Schema({
  defi: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

const Idea = new mongoose.model("Idea", ideaSchema);

const Defi = new mongoose.model("Defi", defiSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.mode === "user") {
      res.render("home", { statut: 1 });
    } else {
      res.render("home", { statut: 2 });
    }
  } else {
    res.render("home", { statut: 0 });
  }
});

app.get("/propos", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("propos", { statut: 1 });
  } else {
    res.render("propos", { statut: 0 });
  }
});

app.get("/contact", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("contact", { statut: 1 });
  } else {
    res.render("contact", { statut: 0 });
  }
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/ecrire_idee", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("ecrire_idee", { statut: 1 });
  } else {
    res.redirect("/login");
  }
});

app.get("/idees_envoyees", function (req, res) {
  if (req.isAuthenticated()) {
    Idea.find(
      { idee: { $ne: null }, user_id: req.user.id },
      function (err, foundIdeas) {
        if (err) {
          console.log(err);
        } else {
          if (foundIdeas) {
            console.log(foundIdeas);
            res.render("idees_envoyees", { ideas: foundIdeas, statut: 1 });
          }
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.get("/idees", function (req, res) {
  if (req.isAuthenticated()) {
    Idea.find({ idee: { $ne: null } }, function (err, foundIdeas) {
      if (err) {
        console.log(err);
      } else {
        if (foundIdeas) {
          console.log(foundIdeas);
          res.render("idees", { ideas: foundIdeas, statut: 1 });
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/defi_mois", function (req, res) {
  if (req.isAuthenticated()) {
    Defi.find({ defi: { $ne: null } }, function (err, foundDefi) {
      if (err) {
        console.log(err);
      } else {
        if (foundDefi) {
          console.log(foundDefi);
          res.render("defi_mois", { defi: foundDefi, statut: 1 });
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/idees_admin", function (req, res) {
  if (req.isAuthenticated()) {
    Idea.find({ idee: { $ne: null } }, function (err, foundIdeas) {
      if (err) {
        console.log(err);
      } else {
        if (foundIdeas) {
          console.log(foundIdeas);
          res.render("idees_admin", { ideas: foundIdeas, statut: 2 });
        }
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/voir_defi", function (req, res) {
  if (req.isAuthenticated()) {
    Idea.find(
      { idee: { $ne: null }, type: "defi" },
      function (err, foundIdeas) {
        if (err) {
          console.log(err);
        } else {
          if (foundIdeas) {
            console.log(foundIdeas);
            Defi.find({ defi: { $ne: null } }, function (err, foundDefi) {
              if (err) {
                console.log(err);
              } else {
                if (foundDefi) {
                  console.log(foundDefi);
                  res.render("voir_defi", {
                    ideas: foundIdeas,
                    defi: foundDefi,
                    statut: 2,
                  });
                }
              }
            });
          }
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.get("/ecrire_defi", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("ecrire_defi", { statut: 2 });
  } else {
    res.redirect("/login");
  }
});

app.get("/compte", function (req, res) {
  if (req.isAuthenticated()) {
    if (req.user.mode === "user") {
      res.render("compte", { statut: 1, user: req.user });
    } else {
      res.render("compte", { statut: 2, user: req.user });
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/");
});

app.post("/register", function (req, res) {
  console.log(req.body);
  User.register(
    {
      mode: req.body.guard,
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
    },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    mode: req.body.guard,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});

app.post("/ecrire_idee", function (req, res) {
  console.log(req.user);
  const submittedIdea = {
    title: req.body.title,
    idee: req.body.idea,
    type: "idee",
    user: req.user.name,
    user_id: req.user.id,
  };

  const idea = new Idea(submittedIdea);
  idea.save(function (err, idea) {
    if (err) {
      console.error(err);
    } else {
      res.redirect("/idees");
    }
  });
});

app.post("/defi_mois", function (req, res) {
  console.log(req.user);
  const submittedIdea = {
    title: req.body.title,
    idee: req.body.idea,
    type: "defi",
    user: req.user.name,
    user_id: req.user.id,
  };

  const idea = new Idea(submittedIdea);
  idea.save(function (err, idea) {
    if (err) {
      console.error(err);
    } else {
      res.redirect("/idees");
    }
  });
});

app.post("/ecrire_defi", function (req, res) {
  const submittedDefi = {
    defi: req.body.defi,
  };

  mongoose.connection.db.dropCollection("defis", function (err, result) {
    console.log("Collection droped");
  });

  const defi = new Defi(submittedDefi);
  defi.save(function (err, defi) {
    if (err) {
      console.error(err);
    } else {
      res.redirect("/idees_admin");
    }
  });
});

app.listen(3000, function (req, res) {
  console.log("Server started on port 3000");
});
