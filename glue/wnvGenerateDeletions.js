
var featuresList = glue.tableToObjects(
		glue.command(["list", "feature", "-w", "featureMetatags.name = 'CODES_AMINO_ACIDS' and featureMetatags.value = true", "name", "displayName", "parent.name"]));

glue.command(["multi-delete", "variation", "-w", "name like 'wnv_aa_del_detect%'"]);

// create "detection" variation objects to detect deletions in each of the features respectively.
var comparisonRefName = "REF_MASTER_WNV";
_.each(featuresList, function(featureObj) {

	glue.inMode("reference/"+comparisonRefName+"/feature-location/"+featureObj.name, function() {
	
		var codonLabels= glue.getTableColumn(glue.command(["list", "labeled-codon"]), "codonLabel");
		var codonLabel2 = codonLabels[1];
		var codonLabelPenultimate = codonLabels[codonLabels.length - 2];
		glue.command(["create", "variation", "wnv_aa_del_detect:"+featureObj.name, 
			"-t", "aminoAcidDeletion", "-c", codonLabel2, codonLabelPenultimate]);

	});

});

var ntDeletionsSet = {};
var orf1aNtDeletions = {}; 
var orf1abNtDeletions = {}; 

var deletionsSet = {};
var orf1aDeletions = {}; 
var orf1abDeletions = {}; 

var processed = 0;

//variant cache test 
//var whereClause = "sequence.sequenceID in ('EPI_ISL_500981', 'EPI_ISL_465549')";

//just delete everything
//var whereClause = "false";

// sequences containing (a) non-codon-aligned deletion in NSP2, (b) codon-aligned deletion in NSP1, (c) no deletions
//var whereClause = "sequence.analyse_variation = true and sequence.sequenceID in ('EPI_ISL_410486', 'EPI_ISL_420775', 'EPI_ISL_402125')"

// production
var whereClause = "sequence.analyse_variation = true and sequence.cg_deletions_from_cache = false";


glue.inMode("alignment/AL_GISAID_CONSTRAINED", function() {
	var almtMemberObjs = glue.tableToObjects(glue.command(["list", "member", "-w", whereClause]));
	_.each(almtMemberObjs, function(almtMemberObj) {
		glue.inMode("member/"+almtMemberObj["sequence.source.name"]+"/"+almtMemberObj["sequence.sequenceID"], function() {
			
			var allFeatureDelObjs = [];
			
			_.each(featuresList, function(featureObj) {
				var memberDelObjs = glue.tableToObjects(glue.command(["variation", "scan", 
					"-r", comparisonRefName, "-f", featureObj.name, 
					"--whereClause", "name = 'wnv_aa_del_detect:"+featureObj.name+"'", 
					"--excludeAbsent", "--showMatchesAsTable"]));
				
				_.each(memberDelObjs, function(memberDelObj) {
					memberDelObj.featureName = featureObj.name;
					memberDelObj.parentFeatureName = featureObj["parent.name"];
				});
				
				allFeatureDelObjs = allFeatureDelObjs.concat(memberDelObjs);
			});
			
			_.each(allFeatureDelObjs, function(memberDelObj) {
				
				var ntDeletionID = memberDelObj.featureName+":nca:"+memberDelObj.refFirstNtDeleted+":"+memberDelObj.refLastNtDeleted;
				var ntDeletionObj = ntDeletionsSet[ntDeletionID];
				if(ntDeletionObj == null) {
					ntDeletionObj = {
						id: ntDeletionID,
						feature: memberDelObj.featureName,
						parentFeature: memberDelObj.parentFeatureName,
						refNtStart: memberDelObj.refFirstNtDeleted,
						refNtEnd: memberDelObj.refLastNtDeleted,
						memberSeqs: []
					};
					ntDeletionsSet[ntDeletionID] = ntDeletionObj;
	
				}
				ntDeletionObj.memberSeqs.push(almtMemberObj);

				if(memberDelObj.deletionIsCodonAligned) {
					var deletionID = memberDelObj.featureName+":ca:"+memberDelObj.refFirstCodonDeleted+":"+memberDelObj.refLastCodonDeleted;
					var deletionObj = deletionsSet[deletionID];
					if(deletionObj == null) {
						deletionObj = {
							id: deletionID,
							feature: memberDelObj.featureName,
							parentFeature: memberDelObj.parentFeatureName,
							startCodon: memberDelObj.refFirstCodonDeleted,
							endCodon: memberDelObj.refLastCodonDeleted,
							refNtStart: memberDelObj.refFirstNtDeleted,
							refNtEnd: memberDelObj.refLastNtDeleted,
							ntDeletionID: ntDeletionID,
							memberSeqs: []
						};
						deletionsSet[deletionID] = deletionObj;

					}
					deletionObj.memberSeqs.push(almtMemberObj);
				}
			});
			processed++;
			if(processed % 250 == 0) {
				glue.log("FINEST", "Processed "+processed+" alignment members for deletions");
				glue.command(["new-context"]);
			}
		});
	});
});

