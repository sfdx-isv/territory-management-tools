# TM-Tools Plugin for the Salesforce CLI

[![Version](https://img.shields.io/npm/v/territory-management-tools.svg)](https://npmjs.org/package/territory-management-tools)
[![CircleCI](https://circleci.com/gh/sfdx-isv/territory-management-tools/tree/master.svg?style=shield)](https://circleci.com/gh/sfdx-isv/territory-management-tools/tree/master)
[![Appveyor CI](https://ci.appveyor.com/api/projects/status/github/sfdx-isv/territory-management-tools?branch=master&svg=true)](https://ci.appveyor.com/project/heroku/territory-management-tools/branch/master)
[![Codecov](https://codecov.io/gh/sfdx-isv/territory-management-tools/branch/master/graph/badge.svg)](https://codecov.io/gh/sfdx-isv/territory-management-tools)
[![Greenkeeper](https://badges.greenkeeper.io/sfdx-isv/territory-management-tools.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/sfdx-isv/territory-management-tools/badge.svg)](https://snyk.io/test/github/sfdx-isv/territory-management-tools)
[![Downloads/week](https://img.shields.io/npm/dw/territory-management-tools.svg)](https://npmjs.org/package/territory-management-tools)
[![License](https://img.shields.io/npm/l/territory-management-tools.svg)](https://github.com/sfdx-isv/territory-management-tools/blob/master/package.json)

A plugin for the Salesforce CLI that makes it easy to migrate from Territory Management (TM1) to Enterprise Territory Management (TM2) by creating a structured, multi-step environment to automate the extraction, transformation, and deployment/load of metadata and data from TM1 to TM2.

## Installation

Installing the TM-Tools Plugin is easy if you have already [installed the Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli).  

**Open a terminal window (command prompt) and enter the following:**

```
$ sfdx plugins:install territory-management-tools
```

**You should see something similar to this:**

![Install the CLI Plugin](https://drive.google.com/uc?export=view&id=1h6iUbZXc3XRJrhE-8uAy_HkqH1d57XBj)

**Important Notes:**
1. The command `sfdx plugins:install` pulls the plugin source code directly from the [territory-management-tools package](https://www.npmjs.com/package/sfdx-falcon), hosted by [NPM](www.npmjs.com)
2. The TM-Tools Plugin has not been digitially signed (yet), so you will need to acknowledge the warning to continue the installation



## Available Commands
<!-- install -->
<!-- commands -->
* [`sfdx tmtools:tm1:analyze [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm1analyze--d-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm1:clean -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm1clean--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm1:extract [-s <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm1extract--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm1:transform -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm1transform--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm2:deploy -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm2deploy--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm2:deploysharing -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm2deploysharing--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
* [`sfdx tmtools:tm2:load -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-tmtoolstm2load--s-directory---falcondebug-array---falcondebugerror---falcondebugsuccess---falcondebugdepth-number---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx tmtools:tm1:analyze [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm1:analyze [-d <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -d, --outputdir=outputdir                                                         [default: .] TODO: Validate need for
                                                                                    this flag then write description

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm1:analyze
  $ sfdx tmtools:tm1:analyze -d ~/custom-target-directory
```

_See code: [src/commands/tmtools/tm1/analyze.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v1.0.0/src/commands/tmtools/tm1/analyze.ts)_

## `sfdx tmtools:tm1:clean -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm1:clean -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         (required) [default: .] TODO: Write
                                                                                    Description

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm1:clean
  $ sfdx tmtools:tm1:clean -s ~/tm1-transformation-directory
```

_See code: [src/commands/tmtools/tm1/clean.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v1.0.0/src/commands/tmtools/tm1/clean.ts)_

## `sfdx tmtools:tm1:extract [-s <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Given the location of a TM1 Analysis file (tm1-analysis.json), extracts all TM1 config (data & metadata) from the associated org and saves it locally.

```
USAGE
  $ sfdx tmtools:tm1:extract [-s <directory>] [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         [default: .] Directory that contains
                                                                                    a tm1-analysis.json file. Defaults
                                                                                    to . (current directory) if not
                                                                                    specified.

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm1:extract
  $ sfdx tmtools:tm1:extract -s ~/tm1-analysis-directory
```

_See code: [src/commands/tmtools/tm1/extract.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v1.0.0/src/commands/tmtools/tm1/extract.ts)_

## `sfdx tmtools:tm1:transform -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

Transforms locally stored TM1 data and metadata into bundles that can be deployed back into the source org once Enterprise Territory Management (TM2) is activated.

```
USAGE
  $ sfdx tmtools:tm1:transform -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         (required) [default: .] Directory
                                                                                    that contains a tm1-extraction.json
                                                                                    file. Defaults to . (current
                                                                                    directory) if not specified.

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm1:transform
  $ sfdx tmtools:tm1:transform -s ~/tm1-extraction-directory
```

_See code: [src/commands/tmtools/tm1/transform.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v1.0.0/src/commands/tmtools/tm1/transform.ts)_

## `sfdx tmtools:tm2:deploy -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm2:deploy -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         (required) [default: .] TODO: Write
                                                                                    Description

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm2:deploy
  $ sfdx tmtools:tm2:deploy -s ~/tm1-transformation-directory
```

_See code: [src/commands/tmtools/tm2/deploy.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v1.0.0/src/commands/tmtools/tm2/deploy.ts)_

## `sfdx tmtools:tm2:deploysharing -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm2:deploysharing -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         (required) [default: .] TODO: Write
                                                                                    Description

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm2:deploysharing
  $ sfdx tmtools:tm2:deploysharing -s ~/tm2-deployment-report-directory
```

_See code: [src/commands/tmtools/tm2/deploysharing.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v1.0.0/src/commands/tmtools/tm2/deploysharing.ts)_

## `sfdx tmtools:tm2:load -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] [--falcondebugdepth <number>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

TODO: Write Description

```
USAGE
  $ sfdx tmtools:tm2:load -s <directory> [--falcondebug <array>] [--falcondebugerror] [--falcondebugsuccess] 
  [--falcondebugdepth <number>] [--json] [--loglevel 
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -s, --sourcedir=sourcedir                                                         (required) [default: .] TODO: Write
                                                                                    Description

  --falcondebug=falcondebug                                                         [default: ] List of debug namespaces
                                                                                    which should render output

  --falcondebugdepth=falcondebugdepth                                               [default: 2] Sets the depth of
                                                                                    object inspection when debug output
                                                                                    is displayed

  --falcondebugerror                                                                Display extended information for
                                                                                    uncaught Errors

  --falcondebugsuccess                                                              Display extended information upon
                                                                                    successful command completion

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx tmtools:tm2:load
  $ sfdx tmtools:tm2:load -s ~/tm1-transformation-directory
```

_See code: [src/commands/tmtools/tm2/load.ts](https://github.com/sfdx-isv/territory-management-tools/blob/v1.0.0/src/commands/tmtools/tm2/load.ts)_
<!-- commandsstop -->


## Questions/Comments

To report bugs or request new features, [create an issue](/issues) in this repository.

## Acknowledgements

* This plugin was created by **Vivek M. Chawla** [LinkedIn](https://www.linkedin.com/in/vivekmchawla/) | [Twitter](https://twitter.com/VivekMChawla)
* Key portions have been adopted from the [SFDX-Falcon Plugin](https://github.com/sfdx-isv/sfdx-falcon)

## License

The TM-Tools Plugin is made available under the MIT License - see the [LICENSE](LICENSE) file for details.
