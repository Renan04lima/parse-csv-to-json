const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')

class ParseCSVtoJSON {
  #fileLines
  #valuesLine
  #dataFormatted

  constructor(path) {
    this.#fileLines = readline.createInterface({
      input: fs.createReadStream(path)
    })
    this.#dataFormatted = []
  }

  async execute() {
    let values = []
    for await (const line of this.#fileLines) {
      let lineArray = line.split(",")
      if (lineArray.length > 12) {
        const removeCommaOfGroup = line.replace(',"S', '"S')
        lineArray = removeCommaOfGroup.split(",")
      }
      values.push(lineArray)
    }

    const columnNames = values.shift()

    for (let i = 0; i < values.length; i++) {
      this.#valuesLine = []
      values[i].forEach((value, index) => {
        this.#valuesLine.push({
          columnName: columnNames[index],
          value,
        })
      })

      const valuesLineFormatted = {
        fullname: this.#findValueByColumn('fullname'),
        eid: this.#findValueByColumn('eid'),
        groups: this.#getGroups(),
        invisible: this.#isInvisible(),
        see_all: this.#isSeeAll()
      }
      if (i > 0) {
        const alreadyExist = this.#dataFormatted.find(({ eid }) => eid === valuesLineFormatted.eid)
        if (alreadyExist) {
          valuesLineFormatted.groups = this.#mergeGroup(valuesLineFormatted)
        }
      }
      this.#dataFormatted.push(valuesLineFormatted)
    }
    this.#writeFileJson()
  }

  #findValueByColumn(name) {
    return this.#valuesLine.find(({ columnName }) => {
      if (columnName === name) return true
    }).value
  }

  #getGroups() {
    const groupsArray = this.#valuesLine.filter(({ columnName, value }) => {
      if (columnName === 'group' && value !== '') return true
    }).map(({ value }) => value)
    const cleanGroupsArray = []
    groupsArray.forEach((item) => {
      item.split(/[/"]/).forEach((i) => {
        if (i !== '') {
          cleanGroupsArray.push(i)
        }
      })
    })
    return cleanGroupsArray
  }

  #mergeGroup(valuesLineFormatted) {
    const oldItem = _.remove(this.#dataFormatted, ({ eid }) => eid === valuesLineFormatted.eid)
    oldItem.forEach((item) => {
      item.groups.forEach((i) => {
        valuesLineFormatted.groups.push(i)
      })
    })
    return _.uniq(valuesLineFormatted.groups)
  }

  #isInvisible() {
    const value = this.#findValueByColumn('invisible')
    return value === '1' || value === 'yes'
  }

  #isSeeAll() {
    const value = this.#findValueByColumn('see_all')
    return value === '1' || value === 'yes'
  }

  #writeFileJson() {
    fs.writeFile('output.json', JSON.stringify(this.#dataFormatted), function (err) {
      if (err) return console.log('Sorry, try again');
    });
  }
}

const filepath = "./input.csv"
const c = new ParseCSVtoJSON(filepath)

c.execute().catch(console.error)