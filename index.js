const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const validateBase64File = (fileB64) => {
  try {
    const buffer = Buffer.from(fileB64, 'base64');
    const mimeType = buffer.toString('utf8', 0, 4);
    const sizeKB = (buffer.length / 1024).toFixed(2);
    return { isValid: true, mimeType, sizeKB };
  } catch (error) {
    return { isValid: false };
  }
};

app.post('/bfhl', upload.none(), (req, res) => {
  const { data, file_b64, email, roll_number, full_name, dob } = req.body;

  if (!data || !email || !roll_number || !full_name || !dob) {
    return res.status(400).json({
      is_success: false,
      message: 'Missing required fields',
    });
  }

  const numbers = data.filter(item => !isNaN(item));
  const alphabets = data.filter(item => isNaN(item) && item.length === 1);

  const lowerCaseAlphabets = alphabets.filter(item => item === item.toLowerCase());
  const highestLowercaseAlphabet = lowerCaseAlphabets.sort().slice(-1);

  let fileInfo = { file_valid: false };
  if (file_b64) {
    const fileValidation = validateBase64File(file_b64);
    fileInfo = {
      file_valid: fileValidation.isValid,
      file_mime_type: fileValidation.isValid ? fileValidation.mimeType : null,
      file_size_kb: fileValidation.isValid ? fileValidation.sizeKB : null,
    };
  }

  const response = {
    is_success: true,
    user_id: `${full_name}_${dob}`,
    email,
    roll_number,
    numbers,
    alphabets,
    highest_lowercase_alphabet: highestLowercaseAlphabet,
    ...fileInfo,
  };

  res.json(response);
});

app.get('/bfhl', (req, res) => {
  res.status(200).json({ operation_code: 1 });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
