//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @file          commands/tmtools/tm1/transform.ts
 * @copyright     Vivek M. Chawla - 2019
 * @author        Vivek M. Chawla <@VivekMChawla>
 * @summary       Implements the CLI command "tmtools:tm1:transform"
 * @description   Salesforce CLI Plugin command (tmtools:tm1:transform) that inspects Territory
 *                Management (TM1) data and metadata stored locally and transforms it into the
 *                required data and metadata for a successful deployment to an org where Enterprise
 *                Territory Management (TM2) is currently activated.
 * @version       1.0.0
 * @license       MIT
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
// Import External Modules
import {flags}                        from  '@salesforce/command';  // Allows creation of flags for CLI commands.
import {Messages}                     from  '@salesforce/core';     // Messages library that simplifies using external JSON for string reuse.
import {SfdxError}                    from  '@salesforce/core';     // Generalized SFDX error which also contains an action.
import {AnyJson}                      from  '@salesforce/ts-types'; // Safe type for use where "any" might otherwise be used.

// Import Local Modules
import {SfdxFalconDebug}              from  '../../../modules/sfdx-falcon-debug';           // Class. Provides custom "debugging" services (ie. debug-style info to console.log()).
import {SfdxFalconError}              from  '../../../modules/sfdx-falcon-error';           // Class. Extends SfdxError to provide specialized error structures for SFDX-Falcon modules.
import {SfdxFalconYeomanCommand}      from  '../../../modules/sfdx-falcon-yeoman-command';  // Base class that CLI commands in this project that use Yeoman should use.

// Import Internal Types
import {SfdxFalconCommandType}        from  '../../../modules/sfdx-falcon-command'; // Enum. Represents the types of SFDX-Falcon Commands.

// Set the File Local Debug Namespace
const dbgNs = 'COMMAND:tmtools-tm1-transform:';
SfdxFalconDebug.msg(`${dbgNs}`, `Debugging initialized for ${dbgNs}`);

// Use SfdxCore's Messages framework to get the message bundles for this command.
Messages.importMessagesDirectory(__dirname);
const commandMessages = Messages.loadMessages('territory-management-toolkit', 'tmtools-tm1-transform');


//─────────────────────────────────────────────────────────────────────────────────────────────────┐
/**
 * @class       TmtoolsTm1Transform
 * @extends     SfdxFalconYeomanCommand
 * @summary     Implements the CLI Command "tmtools:tm1:transform"
 * @description The command "tmtools:tm1:transform"...TODO: Add description
 * @public
 */
//─────────────────────────────────────────────────────────────────────────────────────────────────┘
export default class TmtoolsTm1Transform extends SfdxFalconYeomanCommand {

  // Define the basic properties of this CLI command.
  public static description = commandMessages.getMessage('commandDescription');
  public static hidden      = false;
  public static examples    = [
    `$ sfdx tmtools:tm1:transform`,
    `$ sfdx tmtools:tm1:transform -s ~/tm1-extraction-report-directory`
  ];

  //───────────────────────────────────────────────────────────────────────────┐
  // Define the flags used by this command.
  // -s --SOURCEDIR   Directory that contains a tm1-extraction.json file.
  //                  Defaults to . (current directory) if not specified.
  //───────────────────────────────────────────────────────────────────────────┘
  protected static flagsConfig = {
    sourcedir: flags.directory({
      char: 's',
      required: true,
      description: commandMessages.getMessage('sourcedir_FlagDescription'),
      default: '.',
      hidden: false
    }),

    // IMPORTANT! The next line MUST be here to import the FalconDebug flags.
    ...SfdxFalconYeomanCommand.falconBaseflagsConfig
  };

  // Identify the core SFDX arguments/features required by this command.
  protected static requiresProject        = false;  // True if an SFDX Project workspace is REQUIRED.
  protected static requiresUsername       = false;  // True if an org username is REQUIRED.
  protected static requiresDevhubUsername = false;  // True if a hub org username is REQUIRED.
  protected static supportsUsername       = false;  // True if an org username is OPTIONAL.
  protected static supportsDevhubUsername = false;  // True if a hub org username is OPTIONAL.

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @function    run
   * @returns     {Promise<AnyJson>}  Resolves with a JSON object that the CLI
   *              will pass to the user as stdout if the --json flag was set.
   * @description Entrypoint function for "sfdx tmtools:tm1:transform".
   * @public @async
   */
  //───────────────────────────────────────────────────────────────────────────┘
  public async run():Promise<AnyJson> {

    // Initialize the SfdxFalconCommand (required by ALL classes that extend SfdxFalconCommand).
    this.sfdxFalconCommandInit('tmtools:tm1:transform', SfdxFalconCommandType.UNKNOWN);

    // Run a Yeoman Generator to interact with and run tasks for the user.
    await super.runYeomanGenerator({
      generatorType:  'tmtools-tm1-transform',
      sourceDir:      this.sourceDirectory,
      options: []
    })
    .then(generatorResult   => this.onSuccess(generatorResult)) // Implemented by parent class
    .catch(generatorResult  => this.onError(generatorResult));  // Implemented by parent class

    // Return the JSON Response that was created by onSuccess()
    return this.falconJsonResponse as unknown as AnyJson;
  }

  //───────────────────────────────────────────────────────────────────────────┐
  /**
   * @method      buildFinalError
   * @param       {SfdxFalconError} cmdError  Required. Error object used as
   *              the basis for the "friendly error message" being created
   *              by this method.
   * @returns     {SfdxError}
   * @description Builds a user-friendly error message that is appropriate to
   *              the CLI command that's being implemented by this class. The
   *              output of this method will always be used by the onError()
   *              method from the base class to communicate the end-of-command
   *              error state.
   * @protected
   */
  //───────────────────────────────────────────────────────────────────────────┘
  protected buildFinalError(cmdError:SfdxFalconError):SfdxError {

    // If not implementing anything special here, simply return cmdError.
    return cmdError;
  }
}
