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
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${userName}:${password}@cluster0.bzznx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));

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

async function addUserToDB(name) {
    try {
        await client.connect();
        const result = await
        client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne({userName: name});
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

addUserToDB("TESTNAME");