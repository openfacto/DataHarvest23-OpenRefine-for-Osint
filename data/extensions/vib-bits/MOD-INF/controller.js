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

/*
 * Function invoked to initialize the extension.
 */
function init() {
    /*
     *  Client-side Resources
     */
    var ClientSideResourceManager = Packages.com.google.refine.ClientSideResourceManager;
    
    // Script files to inject into /project page
    ClientSideResourceManager.addPaths(
        "project/scripts",
        module,
        [
	  "scripts/D3.v2.js",
	  "scripts/VIB-Bits-AddFieldIndex.js",
	  "scripts/VIB-Bits-Unpaired-pivot.js",
	  "scripts/VIB-Bits-D3-plot.js",
	  "scripts/VIB-Bits-Join-other.js",
	  "scripts/VIB-Bits-redo-other.js",
	  "scripts/VIB-Bits-redo-history.js",
          "scripts/VIB-Bits-redo.js",
          "scripts/VIB-Bits-HGNC.js",
	  "scripts/menu-bar-extensions.js"
	]
    );
       // Style files to inject into /project page
    ClientSideResourceManager.addPaths(
        "project/styles",
        module,
        [
          "styles/D3.css",
          "styles/VIB-Bits.css"
        ]
    ); 
}
