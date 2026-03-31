import Map "mo:core/Map";
import Text "mo:core/Text";

// v3 - MGC 10-field interface with machineNo
actor {
  // ── Legacy types (kept for stable variable compatibility) ─────────────────
  type OldCategory = { #sales; #hr; #finance; #operations; #other };
  type OldRecord = {
    id : Text; name : Text; category : OldCategory; department : Text;
    date : Text; value : Float; notes : Text;
  };
  type OldMGCRecord = {
    id : Text; gearName : Text; gearNo : Text;
    calibrationDate : Text; dueDate : Text; status : Text; remarks : Text;
  };
  type MGCRecordV2 = {
    id : Text; gearName : Text; gearNo : Text; gearType : Text;
    partSerialNo : Text; calibrationDate : Text; dueDate : Text;
    status : Text; remarks : Text;
  };

  // Legacy stable maps (must keep original names to preserve upgrade compatibility)
  stable var records = Map.empty<Text, OldRecord>();
  stable var mgcRecords = Map.empty<Text, OldMGCRecord>();
  stable var mgcRecordsV2 = Map.empty<Text, MGCRecordV2>();

  // ── Current types ─────────────────────────────────────────────────────────
  type MachinePart = { name : Text; status : Text };
  type MachineRecord = {
    id : Text; machineType : Text; machineNo : Text;
    doneDate : Text; dueDate : Text; parts : [MachinePart];
  };
  type MGCRecord = {
    id : Text; gearName : Text; gearNo : Text; gearType : Text;
    partSerialNo : Text; machineNo : Text; calibrationDate : Text;
    dueDate : Text; status : Text; remarks : Text;
  };

  // Current stable storage
  stable var mgcRecordsV3 = Map.empty<Text, MGCRecord>();
  stable var machines = Map.empty<Text, MachineRecord>();

  // Migrate old records into V3 on every upgrade (idempotent)
  system func postupgrade() {
    for ((k, old) in mgcRecords.entries()) {
      if (mgcRecordsV3.get(k) == null) {
        mgcRecordsV3.add(k, {
          id = old.id; gearName = old.gearName; gearNo = old.gearNo;
          gearType = ""; partSerialNo = ""; machineNo = "";
          calibrationDate = old.calibrationDate; dueDate = old.dueDate;
          status = old.status; remarks = old.remarks;
        });
      };
    };
    for ((k, v2) in mgcRecordsV2.entries()) {
      if (mgcRecordsV3.get(k) == null) {
        mgcRecordsV3.add(k, {
          id = v2.id; gearName = v2.gearName; gearNo = v2.gearNo;
          gearType = v2.gearType; partSerialNo = v2.partSerialNo;
          machineNo = ""; calibrationDate = v2.calibrationDate;
          dueDate = v2.dueDate; status = v2.status; remarks = v2.remarks;
        });
      };
    };
  };

  // ── Machine methods ───────────────────────────────────────────────────────
  public shared func addMachine(
    id : Text, machineType : Text, machineNo : Text,
    doneDate : Text, dueDate : Text, parts : [MachinePart],
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
    id : Text, doneDate : Text, dueDate : Text, parts : [MachinePart],
  ) : async () {
    switch (machines.get(id)) {
      case (?existing) {
        machines.add(id, { existing with doneDate; dueDate; parts });
      };
      case null {};
    };
  };

  // ── MGC methods ───────────────────────────────────────────────────────────
  public shared func addMGCRecord(
    id : Text, gearName : Text, gearNo : Text, gearType : Text,
    partSerialNo : Text, machineNo : Text, calibrationDate : Text,
    dueDate : Text, status : Text, remarks : Text,
  ) : async () {
    mgcRecordsV3.add(id, {
      id; gearName; gearNo; gearType; partSerialNo; machineNo;
      calibrationDate; dueDate; status; remarks;
    });
  };

  public query func getAllMGCRecords() : async [MGCRecord] {
    mgcRecordsV3.values().toArray();
  };

  public shared func deleteMGCRecord(id : Text) : async () {
    mgcRecordsV3.remove(id);
  };

  public shared func updateMGCRecord(
    id : Text, gearName : Text, gearNo : Text, gearType : Text,
    partSerialNo : Text, machineNo : Text, calibrationDate : Text,
    dueDate : Text, status : Text, remarks : Text,
  ) : async () {
    switch (mgcRecordsV3.get(id)) {
      case (?existing) {
        mgcRecordsV3.add(id, {
          existing with
          gearName; gearNo; gearType; partSerialNo; machineNo;
          calibrationDate; dueDate; status; remarks;
        });
      };
      case null {};
    };
  };
};
