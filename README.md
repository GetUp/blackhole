# blackhole webhook receiver

Send JSON or www-form-urlencoded data to the blackhole!

## Usage

Use https://api.getup.org.au/blackhole as your webhook url in whichever system you want to collect events/data from.

Any url params‡ will become part of the json stored, along with a `body` key containing the POST data.  Like so:

`https://api.getup.org.au/blackhole?campaign=dns-test&source=postperson`

will produce:
```
{
  "source": "postperson",
  "campaign": "dns-test",
  "body": {
    ... posted data...
  }
}
```

‡ use whatever you want, but `source` & `campaign` have a db index to make retrieval much faster.

## Analysing the results

Data ends up in _data_ db in the schema/table `isolated.blackhole`.

Here are some helpful queries to get you started:

### All sources, campaigns
```
select payload->>'source' as source
  , payload->>'campaign' as campaign
  , count(*)
from isolated.blackhole
group by 1,2
order by 1,2
```

### All the keys for a particular source
```
select jsonb_object_keys(payload->'body') as key
from isolated.blackhole
where true
  and payload->>'source' = 'community_shapers'
group by 1
order by 1
```

### Some string extraction for old non-json bodies
```
select received_at
  , payload->'queryStringParameters'->>'source' as source
  , payload->'queryStringParameters'->>'campaign' as campaign
  , substring((payload->'body')::text from 'To=([0-9]+)\&') as "to"
  , substring((payload->'body')::text from 'From=([0-9]+)\&') as "from"
  , replace(urldecode_arr(substring((payload->'body')::text from 'Text=(.+)\&To=')),'+',' ') as message
from isolated.blackhole
where true
  and payload->'queryStringParameters'->>'source' = 'plivo_inbound_sms'
```
