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

function VIB_Bits_redo()
{
   $.getJSON("/command/core/get-operations?"+$.param({ project: theProject.id }),
 	    null,
 	    function(data){
 	      if("entries" in data){
 		var a=[];
 		for (var i=0;i<data.entries.length;i++){
 		  var entry=data.entries[i];
 		  if ("operation" in entry){
 		    a.push(entry.operation);
 		  }
 		}
		console.log("Writing cookie:"+JSON.stringify(a));		
		sessionStorage.setItem("VIB-Bits-redo-history",JSON.stringify(a));
 		Refine.postCoreProcess("undo-redo",
 				       {lastDoneID:0},
 				       null,
 				       {everythingChanged: true},
 				       {onDone:function(od){
					 VIB_Bits_Apply_Operations(a);
 				       }
 				       });
 	      }
 	    },
 	    "jsonp");
}