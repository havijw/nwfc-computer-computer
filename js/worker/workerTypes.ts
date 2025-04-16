import { type PyodideFileInfo } from "../hooks/usePyodideWorkerFile";
import { type Course, type Student, type SolverConfiguration } from "../models";

/** Base type for messages to and from the worker. */
interface WorkerMessage {
  /** Message ID. Used to identify which request a response is responding to.
   *
   * Responses have the same ID as the corresponding request.
   */
  id: string;

  /** Message type. One of:
   * - `"status"`
   * - `"solve"`
   * - `"file"`
   *
   * Responses have the same type as the corresponding request.
   */
  type: string;
}

/********** Requests **********/

/** Request for worker status: ready for solving or not.
 *
 * See `WorkerStatusResponse`.
 */
export interface WorkerStatusRequest extends WorkerMessage {
  type: "status";
}

/** Request for worker to solve the optimal assignments for a set of course and students.
 *
 * See `WorkerSolveResponse`.
 */
export interface WorkerSolveRequest extends WorkerMessage {
  type: "solve";

  /** Information about course data file for solver to use. */
  courseInputFile: PyodideFileInfo;

  /** Information about student data file for solver to use. */
  studentInputFile: PyodideFileInfo;

  /** Solver configuration to apply. */
  configuration: SolverConfiguration;
}

/** Request for worker to upload a text file to Pyodide's file system.
 *
 * See `WorkerFileResponse`.
 */
export interface WorkerFileRequest extends WorkerMessage {
  type: "file";

  /** `File` object to be uploaded. Only text files are supported.
   *
   * If `null`, file at the given path will be removed.
   */
  file: File | null;

  /** Path where file should be uploaded or removed. */
  path: string;
}

/** Union of possible requests that can be sent to the worker. */
export type WorkerRequest =
  | WorkerStatusRequest
  | WorkerSolveRequest
  | WorkerFileRequest;

/********** Responses **********/
/* Many of the response types are structured to provide helpful type narrowing between
 * success and failure types. For instance, a status response is guaranteed by the type
 * system to have a non-null error if and only if the `ready` property is false.
 * This means elsewhere, we can check for a non-null error, and in the else block,
 * assume that the solver is ready. The solve response type also uses this structure.
 */

interface WorkerStatusResponseBase extends WorkerMessage {
  type: "status";

  /** Whether the solver is loaded and the worker is ready for solve requests. */
  ready: boolean;

  /** Error due to loading the solver. */
  error: string | null;
}

/** Response when the solver is ready. */
interface WorkerStatusResponseReady extends WorkerStatusResponseBase {
  ready: true;
  error: null;
}

/** Response when the solver is not ready yet (or due to an error in loading it). */
interface WorkerStatusResponseNotReady extends WorkerStatusResponseBase {
  ready: false;
  error: string;
}

/** Response with status of the worker: ready for solving or not.
 *
 * See `WorkerStatusRequest`.
 */
export type WorkerStatusResponse =
  | WorkerStatusResponseReady
  | WorkerStatusResponseNotReady;

/** Base class for solve responses. The `WorkerSolveResponse` type is structured this
 * way so that a response is guaranteed to either have non-null assignments or non-null
 * error. This is useful for type narrowing - we can check if error is null, and if it
 * is not, then we are guaranteed to have non-null assignments.
 */
interface WorkerSolveResponseBase extends WorkerMessage {
  type: "solve";

  /** Optimal course assignments given solver inputs. */
  assignments: [Course, Student[]][] | null;

  /** Error during solving. */
  error: string | null;
}

/** Response due to a successful solve of course assignments. */
interface WorkerSolveResponseSuccess extends WorkerSolveResponseBase {
  assignments: [Course, Student[]][];
  error: null;
}

/** Response due to an error while solving course assignments. */
interface WorkerSolveResponseError extends WorkerSolveResponseBase {
  assignments: null;
  error: string;
}

/** Response with optimal course assignements for some solver inputs.
 *
 * See `WorkerSolveRequest`.
 */
export type WorkerSolveResponse = WorkerSolveResponseSuccess | WorkerSolveResponseError;

/** Response with information about file in Pyodide's file system.
 *
 * See `WorkerFileRequest`.
 */
export interface WorkerFileResponse extends WorkerMessage {
  type: "file";

  /** Path of interest in Pyodide's file system. */
  path: string;

  /** Whether the file currently exists in Pyodide's file system. */
  loaded: boolean;

  /** Error due to loading or removing the file. */
  error: string | null;
}

/** Union of possible responses that can be sent by the worker. */
export type WorkerResponse =
  | WorkerStatusResponse
  | WorkerSolveResponse
  | WorkerFileResponse;
