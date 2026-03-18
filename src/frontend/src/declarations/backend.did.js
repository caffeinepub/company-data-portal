/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

export const MachinePart = IDL.Record({
  'name': IDL.Text,
  'status': IDL.Text,
});

export const MachineRecord = IDL.Record({
  'id': IDL.Text,
  'machineType': IDL.Text,
  'machineNo': IDL.Text,
  'doneDate': IDL.Text,
  'dueDate': IDL.Text,
  'parts': IDL.Vec(MachinePart),
});

export const idlService = IDL.Service({
  'addMachine': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(MachinePart)], [], []),
  'getAllMachines': IDL.Func([], [IDL.Vec(MachineRecord)], ['query']),
  'deleteMachine': IDL.Func([IDL.Text], [], []),
  'updateMachine': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Vec(MachinePart)], [], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const MachinePart = IDL.Record({
    'name': IDL.Text,
    'status': IDL.Text,
  });
  const MachineRecord = IDL.Record({
    'id': IDL.Text,
    'machineType': IDL.Text,
    'machineNo': IDL.Text,
    'doneDate': IDL.Text,
    'dueDate': IDL.Text,
    'parts': IDL.Vec(MachinePart),
  });
  return IDL.Service({
    'addMachine': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(MachinePart)], [], []),
    'getAllMachines': IDL.Func([], [IDL.Vec(MachineRecord)], ['query']),
    'deleteMachine': IDL.Func([IDL.Text], [], []),
    'updateMachine': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Vec(MachinePart)], [], []),
  });
};

export const init = ({ IDL }) => { return []; };
