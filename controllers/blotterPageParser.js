const urldecode = require("urldecode");

module.exports = exports = {};

function cloneContext(parserContext) {
  return JSON.parse(JSON.stringify(parserContext));
}

function completeCaseInfo(parserContext) {
  const context = cloneContext(parserContext);

  if(context.caseInfo) {
    if(context.caseInfo.offenseType == "") context.caseInfo.offenseType = null;
    if(context.caseInfo.offenseDescription == "") context.caseInfo.offenseDescription = null;
    if(context.caseInfo.caseNumber == "") context.caseInfo.caseNumber = null;
    if(context.caseInfo.dispositionDateTime == "") context.caseInfo.dispositionDateTime = null;
    if(context.caseInfo.disposition == "") context.caseInfo.disposition = null;
    context.docket.cases.push(context.caseInfo);
  }

  context.caseInfo = {
    offenseType: "",
    offenseDescription: "",
    caseNumber: "",
    dispositionDateTime: "",
    disposition: ""
  }

  return context;
}

function completeDocket(parserContext, scrub) {
  var context = cloneContext(parserContext);
  if(context.docket) {
    if(scrub) {
      delete context.docket.Name;
      delete context.docket.Age;
      delete context.docket.Address;
    }

    context = completeCaseInfo(context);
    context.dockets.push(context.docket);
  }
  context.docket = {
    cases: []
  };
  context.caseInfo = null;
  context.caseInfoSection = false;

  return context;
}

module.exports = function(scrub) {
  var funcs = {};
  funcs.parsePage = function(page, parserContext) {
    var context = Object.assign({
      docket: null,
      caseInfo: null,
      dockets: [],
      caseInfoSection: false,

      caseTable: {
        offenseTypeX: 0,
        offenseDescriptionX: 0,
        caseNumberX: 0,
        dispositionDateTimeX: 0,
        dispositionX: 0
      }
    }, cloneContext(parserContext));

    var sortedText = page.Texts.sort((a,b) => a.y != b.y ? a.y - b.y : a.x - b.x).map(t => ({ text: urldecode(t.R[0].T), x: t.x, y: t.y }));
    for(var i=0;i<sortedText.length;i++){
      if(sortedText[i].text == "Docket:") {
        context = completeDocket(context, scrub);
      }

      if(sortedText[i].text.endsWith(":") && sortedText.length > i + 1 && !context.caseInfoSection) {
        context.docket[sortedText[i].text.replace(":", "")] = sortedText[i + 1].text.endsWith(":") ? null : sortedText[i + 1].text;
      }

      if(sortedText[i].text == "Offense Type"){
        context.caseInfoSection = true;
        context.caseTable.offenseTypeX = sortedText[i].x;
      }
      else if(sortedText[i].text == "Offense Description"){
        context.caseTable.offenseDescriptionX = sortedText[i].x;
      }
      else if(sortedText[i].text == "Case Number"){
        context.caseTable.caseNumberX = sortedText[i].x;
      }
      else if(sortedText[i].text == "Disposition Date/Time"){
        context.caseTable.dispositionDateTimeX = sortedText[i].x;
      }
      else if(sortedText[i].text == "Disposition") {
        context.caseTable.dispositionX = sortedText[i].x;
      }
      else if(context.caseInfoSection && sortedText[i].x == context.caseTable.offenseTypeX) {
        context = completeCaseInfo(context);
        if(sortedText[i].text == "Totals By Booking Type") {
          context.caseInfoSection = false;
        }
        else{
          context.caseInfo.offenseType += sortedText[i].text;
        }
      }
      else if(context.caseInfoSection && sortedText[i].x == context.caseTable.offenseDescriptionX) {
        context.caseInfo.offenseDescription += sortedText[i].text;
      }
      else if(context.caseInfoSection && sortedText[i].x == context.caseTable.caseNumberX) {
        context.caseInfo.caseNumber += sortedText[i].text;
      }
      else if(context.caseInfoSection && sortedText[i].x == context.caseTable.dispositionDateTimeX) {
        context.caseInfo.dispositionDateTime += sortedText[i].text;
      }
      else if(context.caseInfoSection && sortedText[i].x == context.caseTable.dispositionX) {
        context.caseInfo.disposition += sortedText[i].text;
      }
    }

    return context;
  }

  funcs.completeParse = function(parserContext) {
    return completeDocket(parserContext, scrub).dockets;
  }

  return funcs;
}
