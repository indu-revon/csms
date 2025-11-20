export type OcppMessage = [number, string, string?, any?];
export interface OcppCall extends Array<any> {
    0: 2;
    1: string;
    2: string;
    3: any;
}
export interface OcppCallResult extends Array<any> {
    0: 3;
    1: string;
    2: any;
}
export interface OcppCallError extends Array<any> {
    0: 4;
    1: string;
    2: string;
    3: string;
    4: any;
}
