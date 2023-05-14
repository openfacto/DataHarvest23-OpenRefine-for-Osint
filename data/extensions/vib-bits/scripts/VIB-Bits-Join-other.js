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

function VIB_Bits_Join(column)
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
		$('<p></p>').text("Select project to add data from:").appendTo(body);
		// create options from project names in metadata
		var sel = $('<select />').appendTo($('<p></p>').appendTo(body));
		var flg = true;
		var prj=theProject.metadata.name;
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
		// create table of match columns
		$('<h2>Select matching column</h2>').appendTo(body);
		var matchTable= $('<table/>').appendTo($('<div></div>').addClass("VIB-Bits-panel").height("100px").css("overflow","auto").appendTo(body));
		// create table of columns
		$('<h2>Select value columns</h2>').appendTo(body);
		var colTable= $('<table/>').appendTo($('<div></div>').addClass("VIB-Bits-panel").height("100px").css("overflow","auto").appendTo(body));
		// selectAll en unselectAll buttons
		var selAllBtn=$('<button>Select All</button>').appendTo(body);
		var selNoneBtn=$('<button>Unselect All</button>').appendTo(body);
		var aggrDiv=$('<div></div>').addClass("VIB-Bits-panel").appendTo(body);
		$('<p></p>').text("Select aggregation method:").appendTo(aggrDiv);
		var aggrTr=$('<tr/>').appendTo($('<table/>').appendTo(aggrDiv));
		var aggrSel=$('<select />').attr("title","Aggregation used in case of multiple matches").appendTo($('<td/>').appendTo(aggrTr));
		$('<option>').val("[0]").text("First").attr("selected",true).appendTo(aggrSel);
		$('<option>').val("[-1]").text("Last").appendTo(aggrSel);
		$('<option>').val(".join(', ')").text("Concatenate").appendTo(aggrSel);
		$('<option>').val(".uniques().sort().join(', ')").text("Unique Concatenate").appendTo(aggrSel);
		$('<td>&nbsp;&nbsp;&nbsp;</td>').appendTo(aggrTr);
		var aggrP=$('<p/>').text('Separator:').appendTo($('<td/>').appendTo(aggrTr));
		var aggrInput=$('<input/>').width("50px").val(", ").css("vertical-align","baseline").appendTo(aggrP);
		$('<td>&nbsp;&nbsp;&nbsp;</td>').appendTo(aggrTr);
		var aggrChkP=$('<p/>').text("Split afterwards").appendTo($('<td/>').appendTo(aggrTr));
		var aggrChk=$('<input type="checkbox"/>').appendTo(aggrChkP);
		// attach aggregation change handler
		var aggr="";
		aggrSel.change(function(evt){
		  var str="";
		  for(var i in this.options){
		    var opt=this.options[i];
		    if (opt.selected)
		    {
		      aggr=opt.value;
		      if (i<2)
		      {
			aggrInput.attr("disabled",true);
			aggrP.css('color','#aaa');
			aggrChk.removeAttr("checked");
			aggrChk.attr("disabled",true);
			aggrChkP.css('color','#aaa');
		      }
		      else
		      {
			aggrInput.removeAttr("disabled")
			aggrP.css('color','#000');
			aggrChk.removeAttr("disabled")
			aggrChkP.css('color','#000');
		      }
		      break;
		    }
		  }
		});
		aggrSel.change();
		// get columns current project
		var names={};
		$.getJSON(
		  "/command/core/get-columns-info?" + $.param({ project: theProject.id}),
		  null,
		  function(json){
		    for (var i = 0; i < json.length; i++) {
		      names[json[i].name]=1;
		    }
		  }
		);
		// fill tables
		var cols=[];
		var match="";
		// create table of operations
		var updateEntries=function(projectId){
		  $.getJSON(
		    "/command/core/get-columns-info?" + $.param({ project: projectId}),
		    null,
		    function(json){
		      colTable.empty();
		      matchTable.empty();
		      var updateParams=function(){
			cols=[];
			for (var i = 0; i < json.length; i++) {
			  var entry = json[i];
			  if (entry.selCol){
			    cols.push(entry.name);
			  }
			  if (match==entry.name)
			  {
			    entry.radio.attr("checked","true");
			  }
			  else
			  {
			    entry.radio.removeAttr("checked");
			  }
			}
		      };
		      var createColEntry= function(entry){
			var tbl = colTable[0];
			var tr = tbl.insertRow(tbl.rows.length);
			var td0 = tr.insertCell(0);
			var td1 = tr.insertCell(1);
			td0.width = "1%";
			entry.selCol = true;
			entry.chkCol=$('<input type="checkbox" checked="true" />').appendTo(td0).click(function() {
			  entry.selCol = !entry.selCol;
			  updateParams();
			});
			$('<span>').text(entry.name).appendTo(td1);
		      };
		      var flg=true;
		      var createMatchEntry= function(entry){
			var tbl = matchTable[0];
			var tr = tbl.insertRow(tbl.rows.length);
			var td0 = tr.insertCell(0);
			var td1 = tr.insertCell(1);
			td0.width = "1%";
			if (entry.name==column.name)
			{
			  flg=false;
			  entry.selCol = false;
			  entry.chkCol.removeAttr("checked");
			  match=entry.name;
			  entry.radio=$('<input type="radio" checked="true" />');
			}
			else
			{
			  entry.radio=$('<input type="radio" />').appendTo(td0);
			}
			entry.radio.appendTo(td0).click(function() {
			  match=entry.name;
			  updateParams();
			});
			$('<span>').text(entry.name).appendTo(td1);
		      };
		      for (var i = 0; i < json.length; i++){
			createColEntry(json[i]);
			createMatchEntry(json[i]);
		      }
		      if (flg)
		      {
			match=json[0].name;
			json[0].selCol = false;
			json[0].chkCol.removeAttr("checked");
		      }
		      updateParams();
		      selAllBtn.click(function() {
			for (var i = 0; i < json.length; i++) {
			  if (json[i].name!=match){
			    json[i].selCol = true;
			    json[i].chkCol.attr("checked", "true");
			  }
			}
			updateParams();
		      });
		      selNoneBtn.click(function() {
			for (var i = 0; i < json.length; i++) {
			  json[i].selCol = false;
			  json[i].chkCol.removeAttr("checked");
			}
			updateParams();
		      });
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
		      prj=opt.text;
		      updateEntries(opt.value);
		      break;
		    }
		  }
		});
		sel.change();
		// ok button
		$('<button class="button"></button>').text("OK").click(function() {
		  //console.log("Adding "+cols.join(",")+"\nusing key column "+match+"\nfrom table "+prj);
		  var ops=[];
		  var opsSplit=[];
		  var sep=aggrInput[0].value.replace("'","\\'");
		  for(var i=0;i<cols.length; i++) {
		    var postFix="";
		    if (names[cols[i]]!=null)
		    {
		      var j=2;
		      while (names[cols[i]+"("+j+")"]!=null)
		      {
			j++;
		      }
		      postFix="("+j+")";
		      names[cols[i]+postFix]=1;
		    }
		    ops.push(
		      {
			"op": "core/column-addition",
			"engineConfig": ui.browsingEngine.getJSON(true),
			"newColumnName": cols[i]+postFix,
			"columnInsertIndex": Refine.columnNameToColumnIndex(column.name)+i+1,
			"baseColumnName": column.name,
			"expression": "grel:forEach(cross(cell,\""+prj+"\",\""+match+"\"),v,v.cells[\""+cols[i]+"\"].value)"+aggr.replace(", ",sep),
			"onError": "set-to-blank"
		      }
		    );
		    opsSplit.push(
		      {
			"op": "core/multivalued-cell-split",
			"columnName": cols[i]+postFix,
			"keyColumnName": column.name,
			"separator": sep,
			"mode": "plain"
		      }
		    );
		  }
		  if (aggrChk.attr("checked")=="true")
		  {
		    for(var i=0;i<opsSplit.length; i++) {
		      ops.push(opsSplit[i]);
		    }
		  }
		  //console.log(JSON.stringify(ops));
		  Refine.postCoreProcess(
		    "apply-operations",
		    {},
		    { operations: JSON.stringify(ops) },
		    { everythingChanged: true },
		    {
		      onDone: function(o) {
			if (o.code == "pending") {
			  // Something might have already been done and so it's good to update
			  Refine.update({ everythingChanged: true });
			}
		      }
		    }
		  );

		  DialogSystem.dismissUntil(level - 1);
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