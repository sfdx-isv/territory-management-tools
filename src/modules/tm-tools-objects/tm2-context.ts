//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/tm-tools-objects/tm2-context.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Models the entirety of a transformed set of TM2 data, including intermediate data.
 * @description   Models the entirety of a transformed set of TM2 data, including intermediate data.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries & Modules
import  {JsonMap}         from  '@salesforce/ts-types'; // Any JSON-compatible object.
//import {fs}         from  '@salesforce/core'; // File System utility from the Core SFDX library.
//import * as path    from  'path';             // Node's path library.

// Import Internal Libraries
import  * as csv                        from  '../sfdx-falcon-util/csv';  // ???

// Import Internal Classes & Functions
import  {SfdxFalconDebug}               from  '../sfdx-falcon-debug';       // Class. Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}               from  '../sfdx-falcon-error';       // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
//import {createDeveloperName}            from  '../sfdx-falcon-util/mdapi';  // Function. Given any string, returns a transformed version of that string that is compatible with the Salesforce Developer Name / Full Name conventions.
import  TmFilePaths                     from  '../tm-tools-objects/tm-file-paths';  // Class. Utility for generatig File Paths required by various TM-Tools commands.

// Import TM-Tools Types
import {SObjectRecordId}                from  '../tm-tools-types';    // Type. Represents an SObject Record ID.
//import {AccountShareRecords}            from  '../tm-tools-types';   // Type. Represents an array of AccountShare Records.
//import {AtaRuleDevNamesByRuleId}        from  '../tm-tools-types';   // Type. Represents a map of AccountTerritoryAssignmentRule Developer Names by Rule ID.
//import {AtaRuleItemRecords}             from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRuleItem Records.
//import {AtaRuleItemRecordsByRuleId}     from  '../tm-tools-types';   // Type. Represents a map of an array of AccountTerritoryAssignmentRuleItem Records by Rule ID.
//import {AtaRuleRecord}                  from  '../tm-tools-types';   // Interface. Represents an AccountTerritoryAssignmentRule Record.
//import {AtaRuleRecords}                 from  '../tm-tools-types';   // Type. Represents an array of AccountTerritoryAssignmentRule Records.
//import {AtaRuleRecordsById}             from  '../tm-tools-types';   // Type. Represents a map of AccountTerritoryAssignmentRule Records by Rule ID.
//import {AtaRuleRecordsByTerritoryId}    from  '../tm-tools-types';   // Type. Represents a map of an array of AccountTerritoryAssignmentRule Records by Territory ID.
//import {FilterItem}                     from  '../tm-tools-types';   // Interface. Represents a single filter item. Usually used as part an array of Filter Items.
//import {SharingGroup}                   from  '../tm-tools-types';   // Interface. Represents a Sharing Group inside Salesforce.
//import {SharingRulesJson}               from  '../tm-tools-types';   // Interface. Represents a collection of Criteria, Ownership, and Territory-based Sharing Rules
//import {TerritoryRecord}                from  '../tm-tools-types';   // Interface. Represents a Territory Record.
//import {TerritoryRecords}               from  '../tm-tools-types';   // Type. Represents an array of Territory Records.
//import {TerritoryRecordsById}           from  '../tm-tools-types';   // Type. Represents a map of Territory Records by Territory ID.
//import {TM1AnalysisReport}              from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Analysis Report.
//import {TM1ContextValidation}           from  '../tm-tools-types';   // Interface. Represents the structure of the return value of the Tm1Context.validate() function.
//import {UserTerritoryRecords}           from  '../tm-tools-types';   // Type. Represents an array of UserTerritory Records.


import {ObjectTerritory2AssociationRecords} from  '../tm-tools-types';   // ???
import {Territory2Record}                   from  '../tm-tools-types';   // Interface. Represents a Territory2 Record.
import {Territory2Records}                  from  '../tm-tools-types';   // Type. Represents an array of Territory2 Records.
import {Territory2RecordsByDevName}         from  '../tm-tools-types';   // ???
import {Territory2RecordsById}              from  '../tm-tools-types';   // ???
import {TerritoryDevNameMapping}            from  '../tm-tools-types';   // ???
import {TerritoryDevNameMapByDevName}       from  '../tm-tools-types';   // ???
import {TerritoryDevNameMapById}            from  '../tm-tools-types';   // ???
import {TerritoryDevNameMappings}           from  '../tm-tools-types';   // ???
import {TM1TransformationReport}            from  '../tm-tools-types';   // Interface. Represents the data that is generated by a TM1 Transformation Report.
import {TMToolsAllFilePaths}                from  '../tm-tools-types';   // Type. Represents the complete suite of file paths required by ALL TM-Tools commands.
import {UserTerritory2AssociationRecords}   from  '../tm-tools-types';   // ???

