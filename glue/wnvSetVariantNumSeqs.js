var processed = 0;
var repIDs = glue.getTableColumn(glue.command(["list", "custom-table-row", "wnv_replacement", "id"]), "id");

_.each(repIDs, function(repID) {
	var numSeqs = glue.tableToObjects(
			glue.command(["list", "custom-table-row", "wnv_replacement_sequence", "-w", 
				"wnv_replacement.id = '"+repID+"'"])).length;
	glue.inMode("custom-table-row/wnv_replacement/"+repID, function() {
		glue.command(["set", "field", "num_seqs", numSeqs]);
	});
	processed++;
	if(processed % 500 == 0) {
		glue.logInfo("Set num_seqs for "+processed+" replacements. ");
		glue.command(["commit"]);
		glue.command(["new-context"]);
	}
});
glue.logInfo("Set num_seqs for "+processed+" replacements. ");
glue.command(["commit"]);
glue.command(["new-context"]);