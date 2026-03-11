import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";

actor {
  type Category = {
    #sales;
    #hr;
    #finance;
    #operations;
    #other;
  };

  module Category {
    public func fromText(text : Text) : Category {
      switch (text.toLower()) {
        case ("sales") { #sales };
        case ("hr") { #hr };
        case ("finance") { #finance };
        case ("operations") { #operations };
        case ("other") { #other };
        case (_) { Runtime.trap("Invalid category: " # text) };
      };
    };
  };

  type RecordId = Text;

  type CompanyRecord = {
    id : RecordId;
    name : Text;
    category : Category;
    department : Text;
    date : Text;
    value : Float;
    notes : Text;
  };

  let records = Map.empty<RecordId, CompanyRecord>();

  public shared ({ caller }) func addRecord(
    id : Text,
    name : Text,
    categoryText : Text,
    department : Text,
    date : Text,
    value : Float,
    notes : Text,
  ) : async () {
    let category = Category.fromText(categoryText);
    let record = {
      id;
      name;
      category;
      department;
      date;
      value;
      notes;
    };
    records.add(id, record);
  };

  public query ({ caller }) func getAllRecords() : async [CompanyRecord] {
    records.values().toArray();
  };

  public shared ({ caller }) func deleteRecord(id : RecordId) : async () {
    if (not records.containsKey(id)) {
      Runtime.trap("Record with ID " # id # " does not exist. Try adding it first.");
    };
    records.remove(id);
  };
};
