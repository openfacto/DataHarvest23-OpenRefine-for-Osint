// stored link support

Refine.reinitializeProjectDataOrigSaveFacets = Refine.reinitializeProjectData;

Refine.reinitializeProjectData=function(f, fError){
  Refine.reinitializeProjectDataOrigSaveFacets(f,fError);
  if ($('#project-permalink-button-VIB-Bits').length==0)
  {
    var lnk=$('<a id="project-permalink-button-VIB-Bits" href="javascript:{}" class="secondary">Permalink</a>').css("padding","0 4px").css("font-size","0.7em");
    $('#project-permalink-button').after(lnk).hide();
    $('#project-permalink-button-VIB-Bits').click(function() {
      VIB_Bits_getPermanentLink();
    }).mouseenter(function() {
      if (ui.browsingEngine.getFacetUIStates().length==0){
	this.title="Click to restore saved facets."
      } else {
	this.title="Click to save facets."
      }
    });
  }
  
}

function VIB_Bits_getPermanentLink()
{
  var fcts=ui.browsingEngine.getFacetUIStates();
  if (fcts.length==0) {
    //console.log("Retrieving saved facets");
    $.getJSON(
      "command/core/get-preference?"+$.param({project: theProject.id, name: "VIB-Bits-saved-facets"}),
	null,
	function(data) {
	  console.log(data.value);
	  if (data.value!== null){
	    var params = [
	      "project=" + escape(theProject.id),
	      "ui=" + data.value
	    ];
	    document.location.href="project?" + params.join("&");
	  }
	}
    );
  } else {
    //console.log("Saving facets");
    $.post(
      "command/core/set-preference",
      {
	project: theProject.id,
	name: "VIB-Bits-saved-facets",
	value: escape(JSON.stringify({facets: fcts}))
      },
      function(o){
	if (o.code == "error"){
	  console.log("Error: "+o.message);
	} else {
	  // dummy rename to force project dirty (so metadata is saved)
	  // project name is not set yet, hence the timeout
	  window.setTimeout(VIB_Bits_dummy_rename,500);
	  document.location.href= Refine.getPermanentLink();
	}
	//console.log(JSON.stringify({facets: fcts}));
      },
      "json"
    );
  }
}

function VIB_Bits_dummy_rename()
{
  $.post(
    "command/core/rename-project",
    {
      project: theProject.id,
      name: theProject.metadata.name
    },
    function(o){
      if (o.code == "error"){
	console.log("Error: "+o.message);
      }
    },
    "json"
  );
}