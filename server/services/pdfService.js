import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const extractTextFromFile = async (filePath, mimeType) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found on server');
    }

    const ext = path.extname(filePath).toLowerCase();

    // 1. PDF Documents
    if (ext === '.pdf' || (mimeType && mimeType.includes('pdf'))) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    }

    // 2. DOCX Documents
    if (ext === '.docx' || (mimeType && mimeType.includes('wordprocessingml'))) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }

    // 3. DOC / Fallback Text
    const text = fs.readFileSync(filePath, 'utf-8');
    return text || '';
  } catch (error) {
    console.error(`[Resume Text Extraction Error]: ${error.message}`);
    return '';
  }
};
