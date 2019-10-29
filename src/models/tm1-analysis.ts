//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @copyright     2019, Vivek M. Chawla / Salesforce. All rights reserved.
 * @license       BSD-3-Clause For full license text, see the LICENSE file in the repo root or
 *                `https://opensource.org/licenses/BSD-3-Clause`
 * @file          modules/tm-tools-objects/tm1-analysis.ts
 * @summary       Models the analysis of a TM1 org.
 * @description   Models the analysis of a TM1 org. Includes key information such as the number of
 *                `Territory` records, `UserTerritory` records, and `AccountShare` records where
 *                the sharing reason is `TerritoryManual`.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Libraries, Classes, & Functions
import  {Aliases}                   from  '@salesforce/core';     // Aliases specify alternate names for groups of properties used by the Salesforce CLI, such as orgs.
import  {AuthInfo}                  from  '@salesforce/core';     // Handles persistence and fetching of user authentication information using JWT, OAuth, or refresh tokens.
import  {SfdxFalconDebug}           from  '@sfdx-falcon/debug';   // Class. Specialized debug provider for SFDX-Falcon code.
import  {SfdxFalconError}           from  '@sfdx-falcon/error';   // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import  {SfdxFalconResult}          from  '@sfdx-falcon/status';  // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import  {AsyncUtil}                 from  '@sfdx-falcon/util';    // Function. Allows for a simple "wait" to execute.
import  {SfdxUtil}                  from  '@sfdx-falcon/util';    // Library of SFDX Helper functions specific to SFDX-Falcon.
import  {SfdxFalconModel}           from  '@tmt-models/model';    // Abstract Class. Used for building classes that encapsulate a domain model, including associated domain-specific operations.
import  * as fse                    from  'fs-extra';             // File System utility library with extended functionality.

// Import External Types
import  {SfdxFalconModelOptions}    from  '@tmt-models/model';    // Interface. Represents the collective options object for classes derived from SfdxFalconModel.

// Import Internal Libraries, Classes & Functions

// Import Internal Types
import  {SharingRulesCount}       from  '@tmt-types';   // Interface. Represents a collection of information that tracks the count of Criteria, Owner, and Territory-based Sharing Rules.
import  {TM1AnalysisReport}       from  '@tmt-types';   // Interface. Represents the data that is generated by a TM1 Analysis Report.
import  {TM1AnalyzeFilePaths}     from  '@tmt-types';   // Interface. Represents the complete suite of file paths required by the TM1 Analyze command.
import  {TM1Dependency}           from  '@tmt-types';   // Interface. Represents a metadata component with a dependency on TM1.
import  {TM1HardDependencies}     from  '@tmt-types';   // Interface. Represents a complete view of HARD TM1 dependencies in an org.
import  {TM1SoftDependencies}     from  '@tmt-types';   // Interface. Represents a complete view of SOFT TM1 dependencies in an org.
import  {TM1OrgInfo}              from  '@tmt-types';   // Interface. Represents basic org information for a TM1 org

// Requires
const {falcon}  = require('../../../package.json'); // The custom "falcon" key from package.json. This holds custom project-level values.

// Set the File Local Debug Namespace
const dbgNs = 'MODEL:tm1-analysis';
SfdxFalconDebug.msg(`${dbgNs}:`, `Debugging initialized for ${dbgNs}`);


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * Interface. Represents options used by the `ClassName` constructor.
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export interface ClassNameOptions extends SfdxFalconModelOptions {
  /**
   * Required/Optional. Used by the `constructor()` method of `ClassName`.
   */
  constructorOpts: {
    /**
     *  Optional. ???
     */
    aliasOrUsername:  string;
    /**
     * Required/Optional. ???
     */
    optionTwo:  string;
  };
  /**
   * Required/Optional. Used by the `build()` method of `ClassName`.
   */
  //buildOpts?: undefined; // NOTE: Set this to `undefined` if you DO NOT want to expose these options.
  buildOpts: {
    /**
     *  Required/Optional. ???
     */
    optionOne:  string;
    /**
     * Required. The second option.
     */
    optionTwo:  string;
  };
  /**
   * Required/Optional. Used by the `load()` method of `ClassName`.
   */
  //loadOpts?: undefined; // NOTE: Set this to `undefined` if you DO NOT want to expose these options.
  loadOpts: {
    /**
     *  Required/Optional. ???
     */
    optionOne:  string;
    /**
     * Required. The second option.
     */
    optionTwo:  string;
  };
}

