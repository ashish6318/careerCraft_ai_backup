import axios from 'axios';
import { PdfReader } from 'pdfreader'; // Correct import for pdfreader

const extractTextFromResume = async (resumeUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Step 1: Download the PDF file as a buffer
      const response = await axios.get(resumeUrl, {
        responseType: 'arraybuffer',
      });
      const pdfBuffer = Buffer.from(response.data); // Ensure it's a Node.js Buffer

      // Step 2: Parse the PDF buffer to extract text using pdfreader
      let fullText = '';
      let currentPage = 0;
      const reader = new PdfReader(null); // Pass null for an empty ruleSet for simple text extraction

      reader.parseBuffer(pdfBuffer, (err, item) => {
        if (err) {
          console.error('Error parsing PDF with pdfreader:', err);
          reject(new Error('Failed to parse PDF content.'));
        } else if (!item) {
          // End of PDF data, all pages processed
          // console.log('PDF parsing complete with pdfreader.');
          resolve(fullText.trim());
        } else if (item.page) {
          // New page started
          currentPage = item.page;
        } else if (item.text) {
          // Concatenate text items. Add a space for better word separation.
          fullText += item.text + ' ';
          // Optional: Add a newline at the end of perceived lines or paragraphs if needed,
          // but pdfreader might handle line breaks within item.text based on PDF structure.
          // For simplicity, just concatenating text items with spaces.
        }
      });
    } catch (error) {
      console.error('Error downloading or initiating PDF parsing:', error.message);
      if (error.response) {
          console.error('Axios error response data (first 100 chars):', String(error.response.data).substring(0,100));
          console.error('Axios error response status:', error.response.status);
      }
      reject(new Error(`Failed to download or process resume. Original error: ${error.message}`));
    }
  });
};

export { extractTextFromResume };
