//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          modules/sfdx-falcon-types/index.d.ts
 * @copyright     Vivek M. Chawla - 2018
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Collection of interfaces and types used across SFDX-Falcon modules.
 * @description   Collection of interfaces and types used across SFDX-Falcon modules.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules/Types
import {Connection}           from  '@salesforce/core';         // Why?
import {AnyJson}              from  '@salesforce/ts-types';     // Why?
import {JsonMap}              from  '@salesforce/ts-types';     // Why?
import {QueryResult}          from  'jsforce';                  // Why?
import {RequestInfo}          from  'jsforce';                  // Why?
import {Observable}           from  'rxjs';                     // Why?
import {Observer}             from  'rxjs';                     // Why?
import {Subscriber}           from  'rxjs';                     // Why?
import {Questions}            from  'yeoman-generator';         // Interface. Represents an array of Inquirer "question" objects.
import {Question}             from  'yeoman-generator';         // Interface. Represents an array of Inquirer "question" objects.

// Import Internal Modules/Types
import {SfdxFalconResult}     from  '../sfdx-falcon-result';    // Class. Implements a framework for creating results-driven, informational objects with a concept of heredity (child results) and the ability to "bubble up" both Errors (thrown exceptions) and application-defined "failures".
import {StandardOrgInfo}      from  '../sfdx-falcon-util/sfdx'; // Class. Stores information about a standard (ie. non-scratch) org that is connected to the local Salesforce CLI.
import {ScratchOrgInfo}       from  '../sfdx-falcon-util/sfdx'; // Class. Stores information about a scratch orgs that is connected to the local Salesforce CLI.
import {SfdxFalconTableData}  from  '../sfdx-falcon-util/ux';   // Interface. Represents and array of SfdxFalconKeyValueTableDataRow objects.

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Fundamental Types
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Type. Represents the constructor for a Class, ie. something that can be the right operand of the instanceof operator.
 */
export type ClassConstructor = any;  // tslint:disable-line: no-any

/**
 * Interface. Allows for specification of a message string and chalk-specific styling information.
 */
export interface StyledMessage extends JsonMap {
  /** Required. The text of the desired message. */
  message:  string;
  /** Required. Chalk styles to be applied to the message. Uses the "tagged template literal" format. */
  styling:  string;
}

/**
 * Interface. Represents a "state aware" message. Contains a title, a message, and a type.
 */
export interface StatusMessage extends JsonMap {
  /** Required. The title of the status message. */
  title:    string;
  /** Required. The text of the status message. */
  message:  string;
  /** Required. The type of the status message. */
  type:     StatusMessageType;
}

/**
 * Enum. Represents the various types/states of a Status Message.
 */
