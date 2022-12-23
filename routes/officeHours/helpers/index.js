const notionClient = require("@notionhq/client").Client
const notion = new notionClient({ auth: process.env.NOTION_VIVEK_GITCOIN })

module.exports = {
  generateNotionProfileLink: function(pre, suf) {
    return "https://notion.so/" + encodeURI(
      pre.substring(0,100)
         .replace(/\W/g, " ")
         .replace(/\s+/g, "-")
         + "-"
         + suf.replace(/-/g, "")
    )
  },
  FellowsDB: "7611464a697848d7a3948ed48beaff83",
  AdventuresDB: "fdeb7a1c386e448eaf3a82f666cc49e4",
  AirtableKindleTable: "Kindle",
  fetchFellowByEmail: async function (db, email) {
    let fellow_page;
    try {
      fellow_page = await notion.databases.query({
        database_id: db,
        filter: {
          "or": [
            {
              "property": "email",
              "email": {
                "contains": email
              }
            }
          ],
        },
        page_size: 1
      })
    } catch (err) {
      console.log ("error:::", err)
      return {"error": true}
    }
    return fellow_page
  },
  fetchAdventureFromFellowPage: async function (row) {
    let id = row["results"][0]["properties"]["Adventure"]["relation"][0]["id"]
    , p
    try {
      p = await notion.pages.retrieve({
        page_id: id
      })
    } catch (err) {
      console.log (err)
      return {"error": true}
    }
    
    let title = p["properties"]["Team Name"]["title"][0]["plain_text"]
    return {
      title, id
    }
  }
}