/**
 * Copyright 2013 Kris Daniels.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var Pool = require('pg').Pool;
var named = require('node-postgres-named');
var querystring = require('querystring');

module.exports = function(RED) {
  RED.httpAdmin.get('/postgresdb/:id', function(req, res) {
    var credentials = RED.nodes.getCredentials(req.params.id);
    if (credentials) {
      res.send(JSON.stringify({
        user: credentials.user,
        hasPassword: (credentials.password && credentials.password !== "")
      }));
    } else {
      res.send(JSON.stringify({}));
    }
  });

  RED.httpAdmin.delete('/postgresdb/:id', function(req, res) {
    RED.nodes.deleteCredentials(req.params.id);
    res.status(200).send({});
  });

  RED.httpAdmin.post('/postgresdb/:id', function(req, res) {
    var body = "";
    req.on('data', function(chunk) {
      body += chunk;
    });
    req.on('end', function() {
      var newCreds = querystring.parse(body);
      var credentials = RED.nodes.getCredentials(req.params.id) || {};
      if (newCreds.user == null || newCreds.user === "") {
        delete credentials.user;
      } else {
        credentials.user = newCreds.user;
      }
      if (newCreds.password === "") {
        delete credentials.password;
      } else {
        credentials.password = newCreds.password || credentials.password;
      }
      RED.nodes.addCredentials(req.params.id, credentials);
      res.status(200).send({});
    });
  });

  function PostgresDatabaseNode(n) {
    RED.nodes.createNode(this, n);
    this.hostname = n.hostname;
    this.port = n.port;
    this.db = n.db;
    this.ssl = n.ssl;

    var credentials = this.credentials;
    if (credentials) {
      this.user = credentials.user;
      this.password = credentials.password;
    }
  }

  RED.nodes.registerType("postgresdb", PostgresDatabaseNode, {
    credentials: {
      user: {
        type: "text"
      },
      password: {
        type: "password"
      }
    }
  });

  function PostgresNode(n) {
    RED.nodes.createNode(this, n);

    var node = this;

    node.topic = n.topic;
    node.postgresdb = n.postgresdb;
    node.postgresConfig = RED.nodes.getNode(this.postgresdb);
    node.sqlquery = n.sqlquery;

    if (node.postgresConfig) {

      var connectionConfig = {
        user: node.postgresConfig.user,
        password: node.postgresConfig.password,
        host: node.postgresConfig.hostname,
        port: node.postgresConfig.port,
        database: node.postgresConfig.db,
        ssl: node.postgresConfig.ssl
      };

      var handleError = function(err, msg) {
        msg.payload = "";
        msg.status = "error";
        node.send(msg);
        node.status({
          fill: "red",
          shape: "ring",
          text: "error: " + err.message
        });
      };

      var pool = new Pool(connectionConfig);

      node.on('input', function(msg) {
        if(msg.payload === undefined){
          node.error(RED._("postgres.errors.payload"));
          return;
        }
        pool.connect(function(err, client, done) {
          if (err) {
            handleError(err, msg);
          } else {
            named.patch(client);

            if (msg.queryParameters === undefined){
              msg.queryParameters = {};
            }

            client.query(
              msg.payload,
              msg.queryParameters,
              function(err, results) {
                done();
                if (err) {
                  handleError(err, msg);
                } else {
                    msg.payload = results.rows;
                    msg.status = "success";
                    node.status({
                      fill: "blue",
                      shape: "dot",
                      text: "success"
                    });
                    node.send(msg);
                }
              }
            );
          }
        });
      });
    } else {
      this.error("missing postgres configuration");
    }

    this.on("close", function() {
      if (node.clientdb) {
        node.clientdb.end();
      }
    });
  }

  RED.nodes.registerType("postgres", PostgresNode);
};
