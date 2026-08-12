/* checksum : 40b789337498b6045b60f5bb5a8fd843 */
@cds.external : true
@m.IsDefaultEntityContainer : 'true'
service employeeanduser {
  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'false'
  @sap.label : 'Employee'
  entity EmployeeCollection {
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Object ID'
    key ObjectID : String(70) not null;
    @sap.creatable : 'true'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Employee ID'
    EmployeeID : String(20);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Employee UUID'
    UUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'User ID'
    UserID : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Identity UUID'
    IdentityUUID : UUID;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Global User ID'
    GlobalUserID : String(36);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Business Partner ID'
    BusinessPartnerID : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Employee Validity Start Date'
    @sap.display.format : 'Date'
    EmployeeValidityStartDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Employee Validity End Date'
    @sap.display.format : 'Date'
    EmployeeValidityEndDate : Date;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Business Partner Formatted Name'
    BusinessPartnerFormattedName : String(480);
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
    FirstName : String(40) not null;
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
    @sap.label : 'Second Last Name'
    SecondLastName : String(40);
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
    @sap.label : 'Place of Birth'
    BirthPlace : String(40);
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
    @sap.text : 'RegionCodeText'
    @sap.label : 'State'
    RegionCode : String(6);
    @sap.label : 'State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    RegionCodeText : String;
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
    PostalCode : String(10);
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
    @sap.text : 'POBoxCountryCodeText'
    @sap.label : 'P.O. Box Country/Region'
    POBoxCountryCode : String(3);
    @sap.label : 'P.O. Box Country/Region Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxCountryCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'POBoxRegionCodeText'
    @sap.label : 'P.O. Box State'
    POBoxRegionCode : String(6);
    @sap.label : 'P.O. Box State Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    POBoxRegionCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'P.O. Box City'
    POBoxCity : String(40);
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
    @sap.label : 'In-House Mail'
    InhouseMail : String(10);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Phone'
    OfficePhoneNumber : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Office Phone Number'
    NormalisedOfficePhoneNumber : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Mobile'
    MobilePhoneNumber : String(40);
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Normalized Mobile Phone Number'
    NormalisedMobilePhoneNumber : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Fax'
    FaxNumber : String(40);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'E-Mail'
    Email : String(255);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'User Validity Start Date'
    @sap.display.format : 'Date'
    UserValidityStartDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'User Validity End Date'
    @sap.display.format : 'Date'
    UserValidityEndDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'UserPasswordPolicyCodeText'
    @sap.label : 'User Password Policy'
    UserPasswordPolicyCode : String(40);
    @sap.label : 'User Password Policy Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    UserPasswordPolicyCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'User Locked Indicator'
    UserLockedIndicator : Boolean;
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    @sap.label : 'Counted User Indicator'
    UserCountedIndicator : Boolean;
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
    BusinessUser : Association to BusinessUserCollection {  };
    EmployeeOrganisationalUnitAssignment : Association to many EmployeeOrganisationalUnitAssignmentCollection {  };
    EmployeeSalesResponsibility : Association to many EmployeeSalesResponsibilityCollection {  };
    EmployeeSkills : Association to many EmployeeSkillsCollection {  };
    EmployeeUserBusinessRoleAssignment : Association to many EmployeeUserBusinessRoleAssignmentCollection {  };
    EmployeeUserSubscriptionAssignment : Association to many EmployeeUserSubscriptionAssignmentCollection {  };
    EmployeeWorkingHours : Association to many EmployeeWorkingHoursCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Employee Sales Responsibility'
  entity EmployeeSalesResponsibilityCollection {
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
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Sales Organization ID'
    SalesOrganisationID : String(20) not null;
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
    @sap.label : 'Main'
    MainIndicator : Boolean;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    Employee : Association to EmployeeCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Employee Organizational Unit Assignment'
  entity EmployeeOrganisationalUnitAssignmentCollection {
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
    @sap.label : 'Organizational Unit ID'
    OrgUnitID : String(20);
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'RoleCodeText'
    @sap.label : 'Role'
    RoleCode : String(10);
    @sap.label : 'Role Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    RoleCodeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Valid From'
    @sap.display.format : 'Date'
    StartDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Valid To'
    @sap.display.format : 'Date'
    EndDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Job ID'
    JobID : String(20);
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
    Employee : Association to EmployeeCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Employee User Business Role Assignment'
  entity EmployeeUserBusinessRoleAssignmentCollection {
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
  @sap.label : 'Employee User Subscription Assignment'
  entity EmployeeUserSubscriptionAssignmentCollection {
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
    @sap.updatable : 'true'
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
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'UserSubscriptionTypeCodeText'
    @sap.label : 'Subscription Type'
    UserSubscriptionTypeCode : String(40) not null;
    @sap.label : 'Subscription Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    UserSubscriptionTypeCodeText : String;
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
  @sap.label : 'Employee Working Hours'
  entity EmployeeWorkingHoursCollection {
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
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.text : 'WorkingHoursTypeText'
    @sap.label : 'Type'
    WorkingHoursType : String(2);
    @sap.label : 'Type Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    WorkingHoursTypeText : String;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Valid From'
    @sap.display.format : 'Date'
    StartDate : Date;
    @sap.creatable : 'true'
    @sap.updatable : 'true'
    @sap.filterable : 'true'
    @sap.label : 'Valid To'
    @sap.display.format : 'Date'
    EndDate : Date;
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
    @sap.text : 'WorkingDayCalendarCodeText'
    @sap.label : 'Working Day Calendar'
    WorkingDayCalendarCode : String(6);
    @sap.label : 'Working Day Calendar Text'
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'true'
    WorkingDayCalendarCodeText : String;
    @odata.Type : 'Edm.DateTimeOffset'
    @odata.Precision : 7
    @sap.creatable : 'false'
    @sap.updatable : 'false'
    @sap.filterable : 'false'
    @sap.label : 'Entity Tag'
    ETag : Timestamp;
    Employee : Association to EmployeeCollection {  };
    EmployeeWorkingHoursRecurrence : Association to many EmployeeWorkingHoursRecurrenceCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Employee Working Hours Weekly Recurrence'
  entity EmployeeWorkingHoursRecurrenceCollection {
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
    @sap.label : 'Employee ID'
    EmployeeID : String(20);
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
    EmployeeWorkingHours : Association to EmployeeWorkingHoursCollection {  };
    EmployeeWorkingHoursOperatingPeriod : Association to many EmployeeWorkingHoursOperatingPeriodCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Employee Working Hours Operating Times'
  entity EmployeeWorkingHoursOperatingPeriodCollection {
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
    @sap.label : 'Employee ID'
    EmployeeID : String(20);
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
    EmployeeWorkingHoursRecurrence : Association to EmployeeWorkingHoursRecurrenceCollection {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'true'
  @sap.updatable : 'true'
  @sap.deletable : 'true'
  @sap.label : 'Employee Skills'
  entity EmployeeSkillsCollection {
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
    @sap.label : 'Skill ID'
    SkillID : String(20) not null;
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
    Employee : Association to EmployeeCollection {  };
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeAcademicTitleCodeCollection {
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
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
    Description : String not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @sap.creatable : 'false'
  @sap.updatable : 'false'
  @sap.deletable : 'false'
  @sap.semantics : 'fixed-values'
  entity EmployeeCountryCodeCollection {
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
  entity EmployeeGenderCodeCollection {
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
  entity EmployeeLanguageCodeCollection {
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
  entity EmployeeMaritalStatusCodeCollection {
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
  entity EmployeeNationalityCountryCodeCollection {
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
  entity EmployeeOrganisationalUnitAssignmentRoleCodeCollection {
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
  entity EmployeePOBoxCountryCodeCollection {
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
  entity EmployeeSalesResponsibilityDistributionChannelCodeCollection {
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
  entity EmployeeSalesResponsibilityDivisionCodeCollection {
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
  entity EmployeeTaxJurisdictionCodeCollection {
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
  entity EmployeeTimeZoneCodeCollection {
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
  entity EmployeeTitleCodeCollection {
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
  entity EmployeeUserPasswordPolicyCodeCollection {
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
  entity EmployeeUserSubscriptionAssignmentUserSubscriptionTypeCodeCollection {
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
  entity EmployeeUserSubscriptionAssignmentUserTypeCodeCollection {
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
  entity EmployeeWorkingHoursTimeZoneCodeCollection {
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
  entity EmployeeWorkingHoursWorkingDayCalendarCodeCollection {
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
  entity EmployeeWorkingHoursWorkingHoursTypeCollection {
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
  entity EmployeePOBoxRegionCodeCollection {
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
  entity EmployeeRegionCodeCollection {
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
};

