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


//extend the column header menu
    
ExtensionBar.MenuItems.push(
  {
    "id":"VIB-Bits",
    "label": "VIB-Bits",
    "submenu" : [
      {
	"id": "VIB-Bits/redo",
	label: "Redo operation history",
	click: function() { VIB_Bits_redo();
			  }
      },
      {
	"id": "VIB-Bits/redo-history",
	label: "Redo operation history...",
	click: function() { VIB_Bits_redoHistory();
			  }
      },
      {
	"id": "VIB-Bits/store-redo",
	label: "Store redo history",
	click: function() { VIB_Bits_storeRedo();
			  }
      },
      {
	"id": "VIB-Bits/redo-other",
	label: "Execute other operation history...",
	click: function() { VIB_Bits_redoOther();
			  }
      },
      {},
      {
	"id": "VIB-Bits/unpaired-pivot",
	label: "Unpaired pivot...",
	click: function() { VIB_Bits_UnpairedPivot();
			  }
      },
      {},
      {
	"id": "VIB-Bits/d3-plot",
	label: "Plot with D3...",
	click: function() { VIB_Bits_D3Plot();
			  }
      }
    ]
  }
);

DataTableColumnHeaderUI.extendMenu(function(column, columnHeaderUI, menu) {
  MenuSystem.insertAfter(
    menu,
    [ "core/edit-column", "core/add-column-by-fetching-urls" ],
    [
      {},
      {
	id: "VIB-Bits/add-field-index",
	label: "Add field index..." ,
	click: function() {
	  VIB_Bits_addFieldIndex(column);
	}
      },
      {},
      {
	id: "VIB-Bits/HGNC",
	label: "Add columns from HGNC" ,
	click: function() {
	  VIB_Bits_HGNC(column);
	}
      }
  ]);
});

DataTableColumnHeaderUI.extendMenu(function(column, columnHeaderUI, menu) {
  MenuSystem.insertAfter(
    menu,
    [ "core/edit-column", "core/add-column" ],
    [
      {
	id: "VIB-Bits/Join-other",
	label: "Add column(s) from other projects..." ,
	click: function() {
	  VIB_Bits_Join(column);
	}
      }
    ]);
});
 
