require('dotenv').config();
const express = require("express")
const bodyParser = require('body-parser')
const keys = require('./config/keys')
const { postgraphile } = require("postgraphile")
const fs = require('fs')

const dashData = require('./database/data')

const PORT = process.env.PORT || 3001
const app = express()
const env = process.env.NODE_ENV || 'development'

app.use(express.static("lib"));
// Not sure if this is required but we might need it for req.params in express routes
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.text());
// app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// app.get('/api', (req, res) => res.send('Hello'))

app.get("/api/videos/:filename?", function(req, res) {
  res.writeHead(200, {'Content-Type': 'video/mp4'})

  const filename = req.params.filename
  if (filename) {
    let rs = fs.createReadStream(__dirname + '\\lib\\videos\\' + filename)
    rs.pipe(res)
  } else {
    res.json({msg: 'This file does not exist'})
  }
});

app.get("/api/dashdata", function(req, res) {
  // DEMO: the json data provided here should come from a database in the future
  res.json({data: dashData.data});
});

// This Postgres config must be preceeeded by the creation of a both a Heroku application and a Heroku Postgres database within that application 
// The Heroku application can be created by the heroku-cli. Note the application name.
// The Heroku Postgres database is best installed online within the Heroku dashboard for the application you created.
// The .env file on the root contains the local values needed for development but is filtered by gitignore when deploying
// To supply values in production you will have to install Heroku Postgres on the Heroku application instance you created
//  From the Postgres installation in your application under Resources you can retrieve the values supplied in the dashboard
//  In the Heroku dashboard for the Heroku app you created go Settings tab and click Reveal Config Vars
//   Add the values needed by the keys below as production environment variables.
//   Use the values supplied from the Heroku Postges installation (drill into those settings under the database installation)
const postgresConfig = {
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE
}

app.use(postgraphile(
  postgresConfig,
  "app_public",
  {
    graphiql:true, 
    enableCors: true,
    watchPg: true,
    jwtPgTypeIdentifier: "app_public.jwt_token",
    jwtSecret: process.env.JWT_SECRET,
    pgDefaultRole: process.env.POSTGRAPHILE_DEFAULT_ROLE
  }
));

if (env === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    console.log(req.url)
    // const path = require('path');
    // res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

app.listen(PORT, () => {
  // console.log(`
  // Environment: ${env}
  // postgresConfig: ${postgresConfig}
  // `);
  console.log(`The server is running on port ${PORT}`)
});