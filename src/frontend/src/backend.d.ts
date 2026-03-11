import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CompanyRecord {
    id: RecordId;
    value: number;
    date: string;
    name: string;
    notes: string;
    category: Category;
    department: string;
}
export type RecordId = string;
export enum Category {
    hr = "hr",
    finance = "finance",
    other = "other",
    sales = "sales",
    operations = "operations"
}
export interface backendInterface {
    addRecord(id: string, name: string, categoryText: string, department: string, date: string, value: number, notes: string): Promise<void>;
    deleteRecord(id: RecordId): Promise<void>;
    getAllRecords(): Promise<Array<CompanyRecord>>;
}