//create NT (non codon aligned) deletions
_.each(_.values(ntDeletionsSet), function(ntDeletionObj) {
	if(ntDeletionObj.feature == "ORF_1a" || ntDeletionObj.feature == "ORF_1ab") {
		return;
	}
	createNtDeletion(ntDeletionObj);
});


// create any ORF1a/ORF1ab ntDeletions which are not already represented by NSP ntDeletions
// eg if they span cleavage locations.
_.each(_.values(orf1aNtDeletions), function(ntDeletionObj) {
	if(ntDeletionObj.skipCreation) {
		return;
	}
	createNtDeletion(ntDeletionObj);
});
_.each(_.values(orf1abNtDeletions), function(ntDeletionObj) {
	if(ntDeletionObj.skipCreation) {
		return;
	}
	createNtDeletion(ntDeletionObj);
});

// -----------

//create codon aligned deletions
_.each(_.values(deletionsSet), function(deletionObj) {
	if(deletionObj.feature == "ORF_1a" || deletionObj.feature == "ORF_1ab") {
		return;
	}
	createDeletion(deletionObj);
});
// create any ORF1a/ORF1ab deletions which are not already represented by NSP deletions
// eg if they span cleavage locations.
_.each(_.values(orf1aDeletions), function(deletionObj) {
	if(deletionObj.skipCreation) {
		return;
	}
	createDeletion(deletionObj);
});
_.each(_.values(orf1abDeletions), function(deletionObj) {
	if(deletionObj.skipCreation) {
		return;
	}
	createDeletion(deletionObj);
});



function createNtDeletion(ntDeletionObj) {

	glue.log("FINEST", "Creating NT deletion object", ntDeletionObj);
	var variationName = "wnv_nt_del:"+ntDeletionObj.id;
	var variationExists = false;
	
	glue.inMode("reference/REF_MASTER_WNV/feature-location/"+ntDeletionObj.feature, function() {
		var existing = glue.tableToObjects(glue.command(["list", "variation", "-w", "name = '"+variationName+"'"]));
		if(existing.length > 0) {
			variationExists = true;
		}
		if(!variationExists) {
			glue.command(["create", "variation", variationName, 
			"-t", "nucleotideDeletion", 
			"--nucleotide", ntDeletionObj.refNtStart, ntDeletionObj.refNtEnd]);
		}
	});
	
	// ORF 1a / 1ab corresponding ntDeletion may not exist
	// if the sequence doesn't cover the whole of ORF1a / ORF1ab
	// (ntDeletion variations will currently report insufficient coverage in these scenarios, 
	// which is probably too strict)
	
	if(!variationExists) {
		glue.command(["create", "custom-table-row", "wnv_nt_deletion", ntDeletionObj.id]);
		glue.inMode("custom-table-row/wnv_nt_deletion/"+ntDeletionObj.id, function() {
			var displayName;
			if(ntDeletionObj.refNtStart == ntDeletionObj.refNtEnd) {
				displayName = ntDeletionObj.refNtStart;	
			} else {
				displayName = ntDeletionObj.refNtStart+"-"+ntDeletionObj.refNtEnd;	
			}
			glue.command(["set", "field", "display_name", displayName]);
			glue.command(["set", "field", "reference_nt_start", ntDeletionObj.refNtStart]);		
			glue.command(["set", "field", "reference_nt_end", ntDeletionObj.refNtEnd]);		

			glue.command(["set", "link-target", "variation", 
				"reference/REF_MASTER_WNV/feature-location/"+ntDeletionObj.feature+
				"/variation/"+variationName]);
		});
	}
	
	_.each(ntDeletionObj.memberSeqs, function(memberObj) {
		var sourceName = memberObj["sequence.source.name"];
		var sequenceID = memberObj["sequence.sequenceID"];
		var linkObjId = ntDeletionObj.id+":"+sourceName+":"+sequenceID;
		var variation_present = true;
		glue.command(["create", "custom-table-row", "wnv_nt_deletion_sequence", linkObjId]);
		glue.inMode("custom-table-row/wnv_nt_deletion_sequence/"+linkObjId, function() {
			glue.command(["set", "link-target", "wnv_nt_deletion", "custom-table-row/wnv_nt_deletion/"+ntDeletionObj.id]);
			glue.command(["set", "link-target", "sequence", "sequence/"+sourceName+"/"+sequenceID]);
		});
		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
			glue.command(["set", "field", "variation_present", variation_present]);
			
		});
	});
	
}



