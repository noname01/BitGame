
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var compression = require("compression");
var session = require("cookie-session");

var data = require("./data.js");
var checker = require("./checkAnswer.js");
var user = require("./user.js");

user.readAllUserData();

var app = express();

//static middleware
var oneDay = 86400000;
app.use(compression());
app.use(express.static(path.join(__dirname, 'client'), { maxAge: oneDay }));
app.use(session({
    secret : "123123123123123"
}))

app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'client'));
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get("/", function(req, res){
    res.render("index");
});

app.get("/api/login", function(req, res){
    req.session.uid = "1";
    res.json({"ok": 1});
});

app.get("/api/list", function(req, res){
    var probs = JSON.parse(JSON.stringify(data.list));
    if (req.session.uid) {
        var userObj = user.getUserData(req.session.uid);
        for (var attr in userObj.prob) {
            probs[attr].rate = userObj.prob[attr].rate;
            //probs[attr]["date"] = userObj.prob[attr]["date"];
        }
    }
    res.json(probs);
});

app.get("/api/prob/:pid", function(req, res){

    var prob = JSON.parse(JSON.stringify(data.probs[req.params.pid]));
    if (req.session.uid) {
        var userObj = user.getUserData(req.session.uid);
        if (userObj.prob[req.params.pid]) {
            prob.rate = userObj.prob[req.params.pid].rate;
            prob.date = userObj.prob[req.params.pid].date;
            prob.answer = userObj.prob[req.params.pid].answer;
        }
    }
    res.json(prob);
});

app.post("/api/answer", function(req, res){
    if (req.body.pid) {
        checker.check(req, res);
        if (req.session.uid) {
            var userObj = user.getUserData(req.session.uid);
            userObj.prob[req.body.pid] = {
                "rate": 10,
                "date": new Date(),
                "answer": req.body.answer
            };
            user.writeAllUserData();
            res.json(userObj.prob[req.body.pid]);
        } else
            res.json({"rate": 10});
    } else
        res.json({ok: 0});
});

var server = app.listen(3000, function(){
    console.log("Listening on port %d", server.address().port);
});