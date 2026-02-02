// Bookmarklet code generator for importing course data from D2L

/**
 * Generates the bookmarklet code that copies course data to clipboard
 * @returns {string} - The bookmarklet JavaScript code
 */
export function generateBookmarkletCode() {
  // eslint-disable-next-line no-script-url
  return `javascript:(function(){try{const extractPDFData=async()=>{const pdfData=[];const iframes=document.querySelectorAll('iframe');for(let idx=0;idx<iframes.length;idx++){const iframe=iframes[idx];try{const src=iframe.src||'';if(src.includes('.pdf')||iframe.classList.contains('d2l-fileviewer-rendered-pdf')||iframe.id.includes('pdf')){const pdfInfo={index:idx,src:src,className:iframe.className,id:iframe.id};try{const iframeWin=iframe.contentWindow;if(iframeWin&&iframeWin.PDFViewerApplication){pdfInfo.hasPDFViewer=true;const pdfApp=iframeWin.PDFViewerApplication;if(pdfApp.url)pdfInfo.pdfUrl=pdfApp.url;if(pdfApp.pdfDocument){pdfInfo.numPages=pdfApp.pdfDocument.numPages;let fullText='';for(let pageNum=1;pageNum<=pdfApp.pdfDocument.numPages;pageNum++){try{const page=await pdfApp.pdfDocument.getPage(pageNum);const textContent=await page.getTextContent();const pageText=textContent.items.map(item=>item.str).join(' ');fullText+=pageText+'\\n';}catch(e){}}pdfInfo.textContent=fullText;}}}catch(e){pdfInfo.crossOrigin=true;}pdfData.push(pdfInfo);}}catch(e){}}return pdfData;};extractPDFData().then(pdfData=>{const htmlData={timestamp:Date.now(),url:window.location.href,html:document.documentElement.outerHTML,pdfData:pdfData};navigator.clipboard.writeText(JSON.stringify(htmlData)).then(()=>{alert('Course data saved\\n \\n Switch to the Uni-Cal tab');}).catch(()=>{const textarea=document.createElement('textarea');textarea.value=JSON.stringify(htmlData);document.body.appendChild(textarea);textarea.select();document.execCommand('copy');document.body.removeChild(textarea);alert('Course data copied to clipboard!\\n\\n1. Switch to the Uni-Cal tab\\n2. Click "Import from Clipboard"');});});}catch(error){alert('Error: '+error.message);}})();`;
}

/**
 * Copy text to clipboard with fallback for older browsers
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
      document.body.removeChild(textArea);
      return false;
    }
  }
}
