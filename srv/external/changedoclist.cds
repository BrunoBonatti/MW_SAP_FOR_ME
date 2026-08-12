/* checksum : e116344f1d2b8d66d74c43b6a65b7a08 */
@cds.external : true
@m.IsDefaultEntityContainer : 'true'
service changedoclist {
  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ChangeDocumentCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    key ID : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BusinessObject : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ObjectUUID : String not null;
    @odata.Type : 'Edm.DateTime'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ChangeDateTime : DateTime not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ChangedByIdentityUUID : UUID not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ChangedByUserName : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    CompleteNodeHierarchy : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ObjectNodeElementName : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ObjectNodeElementOldContent : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ObjectNodeElementNewContent : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ObjectNodeElementModificationTypeCode : String not null;
  };
};

