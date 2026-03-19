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

  // New MGC record type
  type MGCRecord = {
    id : Text;
    gearName : Text;
    gearNo : Text;
    calibrationDate : Text;
    dueDate : Text;
    status : Text;
    remarks : Text;
  };

  let machines = Map.empty<Text, MachineRecord>();
  let mgcRecords = Map.empty<Text, MGCRecord>();

  // Machine record methods
  public shared ({ caller }) func addMachine(
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

  public query ({ caller }) func getAllMachines() : async [MachineRecord] {
    machines.values().toArray();
  };

  public shared ({ caller }) func deleteMachine(id : Text) : async () {
    machines.remove(id);
  };

  public shared ({ caller }) func updateMachine(
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

  // MGC record methods
  public shared ({ caller }) func addMGCRecord(
    id : Text,
    gearName : Text,
    gearNo : Text,
    calibrationDate : Text,
    dueDate : Text,
    status : Text,
    remarks : Text,
  ) : async () {
    let record : MGCRecord = {
      id;
      gearName;
      gearNo;
      calibrationDate;
      dueDate;
      status;
      remarks;
    };
    mgcRecords.add(id, record);
  };

  public query ({ caller }) func getAllMGCRecords() : async [MGCRecord] {
    mgcRecords.values().toArray();
  };

  public shared ({ caller }) func deleteMGCRecord(id : Text) : async () {
    mgcRecords.remove(id);
  };

  public shared ({ caller }) func updateMGCRecord(
    id : Text,
    gearName : Text,
    gearNo : Text,
    calibrationDate : Text,
    dueDate : Text,
    status : Text,
    remarks : Text,
  ) : async () {
    switch (mgcRecords.get(id)) {
      case (?existing) {
        let updated : MGCRecord = {
          id;
          gearName;
          gearNo;
          calibrationDate;
          dueDate;
          status;
          remarks;
        };
        mgcRecords.add(id, updated);
      };
      case null {};
    };
  };
};
