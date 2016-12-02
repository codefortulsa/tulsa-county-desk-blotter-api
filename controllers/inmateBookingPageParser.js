const urldecode = require("urldecode");

module.exports = exports = {};

function cloneContext(parserContext) {
  return Object.assign({}, parserContext);
}

function completeCaseInfo(parserContext) {
  const context = cloneContext(parserContext);
  if(context.caseInfo) {

    for(var i in context.caseInfo) {
      if(context.caseInfo[i] == "") {
        context.caseInfo[i] = null;
      } else {
        if((typeof context.caseInfo[i]) == "string") {
          context.caseInfo[i] = context.caseInfo[i].trim();
        }
      }
    }
    context.inmateInfo.cases.push(context.caseInfo);
  }

  context.caseInfo = {
    offenseDescription: "",
    caseNumber: "",
    nextProceedingOrDisposition: "",
    date: "",
    time: "",
    bondType: "",
    amount: ""
  };

  return context;
}

function completeInmate(parserContext, scrub) {
  var context = cloneContext(parserContext);

  if(context.inmateInfo) {

    if(scrub) {
      delete context.inmateInfo.name;
      delete context.inmateInfo.address;
      delete context.inmateInfo.dob;
    }

    context = completeCaseInfo(context);
    for(var i in context.inmateInfo) {
      if(context.inmateInfo[i] == ""){
        context.inmateInfo[i] = null;
      } else {
        if((typeof context.inmateInfo[i]) == "string") {
          context.inmateInfo[i] = context.inmateInfo[i].trim();
        }
      }
    }

    context.inmates.push(context.inmateInfo);
  }

  context.inmateInfo = {
    name: "",
    address: "",
    dob: "",
    race: "",
    gender: "",
    height: "",
    weight: "",
    hair: "",
    eyes: "",
    arrestedBy: "",
    bookingDate: "",
    time: "",
    cell: "",
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
      inmates:[],
      caseInfoSection: false,
      seenAddressNumber: false,
      inmateTableOffsets:[
        {field: "address", x:0, title: "INMATE NAME"},
        {field: "dob", x:0, title: "D.O.B."},
        {field: "race", x:0, title: "RACE"},
        {field: "gender", x:0, title: "GENDER"},
        {field: "height", x:0, title: "HEIGHT"},
        {field: "weight", x:0, title: "WEIGHT"},
        {field: "hair", x:0, title: "HAIR"},
        {field: "eyes", x:0, title: "EYES"},
        {field: "arrestedBy", x:0, title: "ARRESTED BY"},
        {field: "bookingDate", x:0, title: "BOOKING DATE"},
        {field: "time", x:0, title: "TIME"},
        {field: "cell", x:0, title: "CELL"}
      ],
      caseInfoTableOffsets:[
        {field: "offenseDescription", x:0, title: "Offense Description"},
        {field: "caseNumber", x:0, title: "CaseNumber"},
        {field: "nextProceedingOrDisposition", x:0, title: "Next Proceeding or Disposition"},
        {field: "date", x:0, title: "Date"},
        {field: "time", x:0, title: "Time"},
        {field: "bondType", x:0, title: " Bond Type"},
        {field: "amount", x:0, title: "Amount"},
      ]
    }, cloneContext(parserContext));

    var sortedText = page.Texts.sort((a,b) => a.y != b.y ? a.y - b.y : a.x - b.x).map(t => ({ text: urldecode(t.R[0].T), x: t.x, y: t.y }));

    for(var i=0;i<sortedText.length;i++) {
      var inmateTableOffset = context.inmateTableOffsets.filter(x => x.title == sortedText[i].text);

      if(inmateTableOffset.length == 1) {
        inmateTableOffset[0].x = sortedText[i].x;
        //console.log(inmateTableOffset[0].field, sortedText[i].x)
      }
      else {
        var inmateTableOffset = context.inmateTableOffsets.filter(inmate => inmate.x == sortedText[i].x);
        if(inmateTableOffset.length == 1) {
          if(inmateTableOffset[0].field == "address" && sortedText.length > i + 1 && context.inmateTableOffsets[1].x == sortedText[i+1].x) {
            context = completeInmate(context, scrub);
            context.inmateInfo.name += " " + sortedText[i].text;
            context.caseInfoSection = false;
            context.seenAddressNumber = false;
          }
          else if(inmateTableOffset[0].field == "address" && sortedText[i].text == "Offense Description") {
            context.caseInfoSection = true;
          }
          else if(inmateTableOffset[0].field == "address" && !context.caseInfoSection && !context.seenAddressNumber) {
            if((sortedText[i].text.charAt(0) >= '0' && sortedText[i].text.charAt(0) <= '9') || sortedText[i].text == "HOMELESS") {
              context.seenAddressNumber = true;
              context.inmateInfo.address += " " + sortedText[i].text;
            }
            else {
            context.inmateInfo.name += " " + sortedText[i].text;
            }
          }
          else if(!context.caseInfoSection){
            context.inmateInfo[inmateTableOffset[0].field] += " " + sortedText[i].text;
          }
        }

        if(context.caseInfoSection) {
          var caseInfoOffset = context.caseInfoTableOffsets.filter(c => c.title == sortedText[i].text);

          if(caseInfoOffset.length == 1) {
            caseInfoOffset[0].x = sortedText[i].x;
            //console.log(caseInfoOffset[0].field, caseInfoOffset[0].x)
          }
          else {
            //console.dir(sortedText[i]);
            caseInfoOffset = context.caseInfoTableOffsets.filter(c => c.x == sortedText[i].x);
            if(caseInfoOffset.length == 1) {
              if(caseInfoOffset[0].field == "offenseDescription" && ((sortedText.length > i + 1 && context.caseInfoTableOffsets[1].x == sortedText[i + 1].x) || (sortedText.length > i + 1 && context.caseInfoTableOffsets[2].x == sortedText[i + 1].x) || (sortedText.length > i + 2 && context.caseInfoTableOffsets[2].x == sortedText[i + 2].x))) {
                context = completeCaseInfo(context);
              }
              if(context.caseInfo) {
                context.caseInfo[caseInfoOffset[0].field] += " " + sortedText[i].text;
              } else {
                //console.log("Unable to log", caseInfoOffset[0].field, "with text", sortedText[i].text, "because there is no caseInfo object!");
              }
            }
          }
        }
      }
    }

    return context;
  }

  funcs.completeParse = function(parserContext) {
    return completeInmate(parserContext, scrub).inmates;
  }

  return funcs;
}
