import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export function PDFViewer({ file }: { file: Blob }) {
  const [, setNumPages] = useState<number>();
  const [pageNumber] = useState<number>(1);

  function onLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <Document file={file} onLoadSuccess={onLoadSuccess}>
      <Page pageNumber={pageNumber} renderTextLayer={false} />
    </Document>
  );
}
