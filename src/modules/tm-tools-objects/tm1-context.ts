//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/tm1-context.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Models the entirety of an exported set of TM1 data, including helpful transforms.
 * @description   Models the entirety of an exported set of TM1 data, including helpful transforms.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
import {fs}         from  '@salesforce/core'; // ???
import * as path    from  'path';             // Node's path library.
import * as convert from  'xml-js';           // Convert XML text to Javascript object / JSON text (and vice versa).

// Import Internal Modules
import {SfdxFalconDebug}              from  '../sfdx-falcon-debug';       // Class. Specialized debug provider for SFDX-Falcon code.
import {SfdxFalconError}              from  '../sfdx-falcon-error';       // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {parseFile}                    from  '../sfdx-falcon-util/csv';    // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {createDeveloperName}          from  '../sfdx-falcon-util/mdapi';  // Function. Given any string, returns a transformed version of that string that is compatible with the Salesforce Developer Name / Full Name conventions.

// Import TM-Tools Types
import {AccountShareRecords}          from  '../tm-tools-types';   // Type. Represents an array of AccountShare Records.
import {AtaRuleDevNamesByRuleId}      from  '../tm-tools-types';   // Type. Represents a map of AccountTerritoryAssignmentRule Developer Names by Rule ID.
import {AtaRuleItemRecords}           from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRuleItem Records.
import {AtaRuleItemRecordsByRuleId}   from  '../tm-tools-types';   // Type. Represents a map of an array of AccountTerritoryAssignmentRuleItem Records by Rule ID.
import {AtaRuleRecord}                from  '../tm-tools-types';   // Interface. Represents an AccountTerritoryAssignmentRule Record.
import {AtaRuleRecords}               from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRule Records.
import {AtaRuleRecordsById}           from  '../tm-tools-types';   // Type. Represents a map of AccountTerritoryAssignmentRule Records by Rule ID.
import {AtaRuleRecordsByTerritoryId}  from  '../tm-tools-types';   // Type. Represents a map of an array of AccountTerritoryAssignmentRule Records by Territory ID.
import {FilterItem}                   from  '../tm-tools-types';   // Interface. Represents a single filter item. Usually used as part an array of Filter Items.
import {SharingGroup}                 from  '../tm-tools-types';   // Interface. Represents a Sharing Group inside Salesforce.
import {SharingRules}                 from  '../tm-tools-types';   // Interface. Represents a collection of Criteria, Ownership, and Territory-based Sharing Rules
import {TerritoryRecord}              from  '../tm-tools-types';   // Interface. Represents a Territory Record.
import {TerritoryRecords}             from  '../tm-tools-types';   // Type. Represents an array of Territory Records.
import {TerritoryRecordsById}         from  '../tm-tools-types';   // Type. Represents a map of Territory Records by Territory ID.
import {TM1AnalysisReport}            from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Analysis Report.
import {TM1ContextValidation}         from  '../tm-tools-types';   // Interface. Represents the structure of the return value of the Tm1Context.validate() function.
import {TM1FilePaths}                 from  '../tm-tools-types';   // Interface. Represents the complete suite of CSV and Metadata file paths required to create a TM1 Context.
import {UserTerritoryRecords}         from  '../tm-tools-types';   // Type. Represents an array of UserTerritory Records.

