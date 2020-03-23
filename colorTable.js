const chalk = require('chalk');
const colorTable = require('./colors.json');

const citadelBase = colorTable.citadelBase.colors;

citadelBase.map((color) => {
  console.log(chalk.hex(color.hexColor).bold(color.name));
});