function createDeletion(deletionObj) {

	glue.log("FINEST", "Creating AA deletion object", deletionObj);
	var variationName = "wnv_aa_del:"+deletionObj.id;
	var variationExists = false;
	
	glue.inMode("reference/REF_MASTER_WNV/feature-location/"+deletionObj.feature, function() {
		var existing = glue.tableToObjects(glue.command(["list", "variation", "-w", "name = '"+variationName+"'"]));
		if(existing.length > 0) {
			variationExists = true;
		}
		if(!variationExists) {
			glue.command(["create", "variation", variationName, 
				"-t", "aminoAcidDeletion", 
				"--labeledCodon", deletionObj.startCodon, deletionObj.endCodon]);
		}
	});
	
	
	if(!variationExists) {
		glue.command(["create", "custom-table-row", "wnv_deletion", deletionObj.id]);
		glue.inMode("custom-table-row/wnv_deletion/"+deletionObj.id, function() {
			var displayName;
			if(deletionObj.startCodon == deletionObj.endCodon) {
				displayName = deletionObj.startCodon;	
			} else {
				displayName = deletionObj.startCodon+"-"+deletionObj.endCodon;	
			}
			glue.command(["set", "field", "display_name", displayName]);
			glue.command(["set", "field", "start_codon", deletionObj.startCodon]);		
			glue.command(["set", "field", "start_codon_int", parseInt(deletionObj.startCodon)]);		
			glue.command(["set", "field", "end_codon", deletionObj.endCodon]);		
			glue.command(["set", "field", "end_codon_int", parseInt(deletionObj.endCodon)]);		
			glue.command(["set", "field", "reference_nt_start", deletionObj.refNtStart]);		
			glue.command(["set", "field", "reference_nt_end", deletionObj.refNtEnd]);		

			glue.command(["set", "link-target", "variation", 
				"reference/REF_MASTER_WNV/feature-location/"+deletionObj.feature+
				"/variation/"+variationName]);
			glue.command(["set", "link-target", "wnv_nt_deletion", 
				"custom-table-row/wnv_nt_deletion/"+deletionObj.ntDeletionID]);
		});
	}
	
	_.each(deletionObj.memberSeqs, function(memberObj) {
		var sourceName = memberObj["sequence.source.name"];
		var sequenceID = memberObj["sequence.sequenceID"];
		var linkObjId = deletionObj.id+":"+sourceName+":"+sequenceID;
		var variation_present = true;
		glue.command(["create", "custom-table-row", "wnv_deletion_sequence", linkObjId]);
		glue.inMode("custom-table-row/wnv_deletion_sequence/"+linkObjId, function() {
			glue.command(["set", "link-target", "wnv_deletion", "custom-table-row/wnv_deletion/"+deletionObj.id]);
			glue.command(["set", "link-target", "sequence", "sequence/"+sourceName+"/"+sequenceID]);
		});
		glue.inMode("sequence/"+sourceName+"/"+sequenceID, function() {
			glue.command(["set", "field", "variation_present", variation_present]);
		});
	});
}




// Get tip alignments
function getTipAlignments (tipAlignments) {

	// List alignments
	var alignmentList = glue.tableToObjects(glue.command(["list", "alignment", "-w", "name not like 'AL_UNC%'"]));
	//glue.log("INFO", "MSA RESULT WAS ", alignmentList);

	// Get set that are parents
	var parentAlignments = {};
	_.each(alignmentList, function(alignmentObj) {
	
		var parentName = alignmentObj["parent.name"];
		if (parentName) {
			parentAlignments[parentName]= 1;
		}
	});
	//glue.log("INFO", "PARENT RESULT WAS ", parentAlignments);
	
	// Iterate through whole list, capture all those that are to parents
	_.each(alignmentList, function(alignmentObj) {
	
		var alignmentName = alignmentObj["name"];
		
		if (!parentAlignments[alignmentName]) {
			tipAlignments[alignmentName]= 1;
		}
	});
	//glue.log("INFO", "TIP RESULT WAS ", tipAlignments);

}