// Set the File Local Debug Namespace
const dbgNs = 'MODULE:tm1-context:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Tm1Context
 * @description Models the entirety of an exported set of TM1 data, including helpful transforms.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Tm1Context {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepare
   * @param       {string} exportedMetadataPath
   * @param       {string} exportedRecordDataPath
   * @returns     {Promise<Tm1Context>} A fully-populated "Territory Management
   *              1.0 Context" object.
   * @description Given the paths to exported TM1 metadata and record data,
   *              performs a number of import and transformation operations.
   *              The end result is a fully-populated "Territory Management 1.0
   *              Context" which can be used to create an "import deployment"
   *              for a TM2 org.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async prepare(exportedMetadataPath:string, exportedRecordDataPath:string):Promise<Tm1Context> {

    const tm1Context = new Tm1Context(exportedMetadataPath, exportedRecordDataPath);
    await tm1Context.parseCsvFiles();
    await tm1Context.transformCsvFiles();
    await tm1Context.parseXmlFiles();
    tm1Context._prepared = true;
    return tm1Context;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      validate
   * @param       {TM1AnalysisReport} tm1AnalysisReport Required. The TM1
   *              analysis that was the basis for extraction.
   * @param       {string}  tm1MetadataDir  Required. Path to location of
   *              extracted TM1 metadata.
   * @param       {string}  tm1DataDir  Required. Path to location of extracted
   *              TM1 data.
   * @description Given a TM1 Analysis object AND the paths to extracted TM1
   *              metadata and record data, checks to make sure that the
   *              extracted files match what was expected by the TM1 Analysis.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async validate(tm1AnalysisReport:TM1AnalysisReport, tm1MetadataDir:string, tm1DataDir:string):Promise<TM1ContextValidation> {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}validate:arguments:`, arguments);

    // Create a new TM1 Context object and Parse the CSV and XML Files.
    const tm1Context = new Tm1Context(tm1MetadataDir, tm1DataDir);
    await tm1Context.parseCsvFiles();
    await tm1Context.parseXmlFiles();

    // Compare the counts from the parsed CSV files to what the TM1 Analysis expects.
    const tm1ContextValidation:TM1ContextValidation = {
      records: {
        extractedTerritoryRecords:      tm1Context._territoryRecords,
        extractedAtaRuleRecords:        tm1Context._ataRuleRecords,
        extractedAtaRuleItemRecords:    tm1Context._ataRuleItemRecords,
        extractedUserTerritoryRecords:  tm1Context._userTerritoryRecords,
        extractedAccountShareRecords:   tm1Context._accountShareRecords
      },
      expectedRecordCounts: {
        territoryRecordCount:       tm1AnalysisReport.tm1RecordCounts.territoryRecordCount,
        ataRuleRecordCount:         tm1AnalysisReport.tm1RecordCounts.ataRuleRecordCount,
        ataRuleItemRecordCount:     tm1AnalysisReport.tm1RecordCounts.ataRuleItemRecordCount,
        userTerritoryRecordCount:   tm1AnalysisReport.tm1RecordCounts.userTerritoryRecordCount,
        accountShareRecordCount:    tm1AnalysisReport.tm1RecordCounts.accountShareRecordCount,
        sharingCriteriaRuleCount:   tm1AnalysisReport.tm1RecordCounts.sharingCriteriaRuleCount,
        sharingOwnerRuleCount:      tm1AnalysisReport.tm1RecordCounts.sharingOwnerRuleCount,
        sharingTerritoryRuleCount:  tm1AnalysisReport.tm1RecordCounts.sharingTerritoryRuleCount
      },
      actualRecordCounts: {
        territoryRecordCount:       tm1Context._territoryRecords.length,
        ataRuleRecordCount:         tm1Context._ataRuleRecords.length,
        ataRuleItemRecordCount:     tm1Context._ataRuleItemRecords.length,
        userTerritoryRecordCount:   tm1Context._userTerritoryRecords.length,
        accountShareRecordCount:    tm1Context._accountShareRecords.length,
        sharingCriteriaRuleCount:   -1, // NOT_IMPLEMENTED
        sharingOwnerRuleCount:      -1, // NOT_IMPLEMENTED
        sharingTerritoryRuleCount:  -1  // NOT_IMPLEMENTED
      },
      status: {
        territoryExtractionIsValid:     (tm1AnalysisReport.tm1RecordCounts.territoryRecordCount     === tm1Context._territoryRecords.length),
        ataRuleExtractionIsValid:       (tm1AnalysisReport.tm1RecordCounts.ataRuleRecordCount       === tm1Context._ataRuleRecords.length),
        ataRuleItemExtractionIsValid:   (tm1AnalysisReport.tm1RecordCounts.ataRuleItemRecordCount   === tm1Context._ataRuleItemRecords.length),
        userTerritoryExtractionIsValid: (tm1AnalysisReport.tm1RecordCounts.userTerritoryRecordCount === tm1Context._userTerritoryRecords.length),
        accountShareExtractionIsValid:  (tm1AnalysisReport.tm1RecordCounts.accountShareRecordCount  === tm1Context._accountShareRecords.length)
      }
    };

    // DEBUG
    SfdxFalconDebug.obj(`${dbgNs}validate:tm1ContextValidation:`, tm1ContextValidation);

    // Send the TM1 Context Validation back to the caller.
    return tm1ContextValidation;
  }

  // Private Members
  private _accountShareRecords:         AccountShareRecords;
  private _accountSharingRules:         SharingRules;
  private _ataRuleRecords:              AtaRuleRecords;
  private _ataRuleItemRecords:          AtaRuleItemRecords;
  private _ataRuleRecordsById:          AtaRuleRecordsById;
  private _ataRuleRecordsByTerritoryId: AtaRuleRecordsByTerritoryId;
  private _ataRuleItemRecordsByRuleId:  AtaRuleItemRecordsByRuleId;
  private _ataRuleDevNamesByRuleId:     AtaRuleDevNamesByRuleId;
  private _leadSharingRules:            SharingRules;
  private _opportunitySharingRules:     SharingRules;
  private _territoryRecords:            TerritoryRecords;
  private _territoryRecordsById:        TerritoryRecordsById;
  private _tm1FilePaths:                TM1FilePaths;
  private _userTerritoryRecords:        UserTerritoryRecords;
  private _prepared:                    boolean;

  
  // Public Accessors
  public get accountShareRecords()          { return this.contextIsPrepared() ? this._accountShareRecords : undefined; }
  public get accountSharingRules()          { return this.contextIsPrepared() ? this._accountSharingRules : undefined; }
  public get ataRuleRecords()               { return this.contextIsPrepared() ? this._ataRuleRecords : undefined; }
  public get ataRuleRecordsById()           { return this.contextIsPrepared() ? this._ataRuleRecordsById : undefined; }
  public get ataRuleRecordsByTerritoryId()  { return this.contextIsPrepared() ? this._ataRuleRecordsByTerritoryId : undefined; }
  public get ataRuleItemRecords()           { return this.contextIsPrepared() ? this._ataRuleItemRecords : undefined; }
  public get ataRuleItemRecordsByRuleId()   { return this.contextIsPrepared() ? this._ataRuleItemRecordsByRuleId : undefined; }
  public get ataRuleDevNamesByRuleId()      { return this.contextIsPrepared() ? this._ataRuleDevNamesByRuleId : undefined; }
  public get leadSharingRules()             { return this.contextIsPrepared() ? this._leadSharingRules : undefined; }
  public get opportunitySharingRules()      { return this.contextIsPrepared() ? this._opportunitySharingRules : undefined; }
  public get territoryRecords()             { return this.contextIsPrepared() ? this._territoryRecords : undefined; }
  public get territoryRecordsById()         { return this.contextIsPrepared() ? this._territoryRecordsById : undefined; }
  public get tm1FilePaths()                 { return this._tm1FilePaths; }
  public get userTerritoryRecords()         { return this.contextIsPrepared() ? this._userTerritoryRecords : undefined; }
  public get prepared()                     { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Tm1Context
   * @param       {string} exportedMetadataPath
   * @param       {string} exportedRecordDataPath
   * @description Given the paths to exported TM1 metadata and record data,
   *              performs a number of import and transformation operations.
   *              The end result is a fully-populated "Territory Management 1.0
   *              Context" which can be used to prepare an "import deployment"
   *              for a TM2 org.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private constructor(exportedMetadataPath:string, exportedRecordDataPath:string) {

    // Define the expected TM1 file paths.
    this._tm1FilePaths = {
      accountShareCsv:  path.join(exportedRecordDataPath, 'AccountShare.csv'),
      ataRuleCsv:       path.join(exportedRecordDataPath, 'AccountTerritoryAssignmentRule.csv'),
      ataRuleItemCsv:   path.join(exportedRecordDataPath, 'AccountTerritoryAssignmentRuleItem.csv'),
      territoryCsv:     path.join(exportedRecordDataPath, 'Territory.csv'),
      userTerritoryCsv: path.join(exportedRecordDataPath, 'UserTerritory.csv'),
      tm1MetadataDir:   path.join(exportedMetadataPath,   'unpackaged')
    };

    // Initialize Maps
    this._territoryRecordsById        = new Map<string, TerritoryRecord>();
    this._ataRuleRecordsById          = new Map<string, AtaRuleRecord>();
    this._ataRuleRecordsByTerritoryId = new Map<string, AtaRuleRecords>();
    this._ataRuleItemRecordsByRuleId  = new Map<string, AtaRuleItemRecords>();
    this._ataRuleDevNamesByRuleId     = new Map<string, string>();

    // Initialize Arrays
    this._accountSharingRules = {
      sharingCriteriaRules:   [],
      sharingOwnerRules:      [],
      sharingTerritoryRules:  []
    };
    this._leadSharingRules = {
      sharingCriteriaRules:   [],
      sharingOwnerRules:      [],
      sharingTerritoryRules:  []
    };
    this._opportunitySharingRules = {
      sharingCriteriaRules:   [],
      sharingOwnerRules:      [],
      sharingTerritoryRules:  []
    };

    // Mark this as an UNPREPARED context
    this._prepared = false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      addAtaRuleDeveloperName
   * @param       {ataRuleRecord} ataRuleRecord Required.
   * @return      {string}  The final Developer Named for the ATA Rule Record.
   * @description Given an ATA Rule Record, determines an appropriate and valid
   *              Developer Name, ensures that Developer Name is unique within
   *              the current context, the saves that name to a map that's keyed
   *              by the ATA Rule ID.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private addAtaRuleDeveloperName(ataRuleRecord:AtaRuleRecord):string {
    
    // Convert the ATA Rule's Name to a Developer Name.
    const baseDevName = createDeveloperName(ataRuleRecord.Name);
    let   newDevName  = baseDevName;

    // Make sure that this Developer Name is NOT already in use
    const devNameMaxLength  = 80;
    let   counter           = 2;
    while (this.matchAtaRuleDeveloperName(newDevName)) {
      const counterString = counter.toString();
      newDevName = baseDevName.substring(0, devNameMaxLength-counterString.length) + counterString;
      counter += 1;
    }

    // Add the new Developer Name to the Map.
    this._ataRuleDevNamesByRuleId.set(ataRuleRecord.Id, newDevName);

    // Done! Return the new Dev Name (in case anyone cares).
    return newDevName;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      addAtaRuleToTerritoryGroup
   * @param       {ataRuleRecord} ataRuleRecord Required.
   * @return      {AtaRuleRecords}  The array of ATA Rule Records that are
   *              associated with the Territory that the ATA Rule Record we
   *              were given is associated with.
   * @description Given an ATA Rule Record, find out what Territory it belongs
   *              to, then add it to the matching Array of ATA Rule Records in
   *              the ATA Rule Records by Territory ID map. Return the Array
   *              just in case the caller needs it.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private addAtaRuleToTerritoryGroup(ataRuleRecord:AtaRuleRecord):AtaRuleRecords {
    
    // See if there is already an Array of ATA Rule Records for this Rule's associated Territory.
    let ataRuleRecords = this._ataRuleRecordsByTerritoryId.get(ataRuleRecord.TerritoryId);

    // If it's not already an array, initialize one and add it to the Map.
    if (Array.isArray(ataRuleRecords) !== true) {
      ataRuleRecords = [] as AtaRuleRecords;
      this._ataRuleRecordsByTerritoryId.set(ataRuleRecord.TerritoryId, ataRuleRecords);
    }

    // Add the incoming ATA Rule Record to the array.
    ataRuleRecords.push(ataRuleRecord);

    // Return the array in case the caller needs it. (they probably won't)
    return ataRuleRecords;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      contextIsPrepared
   * @return      {boolean}
   * @description Returns true if the context is prepared, throws error otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private contextIsPrepared():boolean {
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `TM1 Context members are not accessible until the context is prepared`
                                , `ContextNotPrepared`
                                , `${dbgNs}contextIsPrepared`);
    }
    else {
      return this._prepared;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      matchAtaRuleDeveloperName
   * @param       {string} devNameToMatch Required.
   * @return      {boolean} TRUE if a match was found. FALSE if not.
   * @description Given a string, searches the list of values in this object's
   *              _ataRuleDevNamesByRuleId Map, returning TRUE if a matching
   *              name was found and FALSE if not.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private matchAtaRuleDeveloperName(devNameToMatch:string):boolean {
    for (const devName of this._ataRuleDevNamesByRuleId.values()) {
      if (devName === devNameToMatch) {
        return true;
      }
    }
    return false;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      parseCsvFiles
   * @return      {Promise<void>}
   * @description Returns true if the context is prepared, throws error otherwise.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async parseCsvFiles():Promise<void> {
    this._accountShareRecords   = await parseFile(this._tm1FilePaths.accountShareCsv);
    this._ataRuleRecords        = await parseFile(this._tm1FilePaths.ataRuleCsv);
    this._ataRuleItemRecords    = await parseFile(this._tm1FilePaths.ataRuleItemCsv);
    this._territoryRecords      = await parseFile(this._tm1FilePaths.territoryCsv);
    this._userTerritoryRecords  = await parseFile(this._tm1FilePaths.userTerritoryCsv);

    // DEBUG
    SfdxFalconDebug.obj(
      `${dbgNs}parseCsvFiles:parseResults:`,
      {
        _territoryRecords:      this._territoryRecords,
        _ataRuleRecords:        this._ataRuleRecords,
        _ataRuleItemRecords:    this._ataRuleItemRecords,
        _userTerritoryRecords:  this._userTerritoryRecords,
        _accountShareRecords:   this._accountShareRecords
      }
    );
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      parseXmlFiles
   * @return      {Promise<void>}
   * @description Returns true if the context is prepared, throws error otherwise.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async parseXmlFiles():Promise<void> {

    // Read Account, Lead, and Opportunity SharingRules XML
    const accountSharingRulesXml = await fs.readFile(path.join(this._tm1FilePaths.tm1MetadataDir, 'sharingRules', 'Account.sharingRules'), 'utf8')
    .catch(asrFileReadError => {
      SfdxFalconDebug.obj(`${dbgNs}parseXmlFiles:asrFileReadError:`, asrFileReadError);
      return undefined;
    }) as string;
    const leadSharingRulesXml = await fs.readFile(path.join(this._tm1FilePaths.tm1MetadataDir, 'sharingRules', 'Lead.sharingRules'), 'utf8')
    .catch(lsrFileReadError => {
      SfdxFalconDebug.obj(`${dbgNs}parseXmlFiles:lsrFileReadError:`, lsrFileReadError);
      return undefined;
    }) as string;
    const opportunitySharingRulesXml = await fs.readFile(path.join(this._tm1FilePaths.tm1MetadataDir, 'sharingRules', 'Opportunity.sharingRules'), 'utf8')
    .catch(osrFileReadError => {
      SfdxFalconDebug.obj(`${dbgNs}parseXmlFiles:osrFileReadError:`, osrFileReadError);
      return undefined;
    }) as string;

    // Parse Account SharingRules XML and make note of any rules that reference "Territory" or "Territory and Subordinates" groups.
    if (accountSharingRulesXml) {
      this._accountSharingRules = this.parseSharingRulesFromXml(accountSharingRulesXml);
      SfdxFalconDebug.obj(`${dbgNs}parseXmlFiles:this._accountSharingRules:`, this._accountSharingRules);
    }

    // Parse Lead SharingRules XML and make note of any rules that reference "Territory" or "Territory and Subordinates" groups.
    if (leadSharingRulesXml) {
      this._leadSharingRules = this.parseSharingRulesFromXml(leadSharingRulesXml);
      SfdxFalconDebug.obj(`${dbgNs}parseXmlFiles:this._leadSharingRules:`, this._leadSharingRules);
    }

    // Parse Opportunity SharingRules XML and make note of any rules that reference "Territory" or "Territory and Subordinates" groups.
    if (opportunitySharingRulesXml) {
      this._opportunitySharingRules = this.parseSharingRulesFromXml(opportunitySharingRulesXml);
      SfdxFalconDebug.obj(`${dbgNs}parseXmlFiles:this._opportunitySharingRules:`, this._opportunitySharingRules);
    }

    // DEBUG
    SfdxFalconDebug.obj(
      `${dbgNs}parseXmlFiles:parseResults:`,
      {
        accountSharingRules:     this._accountSharingRules,
        leadSharingRules:        this._leadSharingRules,
        opportunitySharingRules: this._opportunitySharingRules
      }
    );
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      transformCsvFiles
   * @return      {Promise<void>}
   * @description Returns true if the transformations are successful, throws
   *              error otherwise.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async transformCsvFiles():Promise<void> {

    // Build TerritoryRecordsById Map.
    for (const territoryRecord of this._territoryRecords) {
      this._territoryRecordsById.set(territoryRecord.Id, territoryRecord);
    }

    // Build AtaRuleRecordsById Map.
    for (const ataRuleRecord of this._ataRuleRecords) {
      this._ataRuleRecordsById.set(ataRuleRecord.Id, ataRuleRecord);

      // Create and store a Developer Name for this ATA rule.
      this.addAtaRuleDeveloperName(ataRuleRecord);

      // Add this Rule Record to the appropriate map of of ATA Rules by Territory ID.
      this.addAtaRuleToTerritoryGroup(ataRuleRecord);

      // Build a group of the ATA Rule Item records related to the current ATA Rule.
      const ataRuleItemRecords = [] as AtaRuleItemRecords;
      for (const ataRuleItemRecord of this._ataRuleItemRecords) {
        if (ataRuleItemRecord.RuleId === ataRuleRecord.Id) {
          ataRuleItemRecords.push(ataRuleItemRecord);
        }
      }

      // Add the group of related ATA Rule Item records to the AtaRuleItemRecordsByRuleId Map.
      this._ataRuleItemRecordsByRuleId.set(ataRuleRecord.Id, ataRuleItemRecords);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      parseSharingRulesFromXml
   * @param       {string}  sharingRulesXml
   * @return      {SharingRules}
   * @description Given
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private parseSharingRulesFromXml(sharingRulesXml:string):SharingRules {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}parseSharingRulesFromXml:arguments:`, arguments);

    // Validate sharingRulesXml.
    if (typeof sharingRulesXml !== 'string' || sharingRulesXml === '') {
      throw new SfdxFalconError( `Expected sharingRulesXml to be a non-empty string but got type '${typeof sharingRulesXml}' instead.`
                               , `TypeError`
                               , `${dbgNs}parseSharingRulesFromXml`);
    }

    // Initialize the return value.
    const parsedSharingRules:SharingRules = {
      sharingCriteriaRules: [],
      sharingOwnerRules: [],
      sharingTerritoryRules: []
    };

    // Set options for the XML to JS Object conversion
    const xml2jsOptions = {
      compact:          true,
      nativeType:       true,
      ignoreAttributes: true,
      alwaysArray:      false
    } as convert.Options.XML2JS;

    // Convert the Sharing Rules XML into JSON.
    const sharingRulesJson = convert.xml2js(sharingRulesXml, xml2jsOptions);
    SfdxFalconDebug.obj(`${dbgNs}parseSharingRulesFromXml:sharingRulesJson:`, sharingRulesJson);

    // Focus on just the SharingRules key.
    const sharingRules = sharingRulesJson['SharingRules'];

    // Make sure there actually was a SharingRules key.
    if (typeof sharingRules !== 'object') {
      throw new SfdxFalconError( `Expected Sharing Rules XML to JSON conversion to yield a sharingRules object but got type '${typeof sharingRules}' instead.`
                               , `Xml2JsonParsingError`
                               , `${dbgNs}parseSharingRulesFromXml`);
    }

    // Write a function to test whether a Sharing Rule references "Territory" or "Territory and Subordinates" groups.
    const isTerritoryRelated = (sharingRuleToTest:object):boolean => {
      SfdxFalconDebug.debugObject(`${dbgNs}parseSharingRulesFromXml:isTerritoryRelated:sharingRuleToTest:`, sharingRuleToTest);
      return (
        (
          typeof sharingRuleToTest === 'object' && sharingRuleToTest['sharedTo']
            &&
          (
            (sharingRuleToTest['sharedTo']['territory'] || sharingRuleToTest['sharedTo']['territoryAndSubordinates'])
          )
        )
          ||
        (
          typeof sharingRuleToTest === 'object' && sharingRuleToTest['sharedFrom']
            &&
          (
            (sharingRuleToTest['sharedFrom']['territory'] || sharingRuleToTest['sharedFrom']['territoryAndSubordinates'])
          )
        )
      );
    };

    // Write a function to extract the Shared From group from a Sharing Rule.
    const extractSharedFromGroup = (sharingRule:object):SharingGroup => {
      if (typeof sharingRule === 'object' && typeof sharingRule['sharedFrom'] === 'object') {
        return {
          groupType:    Object.keys(sharingRule['sharedFrom'])[0],
          groupMembers: sharingRule['sharedFrom'][Object.keys(sharingRule['sharedFrom'])[0]]['_text']
        };
      }
      else {
        return undefined;
      }
    };

    // Write a function to extract the Shared From group from a Sharing Rule.
    const extractSharedToGroup = (sharingRule:object):SharingGroup => {
      if (typeof sharingRule === 'object' && typeof sharingRule['sharedTo'] === 'object') {
        return {
          groupType:    Object.keys(sharingRule['sharedTo'])[0],
          groupMembers: sharingRule['sharedTo'][Object.keys(sharingRule['sharedTo'])[0]]['_text']
        };
      }
      else {
        return undefined;
      }
    };


    // Parse CRITERIA-based sharing rules.
    if (sharingRules['sharingCriteriaRules']) {

      // Normalize all results as an Array of CRITERIA-based sharing rules.
      let sharingCriteriaRules = sharingRules['sharingCriteriaRules'];
      if (Array.isArray(sharingCriteriaRules) !== true) {
        sharingCriteriaRules = sharingRules['sharingCriteriaRules'];
      }
      SfdxFalconDebug.debugObject(`${dbgNs}parseSharingRulesFromXml:sharingCriteriaRules:`, sharingCriteriaRules);

      // Iterate over the array of CRITERIA-based sharing rules and extract any that reference "Territory" or "Territory and Subordinates" groups.
      for (const sharingCriteriaRule of sharingCriteriaRules) {
        if (isTerritoryRelated(sharingCriteriaRule)) {

          // Extract the Criteria Items
          const criteriaItems:FilterItem[] = [];

          // Normalize all criteria items as an Array.
          let   criteriaItemsJson = sharingCriteriaRule['criteriaItems'];
          if (Array.isArray(criteriaItemsJson) !== true) {
            criteriaItemsJson = [criteriaItemsJson];
          }
          for (const criteriaItemJson of criteriaItemsJson) {
            criteriaItems.push({
              field:      criteriaItemJson['field']       ? criteriaItemJson['field']['_text']      : undefined,
              operation:  criteriaItemJson['operation']   ? criteriaItemJson['operation']['_text']  : undefined,
              value:      criteriaItemJson['value']       ? criteriaItemJson['value']['_text']      : undefined,
              valueField: criteriaItemJson['valueField']  ? criteriaItemJson['valueField']['_text'] : undefined
            });
          }

          // Create a SharingCriteriaRule object literal and add it to the Sharing Criteria Rules array.
          parsedSharingRules.sharingCriteriaRules.push({
            fullName:     sharingCriteriaRule['fullName']     ? sharingCriteriaRule['fullName']['_text']    : undefined,
            accessLevel:  sharingCriteriaRule['accessLevel']  ? sharingCriteriaRule['accessLevel']['_text'] : undefined,
            accountSettings: {
              caseAccessLevel:        (sharingCriteriaRule['accountSettings'] && sharingCriteriaRule['accountSettings']['caseAccessLevel'])         ? sharingCriteriaRule['accountSettings']['caseAccessLevel']['_text']        : undefined,
              contactAccessLevel:     (sharingCriteriaRule['accountSettings'] && sharingCriteriaRule['accountSettings']['contactAccessLevel'])      ? sharingCriteriaRule['accountSettings']['contactAccessLevel']['_text']     : undefined,
              opportunityAccessLevel: (sharingCriteriaRule['accountSettings'] && sharingCriteriaRule['accountSettings']['opportunityAccessLevel'])  ? sharingCriteriaRule['accountSettings']['opportunityAccessLevel']['_text'] : undefined
            },
            description:   sharingCriteriaRule['description']   ? sharingCriteriaRule['description']['_text']     : undefined,
            label:          sharingCriteriaRule['label']          ? sharingCriteriaRule['label']['_text']         : undefined,
            sharedTo:       extractSharedToGroup(sharingCriteriaRule),
            booleanFilter:  sharingCriteriaRule['booleanFilter']  ? sharingCriteriaRule['booleanFilter']['_text'] : undefined,
            criteriaItems:  criteriaItems
          });
        }
      }
      SfdxFalconDebug.obj(`${dbgNs}parseSharingRulesFromXml:parsedSharingCriteriaRules`, parsedSharingRules.sharingCriteriaRules);
    }

    // Parse OWNER-based sharing rules.
    if (sharingRules['sharingOwnerRules']) {

      // Normalize all results as an Array of OWNER-based sharing rules.
      let sharingOwnerRules = sharingRules['sharingOwnerRules'];
      if (Array.isArray(sharingOwnerRules) !== true) {
        sharingOwnerRules = [sharingOwnerRules];
      }
      SfdxFalconDebug.debugObject(`${dbgNs}parseSharingRulesFromXml:sharingOwnerRules:`, sharingOwnerRules);

      // Iterate over the array of OWNER-based sharing rules and extract any that reference "Territory" or "Territory and Subordinates" groups.
      for (const sharingOwnerRule of sharingOwnerRules) {
        if (isTerritoryRelated(sharingOwnerRule)) {
          parsedSharingRules.sharingOwnerRules.push({
            fullName:     sharingOwnerRule['fullName']     ? sharingOwnerRule['fullName']['_text']    : undefined,
            accessLevel:  sharingOwnerRule['accessLevel']  ? sharingOwnerRule['accessLevel']['_text'] : undefined,
            accountSettings: {
              caseAccessLevel:        (sharingOwnerRule['accountSettings'] && sharingOwnerRule['accountSettings']['caseAccessLevel'])         ? sharingOwnerRule['accountSettings']['caseAccessLevel']['_text']        : undefined,
              contactAccessLevel:     (sharingOwnerRule['accountSettings'] && sharingOwnerRule['accountSettings']['contactAccessLevel'])      ? sharingOwnerRule['accountSettings']['contactAccessLevel']['_text']     : undefined,
              opportunityAccessLevel: (sharingOwnerRule['accountSettings'] && sharingOwnerRule['accountSettings']['opportunityAccessLevel'])  ? sharingOwnerRule['accountSettings']['opportunityAccessLevel']['_text'] : undefined
            },
            description:    sharingOwnerRule['description']   ? sharingOwnerRule['description']['_text']    : undefined,
            label:          sharingOwnerRule['label']         ? sharingOwnerRule['label']['_text']          : undefined,
            sharedFrom:     extractSharedFromGroup(sharingOwnerRule),
            sharedTo:       extractSharedToGroup(sharingOwnerRule),
            booleanFilter:  sharingOwnerRule['booleanFilter'] ? sharingOwnerRule['booleanFilter']['_text']  : undefined
          });
        }
      }
      SfdxFalconDebug.obj(`${dbgNs}parseSharingRulesFromXml:parsedSharingOwnerRules`, parsedSharingRules.sharingOwnerRules);
    }

    // Parse TERRITORY-based sharing rules.
    if (sharingRules['sharingTerritoryRules']) {

      // Normalize all results as an Array of TERRITORY-based sharing rules.
      let sharingTerritoryRules = sharingRules['sharingTerritoryRules'];
      if (Array.isArray(sharingTerritoryRules) !== true) {
        sharingTerritoryRules = [sharingTerritoryRules];
      }
      SfdxFalconDebug.debugObject(`${dbgNs}parseSharingRulesFromXml:sharingTerritoryRules:`, sharingTerritoryRules);

      // Iterate over the array of TERRITORY-based sharing rules and extract any that reference "Territory" or "Territory and Subordinates" groups.
      for (const sharingTerritoryRule of sharingTerritoryRules) {
        if (isTerritoryRelated(sharingTerritoryRule)) {
          parsedSharingRules.sharingTerritoryRules.push({
            fullName:     sharingTerritoryRule['fullName']     ? sharingTerritoryRule['fullName']['_text']    : undefined,
            accessLevel:  sharingTerritoryRule['accessLevel']  ? sharingTerritoryRule['accessLevel']['_text'] : undefined,
            accountSettings: {
              caseAccessLevel:        (sharingTerritoryRule['accountSettings'] && sharingTerritoryRule['accountSettings']['caseAccessLevel'])         ? sharingTerritoryRule['accountSettings']['caseAccessLevel']['_text']        : undefined,
              contactAccessLevel:     (sharingTerritoryRule['accountSettings'] && sharingTerritoryRule['accountSettings']['contactAccessLevel'])      ? sharingTerritoryRule['accountSettings']['contactAccessLevel']['_text']     : undefined,
              opportunityAccessLevel: (sharingTerritoryRule['accountSettings'] && sharingTerritoryRule['accountSettings']['opportunityAccessLevel'])  ? sharingTerritoryRule['accountSettings']['opportunityAccessLevel']['_text'] : undefined
            },
            description:    sharingTerritoryRule['description']   ? sharingTerritoryRule['description']['_text']    : undefined,
            label:          sharingTerritoryRule['label']         ? sharingTerritoryRule['label']['_text']          : undefined,
            sharedFrom:     extractSharedFromGroup(sharingTerritoryRule),
            sharedTo:       extractSharedToGroup(sharingTerritoryRule),
            booleanFilter:  sharingTerritoryRule['booleanFilter'] ? sharingTerritoryRule['booleanFilter']['_text']  : undefined
          });
        }
      }
      SfdxFalconDebug.obj(`${dbgNs}parseSharingRulesFromXml:parsedSharingTerritoryRules`, parsedSharingRules.sharingTerritoryRules);
    }

    // Send back the parsed Sharing Rules.
    return parsedSharingRules;
  }
}
