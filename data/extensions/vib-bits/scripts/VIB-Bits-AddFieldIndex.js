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

function VIB_Bits_addFieldIndex(column)
{
  var frame = DialogSystem.createDialog();
  frame.width("500px");
  var header = $('<div></div>').addClass("dialog-header").text("Add field index for column '"+column.name+"'").appendTo(frame);
  var body = $('<div></div>').addClass("dialog-body").appendTo(frame);
  var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame);

  var tbl=$("<table/>").appendTo(body);
  var tr=$("<tr/>").appendTo(tbl);
  $('<p></p>').text("Index column name: ").appendTo($("<td/>").appendTo(body));
  var inp=$('<input size="40"/>').appendTo($("<td/>").appendTo(body));
  
  $('<button class="button"></button>').text("OK").click(function() {
    var columnIndex = Refine.columnNameToColumnIndex(column.name); 
    var columnName = $.trim(inp[0].value);
    if (!columnName.length) {
      alert("You must enter a column name.");
      return;
    }
    //console.log(column);
    Refine.postCoreProcess(
      "add-column", 
      {
        baseColumnName: column.name, 
        expression: "grel:row.index-row.record.fromRowIndex", 
        newColumnName: columnName,
        columnInsertIndex: columnIndex + 1,
        onError: "set-to-blank"
      },
      null,
      { modelsChanged: true },
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