// File-Global Variables.
const territory2RecordIdPrefix  = '0MI';

// Set the File Local Debug Namespace
const dbgNs = 'MODULE:tm2-context:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Tm2Context
 * @description Models the entirety of a transformed set of TM2 data, including intermediate data.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Tm2Context {

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      prepare
   * @param       {TM1TransformationReport} tm1TransformationReport Required.
   *              The results of the TM1 transformation command.
   * @param       {string}  baseDirectory Required.
   * @returns     {Promise<Tm2Context>} A fully-populated "Territory Management
   *              2.0 Context" object.
   * @description Given a set of TM1 Transform File Paths, performs a number of
   *              in-memory import and transformation operations. The end result
   *              is a fully-populated "Territory Management 2.0 Context" which
   *              can be used to operate deployments and data loads to a TM2 org.
   * @public @static @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public static async prepare(tm1TransformationReport:TM1TransformationReport, baseDirectory:string):Promise<Tm2Context> {
    const tm2FilePaths  = TmFilePaths.getAllTmToolsFilePaths(baseDirectory);
    const tm2Context    = new Tm2Context(tm1TransformationReport, tm2FilePaths);
    await tm2Context.parseCsvFiles();
    await tm2Context.buildRecordMaps();
    tm2Context._prepared = true;
    return tm2Context;
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
  /*
  public static async validate(tm1AnalysisReport:TM1AnalysisReport, tm1MetadataDir:string, tm1DataDir:string):Promise<TM1ContextValidation> {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}validate:arguments:`, arguments);

    // Create a new TM1 Context object and Parse the CSV and XML Files.
    const tm1Context = new Tm1Context(tm1AnalysisReport, tm1MetadataDir, tm1DataDir);
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
        accountShareRecordCount:    tm1AnalysisReport.tm1RecordCounts.accountShareRecordCount
      },
      actualRecordCounts: {
        territoryRecordCount:       tm1Context._territoryRecords.length,
        ataRuleRecordCount:         tm1Context._ataRuleRecords.length,
        ataRuleItemRecordCount:     tm1Context._ataRuleItemRecords.length,
        userTerritoryRecordCount:   tm1Context._userTerritoryRecords.length,
        accountShareRecordCount:    tm1Context._accountShareRecords.length
      },
      expectedMetadataCounts: {
        accountSharingRulesCount: {
          sharingCriteriaRulesCount:  tm1AnalysisReport.tm1MetadataCounts.accountSharingRulesCount.sharingCriteriaRulesCount,
          sharingOwnerRulesCount:     tm1AnalysisReport.tm1MetadataCounts.accountSharingRulesCount.sharingOwnerRulesCount,
          sharingTerritoryRulesCount: tm1AnalysisReport.tm1MetadataCounts.accountSharingRulesCount.sharingTerritoryRulesCount
        },
        leadSharingRulesCount: {
          sharingCriteriaRulesCount:  tm1AnalysisReport.tm1MetadataCounts.leadSharingRulesCount.sharingCriteriaRulesCount,
          sharingOwnerRulesCount:     tm1AnalysisReport.tm1MetadataCounts.leadSharingRulesCount.sharingOwnerRulesCount
        },
        opportunitySharingRulesCount: {
          sharingCriteriaRulesCount:  tm1AnalysisReport.tm1MetadataCounts.opportunitySharingRulesCount.sharingCriteriaRulesCount,
          sharingOwnerRulesCount:     tm1AnalysisReport.tm1MetadataCounts.opportunitySharingRulesCount.sharingOwnerRulesCount
        }
      },
      actualMetadataCounts: {
        accountSharingRulesCount: {
          sharingCriteriaRulesCount:  tm1Context._accountSharingRules.sharingCriteriaRules.length,
          sharingOwnerRulesCount:     tm1Context._accountSharingRules.sharingOwnerRules.length,
          sharingTerritoryRulesCount: tm1Context._accountSharingRules.sharingTerritoryRules.length
        },
        leadSharingRulesCount: {
          sharingCriteriaRulesCount:  tm1Context._leadSharingRules.sharingCriteriaRules.length,
          sharingOwnerRulesCount:     tm1Context._leadSharingRules.sharingOwnerRules.length
        },
        opportunitySharingRulesCount: {
          sharingCriteriaRulesCount:  tm1Context._opportunitySharingRules.sharingCriteriaRules.length,
          sharingOwnerRulesCount:     tm1Context._opportunitySharingRules.sharingOwnerRules.length
        }
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
  //*/

  // Private Members
  private _objectTerritory2AssociationRecords:  ObjectTerritory2AssociationRecords;
  private _territory2Records:                   Territory2Records;
  private _territory2RecordsByDevName:          Territory2RecordsByDevName;
  private _territory2RecordsById:               Territory2RecordsById;
  private _territoryDevNameMapByT2DevName:      TerritoryDevNameMapByDevName;
  private _territoryDevNameMapByT2Id:           TerritoryDevNameMapById;
  private _territoryDevNameMappings:            TerritoryDevNameMappings;
  private _tm1TransformationReport:             TM1TransformationReport;
  private _tm2FilePaths:                        TMToolsAllFilePaths;
  private _userTerritory2AssociationRecords:    UserTerritory2AssociationRecords;
  private _loaded:                              boolean;
  private _prepared:                            boolean;
  private _updated:                             boolean;

  // Public Accessors
  public get objectTerritory2AssociationRecords() { return this.isPrepared() ? this._objectTerritory2AssociationRecords : undefined; }
  public get territory2Records()                  { return this.isPrepared() ? this._territory2Records : undefined; }
  public get territory2RecordsByDevName()         { return this.isPrepared() ? this._territory2RecordsByDevName : undefined; }
  public get territory2RecordsById()              { return this.isPrepared() ? this._territory2RecordsById : undefined; }
  public get territoryDevNameMapByT2DevName()     { return this.isPrepared() ? this._territoryDevNameMapByT2DevName : undefined; }
  public get territoryDevNameMapByT2Id()          { return this.isPrepared() ? this._territoryDevNameMapByT2Id : undefined; }
  public get territoryDevNameMappings()           { return this.isPrepared() ? this._territoryDevNameMappings : undefined; }
  public get tm1TransformationReport()            { return this.isPrepared() ? this._tm1TransformationReport : undefined; }
  public get tm2FilePaths()                       { return this.isPrepared() ? this._tm2FilePaths : undefined; }
  public get userTerritory2AssociationRecords()   { return this.isPrepared() ? this._userTerritory2AssociationRecords : undefined; }
  public get loaded()                             { return this._loaded; }
  public get prepared()                           { return this._prepared; }
  public get updated()                            { return this._updated; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Tm2Context
   * @param       {TM1TransformationReport} tm1TransformationReport Required.
   *              The results of the TM1 transformation command.
   * @param       {TMToolsAllFilePaths} tm2FilePaths Required.
   * @description Given the paths to transformed TM1 metadata and record data,
   *              performs a number of import and transformation operations.
   *              The end result is a fully-populated "Territory Management 2.0
   *              Context" which can be used to prepare an "import deployment"
   *              for a TM2 org.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private constructor(tm1TransformationReport:TM1TransformationReport, tm2FilePaths:TMToolsAllFilePaths) {

    // Save the TM1 Transformation File Paths.
    this._tm2FilePaths  = tm2FilePaths;

    // Save the TM1 Transformation Report
    this._tm1TransformationReport = tm1TransformationReport;

    // Initialize Maps
    this._territory2RecordsByDevName      = new Map<string, Territory2Record>();
    this._territory2RecordsById           = new Map<string, Territory2Record>();
    this._territoryDevNameMapByT2DevName  = new Map<string, TerritoryDevNameMapping>();
    this._territoryDevNameMapByT2Id       = new Map<string, TerritoryDevNameMapping>();

    // Initialize Arrays
    this._objectTerritory2AssociationRecords  = [];
    this._userTerritory2AssociationRecords    = [];
    this._territoryDevNameMappings            = [];

    // Mark this as an UNPREPARED, UNLOADED, and UNUPDATED context
    this._prepared  = false;
    this._loaded    = false;
    this._updated   = false;
  }


  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildObjectT2AssociationRecords
   * @return      {Promise<void>}
   * @description Takes the INTERMEDIATE ObjectTerritory2Association records
   *              known to this context and builds an in-memory JsonMap with the
   *              correct Territory2 IDs filled in.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async buildObjectT2AssociationRecords():Promise<void> {

    // Make sure that this context has not already built out or loaded ObjectTerritory2Association Records.
    if (this._objectTerritory2AssociationRecords.length !== 0) {
      throw new SfdxFalconError ( `buildObjectT2AssociationRecords() can not be called if this context already has ObjectTerritory2Association records in-memory. `
                                + `Currently, this context has ${this._objectTerritory2AssociationRecords.length} ObjectTerritory2Association records in memory.`
                                , `RecordBuildError`
                                , `${dbgNs}buildObjectT2AssociationRecords`);
    }
    
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildUserT2AssociationRecords
   * @return      {Promise<void>}
   * @description Takes the INTERMEDIATE UserTerritory2Association records known
   *              to this context and builds an in-memory JsonMap with the
   *              correct Territory2 IDs filled in.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async buildUserT2AssociationRecords():Promise<void> {

    // Make sure that this context has not already built out or loaded UserTerritory2Association Records.
    if (this._userTerritory2AssociationRecords.length !== 0) {
      throw new SfdxFalconError ( `buildUserT2AssociationRecords() can not be called if this context already has UserTerritory2Association records in-memory. `
                                + `Currently, this context has ${this._userTerritory2AssociationRecords.length} UserTerritory2Association records in memory.`
                                , `RecordBuildError`
                                , `${dbgNs}buildUserT2AssociationRecords`);
    }

    // STREAM rows from the UserTerritory2Association.intermediate.csv file into memory.
    // TRANSFORM each row during the stream to replace the T2_PENDING_DEV_NAME with a valid T2_ID.
    this._userTerritory2AssociationRecords = await csv.transformFile(
      this._tm2FilePaths.userTerritory2AssociationIntermediateCsv,
      {
        onRowData: this.transformPendingT2Id
      }
    );

  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      updateRecordMaps
   * @return      {Promise<void>}
   * @description Uses a CSV file containing Territory2 records and updates the
   *              internal record maps inside this context.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async updateRecordMaps():Promise<void> {

    // Attempt to parse the Territory2 CSV file
    this._territory2Records = await csv.parseFile(this._tm2FilePaths.territory2Csv)
    .catch((csvParseError:Error) => {
      SfdxFalconDebug.obj(`${dbgNs}updateRecordMaps:csvParseError:`, csvParseError);
      throw new SfdxFalconError ( `Unable to parse ${this._tm2FilePaths.territory2Csv}: ${csvParseError.message}`
                                , `CsvParsingError`
                                , `${dbgNs}updateRecordMaps`
                                , csvParseError);
    });

    // Make sure we actually have Territory2 records. If we don't then something went wrong and we need to throw an Error.
    if (this._territory2Records.length === 0) {
      throw new SfdxFalconError ( `The call to updateRecordMaps() has failed. The file '${this._tm2FilePaths.territory2Csv}' contains no records.`
                                , `CsvFileEmpty`
                                , `${dbgNs}lookupTerritory2Id`);
    }

    // Build Territory2Records by DevName Map.
    this.buildT2RecordsByDevNameMap();
    
    // Build Territory2Records by ID Map.
    this.buildT2RecordsByIdMap();
    
    // Update the in-memory TerritoryDevNameMapping array based on the newly learned Territory2 IDs
    for (const territoryDevNameMapping of this._territoryDevNameMappings) {
      
      // Lookup the Territory2 ID.
      territoryDevNameMapping.territory2Id = this.lookupTerritory2Id(territoryDevNameMapping.territory2DevName);

      // If this record has a Territory2 Parent, look up that Parent's ID.
      if (territoryDevNameMapping.territory2ParentDevName) {
        territoryDevNameMapping.territory2ParentId  = this.lookupTerritory2Id(territoryDevNameMapping.territory2ParentDevName);
      }
    }
    SfdxFalconDebug.obj(`${dbgNs}updateRecordMaps:_territoryDevNameMappings`, this._territoryDevNameMappings);

    // Rebuild the Territory Dev Name by T2 Id map
    this.buildTerritoryDevNameMapByT2Id();

    // Mark this TM2 Context as "updated".
    this._updated = true;
  }


  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildRecordMaps
   * @return      {Promise<void>}
   * @description Returns nothing if the record maps are built successfully.
   *              Throws errors otherwise.
   * @private @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private async buildRecordMaps():Promise<void> {

    // Build TerritoryDevNameMap by Territory2 Developer Name
    this.buildTerritoryDevNameMapByT2DevName();

    // Build TerritoryDevNameMap by Territory2 ID.
    this.buildTerritoryDevNameMapByT2Id();

    // Build Territory2Records by DevName Map.
    this.buildT2RecordsByDevNameMap();
    
    // Build Territory2Records by ID Map.
    this.buildT2RecordsByIdMap();
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildT2RecordsByDevNameMap
   * @return      {void}
   * @description Returns nothing if the record map is built successfully.
   *              Throws errors otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildT2RecordsByDevNameMap():void {
    for (const territory2Record of this._territory2Records) {
      this._territory2RecordsByDevName.set(territory2Record.DeveloperName, territory2Record);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildT2RecordsByIdMap
   * @return      {void}
   * @description Returns nothing if the record map is built successfully.
   *              Throws errors otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildT2RecordsByIdMap():void {
    for (const territory2Record of this._territory2Records) {
      this._territory2RecordsById.set(territory2Record.Id, territory2Record);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildTerritoryDevNameMapByT2DevName
   * @return      {void}
   * @description Returns nothing if the record map is built successfully.
   *              Throws errors otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildTerritoryDevNameMapByT2DevName():void {
    for (const territoryDevNameMapping of this._territoryDevNameMappings) {
      this._territoryDevNameMapByT2DevName.set(territoryDevNameMapping.territory2DevName, territoryDevNameMapping);
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildTerritoryDevNameMapByT2Id
   * @return      {void}
   * @description Returns nothing if the record map is built successfully.
   *              Throws errors otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private buildTerritoryDevNameMapByT2Id():void {
    for (const territoryDevNameMapping of this._territoryDevNameMappings) {
      if (territoryDevNameMapping.territory2Id.startsWith(territory2RecordIdPrefix)) {
        this._territoryDevNameMapByT2Id.set(territoryDevNameMapping.territory2Id, territoryDevNameMapping);
      }
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      getConvertedT2Id
   * @param       {string}  pendingT2Id Required. Must begin with the string
   *              "T2ID_PENDING_" and end with a Territory2 Developer Name.
   * @return      {string}
   * @description Given a string that *should* begin with "T2ID_PENDING_" and
   *              end with a Territory2 Developer Name, returns the Territory2
   *              Record ID that is associated with the T2 Developer Name.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private getConvertedT2Id(pendingT2Id:string):string {

    // Debug incoming arguments
    SfdxFalconDebug.obj(`${dbgNs}getConvertedT2Id:arguments:`, arguments);

    // Make sure that we have a string that begins with "T2ID_PENDING_"
    if (typeof pendingT2Id !== 'string' || pendingT2Id === null || pendingT2Id.startsWith('T2ID_PENDING_') !== true) {
      return '';
    }

    // Pull the Developer Name out of the Pending T2 ID.
    const territory2DevName = pendingT2Id.substring(13);
    SfdxFalconDebug.str(`${dbgNs}getConvertedT2Id:territory2DevName:`, territory2DevName);

    // Lookup and return the Territory2 ID that's associated with the Dev Name we just got.
    return this.lookupTerritory2Id(territory2DevName);
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      isPrepared
   * @return      {boolean}
   * @description Returns true if an object instance is prepared. Throws an
   *              error otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private isPrepared():boolean {
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `Operations against Tm2Context objects are not available until the instance is prepared`
                                , `ObjectNotPrepared`
                                , `${dbgNs}isPrepared`);
    }
    else {
      return this._prepared;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      isUpdated
   * @return      {boolean}
   * @description Returns true if the Territory DevName mappings known to this
   *              instance have been updated (or were known from the start in
   *              the case of a successful post-update Load operation). Throws
   *              an error otherwise.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private isUpdated():boolean {
    if (this._updated !== true) {
      throw new SfdxFalconError ( `The requested operation requires a Tm2Context with updated Territory DevName mapping data but this update has not yet happened.`
                                , `ObjectNotUpdated`
                                , `${dbgNs}isUpdated`);
    }
    else {
      return this._updated;
    }
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      lookupTerritory2Id
   * @param       {string}  territory2DevName Required. Developer Name of the
   *              Territory2 object that the caller wants the record ID for.
   * @return      {SObjectRecordId}  SObject ID of the Territory2 record whose
   *              Dev Name matches what the caller provided.
   * @description Given the Developer Name for a Territory2 object, searches
   *              the currently built Territory2 data table and returns the
   *              matching SObject ID.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private lookupTerritory2Id(territory2DevName:string):SObjectRecordId {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}lookupTerritory2Id:arguments:`, arguments);

    // Validate incoming arguments.
    if (typeof territory2DevName !== 'string' || territory2DevName === '' || territory2DevName === null) {
      throw new SfdxFalconError ( `Expected territory2DevName to be a non-empty, non-null string${typeof territory2DevName !== 'string' ? ` but got '${typeof territory2DevName}' instead.` : `.`}`
                                , `TypeError`
                                , `${dbgNs}lookupTerritory2Id`);
    }

    // Find the Territory2 record ID that matches the provided Dev Name.
    const territory2Record = this._territory2RecordsByDevName.get(territory2DevName);

    // If a matching Territory2 record wasn't found, throw an error.
    if (typeof territory2Record === 'undefined') {
      throw new SfdxFalconError ( `The Developer Name '${territory2DevName}' is not associated with any Territory2 records.`
                                , `DeveloperNameNotFound`
                                , `${dbgNs}lookupTerritory2Id`);
    }

    // Return the ID of the Territory2 Record that was found.
    return territory2Record.Id;
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

    // Parse the Territory DevName Mappings. There should ALWAYS be a file here.
    this._territoryDevNameMappings  = await csv.parseFile(this._tm2FilePaths.tm1ToTm2DevnameMapCsv) as TerritoryDevNameMappings;

    // There MAY NOT be any Territory2 records yet, so we must handle a missing file error.
    this._territory2Records = await csv.parseFile(this._tm2FilePaths.territory2Csv)
    .catch(csvParseError => {
      SfdxFalconDebug.obj(`${dbgNs}parseCsvFiles:csvParseError:`, csvParseError);
      return [];
    });

    // DEBUG
    SfdxFalconDebug.obj(
      `${dbgNs}parseCsvFiles:parseResults:`,
      {
        _territoryDevNameMappings:  this._territoryDevNameMappings,
        _territory2Records:         this._territory2Records
      }
    );
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      transformPendingT2Id
   * @param       {JsonMap} data  Required. The "row" of data to transform.
   * @return      {JsonMap}
   * @description Given a "row" of data in the form of a JsonMap, looks for the
   *              Territory2Id "field" and transforms it by inspecting the
   *              contents and looking up any pending T2_ID placeholders.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  private transformPendingT2Id(data:JsonMap):JsonMap {

    // Make sure this TM2 Context has been updated
    this.isUpdated();

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}transformPendingT2Id:arguments:`, arguments);

    // Validate incoming arguments.
    if (typeof data !== 'object' || typeof data.Territory2Id !== 'string' || data.territory2Id === null || data.territory2Id === '') {
      throw new SfdxFalconError ( `Transformable data must have a Territory2Id field that is a non-null, non-empty string. `
                                , `TypeError`
                                , `${dbgNs}transformPendingT2Id`);
    }

    // Attempt to convert the pending T2ID to an actual T2ID.
    const t2Id = this.getConvertedT2Id(data.Territory2Id);

    // If we got a value back for t2Id, use it to replace the value currently in the data.
    if (t2Id) {
      data.territory2Id = t2Id;
    }

    // Send the transformed data back to the caller.
    return data;
  }
}
