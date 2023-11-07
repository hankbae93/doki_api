import path = require('path');

console.log(path);
export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const fileExtName = path.extname(file.originalname);
  const name = file.originalname
    .split('.' + fileExtName)[0]
    .replace(/\s+/g, '_');

  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  const filePath = `${name}-${randomName}${fileExtName}`;

  callback(null, filePath);
};
