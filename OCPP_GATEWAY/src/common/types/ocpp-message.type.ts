export type OcppMessage = [number, string, string?, any?];

export interface OcppCall extends Array<any> {
  0: 2; // CALL
  1: string; // messageId
  2: string; // action
  3: any; // payload
}

export interface OcppCallResult extends Array<any> {
  0: 3; // CALL_RESULT
  1: string; // messageId
  2: any; // payload
}

export interface OcppCallError extends Array<any> {
  0: 4; // CALL_ERROR
  1: string; // messageId
  2: string; // errorCode
  3: string; // errorDescription
  4: any; // errorDetails
}
