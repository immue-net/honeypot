const express = require('express');
const app = express();
const fs = require('fs').promises;
app.listen(3000);
console.log(`Server running at http://localhost:3000`);

const NOT_FOUND = `<body><center><h1>404 Not Found</h1></center><hr><img src="test.png" style="display: none;" /></body>`;

async function LogToFile(fileName, text) {
    return new Promise(async (resolve) => {
        await fs.appendFile(`${fileName}.txt`, text + "\n");
        resolve();
    });
}
async function RemoveFromFile(fileName, text) {
    return new Promise(async (resolve) => {
        var file = await fs.readFile(`${fileName}.txt`, 'utf8');
        if (file.includes(text)) {
            var newValue = file.replace(text + "\n", '');
            await fs.writeFile(`${fileName}.txt`, newValue);
        }
        resolve();
    });
}

async function whitelist(request, response) {
    const user_agent = request.headers['user-agent'];
    const remoteAddress = request.socket.remoteAddress;
    console.log(`Whitelisted ${user_agent}`)
    await RemoveFromFile("log", remoteAddress + "|" + user_agent)
    response.statusCode = 404;
    response.end(NOT_FOUND)
}

app.get('/test.png', whitelist);
app.get('/favicon*', whitelist);
app.use(async (request, response) => {
    var v = `${request.method} ${request.url}`;
    const user_agent = request.headers['user-agent'];
    const remoteAddress = request.socket.remoteAddress;
    console.log(`${remoteAddress} ${request.method} ${request.url} ${user_agent}`);
    LogToFile("log", remoteAddress + "|" + user_agent);
    LogToFile("urls", v);
    response.statusCode = 404;
    response.end(NOT_FOUND);
})