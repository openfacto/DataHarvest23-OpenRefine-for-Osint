//    This plugin, VIB-Bits, provides a variety of improvements to OpenRefine
//    Copyright (C) 2014  VIB
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.

//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

function VIB_Bits_redoHistory()
{
  var frame = DialogSystem.createDialog();
  frame.width("600px");
  var header = $('<div></div>').addClass("dialog-header").text("Select history steps to redo").appendTo(frame);
  var body = $('<div></div>').addClass("dialog-body").appendTo(frame);
  var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame);
  // create table of operations
  var entryTable= $('<table/>').appendTo($('<div></div>').addClass("VIB-Bits-panel").height("400px").css("overflow","auto").appendTo(body));
  // selectAll en unselectAll buttons
  var selAllBtn=$('<button>Select All</button>').appendTo(body);
  var selNoneBtn=$('<button>Unselect All</button>').appendTo(body);
  var selLastBtn=$('<button>Select Last</button>').appendTo(body);
  var selRedoBtn=$('<button>Select Redo</button>').appendTo(body);
  var selToEndBtn=$('<button>Select to End</button>').attr("title","Additonally select all steps from the last selected step until the end").appendTo(body);
  var unselToEndBtn=$('<button>Unselect to End</button>').attr("title","Unselect all steps from the last unselected step until the end").appendTo(body);
  // fill table of operations
  var ops=[];
  var lastItem=-1;
  var keepRedoItems=0;
  var updateEntries=function(projectId){
    $.getJSON(
      "/command/core/get-operations?" + $.param({ project: projectId}),
      null,
      function(json){
	redoOfs=json.entries.length;
	storedRedo=sessionStorage.getItem("VIB-Bits-store-redo");
	if (storedRedo)
	{
	  jsonStored=JSON.parse(storedRedo);
	  for(var i=0;i<jsonStored.length;i++){
	    obj=new Object();
	    obj.operation=jsonStored[i];
	    obj.description=jsonStored[i].description;
	    json.entries.push(obj)
	  }
	}
	entryTable.empty();
	var updateOps=function (){
	  var flg=true;
	  ops=[];
	  for (var i = 0; i < json.entries.length; i++) {
	    var entry = json.entries[i];
	    if ("operation" in entry && entry.selected) {
	      ops.push(entry.operation);
	      flg=false;
	      keepRedoItems=0;
	    } else {
	      if ("operation" in entry && i>=redoOfs) {
		keepRedoItems++;
	      }
	    }
	    if (flg && (!entry.selected) && i<redoOfs)
	    {
	      lastItem=i;
	    }
	  }
	};
	var createEntry= function(entry,lowlight) {
	  var tbl = entryTable[0];
	  var tr = tbl.insertRow(tbl.rows.length);
	  var td0 = tr.insertCell(0);
	  var td1 = tr.insertCell(1);
	  td0.width = "1%";
	  
	  if ("operation" in entry) {
	    
	    if (lowlight) {
	      inp=$('<input type="checkbox"/>');
	      entry.selected = false;
	    } else {
	      inp=$('<input type="checkbox" checked="true" />');
	      entry.selected = true;
	    }
	    inp.appendTo(td0).click(function() {
	      entry.selected = !entry.selected;
	      updateOps();
	    });
	    var sel="";
	    if ("engineConfig" in entry.operation) {
	      var fcts=entry.operation.engineConfig.facets;
	      if (fcts.length>0){
		//console.log(fcts);
		var cols=[];
		for(var i=0;i<fcts.length;i++){
		  cols.push(fcts[i].columnName);
		}
		sel="Has selection"+(cols.length>1?"s":"")+" on '"+cols.join("', '")+"'";
	      }
	    }
	    var mtch=null;
	    if ("expression" in entry.operation) {
	      mtch=entry.operation.expression.split("#")[0].match(/^jython:return +value */);
	    }
	    if (lowlight) {
	      if (mtch){
		$('<span>').text(entry.operation.expression.substring(mtch[0].length+1)).css("color","#88f").appendTo(td1);
	      } else {
		$('<span>').text(entry.description).attr("title",sel).css("color","#888").appendTo(td1);
	      }
	    } else {
	      if (mtch){
		$('<span>').text(entry.operation.expression.substring(mtch[0].length+1)).css("color","#00f").appendTo(td1);
	      } else {
		$('<span>').text(entry.description).attr("title",sel).appendTo(td1);
	      }
	    }
	  } else {
	    $('<input type="checkbox" />').css("display","None").appendTo(td0);
	    $('<span>').text(entry.description).css("color", "#aaa").appendTo(td1);
	  }
	};

	if ("entries" in json){
	  for (var i = 0; i < json.entries.length; i++) {
	    createEntry(json.entries[i],i>=redoOfs);
	  }
	  updateOps();
	  selAllBtn.click(function() {
	    for (var i = 0; i < json.entries.length; i++) {
	      json.entries[i].selected = true;
	    }
	    frame.find('input[type="checkbox"]').attr("checked", "true");
	    updateOps();
	  });
	  selNoneBtn.click(function() {
	    for (var i = 0; i < json.entries.length; i++) {
	      json.entries[i].selected = false;
	    }
	    frame.find('input[type="checkbox"]').removeAttr("checked");
	    updateOps();
	  });
	  selLastBtn.click(function() {
	    for (var i = 0; i < json.entries.length - 1; i++) {
	      json.entries[i].selected = false;
	    }
	    frame.find('input[type="checkbox"]').removeAttr("checked");
	    json.entries[json.entries.length - 1].selected = true;
	    frame.find('input[type="checkbox"]')[json.entries.length - 1].checked=true;
	    updateOps();
	  });
	  selRedoBtn.click(function() {
	    for (var i = 0; i < redoOfs; i++) {
	      json.entries[i].selected = false;
	    }
	    var tmpChks=frame.find('input[type="checkbox"]');
	    tmpChks.removeAttr("checked");
	    for (var i = redoOfs; i < json.entries.length; i++) {
	      if (json.entries[i].selected==false)
	      {
		json.entries[i].selected=true;
		tmpChks[i].checked=true;
	      }
	    }
	    updateOps();
	  });
	  selToEndBtn.click(function() {
	    var tidx=-1;
	    var tmpChks=frame.find('input[type="checkbox"]');
	    for (var i = json.entries.length-1;i>=0;i--) {
	      if (json.entries[i].selected==true)
	      {
		tidx=i;
		break;
	      }
	    }
	    for (var i = tidx+1; i < json.entries.length; i++) {
	      if (json.entries[i].selected==false)
	      {
		json.entries[i].selected=true;
		tmpChks[i].checked=true;
	      }
	    }
	    updateOps();
	  });
	  unselToEndBtn.click(function() {
	    var tidx=-1;
	    var tmpChks=frame.find('input[type="checkbox"]');
	    for (var i = json.entries.length-1;i>=0;i--) {
	      if (json.entries[i].selected==false)
	      {
		tidx=i;
		break;
	      }
	    }
	    for (var i = tidx+1; i < json.entries.length; i++) {
	      if (json.entries[i].selected==true)
	      {
		json.entries[i].selected=false;
		tmpChks[i].checked=false;
	      }
	    }
	    updateOps();
	  });
	}
      },
      "jsonp"
    );
  };
  updateEntries(theProject.id);
  // ok button
  $('<button class="button"></button>').text("OK").click(function() {
    // create dialog box for script
    var frame = DialogSystem.createDialog();
    frame.width("600px");
    var header = $('<div></div>').addClass("dialog-header").text("Edit history steps to redo").appendTo(frame);
    var body = $('<div></div>').addClass("dialog-body").appendTo(frame);
    var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame);
    $('<div>JSON code: </div>').appendTo(body);
    var textArea = $('<textarea/>').attr("title","Editable JSON code of the history steps selected in the previous dialog box.").width("580px").height("400px").css("overflow","auto").text(JSON.stringify(ops, null, 2)).appendTo(body);
    var cookieOld=JSON.stringify(ops, null, 2).match(/'Cookie','[^']+'/);
    var cookieInput;
    if (cookieOld)
    {
      $('<div>Cookie: </div>').appendTo(body);
      cookieInput = $('<input type="text"/>').attr("title","The contents of this input box will be used to replace the cookie (e.g. 'SESSION=abfisjdbkk990wk') in all expression of the form 'Cookie','...' found in the JSON code above").width("550px").attr("value",cookieOld[0].substring(10,cookieOld[0].length-1)).appendTo(body);
    }
    var fixJson = function(json) {
      json = json.trim();
      if (!json.startsWith("[")) {
	json = "[" + json;
      }
      if (!json.endsWith("]")) {
	json = json + "]";
      }

      return json.replace(/\}\s*\,\s*\]/g, "} ]").replace(/\}\s*\{/g, "}, {");
    };
    // ok button
    $('<button class="button"></button>').text("OK").click(function() {
      var jsonNew=textArea[0].value;
      try {
	jsonNew = fixJson(jsonNew);
	if (cookieOld)
	{
	  var cookieTxt=cookieInput[0].value;
	  if (cookieTxt!="")
	  {
	    jsonNew=jsonNew.replace(/'Cookie','[^']+'/g,"'Cookie','"+cookieTxt+"'");
	  }
	}
	jsonNew = JSON.parse(jsonNew);
      } catch(e){
	alert("The JSON you edited is invalid.");
	return;
      }
      redoHistory = function(){
	storedRedo=sessionStorage.getItem("VIB-Bits-store-redo");
	jsonStored=JSON.parse(storedRedo);
	if (keepRedoItems==0) {
	  sessionStorage.setItem("VIB-Bits-store-redo","[]");
	} else {
          sessionStorage.setItem("VIB-Bits-store-redo",JSON.stringify(jsonStored.slice(-keepRedoItems)));
	}
	VIB_Bits_Apply_Operations(jsonNew);
      };
      if (lastItem==-1){
	Refine.postCoreProcess("undo-redo",
 			       {lastDoneID:0},
 			       null,
 			       {everythingChanged: true},
 			       {onDone:function(od){
				 redoHistory();
			       }
			       });
      }
      else
      {
	$.getJSON(
	  "/command/core/get-history?" + $.param({ project: theProject.id}),
	  null,
	  function(histJson){
	    Refine.postCoreProcess("undo-redo",
 				   {lastDoneID:histJson.past[lastItem].id},
 				   null,
 				   {everythingChanged: true},
 				   {onDone:function(od){
				     redoHistory();
				   }
				   });
	  });
      }
      sessionStorage.setItem("VIB-Bits-redo-history",JSON.stringify(jsonNew));
      DialogSystem.dismissUntil(level - 2);
    }).appendTo(footer);
    // cancel button
    $('<button class="button"></button>').text("Cancel").click(function() {
      DialogSystem.dismissUntil(level - 1);
    }).appendTo(footer);
    // rotate fwd button
    $('<button class="button"></button>').text("Rotate fwd").attr("title","Move the last history element to the front").click(function() {
      var jsonNew=textArea[0].value;
      try {
	jsonNew = fixJson(jsonNew);
	jsonNew = JSON.parse(jsonNew);
      } catch(e){
	alert("The JSON you edited is invalid.");
	return;
      }
      jsonNew.unshift(jsonNew.pop());
      textArea.text(JSON.stringify(jsonNew, null, 2));
    }).appendTo(footer);
  // rotate bck button
  $('<button class="button"></button>').text("Rotate bck").attr("title","Move the first history element to the end").click(function() {
      var jsonNew=textArea[0].value;
      try {
	jsonNew = fixJson(jsonNew);
	jsonNew = JSON.parse(jsonNew);
      } catch(e){
	alert("The JSON you edited is invalid.");
	return;
      }
      jsonNew.push(jsonNew.splice(0,1)[0]);
      textArea.text(JSON.stringify(jsonNew, null, 2));
    }).appendTo(footer);
    var level = DialogSystem.showDialog(frame);
  }).appendTo(footer);
  // cancel button
  $('<button class="button"></button>').text("Cancel").click(function() {
    DialogSystem.dismissUntil(level - 1);
  }).appendTo(footer);
  
  var level = DialogSystem.showDialog(frame);
}

