import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";

actor {
  // ── Legacy migration variables ──────────────────────────────────────────
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
  let records = Map.empty<Text, OldRecord>();

  // Old MGCRecord shape (no gearType / partSerialNo).
  // Keep this variable with the OLD name and OLD type so that Motoko can
  // deserialise the on-disk data from the previous canister version.
  type OldMGCRecord = {
    id : Text;
    gearName : Text;
    gearNo : Text;
    calibrationDate : Text;
    dueDate : Text;
    status : Text;
    remarks : Text;
  };
  let mgcRecords = Map.empty<Text, OldMGCRecord>();

  // ── Current types ────────────────────────────────────────────────────────
  type MachinePart = { name : Text; status : Text };

  type MachineRecord = {
    id : Text;
    machineType : Text;
    machineNo : Text;
    doneDate : Text;
    dueDate : Text;
    parts : [MachinePart];
  };

  type MGCRecord = {
    id : Text;
    gearName : Text;
    gearNo : Text;
    gearType : Text;
    partSerialNo : Text;
    calibrationDate : Text;
    dueDate : Text;
    status : Text;
    remarks : Text;
  };

  let machines = Map.empty<Text, MachineRecord>();

  // New stable storage for MGC records (V2 with gearType + partSerialNo).
  let mgcRecordsV2 = Map.empty<Text, MGCRecord>();

  // Migrate old records into V2 on every init/upgrade (idempotent).
  system func postupgrade() {
    for ((k, old) in mgcRecords.entries()) {
      if (mgcRecordsV2.get(k) == null) {
        mgcRecordsV2.add(k, {
          id = old.id;
          gearName = old.gearName;
          gearNo = old.gearNo;
          gearType = "";
          partSerialNo = "";
          calibrationDate = old.calibrationDate;
          dueDate = old.dueDate;
          status = old.status;
          remarks = old.remarks;
        });
      };
    };
  };

  // ── Machine methods ──────────────────────────────────────────────────────
  public shared func addMachine(
    id : Text,
    machineType : Text,
    machineNo : Text,
    doneDate : Text,
    dueDate : Text,
    parts : [MachinePart],
  ) : async () {
    machines.add(id, { id; machineType; machineNo; doneDate; dueDate; parts });
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
        machines.add(id, { existing with doneDate; dueDate; parts });
      };
      case null {};
    };
  };

  // ── MGC methods (use mgcRecordsV2) ───────────────────────────────────────
  public shared func addMGCRecord(
    id : Text,
    gearName : Text,
    gearNo : Text,
    gearType : Text,
    partSerialNo : Text,
    calibrationDate : Text,
    dueDate : Text,
    status : Text,
    remarks : Text,
  ) : async () {
    mgcRecordsV2.add(id, {
      id; gearName; gearNo; gearType; partSerialNo;
      calibrationDate; dueDate; status; remarks;
    });
  };

  public query func getAllMGCRecords() : async [MGCRecord] {
    mgcRecordsV2.values().toArray();
  };

  public shared func deleteMGCRecord(id : Text) : async () {
    mgcRecordsV2.remove(id);
  };

  public shared func updateMGCRecord(
    id : Text,
    gearName : Text,
    gearNo : Text,
    gearType : Text,
    partSerialNo : Text,
    calibrationDate : Text,
    dueDate : Text,
    status : Text,
    remarks : Text,
  ) : async () {
    switch (mgcRecordsV2.get(id)) {
      case (?existing) {
        mgcRecordsV2.add(id, {
          existing with
          gearName; gearNo; gearType; partSerialNo;
          calibrationDate; dueDate; status; remarks;
        });
      };
      case null {};
    };
  };
};
