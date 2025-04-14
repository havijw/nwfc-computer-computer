import { type PyodideFileInfo } from "../hooks/usePyodideTextFile";
import { type Course, type Student, type SolverConfiguration } from "../models";

interface WorkerMessage {
  id: string;
  type: string;
}

//// Requests

export interface WorkerStatusRequest extends WorkerMessage {
  type: "status";
}

export interface WorkerSolveRequest extends WorkerMessage {
  type: "solve";
  courseInputFile: PyodideFileInfo;
  studentInputFile: PyodideFileInfo;
  configuration: SolverConfiguration;
}

export interface WorkerFileUploadRequest extends WorkerMessage {
  type: "file";
  file: File | null;
  path: string;
}

export type WorkerRequest =
  | WorkerStatusRequest
  | WorkerSolveRequest
  | WorkerFileUploadRequest;

//// Responses

interface WorkerStatusResponse extends WorkerMessage {
  type: "status";
  ready: boolean;
  error: string | null;
}

interface WorkerSolveResponseBase extends WorkerMessage {
  type: "solve";
  assignments: [Course, Student[]][] | null;
  error: string | null;
}

interface WorkerSolveResponseSuccess extends WorkerSolveResponseBase {
  assignments: [Course, Student[]][];
  error: null;
}

interface WorkerSolveResponseError extends WorkerSolveResponseBase {
  assignments: null;
  error: string;
}

type WorkerSolveResponse = WorkerSolveResponseSuccess | WorkerSolveResponseError;

interface WorkerFileResponse extends WorkerMessage {
  type: "file";
  path: string;
  loaded: boolean;
  error: string | null;
}

export type WorkerResponse =
  | WorkerStatusResponse
  | WorkerSolveResponse
  | WorkerFileResponse;
