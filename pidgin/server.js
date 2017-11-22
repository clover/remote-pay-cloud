const path = require("path");
const express = require("express");
const app = express();

const contentDir = path.join(__dirname, "public");
app.use(express.static(contentDir));

app.get("/*", function(req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
});

app.set("port", (process.env.PORT || 3000));

app.listen(app.get("port"), function () {
    console.log("Pidgin Automation Server started: http://localhost:" + app.get("port") + "/");
});