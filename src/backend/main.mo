import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Float "mo:core/Float";

actor {
  // ── Migration: preserve old stable variable so upgrade succeeds ──
  type OldCategory = { #sales; #hr; #finance; #operations; #other };
  type OldRecord = {
    id : Text;
    name : Text;
    category : OldCategory;
    department : Text;
    date : Text;
    value : Float;
    notes : Text;
  };
  // Keep old `records` variable declared with its original type so Motoko
  // can deserialise it on upgrade instead of raising M0169.
  // It is intentionally unused after migration.
  let records = Map.empty<Text, OldRecord>();

  // ── New machine record types ──
  type MachinePart = {
    name : Text;
    status : Text;
  };

  type MachineRecord = {
    id : Text;
    machineType : Text;
    machineNo : Text;
    doneDate : Text;
    dueDate : Text;
    parts : [MachinePart];
  };

  let machines = Map.empty<Text, MachineRecord>();

  public shared func addMachine(
    id : Text,
    machineType : Text,
    machineNo : Text,
    doneDate : Text,
    dueDate : Text,
    parts : [MachinePart],
  ) : async () {
    let record : MachineRecord = { id; machineType; machineNo; doneDate; dueDate; parts };
    machines.add(id, record);
  };

  public query func getAllMachines() : async [MachineRecord] {
    machines.values().toArray();
  };

  public shared func deleteMachine(id : Text) : async () {
    machines.remove(id);
  };

  public shared func updateMachine(
    id : Text,
    doneDate : Text,
    dueDate : Text,
    parts : [MachinePart],
  ) : async () {
    switch (machines.get(id)) {
      case (?existing) {
        let updated : MachineRecord = { existing with doneDate; dueDate; parts };
        machines.add(id, updated);
      };
      case null {};
    };
  };
};
