"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const { stock, customers } = require("./data/promo");

let formData = {}

express()
  .use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  })
  .use(morgan("tiny"))
  .use(express.static("public"))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))
  .set("view engine", "ejs")

  // endpoints
  .post("/order", (req, res) => {
    formData =  req.body
    const givenName = formData.givenName.toLowerCase();
    const surname = formData.surname.toLowerCase();
    const email = formData.email.toLowerCase();
    const address = formData.address.toLowerCase();
    const city = formData.city.toLowerCase();
    const province = formData.province.toLowerCase();
    const postcode = formData.postcode.toLowerCase();
    const country = formData.country.toLowerCase();
    const order = formData.order;
    const size = formData.size;


    let json = {
      status: "success",
      path: req.originalUrl,
    };

    //see if customer is already in database
    customers.forEach((customer) => {
      if (
        givenName === customer.givenName.toLowerCase() &&
        surname === customer.surname.toLowerCase() &&
        email === customer.email.toLowerCase() &&
        address === customer.address.toLowerCase() &&
        city === customer.city.toLowerCase() &&
        province === customer.province.toLowerCase() &&
        postcode === customer.postcode.toLowerCase() &&
        country === customer.country.toLowerCase()
      ) {
        json.status = "error";
        json.error = "repeat-customer";
      }
    });
    // see if delivery country is not canada
    if (country !== "canada") {
      json.status = "error";
      json.error = "undeliverable";
    }

    // update stock
    if (order === "shirt") {
      if (stock[order][size] === "0") {
        json.status = "error";
        json.error = "unavailable";
      } else {
        stock[order][size] = (Number(stock[order][size]) - 1).toString();
      }
    } else {
      if (stock[order] === 0) {
        json.status = "error";
        json.error = "unavailable";
      } else {
        stock[order] = (Number(stock[order]) - 1).toString();
      }
    }

    res.json(json);
  })

  .get("/order-confirmed", (req, res) => {
    res.status(200);
    res.render("pages/order-confirmed", { 
      givenName : formData.givenName,
      order : formData.order,
      size : formData.size ,
      province : formData.province
     })
  })


  .listen(8000, () => console.log(`Listening on port 8000`));
