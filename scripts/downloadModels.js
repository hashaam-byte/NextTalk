const fs = require('fs');
const path = require('path');
const https = require('https');

const MODEL_URLS = {
  'tiny_face_detector_model.bin': 'https://github.com/vladmandic/face-api/raw/master/model/tiny_face_detector_model.bin',
  'face_landmark_68_model.bin': 'https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_model.bin'
};

const MODELS_DIR = path.join(__dirname, '../public/models');

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

// Download each model
Object.entries(MODEL_URLS).forEach(([filename, url]) => {
  const filePath = path.join(MODELS_DIR, filename);
  const file = fs.createWriteStream(filePath);

  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${filename}`);
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${filename}:`, err.message);
  });
});
