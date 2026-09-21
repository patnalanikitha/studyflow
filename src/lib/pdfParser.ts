import * as pdfjsLib from 'pdfjs-dist';

// Set workerSrc to match pdfjs-dist version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedDocument {
  name: string;
  text: string;
  numPages: number;
}

/**
 * Extracts raw textual content from an uploaded PDF, TXT, or Markdown document.
 */
export async function extractTextFromDocument(file: File): Promise<ExtractedDocument> {
  const fileName = file.name;
  const isPdf = fileName.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    // Standard text / markdown file reading
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const text = (e.target?.result as string) || '';
        resolve({
          name: fileName,
          text: text.trim(),
          numPages: 1,
        });
      };
      reader.onerror = err => reject(err);
      reader.readAsText(file);
    });
  }

  // Parse PDF with PDF.js
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let fullText = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageStrings = content.items
      .map(item => ('str' in item ? (item as { str: string }).str : ''))
      .filter(Boolean);

    fullText += `--- Page ${pageNum} ---\n` + pageStrings.join(' ') + '\n\n';
  }

  return {
    name: fileName,
    text: fullText.trim(),
    numPages,
  };
}
