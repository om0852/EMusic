"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
const workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

export default function PdfViewer({ file }) {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (!file) return null;

  return (
    <div
      className="w-full h-full overflow-y-auto"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        options={{ disableWorker: false, cMapUrl: "cmaps/", cMapPacked: true }}
        loading={
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading PDF...
          </div>
        }
        error={
          <div className="flex items-center justify-center h-full text-red-500">
            Failed to load PDF
          </div>
        }
        renderMode="canvas"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={800}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </div>
  );
}
