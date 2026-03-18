export interface MachinePart {
    name: string;
    status: string;
}
export interface MachineRecord {
    id: string;
    machineType: string;
    machineNo: string;
    doneDate: string;
    dueDate: string;
    parts: MachinePart[];
}
export interface backendInterface {
    addMachine(id: string, machineType: string, machineNo: string, doneDate: string, dueDate: string, parts: MachinePart[]): Promise<void>;
    getAllMachines(): Promise<MachineRecord[]>;
    deleteMachine(id: string): Promise<void>;
    updateMachine(id: string, doneDate: string, dueDate: string, parts: MachinePart[]): Promise<void>;
}
