glue.command(["multi-delete", "feature_location", "-w", "referenceSequence.name not like '%MASTER%'"]);

var refSeqObjs = glue.tableToObjects(glue.command(["list", "reference", "-w", "name not like '%MASTER%'", "name", "sequence.length"]));

_.each(refSeqObjs, function(refSeqObj) {

	glue.inMode("reference/"+refSeqObj.name, function() {
	
		glue.command(["add", "feature-location", "whole_genome"]);
		glue.inMode("feature-location/whole_genome", function() {
			glue.command(["add", "segment", 1, refSeqObj["sequence.length"]]);
		});
		
	});
	
});

_.each(refSeqObjs, function(refSeqObj) {
	glue.inMode("reference/"+refSeqObj.name, function() {
	
		glue.command(["inherit", "feature-location", 
			"--recursive", "--spanGaps", 
			"AL_UNC_WNV_ROOT", "--relRefName", "REF_MASTER_WNV", "whole_genome"]);		
	
	});

});

