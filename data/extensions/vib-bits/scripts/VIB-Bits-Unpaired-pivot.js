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

function VIB_Bits_UnpairedPivot()
{
  var frame = DialogSystem.createDialog();
  frame.width("500px");
  var header = $('<div></div>').addClass("dialog-header").text("Unpaired data pivot").appendTo(frame);
  var body = $('<div></div>').addClass("dialog-body").appendTo(frame);
  var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame);
  // create table of key columns
  $('<h2>Select optional key columns</h2>').appendTo(body);
  var keyTable= $('<table/>').appendTo($('<div></div>').addClass("VIB-Bits-panel").height("100px").css("overflow","auto").appendTo(body));
  // create table of category columns
  $('<h2>Select category column</h2>').appendTo(body);
  var catTable= $('<table/>').appendTo($('<div></div>').addClass("VIB-Bits-panel").height("100px").css("overflow","auto").appendTo(body));
  // create table of columns
  $('<h2>Select value columns</h2>').appendTo(body);
  var colTable= $('<table/>').appendTo($('<div></div>').addClass("VIB-Bits-panel").height("100px").css("overflow","auto").appendTo(body));
  // selectAll en unselectAll buttons
  var selAllBtn=$('<button>Select All</button>').appendTo(body);
  var selNoneBtn=$('<button>Unselect All</button>').appendTo(body);
  // fill tables
  var keys=[];
  var cols=[];
  var cat="";
  $.getJSON(
    "/command/core/get-columns-info?" + $.param({ project: theProject.id}),
    null,
    function(json){
      keyTable.empty();
      colTable.empty();
      catTable.empty();
      var updateParams=function(){
	keys=[];
	cols=[];
	for (var i = 0; i < json.length; i++) {
	  var entry = json[i];
	  if (entry.selCol){
	    cols.push(entry.name);
	  }
	  if (entry.selKey){
	    keys.push(entry.name);
	  }
	  if (cat==entry.name)
	  {
	    entry.radio.attr("checked","true");
	  }
	  else
	  {
	    entry.radio.removeAttr("checked");
	  }
	}
      };
      var createKeyEntry= function(entry){
	var tbl = keyTable[0];
	var tr = tbl.insertRow(tbl.rows.length);
	var td0 = tr.insertCell(0);
	var td1 = tr.insertCell(1);
	td0.width = "1%";
	entry.selKey = false;
	entry.chkKey=$('<input type="checkbox"/>').appendTo(td0).click(function() {
	  entry.selKey = !entry.selKey;
	  if ((entry.name==cat)&&entry.selKey)
	  {
	    entry.selKey = false;
	    entry.chkKey.removeAttr("checked");
	    alert("You can't select the category column as a key column too!");
	  }
	  if (entry.selKey)
	  {
	    entry.selCol = false;
	    entry.chkCol.removeAttr("checked");
	  }
	  updateParams();
	});
	$('<span>').text(entry.name).appendTo(td1);
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
	  if ((entry.name==cat)&&entry.selCol)
	  {
	    entry.selCol = false;
	    entry.chkCol.removeAttr("checked");
	    alert("You can't select the category column as a value column too!");
	  }
	  if (entry.selCol)
	  {
	    entry.selKey = false;
	    entry.chkKey.removeAttr("checked");
	  }
	  updateParams();
	});
	$('<span>').text(entry.name).appendTo(td1);
      };
      var flg=true;
      var createCatEntry= function(entry){
	var tbl = catTable[0];
	var tr = tbl.insertRow(tbl.rows.length);
	var td0 = tr.insertCell(0);
	var td1 = tr.insertCell(1);
	td0.width = "1%";
	if ((!entry.is_numeric)&&flg)
	{
	  flg=false;
	  entry.selKey = false;
	  entry.chkKey.removeAttr("checked");
	  entry.selCol = false;
	  entry.chkCol.removeAttr("checked");
	  cat=entry.name;
	  entry.radio=$('<input type="radio" checked="true" />');
	}
	else
	{
	  entry.radio=$('<input type="radio" />').appendTo(td0);
	}
	entry.radio.appendTo(td0).click(function() {
	  entry.selKey = false;
	  entry.chkKey.removeAttr("checked");
	  entry.selCol = false;
	  entry.chkCol.removeAttr("checked");
	  cat=entry.name;
	  updateParams();
	});
	$('<span>').text(entry.name).appendTo(td1);
      };
      if (json.length<2)
      {
	alert("You need at least 2 columns to use this tool!");
	DialogSystem.dismissUntil(level - 1);
	return;
      }
      for (var i = 0; i < json.length; i++){
	createKeyEntry(json[i]);
	createColEntry(json[i]);
	createCatEntry(json[i]);
      }
      if (flg)
      {
	cat=json[0].name;
	json[0].selKey = false;
	json[0].chkKey.removeAttr("checked");
	json[0].selCol = false;
	json[0].chkCol.removeAttr("checked");
      }
      updateParams();
      selAllBtn.click(function() {
	for (var i = 0; i < json.length; i++) {
	  if (json[i].name!=cat){
	    json[i].selCol = true;
	    json[i].chkCol.attr("checked", "true");
	    json[i].selKey = false;
	    json[i].chkKey.removeAttr("checked");
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
      // ok button
      $('<button class="button"></button>').text("Ok").click(function() {
	if (cols.length==0)
	{
	  alert("Please select at least one value column!");
	}
	else
	{
	  ops=[];
	  // remove unused columns
	  for(var i = 0; i < json.length; i++) {
	    if ((!json[i].selKey)&&(!json[i].selCol)&&(cat!=json[i].name))
	    {
	      ops.push(
		{
		  "op": "core/column-removal",
		  "columnName": json[i].name
		}
	      );
	    }
	  }
	  // create tmp column names
	  var tmpIdx="tmpIdx";
	  var catCol="cat";
	  var valCol="val";
	  // make sure tmp columns do not exist yet
	  {
	    var names={cat:1};
	    for(var i=0;i<cols.length;i++)
	    {
	      names[cols[i]]=1;
	    }
	    while (names[tmpIdx]!=null)
	    {
	      tmpIdx+="_";
	    }
	    while (names[catCol]!=null)
	    {
	      catCol+="_";
	    }
	    while (names[valCol]!=null)
	    {
	      valCol+="_";
	    }
	  }
	  if (keys.length==0)
	  {
	    // create tmpIdx
	    ops.push(
	      {
		"op": "core/row-reorder",
		"mode": "row-based",
		"sorting": {
		  "criteria": [
		    {
		      "reverse": false,
		      "caseSensitive": true,
		      "column": cat,
		      "valueType": "string",
		      "blankPosition": 2,
		      "errorPosition": 1
		    }
		  ]
		}
	      }
	    );
	    ops.push(
	      {
		"op": "core/blank-down",
		"engineConfig": {
		  "facets": [],
		  "mode": "row-based"
		},
		"columnName": cat
	      }
	    );
	    ops.push(
	      {
		"op": "core/column-addition",
		"engineConfig": {
		  "facets": [],
		  "mode": "row-based"
		},
		"newColumnName": tmpIdx,
		"columnInsertIndex": 0,
		"baseColumnName": cat,
		"expression": "grel:if(value!=null,row.index,null)",
		"onError": "set-to-blank"
	      }
	    );
	    ops.push(
	      {
		"op": "core/fill-down",
		"engineConfig": {
		  "facets": [],
		  "mode": "row-based"
		},
		"columnName": tmpIdx
	      }
	    );
	    ops.push(
	      {
		"op": "core/fill-down",
		"engineConfig": {
		  "facets": [],
		  "mode": "row-based"
		},
		"columnName": cat
	      }
	    );
	    ops.push(
	      {
		"op": "core/text-transform",
		"engineConfig": {
		  "facets": [],
		  "mode": "row-based"
		},
		"columnName": tmpIdx,
		"expression": "grel:row.index-value",
		"onError": "keep-original",
		"repeat": false,
		"repeatCount": 10
	      }
	    );
	    // move cat column to the 2nd position
	    ops.push(
	      {
		"op": "core/column-move",
		"columnName": cat,
		"index": 1
	      }
	    );
	  }
	  else
	  {
	    // move cat column to the 1st position
	    ops.push(
	      {
		"op": "core/column-move",
		"columnName": cat,
		"index": 0
	      }
	    );
	  
	    // move key columns to positions 2 ..
	    for(var i=0;i<keys.length;i++){
	      ops.push(
		{
		  "op": "core/column-move",
		  "columnName": keys[i],
		  "index": 1+i
		}
	      );
	    }
	  }
	  // unpivot value columns
	  ops.push(
	    {
	      "op": "core/transpose-columns-into-rows",
	      "startColumnName": cols[0],
	      "columnCount": cols.length,
	      "ignoreBlankCells": true,
	      "fillDown": true,
	      "keyColumnName": catCol,
	      "valueColumnName": valCol
	    }
	  );
	  // create new column names
	  ops.push(
	    {
	      "op": "core/text-transform",
	      "engineConfig": {
		"facets": [],
		"mode": "row-based"
	      },
	      "columnName": catCol,
	      "expression": "grel:value+\" \"+cells[\""+cat+"\"].value",
	      "onError": "keep-original",
	      "repeat": false,
	      "repeatCount": 10
	    }
	  );
	  ops.push(
	    {
	      "op": "core/column-removal",
	      "columnName": cat
	    }
	  );
	  // do pivot
	  ops.push(
	    {
	      "op": "core/key-value-columnize",
	      "engineConfig": {
		"facets": [],
		"mode": "record-based"
	      },
	      "keyColumnName": catCol,
	      "valueColumnName": valCol,
	      "noteColumnName": ""
	    }
	  );
	  // remove tmpIdx
	  ops.push(
	    {
	      "op": "core/column-removal",
	      "engineConfig": {
		"facets": [],
		"mode": "row-based"
	      },
	      "columnName": tmpIdx
	    }
	  );
	  //console.log(ops);
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
	}
      }).appendTo(footer);
      // cancel button
      $('<button class="button"></button>').text("Cancel").click(function() {
	DialogSystem.dismissUntil(level - 1);
      }).appendTo(footer);
    },
    "jsonp"
  );
  var level = DialogSystem.showDialog(frame);
}