import express from "express";
import mongoose from "mongoose";
import graphqlHTTP from "express-graphql";
import passport from "passport";
import FacebookStrategy from "passport-facebook";
import schema from "../graphql";
import { facebook } from "./config";

const transformFacebookProfile = profile => ({
  name: profile.displayName,
  avatar: profile.image.url
});

passport.use(
  new FacebookStrategy(
    facebook,
    async (accessToken, refreshToken, profile, done) => {
      done(null, transformFacebookProfile(profile._json));
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const app = express();
app.use(passport.initialize());
app.use(passport.session());

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/auth/facebook" }),
  (req, res) =>
    res.redirect(
      "AirbnbReactNativeClone://login?user=" + JSON.stringify(req.user)
    )
);

app.use(
  "/graphql",
  graphqlHTTP(req => ({
    schema,
    pretty: true,
    graphiql: true
  }))
);

mongoose.connect("mongodb://localhost:27017/my-rn-airbnb", {
  useNewUrlParser: true
});

const server = app.listen(5000, () => {
  console.log("listening at port", server.address().port);
});
