//    This plugin, VIB-Bits-diff, provides a menu item 'Calculate diff...' 
//    in OpenRefine (under 'Edit cells/Common transforms') to calculate the
//    difference between two pieces of text separated by a custom separator string
//    and displays that using <ins> and <del> statements.
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
	  "scripts/VIB-Bits-save-facets.js"
	]
    );
}
