import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MachinePart {
    status: string;
    name: string;
}
export interface MGCRecord {
    id: string;
    status: string;
    gearName: string;
    gearNo: string;
    gearType: string;
    partSerialNo: string;
    machineNo: string;
    dueDate: string;
    calibrationDate: string;
    remarks: string;
}
export interface MachineRecord {
    id: string;
    dueDate: string;
    doneDate: string;
    parts: Array<MachinePart>;
    machineNo: string;
    machineType: string;
}
export interface backendInterface {
    addMGCRecord(id: string, gearName: string, gearNo: string, gearType: string, partSerialNo: string, machineNo: string, calibrationDate: string, dueDate: string, status: string, remarks: string): Promise<void>;
    addMachine(id: string, machineType: string, machineNo: string, doneDate: string, dueDate: string, parts: Array<MachinePart>): Promise<void>;
    deleteMGCRecord(id: string): Promise<void>;
    deleteMachine(id: string): Promise<void>;
    getAllMGCRecords(): Promise<Array<MGCRecord>>;
    getAllMachines(): Promise<Array<MachineRecord>>;
    updateMGCRecord(id: string, gearName: string, gearNo: string, gearType: string, partSerialNo: string, machineNo: string, calibrationDate: string, dueDate: string, status: string, remarks: string): Promise<void>;
    updateMachine(id: string, doneDate: string, dueDate: string, parts: Array<MachinePart>): Promise<void>;
}
