
var ncbiCuratedShort;
var whereClause = "source.name = 'ncbi-curated-short' and lineage = null";
ncbiCuratedShort = glue.tableToObjects(glue.command(["list", "sequence", "sequenceID", "-w", whereClause]));
//glue.log("INFO", "RESULT WAS ", ncbiCuratedShort);

var processed = 0;

_.each(ncbiCuratedShort, function(ncbiCuratedShort) {

	var sequenceID = ncbiCuratedShort.sequenceID;
	var sourceName ='ncbi-curated-short';

	var whereClause = "sequenceID = '" + sequenceID + "'";
	//glue.log("INFO", "ID RESULT WAS ", sequenceID);

	var lineageResults;
	glue.inMode("/module/wnvMaxLikelihoodGenotyper", function() {
		lineageResults = glue.command(["genotype", "sequence", "-w", whereClause]);
		//glue.log("INFO", "lineage 1 RESULT WAS ", lineageResults);			
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
		var lineage = lineageResult.replace("AL_WNV_Lineage", "");
		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
		
			glue.command(["set", "field", "lineage", lineage]);
		});
	
	}
	if (cladeResult) {

		//var genoResultElements = lineageResult.split('_');
		//var lineage = genoResultElements[1];
		//var clade = genoResultElements[1];

		var clade = cladeResult.replace("AL_WNV_Lineage1", "");

		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
			glue.command(["set", "field", "clade", clade]);
		});
	
	}

	processed++;

	if(processed % 10 == 0) {
		glue.logInfo("Genotyped "+processed+" sequences. ");
		glue.command(["commit"]);
		glue.command(["new-context"]);
	}

});	
