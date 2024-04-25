const Jimp = require("jimp");

const addTextWatermarkToImage = async function (inputFile, outputFile, text) {
  const image = await Jimp.read(inputFile);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  image.print(font, 15, 15, text);
  await image.quality(100).writeAsync(outputFile);
};

addTextWatermarkToImage(
  "./test.jpg",
  "./test-with-watermark.jpg",
  "Hello world"
);
