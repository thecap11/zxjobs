import fs from 'fs';
import PDFParser from 'pdf2json';

async function test() {
  const buffer = fs.readFileSync('.storage/resumes/demo_marketing_resume_3_years.pdf');
  const pdfParser = new (PDFParser as any)(null, 1);
  pdfParser.on("pdfParser_dataError", (errData: any) => console.error(errData.parserError));
  pdfParser.on("pdfParser_dataReady", () => {
    console.log(pdfParser.getRawTextContent().substring(0, 500));
  });
  pdfParser.parseBuffer(buffer);
}
test();
