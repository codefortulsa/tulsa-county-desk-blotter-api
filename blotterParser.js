const PDFParser = require("pdf2json");
const urldecode = require("urldecode");
const pageParser = require("./blotterPageParser");


module.exports = function(data) {
  return new Promise(function(resolve, reject) {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
      var context = {};
      for(var page=0;page<pdfData.formImage.Pages.length;page++)
      {
        context = pageParser.parsePage(pdfData.formImage.Pages[page], context);
      }

      resolve(pageParser.completeParse(context));
    });

    pdfParser.parseBuffer(data);
  });
}
