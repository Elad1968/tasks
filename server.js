const bodyParser = require("body-parser");
const express = require("express");
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require("mongodb");

async function getMongoDB() {
    const uri = process.env.MONGODB_URI;
    const mongoDB = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    });
    await mongoDB.connect();
    return mongoDB;
}
async function getDatabase(databaseName) {
    const mongoDB = await getMongoDB();
    return mongoDB.db(databaseName);
}
async function getCollection(databaseName, collectionName) {
    const database = await getDatabase(databaseName);
    return database.collection(collectionName);
}

function main() {
    dotenv.config();
    const app = express();
    app.use(bodyParser.json());
    app.use("/", express.static(__dirname + "/client/"));
    app.use(
        "/bootstrap",
        express.static(__dirname + "/node_modules/bootstrap/dist/css")
    );
    app.get("/", (request, response) => {
        response.redirect("/login");
    });
    app.get("/register", (request, response) => {
        response.sendFile(__dirname + "/client/html/register.html");
    });
    app.get("/login", (request, response) => {
        response.sendFile(__dirname + "/client/html/login.html");
    });
    app.get("/todos", (request, response) => {
        response.sendFile(__dirname + "/client/html/todos.html");
    });
    app.post("/api/login", async (request, response) => {
        let answer;
        try {
            const data = request.body;
            const collection = await getCollection("db", "users");
            const filter = {
                email: data["email"],
            };
            const cursor = collection.find(filter);
            if (await cursor.hasNext()) {
                let user = await cursor.next();
                if (user["password"] === data["password"]) {
                    answer = {
                        error: false,
                        username: user["username"],
                        todos: user["todos"],
                    };
                } else {
                    answer = {
                        error: true,
                        message: "Incorrect password.",
                    };
                }
            } else {
                answer = {
                    error: true,
                    message: "Incorrect email.",
                };
            }
        } catch (exception) {
            answer = {
                error: true,
                message: "Unknown error.",
            };
        } finally {
            response.json(answer);
        }
    });
    app.post("/api/set-todos", async (request, response) => {
        let answer;
        try {
            const data = request.body;
            let collection = await getCollection("db", "users");
            const filter = {
                email: data["email"],
                password: data["password"],
            };
            let cursor = collection.find(filter);
            if (await cursor.hasNext()) {
                let update = {
                    $set: {
                        todos: data["todos"],
                    },
                };
                await collection.updateOne(filter, update);
                answer = {};
            } else {
                answer = {
                    error: true,
                    message: "Incorrect email or password.",
                };
            }
        } catch (exception) {
            answer = {
                error: true,
                message: "Unknown error.",
            };
        } finally {
            response.json(answer);
        }
    });
    app.post("/api/get-todos", async (request, response) => {
        let answer;
        try {
            const data = request.body;
            let collection = await getCollection("db", "users");
            const filter = {
                email: data["email"],
                password: data["password"],
            };
            let cursor = collection.find(filter);
            if (await cursor.hasNext()) {
                let user = await cursor.next();
                answer = {
                    todos: user["todos"],
                };
            } else {
                answer = {
                    error: true,
                    message: "Incorrect email or password.",
                };
            }
        } catch (exception) {
            answer = {
                error: true,
                message: "Unknown error.",
            };
        } finally {
            response.json(answer);
        }
    });
    app.post("/api/register", async (request, response) => {
        let answer;
        try {
            const data = request.body;
            let collection = await getCollection("db", "users");
            const filter = {
                email: data["email"],
            };
            let cursor = collection.find(filter);
            if (await cursor.hasNext()) {
                answer = {
                    error: true,
                    message: "Email already exists.",
                };
            } else {
                data["todos"] = [];
                await collection.insertOne(data);
                answer = {
                    error: false,
                };
            }
        } catch (exception) {
            answer = {
                error: true,
                message: "Unknown error.",
            };
        } finally {
            response.json(answer);
        }
    });
    const port = process.env.PORT;
    app.listen(port, async () => {
        console.log("The server is up at port " + port + ".");
    });
}

if (require.main === module) {
    main();
}
