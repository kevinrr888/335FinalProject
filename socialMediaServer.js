if (process.argv.length != 3) {
    process.stdout.write("Usage node socialMediaServer.js PORT_NUMBER_HERE");
    process.exit(1);
}

const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser"); 
const port = process.argv[2];
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${userName}:${password}@cluster0.bzznx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, "/css")));

app.get('/', function(request, response){
    response.render("index");
});

app.get('/createAccount', function(request, response){
    response.render("createAccount");
});

app.get('/login', function(request, response){
    response.render("login");
});

app.get('/nelson', function(request, response){
    response.render("nelson");
});

app.get('/myPaduas', function(request, response){
    response.render("myPaduas");
});

app.get('/postPadua', function(request, response){
    response.render("postPadua");
});

app.post('/createAccount', function(request, response) {
    let accountData = {
        name: request.body.name,
        email: request.body.email,
        birthMonth: request.body.month,
        birthDay: request.body.day,
        birthYear: request.body.year,
        user: request.body.user,
        pass: request.body.pass
    }

    addUserToDB(accountData);
    response.render("accountDetails", accountData);
});

app.post('/login', async function(request, response) {
    let username = request.body.user;
    let pass = request.body.pass;
    const user = await verifyLogin(username, pass);
    if (user) {
        response.render("myAccount", {name: username});
    } else {
        response.render("badLogin");
    }
});

app.post('/postPadua', function(request, response) {
    let padua = {
        user: request.body.user,
        post: request.body.post,
    };

    let post = {post: request.body.post};

    postPaduaToDB(padua);
    response.render("yourPadua", post);
});

process.stdin.setEncoding("utf8");

console.log(`Web server started and running at http://localhost:${port}`);
http.createServer(app).listen(port);

let prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
    let input = process.stdin.read();
    if (input != null) {
        let command = input.trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server\n");
            process.exit(0);
        } else {
            process.stdout.write(`Invalid command: ${command}\n`);
        }
    }
    process.stdout.write(prompt);
    process.stdin.resume();
});

async function postPaduaToDB(padua) {
    try {
        await client.connect();
        const result = await
        client.db(db).collection(collection).insertOne(padua);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

/* ------------- Search for users ------------*/

// By username
async function findUser(username) {
    let filter = {user: username};
    try {
        await client.connect();
        const result = await client.db(db).collection(collection).findOne(filter);
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function addUserToDB(accountData) {
    try {
        await client.connect();
        const result = await
        client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(accountData);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

/* ---------- Verify login credentials ------------- */
async function verifyLogin(username, password) {
    const user = await findUser(username);
    if (user) {
        let realPass = user.pass;
        if (realPass === password) {
            return user;
        } 
    }
}