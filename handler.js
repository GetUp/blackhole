'use strict';
const pg = require('pg');
const conString = process.env.DATABASE_URL;
const query = 'INSERT INTO isolated.webhooks(payload) VALUES($1);';

module.exports.hello = (event, context, callback) => {
  console.log({webhook_received: new Date, event: event});

  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'OK' }),
  };
  const client = new pg.Client(conString);

  client.connect(function(err) {
    if (err) return callback(err);
    client.query(query, [JSON.stringify(event)], function(e, result) {
      client.end();
      if (e) return callback(e);
      callback(null, response);
    });
  });
};
