# WNV-GLUE: Phylogenomic Analysis of West Nile Virus

## Overview

WNV-GLUE is a sequence-oriented resource for comparative genomic analysis of West Nile virus (WNV), developed using the [GLUE](https://github.com/giffordlabcvr/gluetools) software framework.

GLUE is an open, integrated software toolkit designed for storing and interpreting sequence data. It supports the creation of bespoke projects, incorporating essential data items for comparative genomic analysis, such as sequences, multiple sequence alignments, genome feature annotations, and other associated data.

Projects are loaded into the GLUE "engine," forming a relational database that represents the semantic relationships between data items. This foundation supports systematic comparative analyses and the development of sequence-based resources.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Installation](#installation)
- [Usage](#usage)
- [Genotyping](#genotyping)
- [Mutation frequencies](#mutation-frequencies)
- [Data Sources](#data-sources)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Key Features

- **GLUE Framework Integration**: Built on the GLUE software framework, WNV-GLUE offers an extensible platform for efficient, standardized, and reproducible computational genomic analysis of West Nile virus.

- **Phylogenetic Structure**: Sequence data in WNV-GLUE is organized in a phylogenetically-structured manner, allowing users to explore evolutionary relationships easily.

- **Rich Annotations**: Annotated reference sequences enable rigorous comparative genomic analysis related to conservation, adaptation, structural context, and genotype-to-phenotype associations.

- **Automated Genotyping**: WNV-GLUE can perform automated genotyping of WNV sequences (including subgenomic sequences) via GLUE's [maximum likelihood clade assignment (MLCA) algorithm](https://doi.org/10.1186/s12859-018-2459-9).

- **Exploratory and operational**: The GLUE framework allows sequence-based resources to be used for exploratory work in a research setting, as well as operational work in a public or animal health setting.


## Installation

If you have not done so already, install the GLUE software framework by following the [installation instructions](http://glue-tools.cvr.gla.ac.uk/#/installation) on the GLUE web site: 

Download the WNV-GLUE repository, navigate into the top-level directory, and start the GLUE command line interpreter.

At the GLUE command prompt, run the 'buildYfvProject.glue' file as follows:

```
GLUE Version 1.1.107
Copyright (C) 2015-2020 The University of Glasgow
This program comes with ABSOLUTELY NO WARRANTY. This is free software, and you
are welcome to redistribute it under certain conditions. For details see
GNU Affero General Public License v3: http://www.gnu.org/licenses/

Mode path: /
GLUE> run file buildWnvBaseProject.glue
```

This will build (i) the base project, which contains a minimal set of feature definitions, clade categories, reference sequences, and alignments, and (ii) the extension project, which contains all WNV sequences in GenBank.

## Usage

GLUE contains an interactive command line environment focused on the development and use of GLUE projects by bioinformaticians. This provides a range of productivity-oriented features such as automatic command completion, command history and interactive paging through tabular data. 

For detailed instructions on how to use WNV-GLUE for your comparative genomic analysis, refer to the GLUE's [reference documentation](http://glue-tools.cvr.gla.ac.uk/).

## Genotyping

To classify WNV sequences via maximum likelihood clade assignment (MLCA)-based genotyping, call the appropriate genotyping module from the GLUE console, for example:

```
Mode path: /
GLUE> project wnv
OK
Mode path: /project/wnv
GLUE> module wnvMaxLikelihoodGenotyper genotype file -f path/to/sequences/WNV.fasta 
```

Please note the above command sequence is equivalent to the following:

```
Mode path: /
GLUE> project wnv module wnvMaxLikelihoodGenotyper genotype file -f path/to/sequences/WNV.fasta 
```

## Data Sources

WNV-GLUE relies on the following data sources:

- [NCBI Nucleotide](https://www.ncbi.nlm.nih.gov/nuccore)


## Contributing

We welcome contributions from the community! If you're interested in contributing to WNV-GLUE, please review our [Contribution Guidelines](./md/CONTRIBUTING.md).

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./md/code_of_conduct.md)


## License

The project is licensed under the [GNU Affero General Public License v. 3.0](https://www.gnu.org/licenses/agpl-3.0.en.html)

## Contact

For questions, issues, or feedback, please open an issue on the [GitHub repository](https://github.com/giffordlabcvr/WNV-GLUE/issues).

