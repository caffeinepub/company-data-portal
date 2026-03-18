/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface MachinePart {
  'name': string;
  'status': string;
}
export interface MachineRecord {
  'id': string;
  'machineType': string;
  'machineNo': string;
  'doneDate': string;
  'dueDate': string;
  'parts': Array<MachinePart>;
}
export interface _SERVICE {
  'addMachine': ActorMethod<[string, string, string, string, string, Array<MachinePart>], undefined>;
  'getAllMachines': ActorMethod<[], Array<MachineRecord>>;
  'deleteMachine': ActorMethod<[string], undefined>;
  'updateMachine': ActorMethod<[string, string, string, Array<MachinePart>], undefined>;
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