function VIB_Bits_storeRedo()
{
  $.getJSON(
    "/command/core/get-history?" + $.param({ project: theProject.id}),
    null,
    function(histJson){
      tmpId=0
      if (histJson.past.length>0)
      {
	tmpId=histJson.past[histJson.past.length-1].id
      }
      if (histJson.future.length>0)
      {
	Refine.postCoreProcess("undo-redo",
			       {lastDoneID:histJson.future[histJson.future.length-1].id},
 			       null,
 			       {everythingChanged: true},
 			       {onDone:function(od){
				 $.getJSON("/command/core/get-operations?"+$.param({ project: theProject.id }),
 					   null,
 					   function(data){
 					     if("entries" in data){
 					       var a=[];
					       var storedRedo=sessionStorage.getItem("VIB-Bits-store-redo");
 					       for (var i=histJson.past.length;i<data.entries.length;i++){
 						 var entry=data.entries[i];
 						 if ("operation" in entry){
 						   a.push(entry.operation);
 						 }
 					       }
					       if (storedRedo) {
						 jsonStored=JSON.parse(storedRedo);
						 for(var i=0;i<jsonStored.length;i++){
						   a.push(jsonStored[i]);
						 }
					       }
					       //console.log("Store redo:"+JSON.stringify(a));
					       sessionStorage.setItem("VIB-Bits-store-redo",JSON.stringify(a));
					       Refine.postCoreProcess("undo-redo",
								      {lastDoneID:tmpId},
 								      null,
 								      {everythingChanged: true},
 								      {onDone:function(od){
								      }});
					     }},
 					   "jsonp");
			       }
			       });
      }
      else
      {
	sessionStorage.setItem("VIB-Bits-store-redo","[]");
      }
    });
}