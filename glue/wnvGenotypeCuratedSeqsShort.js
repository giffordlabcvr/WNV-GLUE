
//Do serotype recognition for all ncbi curated sequences

var ncbiCurated;
var whereClause = "source.name = 'ncbi-curated-short' and genotype = null";
ncbiCurated = glue.tableToObjects(glue.command(["list", "sequence", "sequenceID", "-w", whereClause]));
//glue.log("INFO", "RESULT WAS ", ncbiCurated);

_.each(ncbiCurated, function(ncbiCurated) {

	var sequenceID = ncbiCurated.sequenceID;
	var sourceName ='ncbi-curated-short';

	var whereClause = "sequenceID = '" + sequenceID + "'";
	glue.log("INFO", "ID RESULT WAS ", sequenceID);

	var genotypeResults1;
	glue.inMode("/module/yfvMaxLikelihoodGenotyper", function() {
		genotypeResults1 = glue.command(["genotype", "sequence", "-w", whereClause]);
		//glue.log("INFO", "Genotype 1 RESULT WAS ", genotypeResults1);			
	});

	var genotypeRows = genotypeResults1.genotypeCommandResult.row;
	var genotypeRow = genotypeRows[0].value;
	var genotypeResult = genotypeRow[1]

	glue.log("INFO", "Genotype RESULT WAS ", genotypeResult);

	if (genotypeResult) {


		var genoResultElements = genotypeResult.split('_YFV_');
		var genotype = genoResultElements[1];

		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
			glue.command(["set", "field", "genotype", genotype]);
		});
	
	}

});	
