const csv = require('csvjson');
const helper = require('./helper.js');

class CsvParser {
  constructor(inputPath, iterator, options) {
    this.iterator = iterator;
    // TODO: for large CSV split the processing in multiple files
    const string = helper.readFileCSV(inputPath, options);

    if (options.csvIndex) {
      
    }

    const o = {
      delimiter: ',',
      quote: '"',
    };

    const result = csv.toObject(string, o);
    this.data = result;
  }

  getCount() {
    return this.data.length;
  }

  getData(index, selector) {
    if (selector.startsWith('PATH~')) {
      return [index.toString()];
    }
    if (this.data[index] && this.data[index][selector]) {
      return helper.addArray(this.data[index][selector]);
    }
    return [];
  }
}

module.exports = CsvParser;
