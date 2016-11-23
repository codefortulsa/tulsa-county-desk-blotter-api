let fs = require('fs');
let PDFParser = require("pdf2json");
let urldecode = require("urldecode"); 
let pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
  var dockets = [];
  var docket = null;
  var caseInfo = null;
  var caseInfoSection = false;

  var offenseTypeX = 0;
  var offenseDescriptionX = 0;
  var caseNumberX = 0;
  var dispositionDateTimeX = 0;
  var dispositionX = 0;

  for(var page=0;page<pdfData.formImage.Pages.length;page++)
  {
    var sortedText = pdfData.formImage.Pages[page].Texts.sort((a,b) => a.y != b.y ? a.y - b.y : a.x - b.x).map(t => ({ text: urldecode(t.R[0].T), x: t.x, y: t.y }));

    for(var i=0;i<sortedText.length;i++){
      if(sortedText[i].text == "Docket:") {
        if(docket != null) {
          if(caseInfo != null) {
            docket.cases.push(caseInfo);
          }
          dockets.push(docket);
        }

        docket = { cases: []};
        caseInfoSection = false;
      }

      if(sortedText[i].text.endsWith(":") && sortedText.length > i + 1 && !caseInfoSection) {
        docket[sortedText[i].text.replace(":", "")] = sortedText[i + 1].text.endsWith(":") ? null : sortedText[i + 1].text;
      }

      if(sortedText[i].text == "Offense Type"){
        caseInfoSection = true;
        offenseTypeX = sortedText[i].x;
      }
      else if(sortedText[i].text == "Offense Description"){
        offenseDescriptionX = sortedText[i].x;
      }
      else if(sortedText[i].text == "Case Number"){
        caseNumberX = sortedText[i].x;
      }
      else if(sortedText[i].text == "Disposition Date/Time"){
        dispositionDateTimeX = sortedText[i].x;
      }
      else if(sortedText[i].text == "Disposition") {
        dispositionX = sortedText[i].x;
      }
      else if(caseInfoSection && sortedText[i].x == offenseTypeX) {
        if(caseInfo != null) {
          docket.cases.push(caseInfo);
        }
        caseInfo = {
          offenseType: sortedText[i].text,
          offenseDescription: "",
          caseNumber: "",
          dispositionDateTime: "",
          disposition: ""
        }
        
      }
      else if(caseInfoSection && sortedText[i].x == offenseDescriptionX) {
        caseInfo.offenseDescription += sortedText[i].text;
      }
      else if(caseInfoSection && sortedText[i].x == caseNumberX) {
        caseInfo.caseNumber += sortedText[i].text;
      }
      else if(caseInfoSection && sortedText[i].x == dispositionDateTimeX) {
        caseInfo.dispositionDateTime += sortedText[i].text;
      }
      else if(caseInfoSection && sortedText[i].x == dispositionX) {
        caseInfo.disposition += sortedText[i].text;
      }
    }
  }

  if(docket != null){
    if(caseInfo != null) {
      docket.cases.push(caseInfo);
    }
    dockets.push(docket);
  }

  fs.writeFileSync("test.json", JSON.stringify(dockets));
});

pdfParser.loadPDF("/mnt/d/Desk Blotter.pdf");
