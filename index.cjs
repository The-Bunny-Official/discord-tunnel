const express = require("express");
const parser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const moment = require("moment");
const fs = require("fs");

const fetch = require("node-fetch");

const config = require("./config.json");

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.set("views", "views");
app.set("view engine", "ejs");
app.set("x-powered-by", false);
app.set("case sensitive routing", false);
app.use(parser.json());
app.use(parser.urlencoded( { extended: true } ));
app.use(cors());
app.use(cookieParser());
app.use(express.static(`${__dirname}`));

async function messageHandling(){
  const messages = await require("./bot.cjs").fetchMessages();

  let content = [];
  let author_ids = [];
  let timestamps = [];
  let parsedContent = ``;

  for (let message of messages){
    message = message[1];

    if(message.content) content.push(message.content);
    author_ids.push(message.author.id);
    timestamps.push(message.createdTimestamp);

    for(let attachment of message.attachments){ 
      const response = await fetch(attachment[1].url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.createWriteStream(`./images/${attachment[1].name}`).write(buffer);

    if(!message.content) content.push(`<embed type="${attachment[1].contentType}" src="../images/${attachment[1].name}">`);
    if(message.content) content[content.length - 1] += `<br><br><embed type="${attachment[1].contentType}" src="../images/${attachment[1].name}">`;
    }
  };

  content.reverse();
  author_ids.reverse();
  timestamps.reverse();

  let i = 0;
  let class_name_suff;

  for (let c of content) {

    if(author_ids[i] == config.client){
      class_name_suff = "client";
    } else {
      class_name_suff = "other"
    }

    let date = new Date(timestamps[i]);
    let time = moment(date, 'MM-DD-YYYY hh:mm:ss a');
    time.utcOffset(-7);

    parsedContent += `<div class="message ${class_name_suff}"><div class="content">${content[i]}</div><div class="tooltip">${time}</div></div><br>`;
    i++;
  };

  return parsedContent;
}

app.get("/", async function(req, res){
  if(!req.cookies.loggedIn) return res.redirect("/login");
  
  res.render("index", {
    content: await messageHandling()
  });
});

app.get("/timedout", async function(req, res){
  if(!req.cookies.loggedIn) return res.redirect("/login");
  res.render("timedout", {
    time: "5 AM"
  });
});

app.post('/api/image-upload', upload.single('file'), async (req, res) => {
  if (req.file) {
    const arrayBuffer = req.file.buffer;

    //fs.writeFileSync(`uploads/${req.file.originalname}`, Buffer.from(arrayBuffer));

    await require("./bot.cjs").sendAttachment(Buffer.from(arrayBuffer), req.file.originalname);

    res.redirect("/");
  }
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/api/send", async (req, res) => {
  const cont = req.body.message;

  await require("./bot.cjs").sendMessage(cont);
  res.redirect("/");
});

app.post("/api/typing", async (req, res) => {
  require("./bot.cjs").sendTyping();
});

app.get("/api/updates", async (req, res) => {
  res.send(await messageHandling());
});

app.post("/api/loginReq", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if(username == config.username && password == config.password){
      res.cookie("loggedIn", "true", "expires", 0);
      res.redirect("/");
    }
});

app.listen(port, () => {
    console.log(`Logged in on port ${port}`)
});

process.on("uncaughtException", (err, origin) => {
    console.error(`Caught exception ${err} at ${origin}`);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error(`Promise ${promise} was rejected because ${reason}`);
});