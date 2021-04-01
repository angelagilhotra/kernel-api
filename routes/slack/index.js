const routes = require('express').Router();
const { airtable } = require('../../credentials.json')
const Airtable = require("airtable");
const base = new Airtable({apiKey: airtable.apiKey}).base(airtable.base);

routes.post('/', async(req,res) => {
  const payload = JSON.parse(req.body.payload)
  const { user, actions } = payload
  console.log ({
    user, actions
  })
  base('NPS').create([
    {
      "fields": {
        "userid": user.id,
        "user": user.name,
        "reaction": actions[0].selected_option.value,
        "timestamp": actions[0].action_ts
      }
    }
  ], function(err, records) {
    if (err) {
      console.error(err);
      res.send({'error': err});
      return;
    }
    records.forEach(function (record) {
      console.log(record.getId());
    });
  });
  res.send({'ok':true})
})

module.exports = routes;
