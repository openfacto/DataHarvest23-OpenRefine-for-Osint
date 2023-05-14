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

function VIB_Bits_HGNC(column)
{
  $.getJSON(
    "/command/core/get-columns-info?" + $.param({ project: theProject.id}),
    null,
    function(json){
      var columnIndex = Refine.columnNameToColumnIndex(column.name);
      cols=[];
      names={};
      for (var i = 0; i < json.length; i++) {
	var entry = json[i];
	cols.push(entry.name);
	names[entry.name]=1;
      }
      ops=[];
      // add tmpIdx column
      var tmpIdx="tmpIdx";
      while (names[tmpIdx]!=null)
      {
	tmpIdx+="_";
      }
      ops.push(
	{
	  "op": "core/column-addition",
	  "engineConfig": {
	    "facets": [],
	    "mode": "row-based"
	  },
	  "newColumnName": tmpIdx,
	  "columnInsertIndex": 0,
	  "baseColumnName": column.name,
	  "expression": "grel:if(row.index==0,1,null)",
	  "onError": "set-to-blank"
	}
      );
      ops.push(
	{
	  "op": "core/multivalued-cell-join",
	  "columnName": column.name,
	  "keyColumnName": tmpIdx,
	  "separator": "\n"
	}
      );
      var HGNC="HGNC";
      while (names[HGNC]!=null)
      {
	HGNC+="_";
      }
      ops.push(
	{
	  "op": "core/column-addition",
	  "engineConfig": {
	    "facets": [],
	    "mode": "record-based"
	  },
	  "newColumnName": HGNC,
	  "columnInsertIndex": columnIndex+2,
	  "baseColumnName": column.name,
	  "expression": "jython:import urllib\nimport urllib2\n\nif value:\n url='http://www.genenames.org/cgi-bin/hgnc_bulkcheck.pl'\n user_agent='Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.56 Safari/537.17'\n headers={'User-Agent':user_agent,'method':'POST','enctype':'multipart/form-data'}\n data=urllib.urlencode({'data':value})+'&format=table&table_case=insensitive&list_format=text&onfail=retain&mode=list&submit=submit'\n req = urllib2.Request(url, data, headers)\n response = urllib2.urlopen(req)\n \n return response.read()\nelse:\n return",
	  "onError": "set-to-blank"
	}
      );
      var HGNC_Location="HGNC Location";
      while (names[HGNC_Location]!=null)
      {
	HGNC_Location+="_";
      }
      ops.push(
	{
	  "op": "core/column-addition",
	  "engineConfig": {
	    "facets": [],
	    "mode": "record-based"
	  },
	  "newColumnName": HGNC_Location,
	  "columnInsertIndex": columnIndex+3,
	  "baseColumnName": HGNC,
	  "expression": "grel:forEach(value.split(\"\\n\").slice(1,-1),v,v.split(\"\\t\")[5]).join(\"\\n\")",
	  "onError": "set-to-blank"
	}
      );
      var HGNC_LINK="HGNC Link";
      while (names[HGNC_LINK]!=null)
      {
	HGNC_LINK+="_";
      }
      ops.push(
	{
	  "op": "core/column-addition",
	  "engineConfig": {
	    "facets": [],
	    "mode": "record-based"
	  },
	  "newColumnName": HGNC_LINK,
	  "columnInsertIndex": columnIndex+3,
	  "baseColumnName": HGNC,
	  "expression": "grel:forEach(value.split(\"\\n\").slice(1,-1),v,if(v.split(\"\\t\")[4].contains(\":\"),\"http://www.genenames.org/data/hgnc_data.php?hgnc_id=\"+v.split(\"\\t\")[4].split(\":\")[1],\"-\")).join(\"\\n\")",
	  "onError": "set-to-blank"
	}
      );
      var HGNC_ApprovedName="HGNC Approved Name";
      while (names[HGNC_ApprovedName]!=null)
      {
	HGNC_ApprovedName+="_";
      }
      ops.push(
	{
	  "op": "core/column-addition",
	  "engineConfig": {
	    "facets": [],
	    "mode": "record-based"
	  },
	  "newColumnName": HGNC_ApprovedName,
	  "columnInsertIndex": columnIndex+3,
	  "baseColumnName": HGNC,
	  "expression": "grel:forEach(value.split(\"\\n\").slice(1,-1),v,v.split(\"\\t\")[3]).join(\"\\n\")",
	  "onError": "set-to-blank"
	}
      );
      var HGNC_ApprovedSymbol="HGNC Approved Symbol";
      while (names[HGNC_ApprovedSymbol]!=null)
      {
	HGNC_ApprovedSymbol+="_";
      }
      ops.push(
	{
	  "op": "core/column-addition",
	  "engineConfig": {
	    "facets": [],
	    "mode": "record-based"
	  },
	  "newColumnName": HGNC_ApprovedSymbol,
	  "columnInsertIndex": columnIndex+3,
	  "baseColumnName": HGNC,
	  "expression": "grel:forEach(value.split(\"\\n\").slice(1,-1),v,v.split(\"\\t\")[2]).join(\"\\n\")",
	  "onError": "set-to-blank"
	}
      );
      var HGNC_MatchType="HGNC Match Type";
      while (names[HGNC_MatchType]!=null)
      {
	HGNC_MatchType+="_";
      }
      ops.push(
	{
	  "op": "core/column-addition",
	  "engineConfig": {
	    "facets": [],
	    "mode": "record-based"
	  },
	  "newColumnName": HGNC_MatchType,
	  "columnInsertIndex": columnIndex+3,
	  "baseColumnName": HGNC,
	  "expression": "grel:forEach(value.split(\"\\n\").slice(1,-1),v,v.split(\"\\t\")[1]).join(\"\\n\")",
	  "onError": "set-to-blank"
	}
      );
      ops.push(
	{
	  "op": "core/column-removal",
	  "columnName": HGNC
	}
      );
      ops.push(
	{
	  "op": "core/multivalued-cell-split",
	  "columnName": column.name,
	  "keyColumnName": tmpIdx,
	  "separator": "\n",
	  "mode": "plain"
	}
      );
      ops.push(
	{
	  "op": "core/multivalued-cell-split",
	  "columnName": HGNC_MatchType,
	  "keyColumnName": tmpIdx,
	  "separator": "\n",
	  "mode": "plain"
	}
      );
      ops.push(
	{
	  "op": "core/multivalued-cell-split",
	  "columnName": HGNC_ApprovedSymbol,
	  "keyColumnName": tmpIdx,
	  "separator": "\n",
	  "mode": "plain"
	}
      );
      ops.push(
	{
	  "op": "core/multivalued-cell-split",
	  "columnName": HGNC_ApprovedName,
	  "keyColumnName": tmpIdx,
	  "separator": "\n",
	  "mode": "plain"
	}
      );
      ops.push(
	{
	  "op": "core/multivalued-cell-split",
	  "columnName": HGNC_LINK,
	  "keyColumnName": tmpIdx,
	  "separator": "\n",
	  "mode": "plain"
	}
      );
      ops.push(
	{
	  "op": "core/multivalued-cell-split",
	  "columnName": HGNC_Location,
	  "keyColumnName": tmpIdx,
	  "separator": "\n",
	  "mode": "plain"
	}
      );
      ops.push(
	{
	  "op": "core/column-removal",
	  "columnName": tmpIdx
	}
      );
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
    },
    "jsonp"
  );
}
