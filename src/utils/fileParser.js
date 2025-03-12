import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import mammoth from "mammoth";

import * as pdfjsLib from "pdfjs-dist/webpack";
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file provided.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;

      if (file.type === "application/pdf") {
        try {
          const pdf = await getDocument({ data: arrayBuffer }).promise;
          let text = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ") + "\n";
          }

          resolve(text.trim());
        } catch (error) {
          console.error("❌ PDF Extraction Error:", error);
          reject("Failed to extract text from PDF.");
        }
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
        file.type === "application/msword"
      ) {
        try {
            const docxText = await mammoth.extractRawText({ buffer: arrayBuffer });
            resolve(docxText.value.trim());
        } catch (error) {
          console.error("❌ DOCX Extraction Error:", error);
          reject("Failed to extract text from DOCX.");
        }
      } else {
        reject("Unsupported file format.");
      }
    };

    reader.onerror = () => {
      reject("Error reading file.");
    };

    reader.readAsArrayBuffer(file);
  });
};
