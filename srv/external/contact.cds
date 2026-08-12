/* checksum : 2a0179a44c922b9384dbf9368cf4171a */
@cds.external : true
@m.IsDefaultEntityContainer : 'true'
service contact {
  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'false'
  @sap.label : 'Contact'
  entity ContactCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'ObjectID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Contact ID'
    ContactID : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Contact UUID'
    ContactUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'External ID'
    ExternalID : String(100);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'External System'
    ExternalSystem : String(32);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'StatusCodeText'
    @sap.label : 'Status'
    StatusCode : String(2);
    @sap.label : 'Status Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    StatusCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TitleCodeText'
    @sap.label : 'Title'
    TitleCode : String(4);
    @sap.label : 'Title Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TitleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'AcademicTitleCodeText'
    @sap.label : 'Academic Title'
    AcademicTitleCode : String(4);
    @sap.label : 'Academic Title Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    AcademicTitleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'AdditionalAcademicTitleCodeText'
    @sap.label : 'Additional Academic Title'
    AdditionalAcademicTitleCode : String(4);
    @sap.label : 'Additional Academic Title Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    AdditionalAcademicTitleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'NamePrefixCodeText'
    @sap.label : 'Prefix'
    NamePrefixCode : String(4);
    @sap.label : 'Prefix Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    NamePrefixCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'First Name'
    FirstName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Last Name'
    LastName : String(40) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional Last Name'
    AdditionalFamilyName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Initials'
    Initials : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Middle Name'
    MiddleName : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Name'
    Name : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'GenderCodeText'
    @sap.label : 'Gender'
    GenderCode : String(1);
    @sap.label : 'Gender Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    GenderCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'MaritalStatusCodeText'
    @sap.label : 'Marital Status'
    MaritalStatusCode : String(1);
    @sap.label : 'Marital Status Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    MaritalStatusCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'LanguageCodeText'
    @sap.label : 'Language'
    LanguageCode : String(2);
    @sap.label : 'Language Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LanguageCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Nick Name'
    NickName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Date of Birth'
    @sap.display.format : 'Date'
    BirthDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Birth Name'
    BirthName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'ContactPermissionCodeText'
    @sap.label : 'Contact Permission'
    ContactPermissionCode : String(1);
    @sap.label : 'Contact Permission Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ContactPermissionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'ProfessionCodeText'
    @sap.label : 'Profession'
    ProfessionCode : String(4);
    @sap.label : 'Profession Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ProfessionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PerceptionOfCompanyCodeText'
    @sap.label : 'Perception Of Company'
    PerceptionOfCompanyCode : String(2);
    @sap.label : 'Perception Of Company Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PerceptionOfCompanyCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Deviating Full Name'
    DeviatingFullName : String(80);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Account'
    AccountUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account Formatted Name'
    AccountFormattedName : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Building'
    Building : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Floor'
    Floor : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Room'
    Room : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Job Title'
    JobTitle : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'FunctionCodeText'
    @sap.label : 'Function'
    FunctionCode : String(4);
    @sap.label : 'Function Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    FunctionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DepartmentCodeText'
    @sap.label : 'Department'
    DepartmentCode : String(4);
    @sap.label : 'Department Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DepartmentCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Department From Business Card'
    Department : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'VIPContactCodeText'
    @sap.label : 'VIP Contact'
    VIPContactCode : String(1);
    @sap.label : 'VIP Contact Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    VIPContactCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    Phone : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    Mobile : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    Fax : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    Email : String(255);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail Invalid'
    EmailInvalidIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BestReachedByCodeText'
    @sap.label : 'Best Reached By'
    BestReachedByCode : String(3);
    @sap.label : 'Best Reached By Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BestReachedByCodeText : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Formatted PostalAddress Description'
    FormattedPostalAddressDescription : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BusinessAddressCountryCodeText'
    @sap.label : 'Country/Region'
    BusinessAddressCountryCode : String(3);
    @sap.label : 'Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BusinessAddressCountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    @sap.label : 'State Text Updatable'
    BusinessAddressStateCodeTextUpdatable : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'House Number'
    BusinessAddressHouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Street'
    BusinessAddressStreet : String(60);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'City'
    BusinessAddressCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Postal Code'
    BusinessAddressStreetPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BusinessAddressStateCodeText'
    @sap.label : 'State'
    BusinessAddressStateCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BusinessAddressStateCodeText : String;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreationOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Creation Identity UUID'
    CreatedByIdentityUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Changed On'
    ChangedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Changed By'
    ChangedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Change Identity UUID'
    ChangedByIdentityUUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Contact Owner ID'
    ContactOwnerID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Owner'
    ContactOwnerUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Phone'
    NormalisedPhone : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Mobile'
    NormalisedMobile : String(40);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    ContactAttachmentFolder : Association to many ContactAttachmentFolderCollection {  };
    ContactInternationalVersion : Association to many ContactInternationalVersionCollection {  };
    ContactIsContactPersonFor : Association to many ContactIsContactPersonForCollection {  };
    ContactOwnerEmployeeBasicData : Association to EmployeeBasicDataCollection {  };
    ContactPersonalAddress : Association to many ContactPersonalAddressCollection {  };
    ContactTextCollection : Association to many ContactTextCollectionCollection {  };
    CorporateAccount : Association to CorporateAccountCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Contact Personal Addresses'
  entity ContactPersonalAddressCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Contact ID'
    ContactID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Main Personal Address'
    MainPersonalAddress : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Formatted Postal Address Description'
    FormattedPostalAddressDescription : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Country/Region'
    CountryCode : String(3);
    @sap.label : 'Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'StateCodeText'
    @sap.label : 'State'
    StateCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    StateCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'c/o'
    CareOfName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 1'
    AddressLine1 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 2'
    AddressLine2 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'House Number'
    HouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Street'
    Street : String(60);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 4'
    AddressLine4 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 5'
    AddressLine5 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'City'
    City : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Postal Code'
    StreetPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box'
    POBox : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Postal Code'
    POBoxPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TimeZoneCodeText'
    @sap.label : 'Time Zone'
    TimeZoneCode : String(10);
    @sap.label : 'Time Zone Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TimeZoneCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    Phone : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    Mobile : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    Fax : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    EMail : String(255);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Web Site'
    WebSite : String(1280);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Phone'
    NormalisedPhone : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Mobile'
    NormalisedMobile : String(40);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    Contact : Association to ContactCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Contact Attachments'
  entity ContactAttachmentFolderCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Contact ID'
    ContactInternalID : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'UUID'
    UUID : UUID not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Name'
    Name : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'CategoryCodeText'
    @sap.label : 'Category Code'
    CategoryCode : String(1) not null;
    @sap.label : 'Category Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CategoryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'TypeCodeText'
    @sap.label : 'Type Code'
    TypeCode : String(5);
    @sap.label : 'Type Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Link Web URI'
    LinkWebURI : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Mime Type'
    MimeType : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Document Link'
    DocumentLink : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Binary'
    Binary : LargeBinary;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(80);
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By'
    LastUpdatedBy : String(80);
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated On'
    LastUpdatedOn : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Document Title'
    Title : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Size In KiloBytes'
    SizeInkB : Decimal(31, 14);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Output Relevance Indicator'
    OutputRelevanceIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Contact Notes'
  entity ContactTextCollectionCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Contact ID'
    ContactID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Text'
    Text : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'LanguageCodeText'
    @sap.label : 'Language Code'
    LanguageCode : String(2);
    @sap.label : 'Language Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LanguageCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Author Name'
    AuthorName : String(40);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By Identity ID'
    CreatedByIdentityID : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By Technical User Indicator'
    CreatedByTechnicalUserIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Updated On'
    UpdatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By'
    LastUpdatedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By Identity ID'
    LastUpdatedByIdentityID : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By Technical User Indicator'
    LastUpdatedByTechnicalUserIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    Contact : Association to ContactCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Contact International Version'
  entity ContactInternationalVersionCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Contact ID'
    ContactID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'InternationalVersionCodeText'
    @sap.label : 'International Version'
    InternationalVersionCode : String(1) not null;
    @sap.label : 'International Version Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    InternationalVersionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TitleCodeText'
    @sap.label : 'Title'
    TitleCode : String(4);
    @sap.label : 'Title Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TitleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'AcademicTitleCodeText'
    @sap.label : 'Academic Title'
    AcademicTitleCode : String(4);
    @sap.label : 'Academic Title Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    AcademicTitleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'AdditionalAcademicTitleCodeText'
    @sap.label : 'Additional Academic Title'
    AdditionalAcademicTitleCode : String(4);
    @sap.label : 'Additional Academic Title Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    AdditionalAcademicTitleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'First Name'
    FirstName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Middle Name'
    MiddleName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Last Name'
    LastName : String(40) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional Last Name'
    AdditionalFamilyName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Initials'
    Initials : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Nick Name'
    NickName : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Name'
    Name : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Building'
    Building : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Floor'
    Floor : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Room'
    Room : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Job Title'
    JobTitle : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Department From Business Card'
    Department : String(40);
    Contact : Association to ContactCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Contact Is Contact Person For'
  entity ContactIsContactPersonForCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Contact ID'
    ContactID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Acount ID'
    AccountID : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account Formatted Name'
    AccountFormattedName : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Main Account'
    ReverseMainIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DepartmentCodeText'
    @sap.label : 'Department'
    DepartmentCode : String(4);
    @sap.label : 'Department Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DepartmentCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'FunctionCodeText'
    @sap.label : 'Function'
    FunctionCode : String(4);
    @sap.label : 'Function Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    FunctionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'VIPReasonCodeText'
    @sap.label : 'VIP Contact'
    VIPReasonCode : String(1);
    @sap.label : 'VIP Contact Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    VIPReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Job Title'
    JobTitle : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Department From Business Card'
    Department : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Building'
    Building : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Floor'
    Floor : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Room'
    Room : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    Email : String(255);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail Invalid'
    EmailInvalidIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    Fax : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    Mobile : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    Phone : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BestReachedByCodeText'
    @sap.label : 'Preferred Method of Contact'
    BestReachedByCode : String(3);
    @sap.label : 'Preferred Method of Contact Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BestReachedByCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Organisation Address UUID'
    OrganisationAddressUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    CorporateAccount : Association to CorporateAccountCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Individual Customer Tax Numbers'
  entity IndividualCustomerTaxNumberCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Tax Country/Region'
    CountryCode : String(3) not null;
    @sap.label : 'Tax Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TaxTypeCodeText'
    @sap.label : 'Tax Number Type'
    TaxTypeCode : String(2) not null;
    @sap.label : 'Tax Number Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TaxTypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Tax Number'
    TaxID : String(20) not null;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    IndividualCustomer : Association to IndividualCustomerCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Tax Numbers'
  entity CorporateAccountTaxNumberCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Tax Country/Region'
    CountryCode : String(3) not null;
    @sap.label : 'Tax Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TaxTypeCodeText'
    @sap.label : 'Tax Number Type'
    TaxTypeCode : String(2) not null;
    @sap.label : 'Tax Number Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TaxTypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Tax Number'
    TaxID : String(20) not null;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    CorporateAccount : Association to CorporateAccountCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Individual Customer Sales Data'
  entity IndividualCustomerSalesDataCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization ID'
    SalesOrganisationID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization Name'
    SalesOrganisationName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DistributionChannelCodeText'
    @sap.label : 'Distribution Channel'
    DistributionChannelCode : String(2);
    @sap.label : 'Distribution Channel Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DistributionChannelCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DivisionCodeText'
    @sap.label : 'Division'
    DivisionCode : String(2);
    @sap.label : 'Division Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DivisionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Office ID'
    SalesOfficeID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Sales Office Name'
    SalesOfficeName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Group ID'
    SalesGroupID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Sales Group Name'
    SalesGroupName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BillingBlockingReasonCodeText'
    @sap.label : 'Billing Block'
    BillingBlockingReasonCode : String(2);
    @sap.label : 'Billing Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BillingBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DeliveryBlockingReasonCodeText'
    @sap.label : 'Delivery Block'
    DeliveryBlockingReasonCode : String(2);
    @sap.label : 'Delivery Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DeliveryBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'OrderBlockingReasonCodeText'
    @sap.label : 'Order Block'
    OrderBlockingReasonCode : String(2);
    @sap.label : 'Order Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    OrderBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Support Block'
    SalesSupportBlockingIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CurrencyCodeText'
    @sap.label : 'Currency'
    CurrencyCode : String(3);
    @sap.label : 'Currency Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CurrencyCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CustomerGroupCodeText'
    @sap.label : 'Customer Group'
    CustomerGroupCode : String(2);
    @sap.label : 'Customer Group Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CustomerGroupCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DeliveryPriorityCodeText'
    @sap.label : 'Delivery Priority'
    DeliveryPriorityCode : String(2);
    @sap.label : 'Delivery Priority Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DeliveryPriorityCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'IncotermsClassificationCodeText'
    @sap.label : 'Incoterms'
    IncotermsClassificationCode : String(3);
    @sap.label : 'Incoterms Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    IncotermsClassificationCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Incoterms Location'
    IncotermsLocation : String(28);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PaymentTermsCodeText'
    @sap.label : 'Payment Terms'
    PaymentTermsCode : String(4);
    @sap.label : 'Payment Terms Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PaymentTermsCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Complete Delivery'
    CompleteDeliveryRequestedIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PriceListCodeText'
    @sap.label : 'Price List'
    PriceListCode : String(2);
    @sap.label : 'Price List Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PriceListCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PriceGroupCodeText'
    @sap.label : 'Price Group'
    PriceGroupCode : String(2);
    @sap.label : 'Price Group Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PriceGroupCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Marked for Deletion'
    MarkedForDeletionIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Plant UUID'
    PlantUUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Plant ID'
    PlantID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Plant Name'
    PlantName : String(40);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Sales Data'
  entity CorporateAccountSalesDataCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization UUID'
    SalesOrganisationUUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization ID'
    SalesOrganisationID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization Name'
    SalesOrganisationName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DistributionChannelCodeText'
    @sap.label : 'Distribution Channel'
    DistributionChannelCode : String(2);
    @sap.label : 'Distribution Channel Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DistributionChannelCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DivisionCodeText'
    @sap.label : 'Division'
    DivisionCode : String(2);
    @sap.label : 'Division Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DivisionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Office ID'
    SalesOfficeID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Sales Office Name'
    SalesOfficeName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Office UUID'
    SalesOfficeUUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Group ID'
    SalesGroupID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Sales Group Name'
    SalesGroupName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Group UUID'
    SalesGroupUUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BillingBlockingReasonCodeText'
    @sap.label : 'Billing Block'
    BillingBlockingReasonCode : String(2);
    @sap.label : 'Billing Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BillingBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DeliveryBlockingReasonCodeText'
    @sap.label : 'Delivery Block'
    DeliveryBlockingReasonCode : String(2);
    @sap.label : 'Delivery Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DeliveryBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'OrderBlockingReasonCodeText'
    @sap.label : 'Order Block'
    OrderBlockingReasonCode : String(2);
    @sap.label : 'Order Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    OrderBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Support Block'
    SalesSupportBlockingIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CurrencyCodeText'
    @sap.label : 'Currency'
    CurrencyCode : String(3);
    @sap.label : 'Currency Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CurrencyCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CustomerGroupCodeText'
    @sap.label : 'Customer Group'
    CustomerGroupCode : String(2);
    @sap.label : 'Customer Group Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CustomerGroupCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DeliveryPriorityCodeText'
    @sap.label : 'Delivery Priority'
    DeliveryPriorityCode : String(2);
    @sap.label : 'Delivery Priority Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DeliveryPriorityCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'IncotermsClassificationCodeText'
    @sap.label : 'Incoterms'
    IncotermsClassificationCode : String(3);
    @sap.label : 'Incoterms Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    IncotermsClassificationCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Incoterms Location'
    IncotermsLocation : String(28);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PaymentTermsCodeText'
    @sap.label : 'Payment Terms'
    PaymentTermsCode : String(4);
    @sap.label : 'Payment Terms Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PaymentTermsCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Complete Delivery'
    CompleteDeliveryRequestedIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PriceListCodeText'
    @sap.label : 'Price List'
    PriceListCode : String(2);
    @sap.label : 'Price List Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PriceListCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PriceGroupCodeText'
    @sap.label : 'Price Group'
    PriceGroupCode : String(2);
    @sap.label : 'Price Group Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PriceGroupCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Marked for Deletion'
    MarkedForDeletionIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Plant UUID'
    PlantUUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Plant ID'
    PlantID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Plant Name'
    PlantName : String(40);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Visiting Times'
  entity CorporateAccountVisitingHoursOperatingPeriodCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Start Time'
    StartTime : Time;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'End Time'
    EndTime : Time;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    CorporateAccountVisitingHoursRecurrence : Association to CorporateAccountVisitingHoursRecurrenceCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Contact Persons'
  entity CorporateAccountHasContactPersonCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Contact ID'
    ContactID : String(10) not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Contact Formatted Name'
    ContactFormattedName : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Main'
    MainIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DepartmentCodeText'
    @sap.label : 'Department'
    DepartmentCode : String(4);
    @sap.label : 'Department Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DepartmentCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'FunctionCodeText'
    @sap.label : 'Function'
    FunctionCode : String(4);
    @sap.label : 'Function Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    FunctionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'VIPReasonCodeText'
    @sap.label : 'VIP Contact'
    VIPReasonCode : String(1);
    @sap.label : 'VIP Contact Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    VIPReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Job Title'
    JobTitle : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Department From Business Card'
    Department : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Building'
    Building : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Floor'
    Floor : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Room'
    Room : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    Email : String(255);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    Fax : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    Mobile : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    Phone : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail Invalid'
    EmailInvalidIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BestReachedByCodeText'
    @sap.label : 'Best Reached By'
    BestReachedByCode : String(3);
    @sap.label : 'Best Reached By Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BestReachedByCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Organization Address UUID'
    OrganisationAddressUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    Contact : Association to ContactCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Individual Customer Team'
  entity IndividualCustomerTeamCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Employee UUID'
    EmployeeUUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Employee ID'
    EmployeeID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PartyRoleCodeText'
    @sap.label : 'Party Role'
    PartyRoleCode : String(10) not null;
    @sap.label : 'Party Role Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PartyRoleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Start Date'
    @sap.display.format : 'Date'
    StartDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'End Date'
    @sap.display.format : 'Date'
    EndDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Main'
    MainIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization ID'
    SalesOrganisationID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DistributionChannelCodeText'
    @sap.label : 'Distribution Channel'
    DistributionChannelCode : String(2);
    @sap.label : 'Distribution Channel Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DistributionChannelCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DivisionCodeText'
    @sap.label : 'Division'
    DivisionCode : String(2);
    @sap.label : 'Division Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DivisionCodeText : String;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    EmployeeBasicData : Association to EmployeeBasicDataCollection {  };
    IndividualCustomer : Association to IndividualCustomerCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Addresses'
  entity CorporateAccountAddressCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Address UUID'
    UUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Main Address'
    MainIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    @sap.label : 'Ship To'
    ShipTo : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    @sap.label : 'Default Ship To'
    DefaultShipTo : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    @sap.label : 'Bill To'
    BillTo : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    @sap.label : 'Default Bill To'
    DefaultBillTo : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Formatted Postal Address Description'
    FormattedPostalAddressDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Address'
    FormattedAddressFirstLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Address Description Line 2'
    FormattedAddressSecondLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Address Description Line 3'
    FormattedAddressThirdLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Address Description Line 4'
    FormattedAddressFourthLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Postal Address'
    FormattedPostalAddressFirstLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Postal Address Description Line 2'
    FormattedPostalAddressSecondLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Postal Address Description Line 3'
    FormattedPostalAddressThirdLineDescription : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Country/Region'
    CountryCode : String(3);
    @sap.label : 'Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'StateCodeText'
    @sap.label : 'State'
    StateCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    StateCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'c/o'
    CareOfName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 1'
    AddressLine1 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 2'
    AddressLine2 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'House Number'
    HouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional House Number'
    AdditionalHouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Street'
    Street : String(60);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 4'
    AddressLine4 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 5'
    AddressLine5 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'District'
    District : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'City'
    City : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Different City'
    DifferentCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Postal Code'
    StreetPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'County'
    County : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Company Postal Code'
    CompanyPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Address'
    POBoxIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box'
    POBox : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Postal Code'
    POBoxPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingCountryCodeText'
    @sap.label : 'P.O. Box Country/Region'
    POBoxDeviatingCountryCode : String(3);
    @sap.label : 'P.O. Box Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingCountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingStateCodeText'
    @sap.label : 'P.O. Box State'
    POBoxDeviatingStateCode : String(6);
    @sap.label : 'P.O. Box State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingStateCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box City'
    POBoxDeviatingCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TimeZoneCodeText'
    @sap.label : 'Time Zone'
    TimeZoneCode : String(10);
    @sap.label : 'Time Zone Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TimeZoneCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Latitude'
    Latitude : Decimal(31, 14);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Longitude'
    Longitude : Decimal(31, 14);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Building'
    Building : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Floor'
    Floor : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Room'
    Room : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    Phone : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Phone'
    NormalisedPhone : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    Mobile : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Mobile'
    NormalisedMobile : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    Fax : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    Email : String(255);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Web Site'
    WebSite : String(1280);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'LanguageCodeText'
    @sap.label : 'Language'
    LanguageCode : String(2);
    @sap.label : 'Language Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LanguageCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BestReachedByCodeText'
    @sap.label : 'Best Reached By'
    BestReachedByCode : String(3);
    @sap.label : 'Best Reached By Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BestReachedByCodeText : String;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    CorporateAccount : Association to CorporateAccountCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Team'
  entity CorporateAccountTeamCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Employee UUID'
    EmployeeUUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Employee ID'
    EmployeeID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PartyRoleCodeText'
    @sap.label : 'Party Role'
    PartyRoleCode : String(10) not null;
    @sap.label : 'Party Role Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PartyRoleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Start Date'
    @sap.display.format : 'Date'
    StartDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'End Date'
    @sap.display.format : 'Date'
    EndDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Main'
    MainIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization ID'
    SalesOrganisationID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DistributionChannelCodeText'
    @sap.label : 'Distribution Channel'
    DistributionChannelCode : String(2);
    @sap.label : 'Distribution Channel Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DistributionChannelCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DivisionCodeText'
    @sap.label : 'Division'
    DivisionCode : String(2);
    @sap.label : 'Division Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DivisionCodeText : String;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    CorporateAccount : Association to CorporateAccountCollection {  };
    EmployeeBasicData : Association to EmployeeBasicDataCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Notes'
  entity CorporateAccountTextCollectionCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Text'
    Text : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'LanguageCodeText'
    @sap.label : 'Language Code'
    LanguageCode : String(2);
    @sap.label : 'Language Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LanguageCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Author Name'
    AuthorName : String(40);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By Identity ID'
    CreatedByIdentityID : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By Technical User Indicator'
    CreatedByTechnicalUserIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Updated On'
    UpdatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By'
    LastUpdatedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By Identity ID'
    LastUpdatedByIdentityID : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By Technical User Indicator'
    LastUpdatedByTechnicalUserIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    CorporateAccount : Association to CorporateAccountCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Attachments'
  entity CorporateAccountAttachmentFolderCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'UUID'
    UUID : UUID not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Name'
    Name : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'CategoryCodeText'
    @sap.label : 'Category Code'
    CategoryCode : String(1) not null;
    @sap.label : 'Category Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CategoryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'TypeCodeText'
    @sap.label : 'Type Code'
    TypeCode : String(5);
    @sap.label : 'Type Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Link Web URI'
    LinkWebURI : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Mime Type'
    MimeType : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Document Link'
    DocumentLink : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Binary'
    Binary : LargeBinary;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(80);
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By'
    LastUpdatedBy : String(80);
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated On'
    LastUpdatedOn : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Document Title'
    Title : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Size In KiloBytes'
    SizeInkB : Decimal(31, 14);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Output Relevance Indicator'
    OutputRelevanceIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'false'
  @sap.label : 'Account'
  entity CorporateAccountCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account UUID'
    UUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'External ID'
    ExternalID : String(100);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'External System'
    ExternalSystem : String(32);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'RoleCodeText'
    @sap.label : 'Role'
    RoleCode : String(6) not null;
    @sap.label : 'Role Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    RoleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'LifeCycleStatusCodeText'
    @sap.label : 'Status'
    LifeCycleStatusCode : String(2);
    @sap.label : 'Status Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LifeCycleStatusCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'D-U-N-S'
    DUNSID : String(60);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'LegalFormCodeText'
    @sap.label : 'Legal Form'
    LegalFormCode : String(2);
    @sap.label : 'Legal Form Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LegalFormCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CustomerABCClassificationCodeText'
    @sap.label : 'ABC Classification'
    CustomerABCClassificationCode : String(1);
    @sap.label : 'ABC Classification Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CustomerABCClassificationCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'NielsenRegionCodeText'
    @sap.label : 'Nielsen ID'
    NielsenRegionCode : String(2);
    @sap.label : 'Nielsen ID Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    NielsenRegionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'IndustrialSectorCodeText'
    @sap.label : 'Industry'
    IndustrialSectorCode : String(10);
    @sap.label : 'Industry Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    IndustrialSectorCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'ContactPermissionCodeText'
    @sap.label : 'Contact Permission'
    ContactPermissionCode : String(1);
    @sap.label : 'Contact Permission Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ContactPermissionCodeText : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Business Partner Formatted Name'
    BusinessPartnerFormattedName : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Name'
    Name : String(40) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional Name'
    AdditionalName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional Name 2'
    AdditionalName2 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional Name 3'
    AdditionalName3 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address UUID'
    CurrentDefaultAddressUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Formatted Postal Address Description'
    FormattedPostalAddressDescription : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Country/Region'
    CountryCode : String(3);
    @sap.label : 'Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'StateCodeText'
    @sap.label : 'State'
    StateCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    StateCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'c/o'
    CareOfName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 1'
    AddressLine1 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 2'
    AddressLine2 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'House Number'
    HouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional House Number'
    AdditionalHouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Street'
    Street : String(60);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 4'
    AddressLine4 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 5'
    AddressLine5 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'District'
    District : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'City'
    City : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Different City'
    DifferentCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Postal Code'
    StreetPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'County'
    County : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Company Postal Code'
    CompanyPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Address'
    POBoxIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box'
    POBox : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Postal Code'
    POBoxPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingCountryCodeText'
    @sap.label : 'P.O. Box Country/Region'
    POBoxDeviatingCountryCode : String(3);
    @sap.label : 'P.O. Box Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingCountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingRegionCodeText'
    @sap.label : 'P.O. Box State'
    POBoxDeviatingRegionCode : String(6);
    @sap.label : 'P.O. Box State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingRegionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box City'
    POBoxDeviatingCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TimeZoneCodeText'
    @sap.label : 'Time Zone'
    TimeZoneCode : String(10);
    @sap.label : 'Time Zone Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TimeZoneCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Building'
    Building : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Floor'
    Floor : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Room'
    Room : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    Phone : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Phone'
    NormalisedPhone : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    Mobile : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Mobile'
    NormalisedMobile : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    Fax : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    Email : String(255);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Web Site'
    WebSite : String(1280);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'LanguageCodeText'
    @sap.label : 'Language'
    LanguageCode : String(2);
    @sap.label : 'Language Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LanguageCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BestReachedByCodeText'
    @sap.label : 'Best Reached By'
    BestReachedByCode : String(3);
    @sap.label : 'Best Reached By Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BestReachedByCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'OrderBlockingReasonCodeText'
    @sap.label : 'Order Block'
    OrderBlockingReasonCode : String(2);
    @sap.label : 'Order Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    OrderBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DeliveryBlockingReasonCodeText'
    @sap.label : 'Delivery Block'
    DeliveryBlockingReasonCode : String(2);
    @sap.label : 'Delivery Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DeliveryBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BillingBlockingReasonCodeText'
    @sap.label : 'Billing Block'
    BillingBlockingReasonCode : String(2);
    @sap.label : 'Billing Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BillingBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Support Block'
    SalesSupportBlockingIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Legal Competence'
    LegalCompetenceIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Recommended Visit Frequency'
    RecommendedVisitingFrequency : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Visit Duration'
    VisitDuration : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Visited'
    @sap.display.format : 'Date'
    LastVisitingDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Next Planned Visit'
    @sap.display.format : 'Date'
    NextVisitingDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Visit Before'
    @sap.display.format : 'Date'
    LatestRecommendedVisitingDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Owner ID'
    OwnerID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Owner UUID'
    OwnerUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Account ID'
    ParentAccountID : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Top Level Account ID'
    TopLevelAccountID : String(10);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreationOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Creation Identity UUID'
    CreatedByIdentityUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Changed On'
    ChangedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Changed By'
    ChangedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Change Identity UUID'
    ChangedByIdentityUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    CorporateAccountAddress : Association to many CorporateAccountAddressCollection {  };
    CorporateAccountAttachmentFolder : Association to many CorporateAccountAttachmentFolderCollection {  };
    CorporateAccountHasContactPerson : Association to many CorporateAccountHasContactPersonCollection {  };
    CorporateAccountIdentification : Association to many CorporateAccountIdentificationCollection {  };
    CorporateAccountInternationalVersion : Association to many CorporateAccountInternationalVersionCollection {  };
    CorporateAccountSalesData : Association to many CorporateAccountSalesDataCollection {  };
    CorporateAccountSkills : Association to many CorporateAccountSkillsCollection {  };
    CorporateAccountTaxNumber : Association to many CorporateAccountTaxNumberCollection {  };
    CorporateAccountTeam : Association to many CorporateAccountTeamCollection {  };
    CorporateAccountTextCollection : Association to many CorporateAccountTextCollectionCollection {  };
    CorporateAccountVisitingHours : Association to many CorporateAccountVisitingHoursCollection {  };
    CorporateAccountVisitingInformationDetails : Association to many CorporateAccountVisitingInformationDetailsCollection {  };
    OwnerEmployeeBasicData : Association to EmployeeBasicDataCollection {  };
    ParentAccount : Association to CorporateAccountCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Individual Customer Notes'
  entity IndividualCustomerTextCollectionCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Text'
    Text : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'LanguageCodeText'
    @sap.label : 'Language Code'
    LanguageCode : String(2);
    @sap.label : 'Language Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LanguageCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Author Name'
    AuthorName : String(40);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By Identity ID'
    CreatedByIdentityID : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By Technical User Indicator'
    CreatedByTechnicalUserIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Updated On'
    UpdatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By'
    LastUpdatedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By Identity ID'
    LastUpdatedByIdentityID : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By Technical User Indicator'
    LastUpdatedByTechnicalUserIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    IndividualCustomer : Association to IndividualCustomerCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Individual Customer Attachments'
  entity IndividualCustomerAttachmentFolderCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'UUID'
    UUID : UUID not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Name'
    Name : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'CategoryCodeText'
    @sap.label : 'Category Code'
    CategoryCode : String(1) not null;
    @sap.label : 'Category Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CategoryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'TypeCodeText'
    @sap.label : 'Type Code'
    TypeCode : String(5);
    @sap.label : 'Type Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Link Web URI'
    LinkWebURI : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Mime Type'
    MimeType : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Document Link'
    DocumentLink : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Binary'
    Binary : LargeBinary;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(80);
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated By'
    LastUpdatedBy : String(80);
    @odata.Type : 'Edm.DateTime'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Updated On'
    LastUpdatedOn : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Document Title'
    Title : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Size In KiloBytes'
    SizeInkB : Decimal(31, 14);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Output Relevance Indicator'
    OutputRelevanceIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'false'
  @sap.label : 'Individual Customer'
  entity IndividualCustomerCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer UUID'
    UUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'External ID'
    ExternalID : String(100);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'External System'
    ExternalSystem : String(32);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'RoleCodeText'
    @sap.label : 'Role'
    RoleCode : String(6) not null;
    @sap.label : 'Role Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    RoleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'LifeCycleStatusCodeText'
    @sap.label : 'Status'
    LifeCycleStatusCode : String(2);
    @sap.label : 'Status Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LifeCycleStatusCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CustomerABCClassificationCodeText'
    @sap.label : 'ABC Classification'
    CustomerABCClassificationCode : String(1);
    @sap.label : 'ABC Classification Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CustomerABCClassificationCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'ContactPermissionCodeText'
    @sap.label : 'Contact Permission'
    ContactPermissionCode : String(1);
    @sap.label : 'Contact Permission Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ContactPermissionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TitleCodeText'
    @sap.label : 'Title'
    TitleCode : String(4);
    @sap.label : 'Title Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TitleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'AcademicTitleCodeText'
    @sap.label : 'Academic Title'
    AcademicTitleCode : String(4);
    @sap.label : 'Academic Title Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    AcademicTitleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'First Name'
    FirstName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Middle Name'
    MiddleName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Last Name'
    LastName : String(40) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional Last Name'
    AdditionalLastName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Initials'
    Initials : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Nickname'
    NickName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'GenderCodeText'
    @sap.label : 'Gender'
    GenderCode : String(1);
    @sap.label : 'Gender Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    GenderCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'NamePrefixCodeText'
    @sap.label : 'Prefix'
    NamePrefixCode : String(4);
    @sap.label : 'Prefix Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    NamePrefixCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'MaritalStatusCodeText'
    @sap.label : 'Marital Status'
    MaritalStatusCode : String(1);
    @sap.label : 'Marital Status Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    MaritalStatusCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'LanguageCodeText'
    @sap.label : 'Language'
    LanguageCode : String(2);
    @sap.label : 'Language Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LanguageCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Birth Name'
    BirthName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Date of Birth'
    @sap.display.format : 'Date'
    BirthDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'NationalityCountryCodeText'
    @sap.label : 'Nationality'
    NationalityCountryCode : String(3);
    @sap.label : 'Nationality Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    NationalityCountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'ProfessionCodeText'
    @sap.label : 'Profession'
    ProfessionCode : String(4);
    @sap.label : 'Profession Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    ProfessionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Deviating Full Name'
    DeviatingFullName : String(80);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Name'
    FormattedName : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Formatted Postal Address Description'
    FormattedPostalAddressDescription : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Country/Region'
    CountryCode : String(3);
    @sap.label : 'Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'StateCodeText'
    @sap.label : 'State'
    StateCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    StateCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'c/o'
    CareOfName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 1'
    AddressLine1 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 2'
    AddressLine2 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'House Number'
    HouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional House Number'
    AdditionalHouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Street'
    Street : String(60);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 4'
    AddressLine4 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 5'
    AddressLine5 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'District'
    District : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'City'
    City : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Different City'
    DifferentCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Postal Code'
    StreetPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'County'
    County : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Address'
    POBoxIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box'
    POBox : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Postal Code'
    POBoxPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingCountryCodeText'
    @sap.label : 'P.O. Box Country/Region'
    POBoxDeviatingCountryCode : String(3);
    @sap.label : 'P.O. Box Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingCountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingStateCodeText'
    @sap.label : 'P.O. Box State'
    POBoxDeviatingStateCode : String(6);
    @sap.label : 'P.O. Box State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingStateCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box City'
    POBoxDeviatingCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TimeZoneCodeText'
    @sap.label : 'Time Zone'
    TimeZoneCode : String(10);
    @sap.label : 'Time Zone Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TimeZoneCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TaxJurisdictionCodeText'
    @sap.label : 'Tax Jurisdiction Code'
    TaxJurisdictionCode : String(25);
    @sap.label : 'Tax Jurisdiction Code Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TaxJurisdictionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Building'
    Building : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Floor'
    Floor : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Room'
    Room : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    Phone : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Phone'
    NormalisedPhone : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    Mobile : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Mobile'
    NormalisedMobile : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    Fax : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    Email : String(255);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail Invalid'
    EmailInvalidIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Web Site'
    WebSite : String(1280);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BestReachedByCodeText'
    @sap.label : 'Best Reached By'
    BestReachedByCode : String(3);
    @sap.label : 'Best Reached By Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BestReachedByCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'OrderBlockingReasonCodeText'
    @sap.label : 'Order Block'
    OrderBlockingReasonCode : String(2);
    @sap.label : 'Order Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    OrderBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DeliveryBlockingReasonCodeText'
    @sap.label : 'Delivery Block'
    DeliveryBlockingReasonCode : String(2);
    @sap.label : 'Delivery Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DeliveryBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BillingBlockingReasonCodeText'
    @sap.label : 'Billing Block'
    BillingBlockingReasonCode : String(2);
    @sap.label : 'Billing Block Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BillingBlockingReasonCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Support Block'
    SalesSupportBlockingIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Recommended Visit Frequency'
    RecommendedVisitingFrequency : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Visit Duration'
    VisitDuration : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Visited'
    @sap.display.format : 'Date'
    LastVisitingDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Next Planned Visit'
    @sap.display.format : 'Date'
    NextVisitingDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Visit Before'
    @sap.display.format : 'Date'
    LatestRecommendedVisitingDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Owner ID'
    OwnerID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Owner UUID'
    OwnerUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreationOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Creation Identity UUID'
    CreatedByIdentityUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Changed On'
    ChangedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Changed By'
    ChangedBy : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Change Identity UUID'
    ChangedByIdentityUUID : UUID;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    IndividualCustomerAddress : Association to many IndividualCustomerAddressCollection {  };
    IndividualCustomerAttachmentFolder : Association to many IndividualCustomerAttachmentFolderCollection {  };
    IndividualCustomerIdentification : Association to many IndividualCustomerIdentificationCollection {  };
    IndividualCustomerSalesData : Association to many IndividualCustomerSalesDataCollection {  };
    IndividualCustomerSkills : Association to many IndividualCustomerSkillsCollection {  };
    IndividualCustomerTaxNumber : Association to many IndividualCustomerTaxNumberCollection {  };
    IndividualCustomerTeam : Association to many IndividualCustomerTeamCollection {  };
    IndividualCustomerTextCollection : Association to many IndividualCustomerTextCollectionCollection {  };
    IndividualCustomerVisitingInformationDetails : Association to many IndividualCustomerVisitingInformationDetailsCollection {  };
    OwnerEmployeeBasicData : Association to EmployeeBasicDataCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Individual Customer Addresses'
  entity IndividualCustomerAddressCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Main Address'
    MainIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    @sap.label : 'Ship To'
    ShipTo : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    @sap.label : 'Default Ship To'
    DefaultShipTo : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    @sap.label : 'Bill To'
    BillTo : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'false'
    @sap.label : 'Default Bill To'
    DefaultBillTo : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Formatted Postal Address Description'
    FormattedPostalAddressDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Address'
    FormattedAddressFirstLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Address Description Line 2'
    FormattedAddressSecondLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Address Description Line 3'
    FormattedAddressThirdLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Address Description Line 4'
    FormattedAddressFourthLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Postal Address'
    FormattedPostalAddressFirstLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Postal Address Description Line 2'
    FormattedPostalAddressSecondLineDescription : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Postal Address Description Line 3'
    FormattedPostalAddressThirdLineDescription : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Country/Region'
    CountryCode : String(3);
    @sap.label : 'Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'StateCodeText'
    @sap.label : 'State'
    StateCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    StateCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'c/o'
    CareOfName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 1'
    AddressLine1 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 2'
    AddressLine2 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'House Number'
    HouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional House Number'
    AdditionalHouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Street'
    Street : String(60);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 4'
    AddressLine4 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 5'
    AddressLine5 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'District'
    District : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'City'
    City : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Different City'
    DifferentCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Postal Code'
    StreetPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'County'
    County : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Address'
    POBoxIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box'
    POBox : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Postal Code'
    POBoxPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingCountryCodeText'
    @sap.label : 'P.O. Box Country/Region'
    POBoxDeviatingCountryCode : String(3);
    @sap.label : 'P.O. Box Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingCountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingStateCodeText'
    @sap.label : 'P.O. Box State'
    POBoxDeviatingStateCode : String(6);
    @sap.label : 'P.O. Box State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingStateCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box City'
    POBoxDeviatingCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TimeZoneCodeText'
    @sap.label : 'Time Zone'
    TimeZoneCode : String(10);
    @sap.label : 'Time Zone Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TimeZoneCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Latitude'
    Latitude : Decimal(31, 14);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Longitude'
    Longitude : Decimal(31, 14);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Building'
    Building : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Floor'
    Floor : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Room'
    Room : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    Phone : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Phone'
    NormalisedPhone : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    Mobile : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Mobile'
    NormalisedMobile : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    Fax : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    Email : String(255);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail Invalid'
    EmailInvalidIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Web Site'
    WebSite : String(1280);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'BestReachedByCodeText'
    @sap.label : 'Best Reached By'
    BestReachedByCode : String(3);
    @sap.label : 'Best Reached By Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    BestReachedByCodeText : String;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    IndividualCustomer : Association to IndividualCustomerCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Visiting Hours'
  entity CorporateAccountVisitingHoursCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'WorkingDayCalendarCodeText'
    @sap.label : 'Working Day Calendar'
    WorkingDayCalendarCode : String(6);
    @sap.label : 'Working Day Calendar Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    WorkingDayCalendarCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TimeZoneCodeText'
    @sap.label : 'Time Zone'
    TimeZoneCode : String(10);
    @sap.label : 'Time Zone Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TimeZoneCodeText : String;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    CorporateAccount : Association to CorporateAccountCollection {  };
    CorporateAccountVisitingHoursRecurrence : Association to many CorporateAccountVisitingHoursRecurrenceCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Visiting Hours Weekly Recurrence'
  entity CorporateAccountVisitingHoursRecurrenceCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Monday'
    MondayIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Tuesday'
    TuesdayIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Wednesday'
    WednesdayIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Thursday'
    ThursdayIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Friday'
    FridayIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Saturday'
    SaturdayIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sunday'
    SundayIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    CorporateAccountVisitingHours : Association to CorporateAccountVisitingHoursCollection {  };
    CorporateAccountVisitingHoursOperatingPeriod : Association to many CorporateAccountVisitingHoursOperatingPeriodCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Individual Customer Skills'
  entity IndividualCustomerSkillsCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Skill ID'
    SkillID : String(20) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mandatory'
    Mandatory : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    IndividualCustomer : Association to IndividualCustomerCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Skills'
  entity CorporateAccountSkillsCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Skill ID'
    SkillID : String(20) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mandatory'
    Mandatory : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    CorporateAccount : Association to CorporateAccountCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Visits Details'
  entity CorporateAccountVisitingInformationDetailsCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'VisitTypeCodeText'
    @sap.label : 'Visit Type'
    VisitTypeCode : String(4);
    @sap.label : 'Visit Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    VisitTypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization ID'
    SalesOrganisationID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DistributionChannelCodeText'
    @sap.label : 'Distribution Channel'
    DistributionChannelCode : String(2);
    @sap.label : 'Distribution Channel Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DistributionChannelCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DivisionCodeText'
    @sap.label : 'Division'
    DivisionCode : String(2);
    @sap.label : 'Division Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DivisionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Recommended Visit Frequency'
    RecommendedVisitingFrequency : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Visit Duration'
    VisitDuration : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Next Planned Visit'
    @sap.display.format : 'Date'
    NextVisitingDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Visited'
    @sap.display.format : 'Date'
    LastVisitingDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Visit Before'
    @sap.display.format : 'Date'
    LatestRecommendedVisitingDate : Date;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Individual Customer Visits Details'
  entity IndividualCustomerVisitingInformationDetailsCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'VisitTypeCodeText'
    @sap.label : 'Visit Type'
    VisitTypeCode : String(4);
    @sap.label : 'Visit Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    VisitTypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization ID'
    SalesOrganisationID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DistributionChannelCodeText'
    @sap.label : 'Distribution Channel'
    DistributionChannelCode : String(2);
    @sap.label : 'Distribution Channel Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DistributionChannelCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DivisionCodeText'
    @sap.label : 'Division'
    DivisionCode : String(2);
    @sap.label : 'Division Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DivisionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Recommended Visit Frequency'
    RecommendedVisitingFrequency : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Visit Duration'
    VisitDuration : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Next Planned Visit'
    @sap.display.format : 'Date'
    NextVisitingDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Visited'
    @sap.display.format : 'Date'
    LastVisitingDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Visit Before'
    @sap.display.format : 'Date'
    LatestRecommendedVisitingDate : Date;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account International Version'
  entity CorporateAccountInternationalVersionCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'InternationalVersionCodeText'
    @sap.label : 'International Version'
    InternationalVersionCode : String(1) not null;
    @sap.label : 'International Version Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    InternationalVersionCodeText : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Business Partner Formatted Name'
    BusinessPartnerFormattedName : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Name'
    Name : String(40) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional Name'
    AdditionalName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional Name 2'
    AdditionalName2 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Additional Name 3'
    AdditionalName3 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address UUID'
    CurrentDefaultAddressUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Formatted Postal Address Description'
    FormattedPostalAddressDescription : String(480);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Country/Region'
    CountryCode : String(3);
    @sap.label : 'Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'StateCodeText'
    @sap.label : 'State'
    StateCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    StateCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'c/o'
    CareOfName : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 1'
    AddressLine1 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 2'
    AddressLine2 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'House Number'
    HouseNumber : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Street'
    Street : String(60);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 4'
    AddressLine4 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 5'
    AddressLine5 : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'District'
    District : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'City'
    City : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Different City'
    DifferentCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Postal Code'
    StreetPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'County'
    County : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Company Postal Code'
    CompanyPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Address'
    POBoxIndicator : Boolean;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box'
    POBox : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box Postal Code'
    POBoxPostalCode : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingCountryCodeText'
    @sap.label : 'P.O. Box Country/Region'
    POBoxDeviatingCountryCode : String(3);
    @sap.label : 'P.O. Box Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingCountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxDeviatingRegionCodeText'
    @sap.label : 'P.O. Box State'
    POBoxDeviatingRegionCode : String(6);
    @sap.label : 'P.O. Box State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxDeviatingRegionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box City'
    POBoxDeviatingCity : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TimeZoneCodeText'
    @sap.label : 'Time Zone'
    TimeZoneCode : String(10);
    @sap.label : 'Time Zone Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TimeZoneCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Building'
    Building : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Floor'
    Floor : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Room'
    Room : String(10);
    CorporateAccount : Association to CorporateAccountCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Account Identification'
  entity CorporateAccountIdentificationCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Account ID'
    AccountID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'IDTypeCodeText'
    @sap.label : 'ID Type'
    IDTypeCode : String(6) not null;
    @sap.label : 'ID Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    IDTypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'ID Number'
    IDNumber : String(60) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Responsible Institution'
    ResponsibleInstitution : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Entry Date'
    @sap.display.format : 'Date'
    EntryDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Valid From'
    @sap.display.format : 'Date'
    ValidFrom : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Valid To'
    @sap.display.format : 'Date'
    ValidTo : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Country/Region'
    CountryCode : String(3);
    @sap.label : 'Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'StateCodeText'
    @sap.label : 'State'
    StateCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    StateCodeText : String;
    CorporateAccount : Association to CorporateAccountCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Individual Customer Identification'
  entity IndividualCustomerIdentificationCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Customer ID'
    CustomerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'IDTypeCodeText'
    @sap.label : 'ID Type'
    IDTypeCode : String(6) not null;
    @sap.label : 'ID Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    IDTypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'ID Number'
    IDNumber : String(60) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Responsible Institution'
    ResponsibleInstitution : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Entry Date'
    @sap.display.format : 'Date'
    EntryDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Valid From'
    @sap.display.format : 'Date'
    ValidFrom : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Valid To'
    @sap.display.format : 'Date'
    ValidTo : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'CountryCodeText'
    @sap.label : 'Country/Region'
    CountryCode : String(3);
    @sap.label : 'Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    CountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'StateCodeText'
    @sap.label : 'State'
    StateCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    StateCodeText : String;
    IndividualCustomer : Association to IndividualCustomerCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'true'
  @sap.deletable : 'false'
  @sap.label : 'Business User'
  entity BusinessUserCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Employee ID'
    EmployeeID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Employee UUID'
    EmployeeUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'User ID'
    UserID : String(40) not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Technical ID'
    TechnicalUserID : String(255);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Identity UUID'
    IdentityUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'ID'
    BusinessPartnerID : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Name'
    BusinessPartnerFormattedName : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Department'
    DepartmentName : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Company'
    CompanyName : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Manager'
    ManagerName : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    EmailURI : String(255);
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DecimalFormatCodeText'
    @sap.label : 'Decimal Notation'
    DecimalFormatCode : String(2);
    @sap.label : 'Decimal Notation Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DecimalFormatCodeText : String;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'DateFormatCodeText'
    @sap.label : 'Date Format'
    DateFormatCode : String(2);
    @sap.label : 'Date Format Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    DateFormatCodeText : String;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TimeFormatCodeText'
    @sap.label : 'Time Format'
    TimeFormatCode : String(2);
    @sap.label : 'Time Format Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TimeFormatCodeText : String;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'TimeZoneCodeText'
    @sap.label : 'Time Zone'
    TimeZoneCode : String(10);
    @sap.label : 'Time Zone Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    TimeZoneCodeText : String;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'LogonLanguageCodeText'
    @sap.label : 'Logon Language'
    LogonLanguageCode : String(2);
    @sap.label : 'Logon Language Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    LogonLanguageCodeText : String;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'User Valid From'
    @sap.display.format : 'Date'
    UserValidityStartDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'User Valid To'
    @sap.display.format : 'Date'
    UserValidityEndDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'User Locked'
    UserLockedIndicator : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Counted User'
    UserCountedIndicator : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'PasswordPolicyCodeText'
    @sap.label : 'Security Policy'
    PasswordPolicyCode : String(40);
    @sap.label : 'Security Policy Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    PasswordPolicyCodeText : String;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Password Inactive'
    PasswordInactiveIndicator : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Password Locked'
    PasswordLockedIndicator : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'UserAccountTypeCodeText'
    @sap.label : 'User Account Type'
    UserAccountTypeCode : String(1);
    @sap.label : 'User Account Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    UserAccountTypeCodeText : String;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'User Created By'
    UserCreatedBy : String(480);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'User Changed By'
    UserChangedBy : String(480);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'User Changed On'
    UserChangedOn : Timestamp;
    BusinessUserBusinessRoleAssignment : Association to many BusinessUserBusinessRoleAssignmentCollection {  };
    BusinessUserSubscriptionAssignment : Association to many BusinessUserSubscriptionAssignmentCollection {  };
    EmployeeBasicData : Association to EmployeeBasicDataCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'false'
  @sap.deletable : 'true'
  @sap.label : 'Business User Business Role Assignment'
  entity BusinessUserBusinessRoleAssignmentCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Employee ID'
    EmployeeID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'User ID'
    UserID : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Business Role ID'
    BusinessRoleID : String(255) not null;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'false'
  @sap.deletable : 'true'
  @sap.label : 'Business User Subscription Assignment'
  entity BusinessUserSubscriptionAssignmentCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Parent Object ID'
    ParentObjectID : String(70);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Employee ID'
    EmployeeID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'User ID'
    UserID : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'UserTypeCodeText'
    @sap.label : 'User Type'
    UserTypeCode : String(3) not null;
    @sap.label : 'User Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    UserTypeCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.text : 'UserSubscriptionTypeCodeText'
    @sap.label : 'Subscription Type'
    UserSubscriptionTypeCode : String(40) not null;
    @sap.label : 'Subscription Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    UserSubscriptionTypeCodeText : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.label : 'Employee Basic Data'
  entity EmployeeBasicDataCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Employee ID'
    EmployeeID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Employee UUID'
    EmployeeUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'UserID'
    UserID : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Identity UUID'
    IdentityUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'ID'
    BusinessPartnerID : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Internal Employee'
    CurrentInternalEmployeeIndicator : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'External Employee'
    CurrentExternalEmployeeIndicator : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Formatted Name'
    FormattedName : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Title'
    TitleCode : String(4);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Academic Title'
    AcademicTitleCode : String(4);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'First Name'
    FirstName : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Middle Name'
    MiddleName : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Last Name'
    LastName : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Second Last Name'
    SecondLastName : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Nickname'
    NickName : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Gender'
    GenderCode : String(1);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Language'
    LanguageCode : String(2);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Formatted Address'
    FormattedAddress : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Country/Region'
    CountryCode : String(3);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'State'
    RegionCode : String(6);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 1'
    AddressLine1 : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 2'
    AddressLine2 : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'House Number'
    HouseNumber : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Street'
    Street : String(60);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 4'
    AddressLine4 : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Address Line 5'
    AddressLine5 : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'City'
    City : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Postal Code'
    PostalCode : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    Phone : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    Mobile : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    Fax : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    Email : String(255);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'User Validity Start Date'
    @sap.display.format : 'Date'
    UserValidityStartDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'User Validity End Date'
    @sap.display.format : 'Date'
    UserValidityEndDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'User Password Policy Code'
    UserPasswordPolicyCode : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'User Locked Indicator'
    UserLockedIndicator : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Time Zone Code'
    TimeZoneCode : String(10);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Manager'
    ManagerUUID : UUID;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Manager Formatted Name'
    ManagerFormattedName : String(480);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Job'
    JobName : String(40);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created On'
    CreatedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Created By'
    CreatedBy : String(480);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Changed On'
    ChangedOn : Timestamp;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Changed By'
    ChangedBy : String(480);
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Entity Last Changed On'
    EntityLastChangedOn : Timestamp;
    BusinessUser : Association to BusinessUserCollection {  };
    ManagerEmployeeBasicData : Association to EmployeeBasicDataCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity BusinessUserDateFormatCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity BusinessUserDecimalFormatCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity BusinessUserLogonLanguageCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity BusinessUserPasswordPolicyCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity BusinessUserSubscriptionAssignmentUserTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity BusinessUserTimeFormatCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity BusinessUserTimeZoneCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity BusinessUserUserAccountTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactAcademicTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactAdditionalAcademicTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactAttachmentFolderCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactAttachmentFolderTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactBestReachedByCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactBusinessAddressCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactContactPermissionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactDepartmentCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactFunctionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactGenderCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactInternationalVersionAcademicTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactInternationalVersionAdditionalAcademicTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactInternationalVersionInternationalVersionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactInternationalVersionTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactIsContactPersonForBestReachedByCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactIsContactPersonForDepartmentCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactIsContactPersonForFunctionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactIsContactPersonForVIPReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactLanguageCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactMaritalStatusCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactNamePrefixCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactPerceptionOfCompanyCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactPersonalAddressCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactPersonalAddressTimeZoneCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactProfessionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactStatusCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactTextCollectionLanguageCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactVIPContactCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountAddressBestReachedByCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountAddressCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountAddressLanguageCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountAddressPOBoxDeviatingCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountAddressTimeZoneCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountAttachmentFolderCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountAttachmentFolderTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountBestReachedByCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountBillingBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountContactPermissionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountCustomerABCClassificationCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountDeliveryBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountHasContactPersonBestReachedByCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountHasContactPersonDepartmentCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountHasContactPersonFunctionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountHasContactPersonVIPReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountIdentificationCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountIdentificationIDTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountInternationalVersionCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountInternationalVersionInternationalVersionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountInternationalVersionPOBoxDeviatingCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountInternationalVersionTimeZoneCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountLanguageCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountLegalFormCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountLifeCycleStatusCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountNielsenRegionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountOrderBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountPOBoxDeviatingCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountRoleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataBillingBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataCurrencyCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataCustomerGroupCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataDeliveryBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataDeliveryPriorityCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataDistributionChannelCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataDivisionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataIncotermsClassificationCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataOrderBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataPaymentTermsCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataPriceGroupCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountSalesDataPriceListCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountTaxNumberCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountTeamDistributionChannelCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountTeamDivisionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountTeamPartyRoleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountTextCollectionLanguageCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountTimeZoneCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountVisitingHoursTimeZoneCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountVisitingHoursWorkingDayCalendarCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountVisitingInformationDetailsDistributionChannelCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountVisitingInformationDetailsDivisionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountVisitingInformationDetailsVisitTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeBasicDataAcademicTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeBasicDataCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeBasicDataGenderCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeBasicDataLanguageCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeBasicDataTimeZoneCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeBasicDataTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeBasicDataUserPasswordPolicyCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerAcademicTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerAddressBestReachedByCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerAddressCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerAddressPOBoxDeviatingCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerAddressTimeZoneCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerAttachmentFolderCategoryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerAttachmentFolderTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerBestReachedByCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerBillingBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerContactPermissionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerCustomerABCClassificationCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerDeliveryBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerGenderCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerIdentificationCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerIdentificationIDTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerLanguageCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerLifeCycleStatusCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerMaritalStatusCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerNamePrefixCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerNationalityCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerOrderBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerPOBoxDeviatingCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerProfessionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerRoleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataBillingBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataCurrencyCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataCustomerGroupCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataDeliveryBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataDeliveryPriorityCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataDistributionChannelCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataDivisionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataIncotermsClassificationCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataOrderBlockingReasonCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataPaymentTermsCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataPriceGroupCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerSalesDataPriceListCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerTaxJurisdictionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerTaxNumberCountryCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerTeamDistributionChannelCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerTeamDivisionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerTeamPartyRoleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerTextCollectionLanguageCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerTimeZoneCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerTitleCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerVisitingInformationDetailsDistributionChannelCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerVisitingInformationDetailsDivisionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerVisitingInformationDetailsVisitTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity BusinessUserSubscriptionAssignmentUserSubscriptionTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactBusinessAddressStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity ContactPersonalAddressStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountAddressPOBoxDeviatingStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountAddressStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountIdentificationStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountIndustrialSectorCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountInternationalVersionPOBoxDeviatingRegionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountInternationalVersionStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountPOBoxDeviatingRegionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity CorporateAccountTaxNumberTaxTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeBasicDataRegionCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerAddressPOBoxDeviatingStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerAddressStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerIdentificationStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerPOBoxDeviatingStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerStateCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity IndividualCustomerTaxNumberTaxTypeCodeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Context'
    key Context : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Code'
    key Code : String not null;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Description'
    Description : String not null;
  };

  @cds.external : true
  function ContactQueryByElements(
    RelationshipBusinessPartnerUUID : String,
    RelationshipRoleCode : String,
    NumberOfRows : String,
    StartRow : String,
    ContactID : String,
    ContactUUID : String,
    LastName : String,
    FirstName : String,
    SortingFormattedName : String,
    City : String,
    StreetPostalCode : String,
    CountryCode : String,
    LifeCycleStatusCode : String,
    AccountID : String,
    AccountUUID : String,
    AccountName : String,
    AccountLifeCycleStatusCode : String,
    DepartmentCode : String,
    FunctionCode : String,
    EMailURI : String,
    CreatedSince : String,
    LastChangeSince : String,
    CreationIdentityID : String,
    LastChangeIdentityID : String,
    ResponsibleAgentUUID : String,
    SearchText : String,
    AccountFormattedName : String,
    ConsiderAccountChangesIndicator : String
  ) returns many ContactCollection;

  @cds.external : true
  function CorporateAccountQueryByElements(
    FormattedName : String,
    NumberOfRows : String,
    StartRow : String,
    AccountID : String,
    ExternalID : String,
    UUID : String,
    LifeCycleStatusCode : String,
    RoleCode : String,
    Name : String,
    AdditionalName : String,
    AddressDefaultIndicator : String,
    City : String,
    StreetPostalCode : String,
    StateCode : String,
    CountryCode : String,
    CustomerABCClassificationCode : String,
    IndustrialSectorCode : String,
    ContactPersonInternalID : String,
    ContactPersonUUID : String,
    ContactPersonLastName : String,
    ContactPersonFirstName : String,
    ContactPersonSortingFormattedName : String,
    ContactPersonWorkplaceEmailURI : String,
    SalesDataSalesOrganisationID : String,
    CreatedSince : String,
    LastChangeSince : String,
    CreationIdentityID : String,
    LastChangeIdentityID : String,
    FromLatitude : String,
    ToLatitude : String,
    FromLongitude : String,
    ToLongitude : String,
    SearchText : String,
    TerritoryOwnerOrResponsibleEmployeeUUID : UUID
  ) returns many CorporateAccountCollection;

  @cds.external : true
  function IndividualCustomerQueryByElements(
    NumberOfRows : String,
    StartRow : String,
    CustomerID : String,
    ExternalID : String,
    UUID : String,
    LifeCycleStatusCode : String,
    RoleCode : String,
    LastName : String,
    FirstName : String,
    SortingFormattedName : String,
    AddressDefaultIndicator : String,
    City : String,
    StreetPostalCode : String,
    CountryCode : String,
    StateCode : String,
    CustomerABCClassificationCode : String,
    SalesDataSalesOrganisationID : String,
    LastChangedSince : String,
    CreatedSince : String,
    CreationIdentityID : String,
    LastChangeIdentityID : String,
    ResponsibleAgentUUID : String,
    FromLatitude : String,
    ToLatitude : String,
    FromLongitude : String,
    ToLongitude : String,
    SearchText : String,
    TerritoryOwnerOrResponsibleEmployeeUUID : UUID
  ) returns many IndividualCustomerCollection;
};

