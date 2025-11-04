// Simple test to check if pdf-parse works in Node.js (no external API)
const fs = require('fs');
const path = require('path');

async function testPdfParse() {
  try {
    console.log('Loading pdf-parse-new...');
    const alt = await import('pdf-parse-new');
    const pdfFn = (alt && (alt.default ?? alt));
    if (typeof pdfFn !== 'function') {
      throw new TypeError('pdf-parse-new did not export a function');
    }

    const docsDir = path.join(process.cwd(), 'documents');
    const files = fs.existsSync(docsDir)
      ? fs.readdirSync(docsDir).filter(f => f.endsWith('.pdf'))
      : [];

    if (files.length === 0) {
      console.log('No PDF files found in documents/');
      return;
    }

    console.log(`Found ${files.length} PDFs. Parsing...\n`);

    for (const f of files) {
      const filePath = path.join(docsDir, f);
      const dataBuffer = fs.readFileSync(filePath);
      console.log(`Parsing ${f} (${dataBuffer.length} bytes)...`);

      const data = await pdfFn(dataBuffer);
      const text = data.text || '';

      const preview = text.slice(0, 150).replace(/\s+/g, ' ');
      console.log(`✅ ${f} -> ${text.length} chars`);
      console.log(`   Preview: ${preview}\n`);
    }

    console.log('Done.');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testPdfParse();
