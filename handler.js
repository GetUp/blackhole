'use strict';
const pg = require('pg');
const conString = process.env.DATABASE_URL;
const query = 'INSERT INTO isolated.webhooks(payload) VALUES($1);';

module.exports.hello = (event, context, callback) => {
  console.log({webhook_received: new Date, event: JSON.stringify(event)});

  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'OK' }),
  };
  const client = new pg.Client(conString);

  client.connect(err => {
    if (err) return handleError(err, callback);
    client.query(query, [JSON.stringify(event)], (e, result) => {
      client.end();
      if (e) return handleError(e, callback);
      callback(null, response);
    });
  });
};

function handleError(err, cb) {
  console.error({error: JSON.stringify(err)});
  const response = {
    statusCode: 500,
    body: JSON.stringify({ error: 'see cloudwatch logs for details' }),
  };
  cb(response);
}
