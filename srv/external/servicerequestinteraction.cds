/* checksum : cf0d99776f005577680e079ef806b8f7 */
@cds.external : true
@m.IsDefaultEntityContainer : 'true'
service servicerequestinteraction {
  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionTicketCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ID : String(35);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    EntityLastChangedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ServiceRequestLifeCycleStatusCode : String(2);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ServiceRequestUserLifeCycleStatusCode : String(2);
    ServiceRequestInteractionInteractions : Association to many ServiceRequestInteractionInteractionsCollection {  };
    ServiceRequestInteractionOngoingInteraction : Association to many ServiceRequestInteractionOngoingInteractionCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionInteractionsCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ID : String(35);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    InformationSensitivityCode : String(1);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    InitiatingActivityUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    InitiatorCode : String(1);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    LifeCycleStatusCode : String(2);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PredecessorActivityUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PriorityCode : String(1);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ProcessingTypeCode : String(4);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ReportedDateTime : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.display.format : 'Date'
    ReportedDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.display.format : 'Date'
    ScheduledStartDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    SocialMediaActivityProviderUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.display.format : 'Date'
    ScheduledEndDate : Date;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ScheduledEndDateTime : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ScheduledStartDateTime : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.display.format : 'Date'
    TransmittedDate : Date;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    TransmittedDateTime : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TypeCode : String(15);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    FromEmailURI : String(254);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    FromPartyID : String(60);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    FromPartyName : String(255);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    SubjectName : String(765);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    GroupCode : String(4);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    DataOriginTypeCode : String(3);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.display.format : 'Date'
    CreationDate : Date;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CreationDateTime : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    CreationIdentityUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    LastChangeDateTime : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    LastChangeIdentityUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    IsDraft : String(5);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    NumberOfAttachments : String(3);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PhoneCallExternalID : String(35);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    IsMemoEditableForUser : String(5);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    IsSubjectSetByML : String(5);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    EntityLastChangedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Text : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    FromPartyUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    FirstRepliedDateTime : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ActivitySentimentTypeCode : String(2);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    InteractionInternalComment : String;
    ServiceRequestInteractionTextCollection : Association to many ServiceRequestInteractionTextCollectionCollection {  };
    ServiceRequestInteractionAttachment : Association to many ServiceRequestInteractionAttachmentCollection {  };
    ServiceRequestInteractionToParty : Association to many ServiceRequestInteractionToPartyCollection {  };
    ServiceRequestInteractionEMailCC : Association to many ServiceRequestInteractionEMailCCCollection {  };
    ServiceRequestInteractionParty : Association to many ServiceRequestInteractionPartyCollection {  };
    ServiceRequestInteractionEMailBCC : Association to many ServiceRequestInteractionEMailBCCCollection {  };
    ServiceRequestInteractionAttachmentHeader : Association to many ServiceRequestInteractionAttachmentHeaderCollection {  };
    ServiceRequestInteractionOriginalContent : Association to many ServiceRequestInteractionOriginalContentCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionToPartyCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    EmailURI : String(254);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PartyID : String(60);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PartyName : String(255);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PartyUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    RoleCategoryCode : String(3);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    TypeCode : String(15);
    ServiceRequestInteractionInteractions : Association to ServiceRequestInteractionInteractionsCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionEMailCCCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    EmailURI : String(254);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PartyID : String(60);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PartyName : String(255);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PartyUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    RoleCategoryCode : String(3);
    ServiceRequestInteractionInteractions : Association to ServiceRequestInteractionInteractionsCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'false'
  @sap.deletable : 'true'
  entity ServiceRequestInteractionAttachmentCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    UUID : UUID not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Name : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    MimeType : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    Binary : LargeBinary;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    SizeInkB : Decimal(31, 14);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DocumentLink : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    OutputRelevanceIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LinkWebURI : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TypeCode : String(5);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CategoryCode : String(1) not null;
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CreatedBy : String(80);
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LastUpdatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LastUpdatedBy : String(80);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Title : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionAttachmentHeaderCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    key ObjectID : UUID not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ParentObjectID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    DocumentUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    TypeCode : String(5);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    MIMECode : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    Name : String;
    ServiceRequestInteractionInteractions : Association to ServiceRequestInteractionInteractionsCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionPartyCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PartyName : String(255);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PartyID : String(60);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    RoleCode : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    RoleCategoryCode : String(3);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    PartyUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    EmailURI : String(254);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    FormattedPhoneNumberDescription : String(350);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    BupaRoleCode : String(6);
    ServiceRequestInteractionInteractions : Association to ServiceRequestInteractionInteractionsCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionOriginalContentCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    key ObjectID : UUID not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ParentObjectID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    BodyContent : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ContentType : String;
    ServiceRequestInteractionInteractions : Association to ServiceRequestInteractionInteractionsCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'true'
  entity ServiceRequestInteractionTextCollectionCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    FormattedText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    Text : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TypeCode : String(5);
    ServiceRequestInteractionInteractions : Association to ServiceRequestInteractionInteractionsCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionEMailBCCCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    EmailURI : String(254);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PartyID : String(60);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PartyName : String(255);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PartyUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    RoleCategoryCode : String(3) not null;
    ServiceRequestInteractionInteractions : Association to ServiceRequestInteractionInteractionsCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionOngoingInteractionCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ServiceRequestID : String(35);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ServiceRequestUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Subject : String(765);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    TransmissionStatus : String(2);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    TypeCode : String(15);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    EntityLastChangedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    NumberOfAttachments : String(3);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CreationDateTime : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    CreationIdentityUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    LastChangeIdentityUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    FromEmailURI : String(254);
    ServiceRequestInteractionOngoingToParty : Association to many ServiceRequestInteractionOngoingToPartyCollection {  };
    ServiceRequestInteractionOngoingEmailCC : Association to many ServiceRequestInteractionOngoingEmailCCCollection {  };
    ServiceRequestInteractionOngoingEmailBCC : Association to many ServiceRequestInteractionOngoingEmailBCCCollection {  };
    ServiceRequestInteractionOngoingParty : Association to many ServiceRequestInteractionOngoingPartyCollection {  };
    ServiceRequestInteractionOngoingAttachmentFolder : Association to many ServiceRequestInteractionOngoingAttachmentFolderCollection {  };
    ServiceRequestInteractionOngoingAttachmentHeader : Association to many ServiceRequestInteractionOngoingAttachmentHeaderCollection {  };
    ServiceRequestInteractionOngoingOriginalContent : Association to many ServiceRequestInteractionOngoingOriginalContentCollection {  };
    ServiceRequestInteractionOngoingErrorLog : Association to many ServiceRequestInteractionOngoingErrorLogCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionOngoingToPartyCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    RoleCategoryCode : String(3);
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    EmailURI : String(254);
    ServiceRequestInteractionOngoingInteraction : Association to ServiceRequestInteractionOngoingInteractionCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionOngoingEmailCCCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    RoleCategoryCode : String(3);
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    EmailURI : String(254);
    ServiceRequestInteractionOngoingInteraction : Association to ServiceRequestInteractionOngoingInteractionCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionOngoingEmailBCCCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    EmailURI : String(254);
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    RoleCategoryCode : String(3);
    ServiceRequestInteractionOngoingInteraction : Association to ServiceRequestInteractionOngoingInteractionCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionOngoingPartyCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    EmailURI : String(254);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    RoleCategoryCode : String(3);
    ServiceRequestInteractionOngoingInteraction : Association to ServiceRequestInteractionOngoingInteractionCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'true'
  entity ServiceRequestInteractionOngoingAttachmentFolderCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    UUID : UUID not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Name : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    MimeType : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    Binary : LargeBinary;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    SizeInkB : Decimal(31, 14);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DocumentLink : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    OutputRelevanceIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LinkWebURI : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TypeCode : String(5);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CategoryCode : String(1) not null;
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CreatedBy : String(80);
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LastUpdatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LastUpdatedBy : String(80);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Title : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionOngoingAttachmentHeaderCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    key ObjectID : UUID not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ParentObjectID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    DocumentUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    TypeCode : String(5);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    MIMECode : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    Name : String;
    ServiceRequestInteractionOngoingInteraction : Association to ServiceRequestInteractionOngoingInteractionCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionOngoingOriginalContentCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    key ObjectID : UUID not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ParentObjectID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    BodyContent : String;
    ServiceRequestInteractionOngoingInteraction : Association to ServiceRequestInteractionOngoingInteractionCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  entity ServiceRequestInteractionOngoingErrorLogCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    key ObjectID : UUID not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ParentObjectID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    ErrorText : String;
    ServiceRequestInteractionOngoingInteraction : Association to ServiceRequestInteractionOngoingInteractionCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionAttachmentCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionAttachmentHeaderMIMECodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionAttachmentHeaderTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionEMailBCCRoleCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionEMailCCRoleCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionInteractionsActivitySentimentTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionInteractionsDataOriginTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionInteractionsInformationSensitivityCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionInteractionsInitiatorCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionInteractionsLifeCycleStatusCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionInteractionsPriorityCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionInteractionsProcessingTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionInteractionsTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingAttachmentHeaderMIMECodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingAttachmentHeaderTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingEmailBCCRoleCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingEmailCCRoleCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingIntAttachmentFolderCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingInteractionTransmissionStatusCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingInteractionTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingPartyRoleCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingToPartyRoleCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionPartyBupaRoleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionPartyRoleCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionPartyRoleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionTicketServiceRequestLifeCycleStatusCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionTicketServiceRequestUserLifeCycleStatusCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionToPartyRoleCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionToPartyTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionAttachmentTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionInteractionsGroupCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionOngoingIntAttachmentFolderTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ServiceRequestInteractionTextCollectionTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    Description : String not null;
  };
};

