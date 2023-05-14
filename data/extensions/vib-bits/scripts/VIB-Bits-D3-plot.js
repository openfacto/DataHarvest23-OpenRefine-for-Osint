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

function VIB_Bits_D3Plot()
{
  $.getJSON("/command/core/get-models?"+$.param({ project: theProject.id }),
	    null,
	    function(models){
	      var model=[];
	      for(var i=0;i<models.columnModel.columns.length;i++)
	      {
		var col=models.columnModel.columns[i];
		model[col.name]=col.cellIndex;
	      }
  $.getJSON("/command/core/get-columns-info?"+$.param({ project: theProject.id }),
	    null,
	    function(data){
	      var frame = DialogSystem.createDialog();
	      frame.width(window.innerWidth - 200);
	      var header = $('<div></div>').addClass("dialog-header").text("Plot using D3").appendTo(frame);
	      var body = $('<div></div>').addClass("dialog-body").appendTo(frame);
	      var footer = $('<div></div>').addClass("dialog-footer").appendTo(frame);
	      var table = $("<table/>").appendTo(body);
	      var row = $("<tr/>").appendTo(table);
	      $("<td>X-column</td>").appendTo(row);
	      var selX = $('<select/>').attr("id","x_column").appendTo($("<td/>").appendTo(row));
	      var nameX;
	      row = $("<tr/>").appendTo(table);
	      $("<td>Y-column</td>").appendTo(row);
	      var selY = $('<select/>').attr("id","y_column").appendTo($("<td/>").appendTo(row));
	      var nameY;
	      row = $("<tr/>").appendTo(table);
	      $("<td>Color by</td>").appendTo(row);
	      var selC = $('<select/>').attr("id","c_column").appendTo($("<td/>").appendTo(row));
	      var nameC="";
	      $('<option>').attr("selected",true).val("").text("None").appendTo(selC);
	      row = $("<tr/>").appendTo(table);
	      var grph=$('<div/>').addClass("VIB-Bits-D3-graph").appendTo($('<td colspan="2"></td>').appendTo(row));

	      row = $("<tr/>").appendTo(table);
	      var dwnld=$('<a href="#">Download</a>').appendTo($('<td colspan="2"></td>').appendTo(row));
	      d3.select(dwnld[0])
	       	.on("mouseover", function(){
	       	  var html = d3.select("svg")
	       	    .attr("version", 1.1)
	       	    .attr("xmlns", "http://www.w3.org/2000/svg")
	       	    .node().parentNode.innerHTML;
	       	  d3.select(this)
		    .attr("target","_blank")
	       	    .attr("href-lang", "image/svg+xml")
	       	    .attr("href", "data:image/svg+xml;base64,\n" + btoa(html));
	       	});

	      var flgX=true;
	      var flgY=true;
	      var typ=[];
	      for(var i=0;i<data.length;i++){
		var col=data[i];
		typ[col.name]=col.is_numeric;
		if (col.is_numeric)
		{
		  var optX=$('<option>').val(col.name).text(col.name).appendTo(selX);
		  var optY=$('<option>').val(col.name).text(col.name).appendTo(selY);
		  if (flgX)
		  {
		    optX.attr("selected",true);
		    nameX=col.name;
		    flgX=false;
		  }
		  else if (flgY)
		  {
		    optY.attr("selected",true);
		    nameY=col.name;
		    flgY=false;
		  }
		}
		else
		{
		  var optX=$('<option>').val(col.name).text(col.name).appendTo(selX);
		  var optY=$('<option>').val(col.name).text(col.name).appendTo(selY);
		  var optC=$('<option>').val(col.name).text(col.name).appendTo(selC);
		}
	      }
	      
	      var margin = {top: 20, right: 80, bottom: 30, left: 80},
	      width = (window.innerWidth - 250) - margin.left - margin.right,
	      height = (window.innerHeight - 200) - margin.top - margin.bottom;

	      var color = d3.scale.category10();

	      
	      var svg = d3.select(grph[0]).append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	      var dta=[];

	      var D3redraw = function()
	      {
		console.log("Redraw "+nameX+", "+nameY+", "+nameC);
		var x;
		var xnum;
		var xlbls=[];
		if (typ[nameX])
		{
		  x = d3.scale.linear()
		    .domain(d3.extent(dta, function(d) { return d[nameX]; })).nice()
		    .range([0, width]);
		}
		else
		{
		  var dmn=[];
		  var keys=[];
		  for(var i=0;i<dta.length;i++)
		  {
		    var d=dta[i];
		    if (keys[d[nameX]]!=1)
		    {
		      dmn.push(d[nameX]);
		      keys[d[nameX]]=1;
		    }
		  }
		  dmn.sort();
		  xnum=Math.ceil(dmn.length/8);
		  for(var i=0;i<dmn.length;i++)
		  {
		    xlbls[i]=(i%xnum==0)?dmn[i]:"";
		  }
		  x = d3.scale.ordinal()
		    .domain(dmn)
		    .rangePoints([0,width],1.0);
		}
		
		var y;
		var ynum;
		var ylbls=[];
		if (typ[nameY])
		{
		  y = d3.scale.linear()
		    .domain(d3.extent(dta, function(d) { return d[nameY]; })).nice()
		    .range([height, 0]);
		}
		else
		{
		  var dmn=[];
		  var keys=[];
		  for(var i=0;i<dta.length;i++)
		  {
		    var d=dta[i];
		    if (keys[d[nameY]]!=1)
		    {
		      dmn.push(d[nameY]);
		      keys[d[nameY]]=1;
		    }
		  }
		  dmn.sort();
		  ynum=Math.ceil(dmn.length/20);
		  for(var i=0;i<dmn.length;i++)
		  {
		    ylbls[i]=(i%ynum==0)?dmn[i]:"";
		  }
		  y = d3.scale.ordinal()
		    .domain(dmn)
		    .rangePoints([0,height],1.0);
		}
 
		var xAxis = d3.svg.axis()
		  .scale(x)
		  .orient("bottom");

		if (!typ[nameX])
		{
		  xAxis.tickValues(xlbls);
		}

		var yAxis = d3.svg.axis()
		  .scale(y)
		  .ticks(10)
		  .orient("left");

		if (!typ[nameY])
		{
		  yAxis.tickValues(ylbls);
		}

		color.domain(d3.values(dta.map(function(d) { return(nameC==""?"":d[nameC]);})));
    
		svg.select("g.x.axis")
		  .call(xAxis)
		  .select("text.label")
		  .text(nameX);
		svg.select("g.y.axis")
		  .call(yAxis)
		  .select("text.label")
		  .text(nameY);
		
		var node = svg.selectAll(".dot")
		  //.attr("title", function(d) {return "modified: "+nameX+":"+d[nameX]+"\n"+nameY+":"+d[nameY]+"\n"+nameC+":"+d[nameC];})
		  .transition()
		  .attr("cx", function(d) { return x(d[nameX]); })
		  .attr("cy", function(d) { return y(d[nameY]); })
		  .style("fill", function(d) { return color(nameC==""?"":d[nameC]); });
		
		node.select("title")
		  .text(function(d) {return nameX+" : "+d[nameX]+"\n"+nameY+" : "+d[nameY]+(nameC==""?"":"\n"+nameC+" : "+d[nameC]);});
		
		svg.selectAll(".legend")
		  .remove();
		
		if (nameC!=""){
		  var legend = svg.selectAll(".legend")    
		    .data(color.domain())
		    .enter().append("g")
		    .attr("class", "legend")
		    .attr("transform", function(d, i) { return "translate(75," + i * 20 + ")"; })
		    .attr("display", function(d,i) {if (i>20) {return "none"} else {return ""}});
		
		  legend.append("rect")
		    .attr("x", width - 18)
		    .attr("width", 18)
		    .attr("height", 18)
		    .style("fill", color);
		
		  legend.append("text")
		    .attr("x", width - 24)
		    .attr("y", 9)
		    .attr("dy", ".35em")
		    .style("text-anchor", "end")
		    .text(function(d) { return d; });
		}
		
	      };

	      d3.select(selX[0])
    		.on("change",function (d,i){nameX=this.options[this.selectedIndex].value; D3redraw();});
	      d3.select(selY[0])
    		.on("change",function (d,i){nameY=this.options[this.selectedIndex].value; D3redraw();});
	      d3.select(selC[0])
    		.on("change",function (d,i){nameC=this.options[this.selectedIndex].value; D3redraw();});

	      var body = {
		engine: JSON.stringify(ui.browsingEngine.getJSON())
	      };

	      $.post("/command/core/get-rows?"+$.param({ project: theProject.id })+"&limit=1000", 
		     body,
		     function(json) {
		       console.log(json);
		       for(var rowIdx=0;rowIdx<json.rows.length;rowIdx++)
		       {
			 var row=json.rows[rowIdx].cells;
			 var drow=[];
			 //console.warn(model);
			 //console.warn(data);
			 //console.warn(row);
			 for(var colIdx=0;colIdx<data.length;colIdx++)
			 {
			   //console.warn(colIdx);
			   var ofs=model[data[colIdx].name];
			   drow[data[colIdx].name]= (row[ofs]!=null?row[ofs].v:null);
			 }
			 dta[rowIdx]=drow;
		       }
		       var x;
		       if (typ[nameX])
		       {
			 x = d3.scale.linear()
			   .domain(d3.extent(dta, function(d) { return d[nameX]; })).nice()
			   .range([0, width]);
		       }
		       else
		       {
			 var dmn=[];
			 var keys=[];
			 for(var i=0;i<dta.length;i++)
			 {
			   var d=dta[i];
			   if (keys[d[nameX]]!=1)
			   {
			     dmn.push(d[nameX]);
			     keys[d[nameX]]=1;
			   }
			 }
			 dmn.sort();
			 x = d3.scale.ordinal()
			   .domain(dmn)
			   .rangePoints([0,width],1.0);
		       }
		       
		       var y;
		       if (typ[nameY])
		       {
			 y = d3.scale.linear()
			   .domain(d3.extent(dta, function(d) { return d[nameY]; })).nice()
			   .range([height, 0]);
		       }
		       else
		       {
			 var dmn=[];
			 var keys=[];
			 for(var i=0;i<dta.length;i++)
			 {
			   var d=dta[i];
			   if (keys[d[nameY]]!=1)
			   {
			     dmn.push(d[nameY]);
			     keys[d[nameY]]=1;
			   }
			 }
			 dmn.sort();
			 y = d3.scale.ordinal()
			   .domain(dmn)
			   .rangePoints([0,height],1.0);
		       }
		       
		       var xAxis = d3.svg.axis()
			 .scale(x)
			 .orient("bottom");
		       
		       var yAxis = d3.svg.axis()
			 .scale(y)
			 .orient("left");

		       color.domain(d3.values(dta.map(function(d) { return(nameC==""?"":d[nameC]);})));
		       svg.append("g")
			 .attr("class", "x axis")
			 .attr("transform", "translate(0," + height + ")")
			 .call(xAxis)
			 .append("text")
			 .attr("class", "label")
			 .attr("x", width)
			 .attr("y", -10)
			 .style("text-anchor", "end")
			 .text(nameX);
		       
		       svg.append("g")
			 .attr("class", "y axis")
			 .call(yAxis)
			 .append("text")
			 .attr("class", "label")
			 .attr("transform", "rotate(-90)")
			 .attr("y", 10)
			 .attr("dy", ".71em")
			 .style("text-anchor", "end")
			 .text(nameY)
		       
		       var node = svg.selectAll(".dot")
			 .data(dta)
			 .enter().append("circle")
			 .attr("class", "dot")
			 .attr("r", 3.5)
			 .attr("cx", function(d) { return x(d[nameX]); })
			 .attr("cy", function(d) { return y(d[nameY]); })
			 .style("fill", function(d) { return color(nameC==""?"":d[nameC]); });
		       
		       node.append("title")
			 .text(function(d) {return nameX+" : "+d[nameX]+"\n"+nameY+" : "+d[nameY]+(nameC==""?"":"\n"+nameC+" : "+d[nameC]);});
		       
		       if (nameC!=""){
			 var legend = svg.selectAll(".legend")
			   .data(color.domain())
			   .enter().append("g")
			   .attr("class", "legend")
			   .attr("transform", function(d, i) { return "translate(75," + i * 20 + ")"; });
			 
			 legend.append("rect")
			   .attr("x", width - 18)
			   .attr("width", 18)
			   .attr("height", 18)
			   .style("fill", color);
			 
			 legend.append("text")
			   .attr("x", width - 24)
			   .attr("y", 9)
			   .attr("dy", ".35em")
			   .style("text-anchor", "end")
			   .text(function(d) { return d; });
		       }
		     });
	      
	      // cancel button
	      $('<button class="button"></button>').text("Cancel").click(function() {
		DialogSystem.dismissUntil(level - 1);
	      }).appendTo(footer);
	      var level = DialogSystem.showDialog(frame);
	    },
	    "jsonp");
	    },
	    "jsonp");
}
