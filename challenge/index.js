const fs = require('fs')
const readline = require('readline')
const _ = require('lodash')

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

    const columnNames = values.shift()
    const persons = []
    const findValueByColumn = (array, name) => {
      return array.find(({ columnName }) => {
        if (columnName === name) return true
      }).value
    }

    for (let i = 0; i < values.length; i++) {
      const arrayFinal = []
      values[i].forEach((value, index) => {
        arrayFinal.push({
          columnName: columnNames[index],
          value,
        })
      })
      const getGroups = (arrayFinal) => {
        const a = arrayFinal.filter(({ columnName, value }) => {
          if (columnName === 'group' && value !== '') return true
        }).map(({ value }) => value)
        const cleanArray = []
        a.forEach((item) => {
          item.split(/[/"]/).forEach((i) => {
            if (i !== '') {
              cleanArray.push(i)
            }
          })
        })
        return cleanArray
      }
      const valuesFormatted = {
        fullname: findValueByColumn(arrayFinal, 'fullname'),
        eid: findValueByColumn(arrayFinal, 'eid'),
        groups: getGroups(arrayFinal)
      }
      if (i > 0) {
        const alreadyExist = persons.find(({ eid }) => eid === valuesFormatted.eid)
        if (alreadyExist) {
          const oldItem = _.remove(persons, ({ eid }) => eid === valuesFormatted.eid)
          oldItem.forEach((item) => {
            item.groups.forEach((i) => {
              valuesFormatted.groups.push(i)
            })
          })
          valuesFormatted.groups = _.uniq(valuesFormatted.groups)
        }
      }
      persons.push(valuesFormatted)
    }
    this.#writeFileJson(persons)
  }

  #writeFileJson(data) {
    fs.writeFile('output.json', JSON.stringify(data), function (err) {
      if (err) return console.log('Sorry, try again');
    });
  }
}
const filepath = "./examples/input.csv"
const c = new ParseCSVtoJSON(filepath)

c.execute().catch(console.error)