export enum StatusMessageType {
  ERROR   = 'error',
  INFO    = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  FATAL   = 'fatal'
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Falcon and SFDX Config-related interfaces and types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Represents the status code and JSON result that is sent to the caller when SFDX-Falcon CLI Commands are run.
 */
export interface SfdxFalconJsonResponse extends JsonMap {
  falconStatus: number;
  falconResult: AnyJson;
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Packaging-related types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents a Metadata Package (033). Can be managed or unmanaged.
 */
export interface MetadataPackage extends JsonMap {
  Id:                       string;
  Name:                     string;
  NamespacePrefix:          string;
  MetadataPackageVersions:  MetadataPackageVersion[];
}

/**
 * Interface. Represents a Metadata Package Version (04t).
 */
export interface MetadataPackageVersion extends JsonMap {
  Id:                 string;
  Name:               string;
  MetadataPackageId:  string;
  MajorVersion:       number;
  MinorVersion:       number;
  PatchVersion:       number;
  BuildNumber:        number;
  ReleaseState:       string;
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Listr related interfaces and types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents a "runnable" Listr object (ie. an object that has the run() method attached).
 */
export interface ListrObject extends Object {
  run():Promise<any>; // tslint:disable-line: no-any
}

/**
 * Interface. Represents a Listr Task object that can be executed by a Listr Task Runner.
 */
export interface ListrTask {
  title:    string;
  task:     ListrTaskFunction;
  skip?:    boolean|ListrSkipFunction|ListrSkipCommand;
  enabled?: boolean|ListrEnabledFunction;
}

/**
 * Represents an "enabled" function for use in a Listr Task.
 */
export type ListrEnabledFunction =
  (context?:any)=> boolean; // tslint:disable-line: no-any

/**
 * Type. Represents a "skip" function for use in a Listr Task.
 */
export type ListrSkipFunction =
  (context?:any) => boolean|string|Promise<boolean|string>;  // tslint:disable-line: no-any

/**
 * Type. A built-in function of the "this task" Listr Task object that gets passed into executable task code.
 */
export type ListrSkipCommand =
  (message?:string) => void;

/**
 * Represents a "task" function for use in a Listr Task.
 */
export type ListrTaskFunction =
  (context?:ListrContext, task?:ListrTask) => void|Promise<void>|Observable<any>; // tslint:disable-line: no-any

/**
 * Represents the set of "execution options" related to the use of Listr.
 */
export interface ListrExecutionOptions {
  listrContext: any;  // tslint:disable-line: no-any
  listrTask:    any;  // tslint:disable-line: no-any
  observer:     any;  // tslint:disable-line: no-any
  sharedData?:  object;
}

/**
 * Represents the Listr "Context" that's passed to various functions set up inside Listr Tasks.
 */
export type ListrContext = any; // tslint:disable-line: no-any

/**
 * Interface. Represents the Listr Context variables used by the "finalizeGit" task collection.
 */
export interface ListrContextFinalizeGit extends JsonMap {
  gitInstalled:           boolean;
  gitInitialized:         boolean;
  projectFilesStaged:     boolean;
  projectFilesCommitted:  boolean;
  gitRemoteIsValid:       boolean;
  gitRemoteAdded:         boolean;
}

/**
 * Interface. Represents the Listr Context variables used by the "Package Retrieve/Extract/Convert" task collection.
 */
export interface ListrContextPkgRetExCon extends JsonMap {
  packagesRetrieved:  boolean;
  sourceExtracted:    boolean;
  sourceConverted:    boolean;
}

/**
 * Interface. Represents the suite of information required to run a Listr Task Bundle.
 */
export interface ListrTaskBundle {
  /** Required. A fully instantiated Listr Object representing the tasks that the caller would like to run. */
  listrObject:            ListrObject;
  /** Required. The debug namespace that will be used by SfdxFalconDebug and SfdxFalconError objects. */
  dbgNsLocal:             string;
  /** Required. Status Message that will be added to the GeneratorStatus object if the Task Bundle completes successfully. */
  generatorStatusSuccess: StatusMessage;
  /** Required. Status Message that will be added to the GeneratorStatus object if the Task Bundle does not complete successfully. */
  generatorStatusFailure: StatusMessage;
  /** Required. Specifies whether an error will be thrown if any of the Tasks in the Task Bundle fail. */
  throwOnFailure:         boolean;
  /** Optional. A styled message that will be shown to the user BEFORE the Task Bundle is run. */
  preTaskMessage?:        StyledMessage;
  /** Optional. A styled message that will be shown to the user AFTER the Task Bundle is run. */
  postTaskMessage?:       StyledMessage;
}

/**
 * Type. Alias to an rxjs Observer<unknown> type.
 */
export type Observer = Observer<unknown>;

/**
 * Type. Alias to an rxjs Subscriber<unknown> type.
 */
export type Subscriber = Subscriber<unknown>;

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Yeoman/Inquirer/SfdxFalconInterview/SfdxFalconPrompt related interfaces and types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

export type InquirerChoice<U=unknown>   = import('inquirer/lib/objects/choice')<U>;
export type InquirerSeparator           = import('inquirer/lib/objects/separator');
export type InquirerChoices             = Array<InquirerChoice|InquirerSeparator>;
export type InquirerQuestion            = import('inquirer').Question;
export type InquirerQuestions           = import('inquirer').QuestionCollection;
export type InquirerAnswers             = import('inquirer').Answers;

/**
 * Represents a Yeoman/Inquirer choice object.
 */
export type  YeomanChoice = InquirerChoice;

/**
 * Type. Represents a "checkbox choice" in Yeoman/Inquirer.
 */
export type YeomanCheckboxChoice = InquirerChoice;

/**
 * Type. Represents the function signature for a "Disabled" function.
 */
export type YeomanChoiceDisabledFunction = (answers:unknown) => boolean|string; // tslint:disable-line: no-any

/**
 * Represents what an answers hash should look like during Yeoman/Inquirer interactions
 * where the user is being asked to proceed/retry/abort something.
 */
export interface ConfirmationAnswers extends JsonMap {
  proceed:  boolean;
  restart:  boolean;
  abort:    boolean;
}

/**
 * Type. Defines a function that displays answers to a user.
 */
export type AnswersDisplay<T extends object> = (userAnswers?:T) => Promise<void | SfdxFalconTableData>;

/**
 * Type. Alias to a combination of Error or SfdxFalconResult.
 */
export type ErrorOrResult = Error | SfdxFalconResult;

/**
 * Interface. Represents the options that can be set by the SfdxFalconPrompt constructor.
 */
export interface PromptOptions<T extends object> {
  questions:            Questions | QuestionsBuilder; // Required. Questions for the user.
  questionsArgs?:       unknown[];                    // Optional. Array of arguments to be passed to a QuestionsBuilder function.
  defaultAnswers:       T;                            // Required. Default answers to the Questions.
  confirmation?:        Questions | QuestionsBuilder; // Optional. Confirmation Questions.
  confirmationArgs?:    unknown[];                    // Optional. Array of arguments to be passed to a QuestionsBuilder function.
  invertConfirmation?:  boolean;                      // Optional. Treats
  display?:             AnswersDisplay<T>;            // ???
  context?:             object;                       // Optional. The scope of the caller who creates an SfdxFalconPrompt.
  data?:                object;                       // Optional. ???
}

/**
 * Interface. Represents the options that can be set by the SfdxFalconInterview constructor.
 */
export interface InterviewOptions<T extends object> {
  defaultAnswers:       T;                            // Required. Default answers to the Questions.
  confirmation?:        Questions | QuestionsBuilder; // Optional. Confirmation Questions.
  confirmationHeader?:  string;                       // Optional. Text to be shown above the Interview's Confirmation Question.
  invertConfirmation?:  boolean;                      // Optional. Inverts the relevant Confirmation Answers before considering their value.
  display?:             AnswersDisplay<T>;            // Optional. Async function that returns void if the function renders something, or an array of Falcon Data Table rows if not.
  displayHeader?:       string;                       // Optional. Text to be shown above the Display Table.
  context?:             object;                       // Optional. ???
  sharedData?:          object;                       // Optional. ???
}

/**
 * Interface. Represents the options that can be set by the InterviewGroup constructor.
 */
export interface InterviewGroupOptions<T extends object> {
  questions:            Questions | QuestionsBuilder;
  questionsArgs?:       unknown[];
  confirmation?:        Questions | QuestionsBuilder;
  confirmationArgs?:    unknown[];
  invertConfirmation?:  boolean;
  display?:             AnswersDisplay<T>;
  when?:                ShowInterviewGroup;
  abort?:               AbortInterview;
  title?:               string;
}
/**
 * Interface. Represents a set of status indicators for an SfdxFalconInterview.
 */
export interface InterviewStatus {
  aborted?:   boolean;
  completed?: boolean;
  reason?:    string;
}

/**
 * Type alias defining a function that checks whether an Interview should be aborted.
 */
export type AbortInterview = (groupAnswers:InquirerAnswers, userAnswers?:InquirerAnswers) => boolean | string;

/**
 * Type alias defining a function that can be used to determine boolean control-flow inside an Interview.
 */
export type InterviewControlFunction = (userAnswers:InquirerAnswers, sharedData?:object) => boolean | Promise<boolean>;

/**
 * Type alias defining a function or simple boolean that checks whether an Interview Group should be shown.
 */
export type ShowInterviewGroup = boolean | InterviewControlFunction;

/**
 * Function type alias defining a function that returns Inquirer Questions.
 */
export type QuestionsBuilder = () => Questions;

/**
 * Alias to the Questions type from yeoman-generator. This is the "official" type for SFDX-Falcon.
 */
export type Questions = Questions;

/**
 * Alias to the Question type from yeoman-generator. This is the "official" type for SFDX-Falcon.
 */
export type Question = Question;

/**
 * Interface. Represents the initialization requirements for Yeoman Generators that implement SfdxFalconYeomanGenerator.
 */
export interface GeneratorRequirements {
  git:              boolean;
  gitRemoteUri:     string;
  localFile:        string;
  localDirectory:   string;
  standardOrgs:     boolean;
  scratchOrgs:      boolean;
  devHubOrgs:       boolean;
  envHubOrgs:       boolean;
  managedPkgOrgs:   boolean;
  unmanagedPkgOrgs: boolean;
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// Salesforce DX / JSForce related types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Type. Represents either an Org Alias or a JSForce Connection.
 */
export type AliasOrConnection = string | Connection;

/**
 * Interface. Represents a resolved (active) JSForce connection to a Salesforce Org.
 */
export interface ResolvedConnection {
  connection:       Connection;
  orgIdentifier:    string;
}

/**
 * Interface. Represents information needed to make a REST API request via a JSForce connection.
 */
export interface RestApiRequestDefinition {
  aliasOrConnection:  string|Connection;
  request:            RequestInfo;
  options?:           {any};
}

/**
 * Type. Alias to a Map with string keys and MetadataPackageVersion values.
 */
export type PackageVersionMap = Map<string, MetadataPackageVersion[]>;

/**
 * Type. Alias to the JSForce definition of QueryResult.
 */
export type QueryResult<T> = QueryResult<T>;

/**
 * Interface. Represents the "nonScratchOrgs" (aka "standard orgs") data returned by the sfdx force:org:list command.
 */
export interface RawStandardOrgInfo {
  orgId?:                   string;     // Why?
  username?:                string;     // Why?
  alias?:                   string;     // Why?
  accessToken?:             string;     // Why?
  instanceUrl?:             string;     // Why?
  loginUrl?:                string;     // Why?
  clientId?:                string;     // Why?
  isDevHub?:                boolean;    // Why?
  isDefaultDevHubUsername?: boolean;    // Why?
  defaultMarker?:           string;     // Why?
  connectedStatus?:         string;     // Why?
  lastUsed?:                string;     // Why?
}

/**
 * Interface. Represents the "scratchOrgs" data returned by the sfdx force:org:list --all command.
 */
export interface RawScratchOrgInfo {
  orgId?:                   string;     // Why?
  username?:                string;     // Why?
  alias?:                   string;     // Why?
  accessToken?:             string;     // Why?
  instanceUrl?:             string;     // Why?
  loginUrl?:                string;     // Why?
  clientId?:                string;     // Why?
  createdOrgInstance?:      string;     // Why?
  created?:                 string;     // Wyy?
  devHubUsername?:          string;     // Why?
  connectedStatus?:         string;     // Why?
  lastUsed?:                string;     // Why?
  attributes?:              object;     // Why?
  orgName?:                 string;     // Why?
  status?:                  string;     // Why?
  createdBy?:               string;     // Why?
  createdDate?:             string;     // Why?
  expirationDate?:          string;     // Why?
  edition?:                 string;     // Why?
  signupUsername?:          string;     // Why?
  devHubOrgId?:             string;     // Why?
  isExpired?:               boolean;    // Why?
}

/**
 * Type. Alias for a Map with string keys holding StandardOrgInfo values.
 */
export type StandardOrgInfoMap = Map<string, StandardOrgInfo>;

/**
 * Type. Alias for a Map with string keys holding ScratchOrgInfo values.
 */
export type ScratchOrgInfoMap = Map<string, ScratchOrgInfo>;

/**
 * Interface. Represents the options that can be set when constructing a StandardOrgInfo object.
 */
export interface StandardOrgInfoOptions extends RawStandardOrgInfo {
  metadataPackageResults?:  QueryResult<MetadataPackage>;
}

/**
 * Enum. Represents the various CLI log level flag values.
 */
export enum SfdxCliLogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO  = 'info',
  WARN  = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Interface. Represents the result of a call to shell.execL().
 */
export interface ShellExecResult {
  code?:     number;
  stdout?:   string;
  stderr?:   string;
  message?:  string;
  resolve?:  boolean;
}

/**
 * Interface. Represents the REST response provided for an Object Describe.
 */
export interface ObjectDescribe {
  activateable?:        boolean;
  createable?:          boolean;
  custom?:              boolean;
  customSetting?:       boolean;
  deletable?:           boolean;
  deprecatedAndHidden?: boolean;
  feedEnabled?:         boolean;
  hasSubtypes?:         boolean;
  isSubtype?:           boolean;
  keyPrefix?:           string;
  label?:               string;
  labelPlural?:         string;
  layoutable?:          boolean;
  mergeable?:           boolean;
  mruEnabled?:          boolean;
  name?:                string;
  queryable?:           boolean;
  replicateable?:       boolean;
  retrieveable?:        boolean;
  searchable?:          boolean;
  triggerable?:         boolean;
  undeletable?:         boolean;
  updateable?:          boolean;
  urls?:                any;      // tslint:disable-line: no-any
}

//
//
//
//
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
// SObject related types.
//─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
//
//
//
//

/**
 * Interface. Represents a baseline SObject.
 */
export interface SObject {
  id?:    string;
  name?:  string;
}

/**
 * Interface. Represents the Salesforce Profile SObject.
 */
export type Profile = SObject;

/**
 * Interface. Represents the Salesforce PermissionSetAssignment SObject.
 */
export interface PermissionSetAssignment extends SObject {
  PermissionSetId:  string;
  AssigneeId:       string;
}

/**
 * Interface. Represents the Salesforce User SObject.
 */
export interface User extends SObject {
  username?: string;
}

/**
 * Type. Alias for an array of objects that may have "Id" and "Name" properties.
 */
export type SObjectFindResult = Array<{Id?: string; Name?: string; }>;
