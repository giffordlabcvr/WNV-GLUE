
var ncbiCurated;
var whereClause = "source.name = 'ncbi-curated' and lineage = null";
ncbiCurated = glue.tableToObjects(glue.command(["list", "sequence", "sequenceID", "-w", whereClause]));
//glue.log("INFO", "RESULT WAS ", ncbiCurated);

_.each(ncbiCurated, function(ncbiCurated) {

	var sequenceID = ncbiCurated.sequenceID;
	var sourceName ='ncbi-curated';

	var whereClause = "sequenceID = '" + sequenceID + "'";
	glue.log("INFO", "ID RESULT WAS ", sequenceID);

	var lineageResults;
	glue.inMode("/module/wnvMaxLikelihoodGenotyper", function() {
		lineageResults = glue.command(["genotype", "sequence", "-w", whereClause]);
		glue.log("INFO", "lineage 1 RESULT WAS ", lineageResults);			
	});

	var lineageRows = lineageResults.genotypeCommandResult.row;
	var lineageRow = lineageRows[0].value;
	var lineageResult = lineageRow[1]
	var cladeResult = lineageRow[2]

	//glue.log("INFO", "lineage RESULT WAS ", lineageResult);

	if (lineageResult) {

		//var genoResultElements = lineageResult.split('_');
		//var lineage = genoResultElements[1];
		//var clade = genoResultElements[1];

		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
			glue.command(["set", "field", "lineage", lineageResult]);
		});
	
	}
	if (cladeResult) {

		//var genoResultElements = lineageResult.split('_');
		//var lineage = genoResultElements[1];
		//var clade = genoResultElements[1];

		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
			glue.command(["set", "field", "clade", cladeResult]);
		});
	
	}
});	
