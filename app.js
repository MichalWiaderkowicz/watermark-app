const Jimp = require("jimp");
const inquirer = require("inquirer");
const fs = require("fs");

const generateFileTitle = () => {
  const timestamp = new Date().getTime();
  const fileTitle = `${timestamp}-with_watermark.jpg`;
  return fileTitle;
};

const addTextWatermarkToImage = async function (inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
    console.log("Your text was succesfully added to image!");
    await startApp();
  } catch (error) {
    console.log("Something went wrong... Try again!");
  }
};
//addTextWatermarkToImage(
// "./test.jpg",
//"./test-with-watermark.jpg",
//"Hello world"
//);

const addImageWatermarkToImage = async function (
  inputFile,
  outputFile,
  watermarkFile
) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
    console.log("Your watermark image was succesfully added to image!");
    await startApp();
  } catch (error) {
    console.log("Something went wrong... Try again!");
  }
};

const startApp = async () => {
  // Ask if user is ready
  const answer = await inquirer.prompt([
    {
      name: "start",
      message:
        'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: "confirm",
    },
  ]);

  // if answer is no, just quit the app
  if (!answer.start) process.exit();

  // ask about input file and watermark type
  const options = await inquirer.prompt([
    {
      name: "inputImage",
      type: "input",
      message: "What file do you want to mark?",
      default: "test.jpg",
    },
    {
      name: "watermarkType",
      type: "list",
      choices: ["Text watermark", "Image watermark"],
    },
  ]);

  const inputImagePath = "./img/" + options.inputImage;
  const outputImagePath = "./results/" + generateFileTitle(options.inputImage);

  if (options.watermarkType === "Text watermark") {
    const text = await inquirer.prompt([
      {
        name: "value",
        type: "input",
        message: "Type your watermark text:",
      },
    ]);

    options.watermarkText = text.value;

    fs.access(inputImagePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`${inputImagePath} file does not exist!`);
      } else {
        addTextWatermarkToImage(
          inputImagePath,
          outputImagePath,
          options.watermarkText
        );
      }
    });
  } else {
    const image = await inquirer.prompt([
      {
        name: "filename",
        type: "input",
        message: "Type your watermark name:",
        default: "logo.png",
      },
    ]);

    options.watermarkImage = image.filename;
    const watermarkImagePath = "./img/" + options.watermarkImage;

    fs.access(inputImagePath, fs.constants.F_OK, (err1) => {
      fs.access(watermarkImagePath, fs.constants.F_OK, (err2) => {
        if (err1 || err2) {
          console.error(
            `${inputImagePath} file or ${watermarkImagePath} file does not exist!`
          );
        } else {
          addImageWatermarkToImage(
            inputImagePath,
            outputImagePath,
            watermarkImagePath
          );
        }
      });
    });
  }
};

startApp();
