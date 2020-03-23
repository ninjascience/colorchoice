const express = require('express');
const app = express();
var diff = require('color-diff');
var convert = require('color-convert');
var colorTable = require('./colors');
const port = 3000;

app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/:baseRangeKey?', function (req, res) {
  baseRangeKey = req.params.baseRangeKey || 'citadelBase';
  console.log('baseRangeKey', baseRangeKey);
  const comparisonRanges = Object.keys(colorTable).filter((colorRangeKey) => {
    return colorRangeKey !== baseRangeKey;
  });
  console.log('comparisonRanges', comparisonRanges);
  const baseRange = colorTable[baseRangeKey];

  const match = baseRange.colors.map((color) => {
    baseRGB = hexToRgb(color.hexColor);
    color.comparisons = comparisonRanges.map((comparisonRangeKey) => {
      const comparisonRange = colorTable[comparisonRangeKey];
      const rangeIndex = {};
      const rangePalette = [];
      comparisonRange.colors.forEach((color) => {
        rangeIndex[color.hexColor] = color;
        const rangeRGB = hexToRgb(color.hexColor);
        rangePalette.push(hexToRgb(color.hexColor));
      });
      const closestRGB = diff.closest(baseRGB, rangePalette);
      const closestHex = rgbToHex(closestRGB);
      const closest = rangeIndex[closestHex];
      closest.delta = diff.diff(diff.rgb_to_lab(baseRGB), diff.rgb_to_lab(closestRGB)).toFixed(2);
      if(closest.delta <= 3) {
        closest.quality = 'good';
      } else if(closest.delta <= 7) {
        closest.quality = 'ok';
      } else {
        closest.quality = 'bad';
      }
      closest.range = comparisonRange.name;
      return closest;
    });

    return {...color}
  });

  match.sort((a, b) => {
    const aHue = rgbToHsl(hexToRgb(a.hexColor));
    const bHue = rgbToHsl(hexToRgb(b.hexColor));
    return aHue.H - bHue.H;
  });
  //console.log('match', JSON.stringify(match));
  res.render('index', { baseRange, match })
});

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    R: parseInt(result[1], 16),
    G: parseInt(result[2], 16),
    B: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(rgb) {
  return `#${valueToHex(rgb.R)}${valueToHex(rgb.G)}${valueToHex(rgb.B)}`
}

function valueToHex(value) { 
  let hex = Number(value).toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
};

function rgbToHsl(rgb) {
  const hsl = convert.rgb.hsl([rgb.R, rgb.G, rgb.B]);
  return {H: hsl[0], S: hsl[1], L: hsl[2]};
}


app.listen(port, () => console.log(`Example app listening on port ${port}!`));