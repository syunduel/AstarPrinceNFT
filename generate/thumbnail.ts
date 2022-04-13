import sharp = require('sharp');
import * as traitConfig from "./config.json";
const fs = require('fs');

const dirFiles = fs.readdirSync(traitConfig.output_dir);
console.log(dirFiles);

function main(dirFiles: Array<string>) {
  if (!fs.existsSync(traitConfig.thumbnail_dir)) {
    fs.mkdirSync(traitConfig.thumbnail_dir);
  }
  for (const file of dirFiles) {
    makeThumbnail(file);
  }
}

async function makeThumbnail(file: string) {
  await sharp(traitConfig.output_dir + file)
    .resize(traitConfig.thumbnail)
    .toFile(traitConfig.thumbnail_dir + file);
  console.log("thumbnail created;" + file);
}

main(dirFiles);