//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       Tm1Analysis
 * @extends     SfdxFalconModel
 * @description Models the analysis of a TM1 org.
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export class Tm1Analysis extends SfdxFalconModel {

  // Private Members
  private _accountShareRecordCount:       number;
  private _ataRuleRecordCount:            number;
  private _ataRuleItemRecordCount:        number;
  private _hardTm1DependencyCount:        number;
  private _softTm1DependencyCount:        number;
  private _hardTm1Dependencies:           TM1Dependency[];
  private _softTm1Dependencies:           TM1Dependency[];
  private _accountSharingRulesCount:      SharingRulesCount;
  private _leadSharingRulesCount:         SharingRulesCount;
  private _opportunitySharingRulesCount:  SharingRulesCount;
  private _groupRecordCount:              number;
  private _territoryRecordCount:          number;
  private _userTerritoryRecordCount:      number;
  private _dateAnalyzed:                  string;
  private _orgInfo:                       TM1OrgInfo;
  private _aliasOrUsername:               string;
  private _defaultDelay:                  number;
  private _filePaths:                     TM1AnalyzeFilePaths;
  private _prepared:                      boolean;

  // Public Accessors
  public get accountShareRecordCount()      { this.checkPrepared(); return this._accountShareRecordCount; }
  public get ataRuleRecordCount()           { this.checkPrepared(); return this._ataRuleRecordCount; }
  public get ataRuleItemRecordCount()       { this.checkPrepared(); return this._ataRuleItemRecordCount; }
  public get hardTm1DependencyCount()       { this.checkPrepared(); return this._hardTm1DependencyCount; }
  public get softTm1DependencyCount()       { this.checkPrepared(); return this._softTm1DependencyCount; }
  public get hardTm1Dependencies()          { this.checkPrepared(); return this._hardTm1Dependencies; }
  public get softTm1Dependencies()          { this.checkPrepared(); return this._softTm1Dependencies; }
  public get dateAnalyzed()                 { this.checkPrepared(); return this._dateAnalyzed; }
  public get orgInfo()                      { this.checkPrepared(); return this._orgInfo; }
  public get aliasOrUsername()              { this.checkPrepared(); return this._aliasOrUsername; }
  public get accountSharingRulesCount()     { this.checkPrepared(); return this._accountSharingRulesCount; }
  public get leadSharingRulesCount()        { this.checkPrepared(); return this._leadSharingRulesCount; }
  public get opportunitySharingRulesCount() { this.checkPrepared(); return this._opportunitySharingRulesCount; }
  public get groupRecordCount()             { this.checkPrepared(); return this._groupRecordCount; }
  public get territoryRecordCount()         { this.checkPrepared(); return this._territoryRecordCount; }
  public get userTerritoryRecordCount()     { this.checkPrepared(); return this._userTerritoryRecordCount; }
  public get filePaths()                    { return this._filePaths; }
  public get prepared()                     { return this._prepared; }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @constructs  Tm1Analysis
   * @param       {string}  aliasOrUsername Required.
   * @param       {TM1AnalyzeFilePaths} tm1AnalyzeFilePaths Required.
   * @param       {number}  [defaultDelay]  Optional. Number of seconds that
   *              every Analyze step will wait before executing. Defaults to 1.
   * @description Constructs a TM1 Analysis object that can either be prepared
   *              manually by an external actor or prepared by reading the
   *              contents of a previously-created TM1 Analysis Results File.
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public constructor(aliasOrUsername:string, tm1AnalyzeFilePaths:TM1AnalyzeFilePaths, defaultDelay?:number) {

    // Call the superclass constructor.
    super({
      dbgNsExt: `MODEL`,  // Sets the base debug namespace for this Model.
      trapErrors: false   // Indicates that build/load errors should not be trapped.
    });

    // Make sure that the "Alias or User Name" (if provided) is a string, then initialize the member var.
    if (typeof aliasOrUsername !== 'undefined' && typeof aliasOrUsername !== 'string') {
      throw new SfdxFalconError ( `The aliasOrUsername argument, when provided, must be a string. Got type '${typeof aliasOrUsername}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    this._aliasOrUsername = aliasOrUsername || '';

    // Make sure that the "Default Delay" (if provided) is a number, then initialize the member var.
    if (typeof defaultDelay !== 'undefined' && typeof defaultDelay !== 'number') {
      throw new SfdxFalconError ( `The defaultDelay argument, when provided, must be a number. Got type '${typeof defaultDelay}' instead.`
                                , `TypeError`
                                , `${dbgNs}constructor`);
    }
    this._defaultDelay = defaultDelay || 1;

    // Initialize the "date analyzed" value to NOW.
    const dateNow       = new Date(Date.now());
    this._dateAnalyzed  = dateNow.toString();

    // Initialize the File Paths.
    this._filePaths = tm1AnalyzeFilePaths;

    // There's not much if the user READS various properties before being PREPARED, so just initialize as TRUE.
    this._prepared = true;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAccountShares
   * @return      {number}  Number of Account Share records present in the
   *              target org with "TerritoryManual" as their RowCause.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAccountShares():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM AccountShare WHERE RowCause='TerritoryManual'`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
      soqlQuery,
      {
        apiVersion:     falcon.sfdcApiVersion,
        logLevel:       'warn',
        useToolingApi:  false,
        perfLog:        false,
        json:           true
      }
    )
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeAccountShares:successResult:`, successResult);
      this._accountShareRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeAccountShares:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNs}analyzeAccountShares`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Return the result.
    return this._accountShareRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAtaRuleItems
   * @return      {number}  Number of TM1 ATA Rule Items present in the target org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAtaRuleItems():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM AccountTerritoryAssignmentRuleItem`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
      soqlQuery,
      {
        apiVersion:     falcon.sfdcApiVersion,
        logLevel:       'warn',
        useToolingApi:  false,
        perfLog:        false,
        json:           true
      }
    )
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeAtaRuleItems:successResult:`, successResult);
      this._ataRuleItemRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeAtaRuleItems:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNs}analyzeAtaRuleItems`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Return the result.
    return this._ataRuleItemRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAtaRules
   * @return      {number}  Number of TM1 ATA Rules present in the target org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAtaRules():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM AccountTerritoryAssignmentRule`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
      soqlQuery,
      {
        apiVersion:     falcon.sfdcApiVersion,
        logLevel:       'warn',
        useToolingApi:  false,
        perfLog:        false,
        json:           true
      }
    )
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeAtaRules:successResult:`, successResult);
      this._ataRuleRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeAtaRules:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNs}analyzeAtaRules`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Return the result.
    return this._ataRuleRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeGroups
   * @return      {number}  Number of Group records present in the target org
   *              with "Territory" or "TerritoryAndSubordinates" as their Type.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeGroups():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM Group WHERE Type='Territory' OR Type='TerritoryAndSubordinates'`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
      soqlQuery,
      {
        apiVersion:     falcon.sfdcApiVersion,
        logLevel:       'warn',
        useToolingApi:  false,
        perfLog:        false,
        json:           true
      }
    )
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeGroups:successResult:`, successResult);
      this._groupRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeGroups:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNs}analyzeGroups`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Return the result.
    return this._groupRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeHardTm1Dependencies
   * @return      {TM1HardDependencies} Object containing the HARD TM1
   *              Dependency Count and an array of the HARD TM1 Dependencies
   *              that were found.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeHardTm1Dependencies():Promise<TM1HardDependencies> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Do stuff...

    // Return the result.
    return {
      hardTm1DependencyCount: this._hardTm1DependencyCount,
      hardTm1Dependencies:    this._hardTm1Dependencies
    };
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeSoftTm1Dependencies
   * @return      {TM1SoftDependencies}  Object containing the SOFT TM1
   *              Dependency Count and an array of the SOFT TM1 Dependencies
   *              that were found.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeSoftTm1Dependencies():Promise<TM1SoftDependencies> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Do stuff...

    // Return the result.
    return {
      softTm1DependencyCount: this._softTm1DependencyCount,
      softTm1Dependencies:    this._softTm1Dependencies
    };
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeAccountSharingRules
   * @return      {Promise<SharingRulesCount>} Criteria, Owner, and Territory
   *              Sharing Rule counts for the ACCOUNT object that are shared
   *              TO or FROM a TM1 Territory or TM1 "Territories and
   *              Subordinates" group.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeAccountSharingRules():Promise<SharingRulesCount> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Do stuff...

    // Return the result.
    return this._accountSharingRulesCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeLeadSharingRules
   * @return      {Promise<SharingRulesCount>} Criteria, Owner, and Territory
   *              based Sharing Rule counts for the LEAD object that are shared
   *              TO or FROM a TM1 Territory or TM1 "Territories and
   *              Subordinates" group.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeLeadSharingRules():Promise<SharingRulesCount> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Do stuff...

    // Return the result.
    return this._leadSharingRulesCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeOpportunitySharingRules
   * @return      {Promise<SharingRulesCount>} Criteria, Owner, and Territory
   *              based Sharing Rule counts for the OPPORTUNITY object that
   *              are shared TO or FROM a TM1 Territory or TM1 "Territories and
   *              Subordinates" group.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeOpportunitySharingRules():Promise<SharingRulesCount> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Do stuff...

    // Return the result.
    return this._opportunitySharingRulesCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeTerritories
   * @return      {number}  Number of TM1 Territories in the target org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeTerritories():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM Territory`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
      soqlQuery,
      {
        apiVersion:     falcon.sfdcApiVersion,
        logLevel:       'warn',
        useToolingApi:  false,
        perfLog:        false,
        json:           true
      }
    )
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeTerritories:successResult:`, successResult);
      this._territoryRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeTerritories:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNs}analyzeTerritories`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Return the result.
    return this._territoryRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      analyzeUserTerritoryAssignments
   * @return      {number}  Number of TM1 UserTerritory records in the target org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async analyzeUserTerritoryAssignments():Promise<number> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Prep the SOQL Query
    const soqlQuery = `SELECT count() FROM UserTerritory`;

    // Execute the SOQL Query
    await SfdxUtil.executeSoqlQuery(
      this._aliasOrUsername,
      soqlQuery,
      {
        apiVersion:     falcon.sfdcApiVersion,
        logLevel:       'warn',
        useToolingApi:  false,
        perfLog:        false,
        json:           true
      }
    )
    .then((successResult:SfdxFalconResult) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeUserTerritoryAssignments:successResult:`, successResult);
      this._userTerritoryRecordCount = SfdxUtil.getRecordCountFromResult(successResult);
    })
    .catch((failureResult:SfdxFalconResult|Error) => {
      SfdxFalconDebug.obj(`${dbgNs}analyzeUserTerritoryAssignments:failureResult:`, failureResult);
      if (failureResult instanceof SfdxFalconResult) {
        // Add additional context and repackage the Error contained by the SfdxFalconResult
        throw failureResult.error(
          new SfdxFalconError ( `The target org (${this._aliasOrUsername}) does not appear to have Territory Management (TM1) enabled.`
                              , `MissingTM1Config`
                              , `${dbgNs}analyzeUserTerritoryAssignments`
                              ,  failureResult.errObj)
        );
      }
      else {
        throw failureResult;
      }
    });

    // Return the result.
    return this._userTerritoryRecordCount;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      gatherOrgInformation
   * @return      {TM1OrgInfo}  Basic information about the target TM1 org.
   * @description ???
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async gatherOrgInformation():Promise<TM1OrgInfo> {

    // Make sure we have a UserName
    this.checkAliasOrUsername();

    // Add a delay for dramatic effect.
    await AsyncUtil.waitASecond(this._defaultDelay);

    // Convert the "alias or username" to a for-sure username.
    this._orgInfo.username = (await Aliases.fetch(this._aliasOrUsername)) || this._aliasOrUsername;
    SfdxFalconDebug.str(`${dbgNs}gatherOrgInformation:orgInfo.username`, this._orgInfo.username);

    // Try to get the AuthInfo data for that username.
    const authInfo = await AuthInfo.create({
      username: this._orgInfo.username
    })
    .catch(authInfoError => {
      throw new SfdxFalconError ( `The supplied Alias or Username (${this._aliasOrUsername}) does not map to any authenticated orgs in the local environment.`
                                , `InvalidAliasOrUsername`
                                , `${dbgNs}gatherOrgInformation`
                                , authInfoError);
    }) as AuthInfo;
    SfdxFalconDebug.obj(`${dbgNs}gatherOrgInformation:authInfo.fields`, authInfo.getFields());

    // Get the Alias, Org ID, login URL, and Created Org Instance from the retrieved Auth Info.
    this._orgInfo.alias               = (this._aliasOrUsername !== this._orgInfo.username) ? this._aliasOrUsername : undefined;
    this._orgInfo.orgId               = authInfo.getFields().orgId;
    this._orgInfo.loginUrl            = authInfo.getFields().loginUrl;
    this._orgInfo.createdOrgInstance  = authInfo.getFields().createdOrgInstance;

    // Return the result.
    return this._orgInfo;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      generateReport
   * @return      {TM1AnalysisReport} Complete JSON representation of the TM1
   *              analysis based on the values currently known to this instance.
   * @description ???
   * @public
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public generateReport():TM1AnalysisReport {
    const tm1AnalysisReport:TM1AnalysisReport = {
      orgInfo:  this._orgInfo,
      tm1RecordCounts:  {
        territoryRecordCount:       this._territoryRecordCount,
        userTerritoryRecordCount:   this._userTerritoryRecordCount,
        ataRuleRecordCount:         this._ataRuleRecordCount,
        ataRuleItemRecordCount:     this._ataRuleItemRecordCount,
        accountShareRecordCount:    this._accountShareRecordCount,
        groupRecordCount:           this._groupRecordCount
      },
      tm1MetadataCounts: {
        accountSharingRulesCount: {
          sharingCriteriaRulesCount:  this._accountSharingRulesCount.sharingCriteriaRulesCount,     // NOT_FULLY_IMPLEMENTED
          sharingOwnerRulesCount:     this._accountSharingRulesCount.sharingOwnerRulesCount,        // NOT_FULLY_IMPLEMENTED
          sharingTerritoryRulesCount: this._accountSharingRulesCount.sharingTerritoryRulesCount     // NOT_FULLY_IMPLEMENTED
        },
        leadSharingRulesCount: {
          sharingCriteriaRulesCount:  this._leadSharingRulesCount.sharingCriteriaRulesCount,        // NOT_FULLY_IMPLEMENTED
          sharingOwnerRulesCount:     this._leadSharingRulesCount.sharingOwnerRulesCount            // NOT_FULLY_IMPLEMENTED
        },
        opportunitySharingRulesCount: {
          sharingCriteriaRulesCount:  this._opportunitySharingRulesCount.sharingCriteriaRulesCount, // NOT_FULLY_IMPLEMENTED
          sharingOwnerRulesCount:     this._opportunitySharingRulesCount.sharingOwnerRulesCount     // NOT_FULLY_IMPLEMENTED
        }
      },
      hardTm1Dependencies: {
        hardTm1DependencyCount: this._hardTm1DependencyCount,
        hardTm1Dependencies:    this._hardTm1Dependencies
      },
      softTm1Dependencies: {
        softTm1DependencyCount: this._softTm1DependencyCount,
        softTm1Dependencies:    this._softTm1Dependencies
      }
    };
    SfdxFalconDebug.obj(`${dbgNs}generateReport:tm1AnalysisReport:`, tm1AnalysisReport);
    return tm1AnalysisReport;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      saveReport
   * @param       {string}  [targetFile]  Optional. Path to the directory and file
   *              into which the user would like to save the Results. This file
   *              should end with the .json extension.
   * @return      {Promise<TM1AnalysisReport>} Complete JSON representation of
   *              the TM1 analysis that was written to the user's filesystem.
   * @description Given a complete filepath (directory plus filename), writes
   *              out all of this object's known analysis information in JSON
   *              format to the specified file.
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async saveReport(targetFile?:string):Promise<TM1AnalysisReport> {

    // Debug incoming arguments.
    SfdxFalconDebug.obj(`${dbgNs}saveReport:arguments:`, arguments);

    // Default target file to the one from the TM File Paths collection unless the caller overrides.
    targetFile = targetFile || this._filePaths.tm1AnalysisReportPath;

    // Validate incoming arguments.
    if (typeof targetFile !== 'string' || targetFile === '' || targetFile === null) {
      throw new SfdxFalconError ( `The targetFile must be a non-empty string. Got '${typeof targetFile}' instead.`
                                , `TypeError`
                                , `${dbgNs}saveReport`);
    }
    if (targetFile.endsWith('.json') !== true) {
      throw new SfdxFalconError ( `The targetFile must end with the '.json' extension. The path/file '${targetFile}' is invalid.`
                                , `InvalidFileName`
                                , `${dbgNs}saveReport`);
    }

    // Generate the report.
    const report = this.generateReport();
    SfdxFalconDebug.obj(`${dbgNs}saveReport:report:`, report);

    // Write the report to the local filesystem.
    await fse.ensureFile(targetFile);
    await fse.writeJson(targetFile, report, {spaces: '\t'});

    // Send the report back to the caller.
    return report;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      _initialize
   * @return      {boolean}
   * @description Initializes all model-specific member variables and structures.
   *              Called by the `constructor` and again by the `refresh()`
   *              method when the caller wants to rebuild/reinitialize the model.
   * @protected @abstract
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected _initialize():void {

    // Initialize all counts to -1 to indicate an unset value.
    this._accountShareRecordCount   = -1;
    this._ataRuleItemRecordCount    = -1;
    this._ataRuleRecordCount        = -1;
    this._hardTm1DependencyCount    = -1;
    this._softTm1DependencyCount    = -1;
    this._territoryRecordCount      = -1;
    this._groupRecordCount          = -1;
    this._userTerritoryRecordCount  = -1;
    this._accountSharingRulesCount  = {
      sharingCriteriaRulesCount:  -1,
      sharingOwnerRulesCount:     -1,
      sharingTerritoryRulesCount: -1
    };
    this._leadSharingRulesCount = {
      sharingCriteriaRulesCount:  -1,
      sharingOwnerRulesCount:     -1
    };
    this._opportunitySharingRulesCount  = {
      sharingCriteriaRulesCount:    -1,
      sharingOwnerRulesCount:       -1
    };

    // Initialize the Hard and Soft TM1 Dependency arrays.
    this._hardTm1Dependencies = [];
    this._softTm1Dependencies = [];

    // Initialize the Org Info object.
    this._orgInfo = {
      alias:              'NOT_SPECIFIED',
      username:           'NOT_SPECIFIED',
      orgId:              'NOT_SPECIFIED',
      loginUrl:           'NOT_SPECIFIED',
      createdOrgInstance: 'NOT_SPECIFIED'
    };
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      checkPrepared
   * @return      {void}
   * @description Checks if the analysis is prepared. If not, an Error is thrown.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  private checkPrepared():void {
    if (this._prepared !== true) {
      throw new SfdxFalconError ( `The requested operation is not allowed until the analysis is prepared`
                                , `AnalysisNotPrepared`
                                , `${dbgNs}checkPrepared`);
    }
  }//*/

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      checkAliasOrUsername
   * @return      {void}
   * @description Checks if a UserName was provided when this object was
   *              constructed. If not, an Error is thrown.
   * @private
   */
  //───────────────────────────────────────────────────────────────────────────┘
  /*
  private checkAliasOrUsername():void {
    if (! this._aliasOrUsername) {
      throw new SfdxFalconError ( `The requested operation requires an Alias or Username, but one was not provided when this Tm1Analysis object was constructed.`
                                , `UserNameMissing`
                                , `${dbgNs}checkAliasOrUsername`);
    }
  }//*/
}
