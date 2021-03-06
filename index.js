'use strict';
const pg = require('pg');
const qs = require('qs');
const conString = process.env.DATABASE_URL;
const query = 'INSERT INTO isolated.blackhole(payload) VALUES($1);';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-requested-with',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const successResponse = {
  statusCode: 200,
  headers: corsHeaders,
  body: JSON.stringify({ message: 'OK' }),
};

const errorResponse = {
  statusCode: 500,
  headers: corsHeaders,
  body: JSON.stringify({ error: 'see cloudwatch logs for details' }),
};

module.exports.process = (event, context, callback) => {
  console.log({ webhook_received: new Date, event: JSON.stringify(event) });

  const client = new pg.Client(conString);

  client.connect(err => {
    if (err) return handleError(err, callback);
    const body = /www-form-urlencoded/.test(event.headers['Content-Type']) ? qs.parse(event.body) : JSON.parse(event.body)
    const payload = Object.assign({}, event.queryStringParameters, { body });
    client.query(query, [JSON.stringify(payload)], e => {
      client.end();
      if (e) return handleError(e, callback);
      callback(null, successResponse);
    });
  });
};

function handleError(err, cb) {
  console.error({ error: JSON.stringify(err) });
  cb(null, errorResponse);
}
