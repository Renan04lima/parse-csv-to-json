const fs = require('fs')
const readline = require('readline')

class ParseCSVtoJSON {
  fileLines

  constructor(path) {
    this.fileLines = readline.createInterface({
      input: fs.createReadStream(path)
    })
  }

  async execute() {
    let values = []
    for await (const item of this.fileLines) {
      let line = item.split(",")
      if (line.length > 12) {
        const removeCommaOfGroup = item.replace(',"S', '"S')
        line = removeCommaOfGroup.split(",")
      }
      values.push(line)
    }
  }
}
const filepath = "./examples/input.csv"
const c = new ParseCSVtoJSON(filepath)

c.execute().catch(console.error)