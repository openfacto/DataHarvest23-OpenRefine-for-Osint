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

function VIB_Bits_Apply_Operations(ops)
{
  var batchSize=400;
  var ofs=0;
  var next=function () {
    if (ops.length>ofs+batchSize) {
      console.log("Applying steps "+(ofs+1)+" - "+(ofs+batchSize));
      Refine.postCoreProcess(
	"apply-operations",
	{},
	{ operations: JSON.stringify(ops.slice(ofs,ofs+batchSize)) },
	{ everythingChanged: true },
	{	onDone: function(o) {
	  if (o.code == "pending"){
	    Refine.update({everythingChanged: true});
	  }
	  ofs+=batchSize;

	  window.setTimeout(function() {
	    next();
	  }, 500); 
	}}
      );
    } else {
      console.log("Applying steps "+(ofs+1)+" - "+ops.length);
      Refine.postCoreProcess("apply-operations",
			     {},
			     {operations: JSON.stringify(ops.slice(ofs))},
			     {everythingChanged: true},
			     {onDone: function(o){
			       if (o.code == "pending"){
				 Refine.update({everythingChanged: true});
			       }}});
    }
  }
  next();
}

function VIB_Bits_redoOther()
{
  // request project metadata
  $.getJSON("/command/core/get-all-project-metadata",
	    null,
	    function(data){
	      if("projects" in data){
		var frame = DialogSystem.createDialog();
		frame.width("500px");
		var header = $('<div></div>').addClass("dialog-header").text("Select project").appendTo(frame);
		var body = $('<div></div>').addClass("dialog-body").appendTo(frame);
		var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame);
		$('<p></p>').text("Select project to use history from:").appendTo(body);
		// create options from project names in metadata
		var sel = $('<select />').appendTo($('<p></p>').appendTo(body));
		var flg = true;
		for(var project in data.projects){
		  var opt=$('<option>').val(project).text(data.projects[project].name).appendTo(sel);
		  if (flg && (data.projects[project].name==theProject.metadata.name))
		  {
		    opt.attr("selected",true);
		    flg=false;
		  }
		}
		// sort options on name
		var selSorted=sel.find("option").toArray().sort(function(a,b){return (a.innerHTML.toLowerCase()>b.innerHTML.toLowerCase())?1:-1;});
		sel.empty();
		$.each(selSorted, function(key,val){
		  sel.append(val);
		});
		// create table of operations
		var entryTable= $('<table/>').appendTo($('<div></div>').addClass("VIB-Bits-panel").height("400px").css("overflow","auto").appendTo(body));
		// selectAll en unselectAll buttons
		var selAllBtn=$('<button>Select All</button>').appendTo(body);
		var selNoneBtn=$('<button>Unselect All</button>').appendTo(body);
		var selToEndBtn=$('<button>Select to End</button>').attr("title","Additonally select all steps from the last selected step until the end").appendTo(body);
		var unselToEndBtn=$('<button>Unselect to End</button>').attr("title","Unselect all steps from the last unselected step until the end").appendTo(body);
		// advanced settings
		var advanced=$.cookie("VIB_Bits.redo-other.advanced");
		var advancedChk=$('<input type="checkbox" title="Check to allow editing the Json code before execution"/>').appendTo($('<p></p>').text("Advanced").appendTo(body)).click(function() {
		  if (advanced=="true")
		  {
		    advanced="false";
		  }
		  else
		  {
		    advanced="true";
		  }
		  $.cookie("VIB_Bits.redo-other.advanced",advanced);
		});
		if (advanced=="true"){
		  advancedChk.attr("checked","true");
		}
		// fill table of operations
		var ops=[];
		var updateEntries=function(projectId){
		  $.getJSON(
		    "/command/core/get-operations?" + $.param({ project: projectId}),
		    null,
		    function(json){
		      entryTable.empty();
		      var updateOps=function (){
			ops=[];
			for (var i = 0; i < json.entries.length; i++) {
			  var entry = json.entries[i];
			  if ("operation" in entry && entry.selected) {
			    ops.push(entry.operation);
			  }
			}
		      };
		      var createEntry= function(entry) {
			var tbl = entryTable[0];
			var tr = tbl.insertRow(tbl.rows.length);
			var td0 = tr.insertCell(0);
			var td1 = tr.insertCell(1);
			td0.width = "1%";
			
			if ("operation" in entry) {
			  entry.selected = true;
			  
			  $('<input class="history-entry" type="checkbox" checked="true" />').appendTo(td0).click(function() {
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
			  mtch=null;
			  if ("expression" in entry.operation) {
			    mtch=entry.operation.expression.split("#")[0].match(/^jython:return +value */);
			  }
			  if (mtch){
			    $('<span>').text(entry.operation.expression.substring(mtch[0].length+1)).css("color","#88f").appendTo(td1);
			  } else {
			    $('<span>').text(entry.operation.description).attr("title",sel).appendTo(td1);
			  }
			} else {
			  $('<span>').text(entry.description).css("color", "#888").appendTo(td1);
			}
		      };
		      //console.log(theProject.metadata.name);
		      if ("entries" in json){
			for (var i = 0; i < json.entries.length; i++) {
			  createEntry(json.entries[i]);
			}
			updateOps();
			selAllBtn.off();
			selAllBtn.click(function() {
			  for (var i = 0; i < json.entries.length; i++) {
			    json.entries[i].selected = true;
			  }
			  frame.find('input.history-entry').attr("checked", "true");
			  updateOps();
			});
			selNoneBtn.off();
			selNoneBtn.click(function() {
			  for (var i = 0; i < json.entries.length; i++) {
			    json.entries[i].selected = false;
			  }
			  frame.find('input.history-entry').removeAttr("checked");
			  updateOps();
			});
			selToEndBtn.off();
			selToEndBtn.click(function() {
			  var tidx=-1;
			  var tmpChks=frame.find('input.history-entry');
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
			unselToEndBtn.off();
			unselToEndBtn.click(function() {
			  var tidx=-1;
			  var tmpChks=frame.find('input.history-entry');
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
		// attach change handler
		sel.change(function(evt){
		  var str="";
		  for(var i in this.options){
		    var opt=this.options[i];
		    if (opt.selected)
		    {
		      updateEntries(opt.value);
		    }
		  }
		});
		sel.change();
		// ok button
		$('<button class="button"></button>').text("OK").click(function() {
		  if (advanced=="true"){
		    // create dialog box for script
		    var frame2 = DialogSystem.createDialog();
		    frame2.width("600px");
		    var header = $('<div></div>').addClass("dialog-header").text("Edit history steps to do").appendTo(frame2);
		    var body = $('<div></div>').addClass("dialog-body").appendTo(frame2);
		    var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame2);
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
		      VIB_Bits_Apply_Operations(jsonNew);
		      DialogSystem.dismissUntil(level2 - 2);
		    }).appendTo(footer);
		    // cancel button
		    $('<button class="button"></button>').text("Cancel").click(function() {
		      DialogSystem.dismissUntil(level2 - 1);
		    }).appendTo(footer);
		    var level2 = DialogSystem.showDialog(frame2);
		  }
		  else{
		    // apply operations
		    VIB_Bits_Apply_Operations(ops);
		    DialogSystem.dismissUntil(level - 1);
		  }
		}).appendTo(footer);
		// cancel button
		$('<button class="button"></button>').text("Cancel").click(function() {
		  DialogSystem.dismissUntil(level - 1);
		}).appendTo(footer);

		var level = DialogSystem.showDialog(frame);
	      }
	    }
	   );

}