/* checksum : b4d112c5c4a0685edf59defd2a58397f */
namespace SAP.Cloud.ALM;

@Capabilities.BatchSupported : false
@Capabilities.KeyAsSegmentSupported : true
@Core.Description : 'SAP Cloud ALM ITSM'
@Core.SchemaVersion : '1.5.0'
@Core.LongDescription : ```
The **SAP Cloud ALM ITSM API** enables you to open and manage cases (tickets) in the SAP Support Backbone.

The goal of the SAP Cloud ALM ITSM API is to support case management from your ITSM system. The SAP Cloud ALM Cases API lets you create, manage, and exchange cases with the SAP support backbone.

Cases created or managed via the SAP Cloud ALM Cases API are fully compatible with SAP standard support access points: SAP for Me, SAP for Me mobile app, Built-In Support, and SAP Solution Manager.

In addition, the SAP Cloud ALM Cases API offers AI-enabled self-service capabilities for incident solution recommendations and categorizations.
```
service ITSM {
  @Common.Label : 'Cases'
  @Core.Description : 'Get a case'
  @Core.LongDescription : 'Retrieves detailed information about a specific customer support case.'
  @openapi.path : '/supportcases/cases'
  function supportcases_cases(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User ID of the reporter. Used to scope results to cases accessible by this user.'
    @openapi.in : 'query'
    reporter : String
  ) returns ITSM_types.Case;

  @Common.Label : 'Cases'
  @Core.Description : 'Create a case'
  @Core.LongDescription : ```
  Creates a new customer support case in the SAP Support Backbone.
  
  See the \`CasePost\` schema for the full list of supported request body fields. Required fields are: \`priority\`, \`component\`, \`customerNumber\`, \`installationNumber\`, \`systemNbr\`, \`subject\`, \`description\`, and \`reporter\`.
  
  The response body contains the correlation ID of the newly created case.
  ```
  @openapi.path : '/supportcases/cases'
  action supportcases_cases_post(
    @openapi.in : 'body'
    body : ITSM_types.CasePost
  ) returns ITSM_types.CaseIdResponse;

  @Common.Label : 'Cases'
  @Core.Description : 'Update a case'
  @Core.LongDescription : ```
  Updates an existing support case in the SAP Support Backbone.
  
  Required parameters are the case **id** (query) and **reporter** S-User ID (query). The request body contains the fields to update. See the \`CasePatch\` schema for details.
  
  The response returns the correlation ID of the updated case.
  
  **Field update constraints:**
  
  - When the case status is **"In Processing by SAP"**, only \`comments\`, \`contactList\`, and \`attachments\` can be updated.
  - \`priority\` and all business impact fields (\`businessImpact\`, \`businessImpactSeverity\`, \`workaround\`, \`workaroundEffectiveness\`, \`impactedDeadline\`, \`impactedUsersNumber\`) can only be updated when the status is **"Customer Action"** or **"Partner-Customer Action"**.
  - To close a case, set \`status\` to \`Confirmed\`.
  ```
  @openapi.method : 'PATCH'
  @openapi.path : '/supportcases/cases'
  action supportcases_cases_patch(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User ID of the reporter. Used to scope results to cases accessible by this user.'
    @openapi.in : 'query'
    @openapi.required : true
    reporter : String,
    @openapi.in : 'body'
    body : ITSM_types.CasePatch
  ) returns ITSM_types.CaseIdResponse;

  @Common.Label : 'Cases'
  @Core.Description : 'Get a list of cases'
  @Core.LongDescription : `Retrieves a paginated array of customer support case IDs matching the provided filter criteria.

At least one **installationNumber** or one **customerNumber** must be provided. All other parameters are optional filters. See the parameter list below for details.`
  @openapi.path : '/supportcases/cases/ids'
  function supportcases_cases_ids(
    @description : ```
    List of installation numbers for which the cases are managed. 
    
     * Mandatory parameter: at least one installation number (or one customer number) should be provided. 
    
     * Maximum number of installation numbers that can be provided is 5.
    ```
    @openapi.in : 'query'
    installationNumber : many anonymous.type0,
    @description : ```
    List of customer numbers of the customer.
    * Mandatory parameter: at least one customer number (or one installation number) should be provided. 
    
     * Maximum number of customer numbers that can be provided is 5.
    ```
    @openapi.in : 'query'
    customerNumber : many anonymous.type1,
    @description : 'List of system numbers for which the cases are managed. Maximum number of system numbers that can be provided is 5.'
    @openapi.in : 'query'
    systemNumber : many anonymous.type2,
    @description : '- S-User ID of the reporter. May be a VAR partner or the customer managing the cases.'
    @openapi.in : 'query'
    reporter : String,
    @description : 'Filter parameter - list of statuses for the cases.'
    @openapi.in : 'query'
    status : many anonymous.type3,
    @description : `Filter parameter - one or more components of the case.
`
    @openapi.in : 'query'
    @openapi.explode : true
    component : many String,
    @description : 'Filter parameter - priority of the case.'
    @openapi.in : 'query'
    priority : many anonymous.type4,
    @description : 'Filter parameter - active status of the case.'
    @openapi.in : 'query'
    active : Boolean,
    @assert.format : 'SAP|S[0-9]{10}'
    @description : 'Filter parameter - creator of the case. Can be "SAP" or an S-user.'
    @openapi.in : 'query'
    createdBy : String,
    @assert.format : 'SAP|S[0-9]{10}'
    @description : 'Filter parameter - last party to update the case. Can be "SAP" or an S-user.'
    @openapi.in : 'query'
    lastUpdatedBy : String,
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @description : 'Filter to retrieve cases last changed on or after the specified date (YYYY-MM-DD).'
    @openapi.in : 'query'
    fromLastChangedDate : String,
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @description : 'Filter to retrieve cases last changed on or before the specified date (YYYY-MM-DD).'
    @openapi.in : 'query'
    toLastChangedDate : String,
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @description : ```
    Filter parameter - last changed timestamp with operator to filter
    items (UTC).
    
    * Last changed timestamp value should be formatted as ISO 8601
    format.
    
    ```
    @openapi.in : 'query'
    fromLastChangedTimestamp : String,
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @description : ```
    Filter parameter - last changed timestamp with operator to filter
    items (UTC).
    
    * Last changed timestamp value should be formatted as ISO 8601
    format.
    
    ```
    @openapi.in : 'query'
    toLastChangedTimestamp : String,
    @description : 'Filter parameter - to retrieve proactive cases when set to true and exclude proactive cases when set to false.'
    @openapi.in : 'query'
    proactive : Boolean,
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.CaseId;
  };

  @Common.Label : 'Cases'
  @Core.Description : 'Get list of action plans'
  @Core.LongDescription : 'Retrieves a list of action plans associated with a specific support case. Supports filtering by creation or update date/timestamp and pagination via **offset** and **limit**.'
  @openapi.path : '/supportcases/cases/actionPlans'
  function supportcases_cases_actionPlans(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User ID of the reporter. Used to scope results to cases accessible by this user.'
    @openapi.in : 'query'
    reporter : String,
    @description : `Filter parameter to retrieve items created on or after the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    fromCreationDate : String,
    @description : `Filter parameter to retrieve items created on or before the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    toCreationDate : String,
    @description : ```
    Filter parameter to retrieve items created on or after the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    fromCreationTimestamp : String,
    @description : ```
    Filter parameter to retrieve items created on or before the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    toCreationTimestamp : String,
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @description : `Filter parameter to retrieve items updated on or after the  specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @openapi.in : 'query'
    fromUpdateDate : String,
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @description : `Filter parameter to retrieve items updated on or before the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @openapi.in : 'query'
    toUpdateDate : String,
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @description : ```
    Filter parameter to retrieve items updated on or after the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @openapi.in : 'query'
    fromUpdateTimestamp : String,
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @description : ```
    Filter parameter to retrieve items updated on or before the
    specified timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @openapi.in : 'query'
    toUpdateTimestamp : String,
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.ActionPlan;
  };

  @Common.Label : 'Cases'
  @Core.Description : 'Get list of articles'
  @Core.LongDescription : 'Retrieves a list of Knowledge Base Articles (KBAs) attached to a specific support case. Supports filtering by creation date/timestamp and pagination via **offset** and **limit**.'
  @openapi.path : '/supportcases/cases/articles'
  function supportcases_cases_articles(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User ID of the reporter. Used to scope results to cases accessible by this user.'
    @openapi.in : 'query'
    reporter : String,
    @description : `Filter parameter to retrieve items created on or after the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    fromCreationDate : String,
    @description : `Filter parameter to retrieve items created on or before the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    toCreationDate : String,
    @description : ```
    Filter parameter to retrieve items created on or after the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    fromCreationTimestamp : String,
    @description : ```
    Filter parameter to retrieve items created on or before the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    toCreationTimestamp : String,
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.Article;
  };

  @Common.Label : 'Cases'
  @Core.Description : 'Get list of activities'
  @Core.LongDescription : 'Retrieves a list of all activities (audit log entries) for a specific support case. Supports filtering by creation date/timestamp and pagination via **offset** and **limit**.'
  @openapi.path : '/supportcases/cases/activities'
  function supportcases_cases_activities(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User ID of the reporter. Used to scope results to cases accessible by this user.'
    @openapi.in : 'query'
    reporter : String,
    @description : `Filter parameter to retrieve items created on or after the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    fromCreationDate : String,
    @description : `Filter parameter to retrieve items created on or before the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    toCreationDate : String,
    @description : ```
    Filter parameter to retrieve items created on or after the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    fromCreationTimestamp : String,
    @description : ```
    Filter parameter to retrieve items created on or before the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    toCreationTimestamp : String,
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.Activity;
  };

  @Common.Label : 'Cases'
  @Core.Description : 'Get list of attachments'
  @Core.LongDescription : 'Retrieves a list of all attachments associated with a specific support case, including the ID and Document Service URL of each file. Supports filtering by creation date/timestamp and pagination via **offset** and **limit**.'
  @openapi.path : '/supportcases/cases/attachments'
  function supportcases_cases_attachments(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User ID of the reporter. Used to scope results to cases accessible by this user.'
    @openapi.in : 'query'
    reporter : String,
    @description : `Filter parameter to retrieve items created on or after the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    fromCreationDate : String,
    @description : `Filter parameter to retrieve items created on or before the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    toCreationDate : String,
    @description : ```
    Filter parameter to retrieve items created on or after the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    fromCreationTimestamp : String,
    @description : ```
    Filter parameter to retrieve items created on or before the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    toCreationTimestamp : String,
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.Attachment;
  };

  @Common.Label : 'Cases'
  @Core.Description : 'Post an attachment'
  @Core.LongDescription : 'Uploads one or multiple attachments to a specific support case. The request body is a JSON array of attachment objects following the `CaseAttachmentPost` schema. Uploaded files are added to the case history and accessible via SAP standard support access points.'
  @openapi.path : '/supportcases/cases/attachments'
  action supportcases_cases_attachments_post(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User ID of the reporter. Used to scope results to cases accessible by this user.'
    @openapi.in : 'query'
    @openapi.required : true
    reporter : String,
    @openapi.in : 'body'
    body : many ITSM_types.CaseAttachmentPost
  ) returns ITSM_types.CaseIdResponse;

  @Common.Label : 'Cases'
  @Core.Description : 'Get list of comments'
  @Core.LongDescription : 'Retrieves a list of all comments on a specific support case. Supports filtering by creation date/timestamp and pagination via **offset** and **limit**.'
  @openapi.path : '/supportcases/cases/comments'
  function supportcases_cases_comments(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User ID of the reporter. Used to scope results to cases accessible by this user.'
    @openapi.in : 'query'
    reporter : String,
    @description : `Filter parameter to retrieve items created on or after the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    fromCreationDate : String,
    @description : `Filter parameter to retrieve items created on or before the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-02'
    @openapi.in : 'query'
    toCreationDate : String,
    @description : ```
    Filter parameter to retrieve items created on or after the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    fromCreationTimestamp : String,
    @description : ```
    Filter parameter to retrieve items created on or before the specified
    timestamp (UTC).
    
    * The timestamp value should be formatted \`YYYY-MM-DD HH:MM:SS\`
    
    ```
    @assert.format : '^\d{4}-\d{2}-\d{2} (?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : '2024-08-10 10:15:30'
    @openapi.in : 'query'
    toCreationTimestamp : String,
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.Comment;
  };

  @Common.Label : 'Cases'
  @Core.Description : 'Update a case with comments'
  @Core.LongDescription : 'Adds a new comment to an existing support case. The response returns the ID of the updated case.'
  @openapi.path : '/supportcases/cases/comments'
  action supportcases_cases_comments_post(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User from the customer, it maybe a VAR partner or the Customer itself which is managing the cases.'
    @openapi.in : 'query'
    @openapi.required : true
    reporter : String,
    @openapi.in : 'body'
    body : ITSM_types.CommentPost
  ) returns ITSM_types.CaseIdResponse;

  @Common.Label : 'Cases'
  @Core.Description : 'Get list of contacts'
  @Core.LongDescription : 'Retrieves the list of contacts associated with a specific support case.'
  @openapi.path : '/supportcases/cases/contacts'
  function supportcases_cases_contacts(
    @description : 'ID of the case.'
    @openapi.in : 'query'
    @openapi.required : true
    id : String,
    @description : 'S-User ID of the reporter. Used to scope results to cases accessible by this user.'
    @openapi.in : 'query'
    reporter : String
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.Contact;
  };

  @Common.Label : 'Attachments'
  @Core.Description : 'Retrieve attachment'
  @Core.LongDescription : 'Downloads a single attachment by its ID. Set **base64Encoded** to `true` to receive the content as a base64-encoded string instead of raw binary.'
  @openapi.path : '/supportcases/attachment'
  function supportcases_attachment(
    @description : 'ID of the attachment.'
    @openapi.in : 'query'
    @openapi.required : true
    idAttachment : String,
    @description : 'ID of the S-User.'
    @openapi.in : 'query'
    @openapi.required : true
    reporter : String,
    @description : 'Flag indicating if the attachment should be base64 encoded.'
    @openapi.in : 'query'
    base64Encoded : Boolean default false
  ) returns
    @openapi.contentType : 'application/octet-stream'
    LargeBinary;

  @Common.Label : 'Attachments'
  @Core.Description : 'Upload attachment'
  @Core.LongDescription : `Uploads a binary or base64-encoded file as an attachment to the document repository. Maximum file size is 30 MB.

Permitted file types are listed in [SAP Note 1277146](https://me.sap.com/notes/1277146). Files of any other type will not be transferred to SAP.`
  @openapi.path : '/supportcases/attachment'
  action supportcases_attachment_post(
    @description : 'Flag indicating if the attachment is base64 encoded.'
    @openapi.in : 'query'
    base64Encoded : Boolean default false,
    @openapi.contentType : 'multipart/form-data'
    @openapi.in : 'body'
    body : {
      @mandatory : true
      attachment : ITSM_types.BinaryAttachment;
      name : String;
      @description : 'File extension (e.g., ''png'', ''txt'').'
      type : String;
      description : String;
      @mandatory : true
      installation : String;
    }
  ) returns ITSM_types.AttachmentResponse;

  @Common.Label : 'Components'
  @Core.Description : 'Get list of CSN components'
  @Core.LongDescription : `Returns a paginated list of CSN components matching the provided filters.

The response is an array of component entries as stored in the backend system.`
  @openapi.path : '/supportcases/masterdata/components'
  function supportcases_masterdata_components(
    @assert.format : '^(?=.*[a-zA-Z])[a-zA-Z*-]{1,40}$'
    @description : 'Text-based search filter for component IDs (1-40 characters; can contain letters, hyphens and asterisks)'
    @openapi.in : 'query'
    componentIdSearchText : String,
    @assert.format : 'd{1,10}'
    @description : 'Numeric search filter for component keys (up to 10 digits)'
    @openapi.in : 'query'
    componentKey : String,
    @assert.format : 'd{1,10}'
    @description : 'Numeric search filter for component''s parent keys (up to 10 digits). Accepts "EMPTY" as input (case insensitive).'
    @openapi.in : 'query'
    parentKey : String,
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @description : `Filter parameter to retrieve items updated on or after the  specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @openapi.in : 'query'
    fromUpdateDate : String,
    @assert.format : '^\d{4}-\d{2}-\d{2}$'
    @description : `Filter parameter to retrieve items updated on or before the specified date.
* The date value should be formatted as \`YYYY-MM-DD\` (ISO 8601 date format).`
    @openapi.in : 'query'
    toUpdateDate : String,
    @description : 'Search flag for whether a component is obsolete or not.'
    @openapi.in : 'query'
    obsolete : Boolean,
    @description : 'Search flag for whether a component is selectable for case creation or not.'
    @openapi.in : 'query'
    selectable : Boolean,
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.Component;
  };

  @Common.Label : 'Contacts'
  @Core.Description : 'Get list of contacts'
  @Core.LongDescription : 'Returns the list of S-Users authorized to manage cases for a specific customer. Supports pagination via **offset** and **limit**.'
  @openapi.path : '/supportcases/masterdata/contacts'
  function supportcases_masterdata_contacts(
    @description : 'S-User of the customer.'
    @openapi.in : 'query'
    reporter : String,
    @description : 'Customer number of the customer that the contacts belong to.'
    @openapi.in : 'query'
    @openapi.required : true
    customerNumber : String,
    @description : 'Installation number of the customer.'
    @openapi.in : 'query'
    installationNumber : String,
    @description : ```
    Filter by authorization object. \`CASE_MANAGEMENT_P\` is required for partners to manage an end customer's cases.
    
    Available values:
    
    - **ADMIN**: Edit Authorizations
    - **REPORT_TECHNICAL_PROBLEM**: Report Technical Problem
    - **CASE_READ**: Display all Cases
    - **CASE_READ_INST**: Display Cases
    - **CASE_WRITE**: Send Cases to SAP
    - **CASE_CLOSE**: Close Cases
    - **CASE_MANAGEMENT_P**: Customer Incident Management (Partner)
    - **ALL**: Returns all S-Users regardless of their authorizations
    ```
    @openapi.in : 'query'
    authorizationObjects : String default 'ADMIN',
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.CustomerSet;
  };

  @Common.Label : 'Self-service'
  @Core.Description : 'Get solution recommendations'
  @Core.LongDescription : ```
  Provides AI-based recommendations for support resources based on the case description.
  
  Returns a ranked list of relevant SAP knowledge content, including KBAs, SAP Notes, SAP Help Portal documentation, and SAP Community content.
  
  For more consistent results, provide **description**, **component**, **customerNumber**, and **installationNumber**.
  ```
  @openapi.path : '/supportcases/recommendations/solutions'
  action supportcases_recommendations_solutions_post(
    @openapi.in : 'body'
    body : ITSM_types.SolutionPost
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.Recommendations;
  };

  @Common.Label : 'Self-service'
  @Core.Description : 'Get component category recommendations'
  @Core.LongDescription : `Provides AI-based component recommendations based on the case description.

Results are ranked by relevance to the described issue. For more reliable results, provide both **description** and **installationNumber**.`
  @openapi.path : '/supportcases/recommendations/categories'
  action supportcases_recommendations_categories_post(
    @openapi.in : 'body'
    body : ITSM_types.CategoryPost
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.Categories;
  };

  @Common.Label : 'Landscape'
  @Core.Description : 'Get Landscape Objects'
  @Core.LongDescription : ```
  Returns the complete landscape information for a customer.
  
  When **onlyCaseSelectable** is \`true\`, only landscape objects selectable for case creation are returned and **reporter** becomes mandatory.
  
  Depending on whether **customerNumber** or **reporter** is provided, the API returns all landscape objects belonging to that customer or S-User respectively.
  ```
  @openapi.path : '/supportcases/masterdata/landscapeObjects'
  function supportcases_masterdata_landscapeObjects(
    @description : 'S-User of the customer that the landscape objects belong to. Only mandatory when onlyCaseSelectable is true.'
    @openapi.in : 'query'
    reporter : String,
    @description : 'Customer number of the customer that the landscape objects belong to.'
    @openapi.in : 'query'
    customerNumber : String,
    @description : 'Support partner number of the system.'
    @openapi.in : 'query'
    supportPartnerNumber : String,
    @description : `Search text to filter the results. The search is performed on all fields.

Can only be used when onlyCaseSelectable is true, otherwise it will be ignored`
    @openapi.in : 'query'
    searchText : String,
    @description : 'If true, only landscape objects that can be selected for a case creation will be returned.'
    @openapi.in : 'query'
    onlyCaseSelectable : Boolean,
    @description : 'If true, only landscape objects that are supported by an SAP support partner will be returned.'
    @openapi.in : 'query'
    onlySupported : Boolean,
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM_types.LandscapeObject;
  };

  @Common.Label : 'Landscape'
  @Core.Description : 'Get extended landscape objects'
  @Core.LongDescription : ```
  Retrieves two datasets for a given customer:
  
  - **globalSUsers**: S-Users with access to the entire landscape
  - **landscapeObjects**: individual landscape objects, each with the S-Users who have access to it
  
  Either **reporter** or **customerNumber** must be provided.
  ```
  @openapi.path : '/supportcases/masterdata/landscapeObjectsExtended'
  function supportcases_masterdata_landscapeObjectsExtended(
    @description : 'S-User of the customer that the landscape objects belong to.'
    @openapi.in : 'query'
    reporter : String,
    @description : 'Customer number of the customer that the landscape objects belong to.'
    @openapi.in : 'query'
    @openapi.required : true
    customerNumber : String,
    @description : 'Support partner number of the system.'
    @openapi.in : 'query'
    supportPartnerNumber : String,
    @description : ```
    Filter by authorization object. \`CASE_MANAGEMENT_P\` is required for partners to manage an end customer's cases.
    
    Available values:
    
    - **ADMIN**: Edit Authorizations
    - **REPORT_TECHNICAL_PROBLEM**: Report Technical Problem
    - **CASE_READ**: Display all Cases
    - **CASE_READ_INST**: Display Cases
    - **CASE_WRITE**: Send Cases to SAP
    - **CASE_CLOSE**: Close Cases
    - **CASE_MANAGEMENT_P**: Customer Incident Management (Partner)
    ```
    @openapi.in : 'query'
    authorizationObjects : String default 'ADMIN',
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer,
    @description : 'Limit the number of the s-users in the global s-users List and the subList per landscape object.'
    @openapi.in : 'query'
    sUsersLimit : Integer,
    @description : 'Offset the number of s-users in the global s-users List and the subList per landscape object'
    @openapi.in : 'query'
    sUsersOffset : Integer,
    @description : 'List of fields to be included in the response (globalSUsers and landscapeObjects). If not provided, both lists are returned.'
    @openapi.in : 'query'
    ![select] : String default 'globalSUsers, landscapeObjects'
  ) returns {
    globalSUsers : {
      @Core.Example.$Type : 'Core.PrimitiveExampleValue'
      @Core.Example.Value : 10
      count : Integer;
      @Core.Example.$Type : 'Core.PrimitiveExampleValue'
      @Core.Example.Value : 100
      totalCount : Integer;
      results : many anonymous.type5;
    };
    landscapeObjects : {
      @Core.Example.$Type : 'Core.PrimitiveExampleValue'
      @Core.Example.Value : 10
      count : Integer;
      @Core.Example.$Type : 'Core.PrimitiveExampleValue'
      @Core.Example.Value : 100
      totalCount : Integer;
      results : many ITSM_types.LandscapeObjectExtended;
    };
  };

  @Common.Label : 'Customers'
  @Core.Description : 'Get supported customers for a CCC member'
  @Core.LongDescription : ```
  Retrieves the flat list of customers that a Customer Competence Center
  (CCC) group member is responsible for supporting, including the
  relationship type for each entry (SUPPORTED, CCC, SERVICED).
  
  
  If **reporter** is omitted, the S-User is resolved from the
  authenticated user's certificate.
  
  ```
  @openapi.path : '/supportcases/masterdata/customers'
  function supportcases_masterdata_customers(
    @description : 'S-User ID of the CCC member. If omitted, resolved from the authenticated user''s certificate.'
    @openapi.in : 'query'
    reporter : String,
    @description : 'Filter by one or more child customer IDs (exact match). Repeat the parameter for multiple values.'
    @openapi.in : 'query'
    customerNumber : many String,
    @description : 'Filter by parent customer ID (exact match). Useful for navigating VAR hierarchies.'
    @openapi.in : 'query'
    parentCustomerNumber : String,
    @description : 'Filter by one or more relationship types. Repeat the parameter for multiple values.'
    @openapi.in : 'query'
    relationshipType : many anonymous.type6,
    @description : 'Paging parameter - the number of items to skip before starting to collect the result set.'
    @openapi.in : 'query'
    offset : Integer default 0,
    @description : 'Paging parameter - the maximum number of items to be returned.'
    @openapi.in : 'query'
    limit : Integer
  ) returns {
    @description : 'Number of results in the current page.'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @description : 'Total number of results matching the active filters and security constraints, before pagination is applied.'
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 14
    totalCount : Integer;
    results : many ITSM_types.SupportedCustomer;
  };

  @description : 'Installation Number for the SAP Solution for which the cases is managed'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0020601305'
  type anonymous.type0 : String;

  @description : 'Customer Number of the customer'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0001234567'
  type anonymous.type1 : String;

  @description : 'system Number for which the cases is managed'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '000000000123456789'
  type anonymous.type2 : String;

  @assert.range : true
  type anonymous.type3 : String enum {
    Sent_to_SAP = 'Sent to SAP';
    In_Processing_by_SAP = 'In Processing by SAP';
    Customer_Action = 'Customer Action';
    Confirmed;
    Pending_Release = 'Pending Release';
    SAP_Proposed_Solution = 'SAP Proposed Solution';
    Sent_to_SAP_Partner = 'Sent to SAP Partner';
    Partner_Customer_Action = 'Partner-Customer Action';
    Confirmed_Automatically = 'Confirmed Automatically';
  };

  @assert.range : true
  type anonymous.type4 : String enum {
    _1 = '1';
    _2 = '2';
    _3 = '3';
    _4 = '4';
  };

  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S0123456789'
  type anonymous.type5 : String;

  @assert.range : true
  type anonymous.type6 : String enum {
    SUPPORTED;
    CCC;
    SERVICED;
    DEFAULT;
  };

  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S0123456789'
  type anonymous.type7 : String;
};

@description : 'A support case as returned by the SAP Support Backbone.'
type ITSM_types.Case {
  @description : 'Internal correlation ID of the case in the SAP Support Backbone.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '002028376700055632532023'
  id : String;
  @description : 'Number of the case in the SAP Support Backbone'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '5563253/2023'
  caseNumber : String;
  @description : 'Subject of the case'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the subject of the case'
  subject : String;
  @description : 'Description of the case'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the description of the case'
  description : String;
  @description : 'Language of the case'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'EN'
  language : String;
  @description : 'The technical component (CSN) associated with the case, such as a product or service area within SAP.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'XX-SER-ITSM-TEST'
  product : String;
  @description : 'The specific functional area or submodule related to the selected component (product).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Administration > External API Management'
  productFunction : String;
  @description : 'Priority level: 1 = Very High, 2 = High, 3 = Medium, 4 = Low.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '1'
  priority : String;
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'In Processing by SAP'
  status : String;
  @description : 'Free-text description of how the issue impacts business operations.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'this is the business impact'
  businessImpact : String;
  @description : 'Display name of the affected system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'A11 backup'
  systemName : String;
  @description : 'System number'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '000000000311834471'
  systemNbr : String;
  @description : 'System number, "systemId" is an alias for the systemNbr'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '000000000311834471'
  systemId : String;
  @description : 'SAP customer number (CRM ID).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0001105772'
  customerNumber : String;
  @description : 'SAP partner number of the support partner assigned to this case.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0000001234'
  supportPartnerNumber : String;
  @description : 'S-User of the support partner contact.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  supportPartnerContact : String;
  @description : 'Support contract type (e.g., VAR-D for VAR direct support).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'VAR-D'
  supportType : String;
  @description : 'SAP installation number identifying the customer''s system landscape.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0020601305'
  installationNumber : String;
  @description : 'S-User ID of the person who reported the case.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  reporter : String;
  @description : 'S-User of the customer contact'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  customer : String;
  @description : 'Creation timestamp (UTC)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  createdAt : String;
  @description : 'User last update timestamp (UTC)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00Z'
  updatedAt : String;
  @description : 'System last update timestamp (UTC)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  updatedBySystemAt : String;
  @description : 'Closed timestamp (UTC)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  closedAt : String;
  @description : 'Date when the case is automatically confirmed by SAP if no response is received from the customer. Applicable only for cases in status "Customer Action", "Partner-Customer Action" or "Sap Proposed Solution".'
  autoConfirmationDate : String;
  @description : 'S-User who created the case'
  createdBy : String;
  @description : 'S-User who last updated the case.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  lastUpdatedBy : String;
  @description : 'Deep link to this case in SAP for Me.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'https://me.sap.com/servicessupport/case/002028376700055632532023'
  connectionLink : String;
  @description : 'Indicates if the case is proactive'
  proactive : Boolean;
  @description : 'PCSO proactive use case identifier (format: PCSXXXX). Empty string if the case does not have a use case ID.'
  proactiveUseCaseId : String;
};

@description : 'Request body for creating a new support case.'
type ITSM_types.CasePost {
  @description : 'Priority of the case. 1 is the highest priority, 4 is the lowest priority'
  @assert.range : true
  @mandatory : true
  priority : String enum {
    _1 = '1';
    _2 = '2';
    _3 = '3';
    _4 = '4';
  };
  @description : 'Component CSN of the case'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'XX-SER-ITSM-TEST'
  @mandatory : true
  component : String;
  @description : 'Customer Number'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0001105772'
  @mandatory : true
  customerNumber : String;
  @description : 'Installation Number'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0020601305'
  @mandatory : true
  installationNumber : String;
  @description : 'System number, "systemId" is an accepted alias for systemNbr'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '000000000311834471'
  @mandatory : true
  systemNbr : String;
  @description : 'Subject of the case'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the subject of the case'
  @mandatory : true
  subject : String;
  @description : 'Description of the case'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the description of the case'
  @mandatory : true
  description : String;
  @description : 'S-User of the customer contact'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  customer : String;
  @description : 'S-User of the reporter'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  @mandatory : true
  reporter : String;
  @description : 'Business impact statement'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'this is the business impact'
  businessImpact : String;
  @description : 'Severity of the business impact. 1 = Critically affected, 2 = Seriously affected, 3 = Moderately affected'
  @assert.range : true
  businessImpactSeverity : String enum {
    _1 = '1';
    _2 = '2';
    _3 = '3';
  };
  @description : 'Flag indicating whether a workaround exists. Y = Yes, N = No'
  @assert.range : true
  workaround : String enum {
    Y;
    N;
  };
  @description : 'Phrase describing how effective the workaround is. Mandatory when workaround is Y'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'The workaround resolves the issue temporarily'
  workaroundEffectiveness : String;
  @description : 'Upcoming deadline date that could be impacted by this issue (YYYY-MM-DD)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2024-12-31'
  impactedDeadline : String;
  @description : 'Number of users impacted by this issue (positive integer)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '100'
  impactedUsersNumber : String;
  @description : 'Language of the case. The supported values are: EN (English), DE (German), JP (Japanese), and ZH (Chinese)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'EN'
  language : String;
  @description : 'List of attachments'
  attachments : many ITSM_types.CaseAttachmentPost;
  @description : 'List of contact list'
  contactList : many ITSM_types.Contact;
  @description : 'First comment to include with created case'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is a comment.'
  comment : String;
};

@description : 'Response payload for a case creation and update requests'
type ITSM_types.CaseIdResponse {
  @description : 'ID of the created or updated case'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '002028376700055632532023'
  id : String;
};

@description : 'Request body for updating an existing support case.'
type ITSM_types.CasePatch {
  @description : 'Priority of the case. 1 is the highest priority, 4 is the lowest priority'
  @assert.range : true
  priority : String enum {
    _1 = '1';
    _2 = '2';
    _3 = '3';
    _4 = '4';
  };
  status : ITSM_types.CaseStatusCode;
  @description : 'Business impact statement'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'this is the business impact'
  businessImpact : String;
  @description : 'Severity of the business impact. 1 = Critically affected, 2 = Seriously affected, 3 = Moderately affected'
  @assert.range : true
  businessImpactSeverity : String enum {
    _1 = '1';
    _2 = '2';
    _3 = '3';
  };
  @description : 'Flag indicating whether a workaround exists. Y = Yes, N = No'
  @assert.range : true
  workaround : String enum {
    Y;
    N;
  };
  @description : 'Phrase describing how effective the workaround is. Mandatory when workaround is Y'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'The workaround resolves the issue temporarily'
  workaroundEffectiveness : String;
  @description : 'Upcoming deadline date that could be impacted by this issue (YYYY-MM-DD)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2024-12-31'
  impactedDeadline : String;
  @description : 'Number of users impacted by this issue (positive integer)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '100'
  impactedUsersNumber : String;
  @description : 'Comment or note to add to the case.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'this is the comment'
  comments : String;
  @description : 'List of attachments'
  attachments : many ITSM_types.CaseAttachmentPost;
  @description : 'List of contact list'
  contactList : many ITSM_types.Contact;
};

@description : 'A case identifier returned in list results.'
type ITSM_types.CaseId {
  @description : 'Internal correlation ID of the case in the SAP Support Backbone.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '002028376700055632532023'
  correlationId : String;
};

@description : 'Contact information. None of the fields are mandatory on their own. However, at least one form of contact information is required.'
type ITSM_types.Contact {
  @description : 'Type of contact, freely defined by the customer. The reserved type REPORTER identifies the primary person to contact for questions; REPORTER contacts can only be added during case creation.'
  contactType : String;
  @description : 'S-User ID of the contact.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  userId : String;
  @description : 'Name of the contact'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'John Doe'
  name : String;
  @description : 'E-mail of the contact'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'John.Goe@sap.com'
  email : String;
  @description : 'Telephone of the contact'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '+49 6227 7 12345'
  telephone : String;
  @description : 'Mobile number of the contact'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '+49 6227 7 12345'
  mobile : String;
  @description : 'Timezone of the S-User'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Europe/Berlin'
  timeZone : String;
};

@description : 'Contact and profile information for a customer S-User.'
type ITSM_types.CustomerSet {
  @description : 'S-User of the customer.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  suser : String;
  @description : 'First name of the customer.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'John'
  firstname : String;
  @description : 'Last name of the customer.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Doe'
  surname : String;
  @description : 'Email of the customer.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Johm.Doe@sap.com'
  email : String;
  @description : 'Phone number of the customer.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '+49 6227 7 12345'
  phone : String;
  @description : 'Secondary phone number of the customer.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '+49 6227 7 12345'
  phone2 : String;
  @description : 'Language of the customer.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'EN'
  language : String;
  @description : 'Timezone of the customer.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Europe/Berlin'
  timeZone : String;
  @description : 'Country of the customer.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Germany'
  country : String;
};

@description : 'Metadata for a file attached to a support case.'
type ITSM_types.Attachment {
  @description : 'Id of the attachment'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '002028376700055632532023'
  idAttachment : String;
  @description : 'Name of the file'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'file.pdf'
  fileName : String;
  @description : 'Data protection classification of the attachment (read-only).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'NONE'
  dataProtectionRestriction : String;
  @description : 'Description of the attachment'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'this is the description of the attachment'
  description : String;
  @description : 'URL of the file in the Document Service'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'https://document.support.sap.com/customerincident/V9ESgyGRjhjmHTiIK-pLEHo0mGBDzDe8VErXbXoqHFauWs'
  url : String;
  @description : 'File extension or MIME type of the attachment (e.g., pdf, png).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'pdf'
  contentType : String;
  @description : 'Last update timestamp (UTC)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  updatedAt : String;
  @description : 'Creation timestamp (UTC)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  createdAt : String;
  @description : 'S-User of the creator of the file'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  createdBy : String;
};

@description : 'An audit log entry recording a change made to a support case.'
type ITSM_types.Activity {
  @description : 'New value after the change (e.g., new status or priority).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Customer Action'
  value : String;
  @description : 'Value before the change.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Sent to SAP'
  previousValue : String;
  @description : 'Field that was changed.'
  @assert.range : true
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Status'
  type : String enum {
    Component;
    Status;
    Priority;
    Description;
    Info_for_SAP = 'Info for SAP';
    Info_for_Customer = 'Info for Customer';
    Business_Impact = 'Business Impact';
  };
  @description : 'Timestamp when the change was recorded (UTC).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  createdAt : String;
  @description : 'S-User who made the change.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  createdBy : String;
};

@description : 'A comment on a support case, either directed at SAP or the customer.'
type ITSM_types.Comment {
  @description : 'Content of the comment'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'this is the content of the comment'
  value : String;
  @description : 'Type of comment'
  @assert.range : true
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Info for Customer'
  type : String enum {
    Info_for_Customer = 'Info for Customer';
    Info_for_SAP = 'Info for SAP';
  };
  @description : 'Creation date of the comment'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  createdAt : String;
  @description : 'S-User of the comment author'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  createdBy : String;
};

@description : 'An action plan entry associated with a support case.'
type ITSM_types.ActionPlan {
  @description : 'Identifier of the action plan.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'ACP21023456'
  id : String;
  @description : 'S-User of the creator'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  openedBy : String;
  @description : 'Responsible Team'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S00000444499'
  responsible : String;
  @description : 'Description or notes for the action plan.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'this is the content of the actionPlan'
  comment : String;
  @description : 'Creation timestamp.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  createdAt : String;
  @description : 'Last update timestamp.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  updatedAt : String;
  @description : 'Closed date'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  closedAt : String;
  @description : 'State of the action plan'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Open'
  status : String;
};

@description : 'A SAP Knowledge Base Article (KBA) linked to a support case.'
type ITSM_types.Article {
  @description : 'Short description of the article'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the short description of the article'
  description : String;
  @description : 'Creation date'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2021-06-01 12:00:00'
  createdAt : String;
  @description : 'KBA number (e.g., KB0640079).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'KB0640079'
  kbaNumber : String;
};

type ITSM_types.Error {
  @mandatory : true
  error : {
    @mandatory : true
    code : String;
    @mandatory : true
    message : String;
    target : String;
    details : many {
      @mandatory : true
      code : String;
      @mandatory : true
      message : String;
      target : String;
    };
  };
};

@description : ```
Supported case status values:

- Sent to SAP — A case was sent to SAP. You can add further information
and re-send it to SAP.  

- In processing by SAP — The case is being processed by an SAP support
agent. 

- Customer Action — The SAP agent is waiting for additional information
from the customer. 

- Confirmed — The case was closed by the customer and can no longer be
reopened.

- Pending Release - Waiting a correction from SAP

- SAP Proposed Solution – SAP has proposed a solution to this case.

- Sent to SAP Partner – The ticket has been forwarded to a SAP Partner.

- Partner-Customer Action – The SAP agent is waiting for additional
information from the Partner.

- Confirmed Automatically – The case was closed automatically. The case
was not updated and sent back to SAP by customer or partner for further
processing, it has been automatically closed after 21 calendar days.
```
@assert.range : true
@Core.Example.$Type : 'Core.PrimitiveExampleValue'
@Core.Example.Value : 'Sent to SAP'
type ITSM_types.CaseStatus : String enum {
  Sent_to_SAP = 'Sent to SAP';
  In_Processing_by_SAP = 'In Processing by SAP';
  Customer_Action = 'Customer Action';
  Confirmed;
  Pending_Release = 'Pending Release';
  SAP_Proposed_Solution = 'SAP Proposed Solution';
  Sent_to_SAP_Partner = 'Sent to SAP Partner';
  Partner_Customer_Action = 'Partner-Customer Action';
  Confirmed_Automatically = 'Confirmed Automatically';
};

@description : 'Status string of the case, Default value is ''UPDATE''. To close a case, the status must be set to ''CONFIRMED''.'
@assert.range : true
@Core.Example.$Type : 'Core.PrimitiveExampleValue'
@Core.Example.Value : 'UPDATE'
type ITSM_types.CaseStatusCode : String enum {
  UPDATE;
  Confirmed;
};

type ITSM_types.CaseAttachmentPost {
  @description : 'Name of the file'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'file.pdf'
  @mandatory : true
  fileName : String;
  @description : 'Short description of the attachment'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the description of the attachment'
  @mandatory : true
  description : String;
  @description : 'Data protection classification for the attachment. NONE = no restriction, EUDP = EU data protection, CNDP = China data protection.'
  @assert.range : true
  dataProcessingAndSecurity : String enum {
    NONE;
    EUDP;
    CNDP;
  } default 'NONE';
  @description : 'Document Service URL of the pre-uploaded attachment.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'https://document.support.sap.com/customerincident/V9ESgyGRjhjmHTiIK-pLEHo0mGBDzDe8VErXbXoqHFauWs'
  @mandatory : true
  url : String;
};

@description : 'Binary file content for upload. Supported formats: 016, ABP, ADDONS, AML, ASC, ATL, AVI, BIAR, BMP, BPMN, BZ2, CAB, CALLSTACK, CAR, CIF, CSV, DKP, DMP, DOC, DOCM, DOCX, DWI, ELG, EML, ERR, ERROR, ERRORINFO, EVTX, GIF, GLF, GZ, GZIP, HAR, HTM, HTML, HWL, INF, INI, IQMSQ, JAR, JPEG, JPG, JSON, LCMBIAR, LOG, MDB, MDL, MMAP, MONITOR, MOV, MP4, MSG, ODP, ODS, ODT, OUT, PAR, PCAPNG, PCX, PDF, PL, PML, PNG, PPS, PPSX, PPT, PPTX, PROPERTIES, PRT, RAR, REP, RH, RPM, RPT, RTF, SAR, SAV, SAZ, SCA, SCK, SCM, SGX, SH, SIM, SNP, SQF, SQLITE, TAR, TGZ, TIF, TRACE, TRC, TSK, TXT, TZ, UDC, UDT, UNV, URL, VDS, VER, WAR, WAV, WID, WMV, WRI, XLB, XLC, XLF, XLS, XLSM, XLSX, XLT, XML, XSL, Z, Z01, Z02, Z03, Z04, Z05, ZIP.'
type ITSM_types.BinaryAttachment : String;

@description : 'Response returned after a successful attachment upload.'
type ITSM_types.AttachmentResponse {
  @description : 'URL of the uploaded attachment'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'https://document.support.sap.com/customerincident/V9ESgyGRjhjmHTiIK-pLEHo0mGBDzDe8VErXbXoqHFauWs'
  url : String;
};

@description : 'Request body for adding a comment to a support case.'
type ITSM_types.CommentPost {
  @description : 'Comment to be submitted'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'this is the comment'
  @mandatory : true
  text : String;
};

@description : 'A CSN component (product area) in the SAP component hierarchy.'
type ITSM_types.Component {
  @description : 'ID of the CSN component'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'XX-SER-ITSM-TEST'
  componentId : String;
  @description : 'Key of the CSN component'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0000061861'
  componentKey : String;
  @description : 'Description of the CSN component'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the description of the component'
  description : String;
  @description : 'key of the Parent component of the CSN component, if there is one'
  productId : String;
  @description : 'Description of the product the component belongs to'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the description of the product'
  productDescription : String;
  @description : 'Description of the product area the component belongs to'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the description of the product area'
  productAreaDescription : String;
  @description : 'Key of the parent component of the CSN component, if there is one'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0000030257'
  parentKey : String;
  @description : 'Last update date of the CSN component'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '2025-06-01'
  updateDate : String;
  @description : 'Indicates if the component is obsolete'
  obsolete : Boolean;
  @description : 'Indicates if the component is selectable for case creation'
  selectable : Boolean;
};

type ITSM_types.SolutionPost {
  @description : 'Reporter of the issue (S-User)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S0018132425'
  reporter : String;
  @description : 'Subject of the issue (short description)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the subject of the issue'
  subject : String;
  @description : 'Description of the issue (long description)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the description of the issue'
  @mandatory : true
  description : String;
  @description : 'Steps to reproduce the issue.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '1. Open transaction X. 2. Enter value Y. 3. Click Submit.'
  stepstoReproduce : String;
  @description : 'Application component of the incident.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'XX-SER-ITSM-TEST'
  component : String;
  @description : 'CRM customer number.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0001105772'
  customerNumber : String;
  @description : 'System ID.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '000000000311834471'
  systemId : String;
  @description : 'Customer installation number.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0020601305'
  installationNumber : String;
  @description : ```
  Time filter to provide recommendations based on similar issues created within the specified time frame (e.g., 'last 30 days'). 
  
  Accepted syntax: last X days/weeks/months/years (e.g., 'last 30 days', 'last 4 weeks', 'last 6 months', 'last 1 years')
  
  ```
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'last 30 days'
  timeFrame : String;
};

type ITSM_types.CategoryPost {
  @description : 'Reporter of the issue (S-User)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S0018132425'
  reporter : String;
  @description : 'Subject of the issue (short description)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the subject of the issue'
  subject : String;
  @description : 'Description of the issue (long description)'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the description of the issue'
  @mandatory : true
  description : String;
  @description : 'Steps to reproduce the issue.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '1. Open transaction X. 2. Enter value Y. 3. Click Submit.'
  stepstoReproduce : String;
  @description : 'Application component of the incident.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'XX-SER-ITSM-TEST'
  component : String;
  @description : 'CRM customer number.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0001105772'
  customerNumber : String;
  @description : 'System ID.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '000000000311834471'
  systemId : String;
  @description : 'Customer installation number.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0020601305'
  installationNumber : String;
};

@description : 'An AI-suggested CSN component category, ranked by relevance.'
type ITSM_types.Categories {
  @description : 'Code name of the CSN component'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'XX-SER-ITSM-TEST'
  componentName : String;
  @description : 'Path of the CSN component'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'XX > SER > ITSM'
  componentPath : String;
  @description : 'Product of the CSN component, if there is one'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the description of the component'
  componentText : String;
  @description : 'Rank of the category'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 1
  rank : Integer;
};

@description : 'A knowledge resource recommendation returned by the AI self-service engine.'
type ITSM_types.Recommendations {
  @description : 'ID of the KBA'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '00202837'
  id : String;
  @description : 'Title of the KBA.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the title of the kba'
  title : String;
  @description : 'Summary of the KBA.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the summary of the kba'
  summary : String;
  @description : 'Type of the KBA.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'KBA'
  type : String;
  @description : 'Component of the KBA.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'XX-SER-ITSM-TEST'
  component : String;
  @description : 'Product the KBA belongs to.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'SAP SOLUTION MANAGER'
  product : String;
  @description : 'Category of the KBA.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'How To'
  category : String;
  @description : 'Indicates whether the KBA is specifically recommended for this case.'
  recommended : Boolean;
  @description : 'Human-readable age of the KBA since its release.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Released 1 month ago'
  age : String;
  @description : 'URL to the KBA in SAP for Me.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'https://me.sap.com/notes/00202837'
  url : String;
  @description : 'Relevance rank of the KBA (1 = most relevant).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 1
  rank : Integer;
};

@title : 'LandscapeObjects'
type ITSM_types.LandscapeObject {
  @description : 'S-User Number of owner'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S0018132425'
  uName : String;
  @description : 'Customer number of the owner of the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0001105772'
  customerNbr : String;
  @description : 'Product number of the solution installed on the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '01200615320800000636'
  productNbr : String;
  @description : 'Product name of the solution installed on the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'SAP SOLUTION MANAGER'
  productTxt : String;
  @description : 'Product version number of the solution installed on the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '01200314690900002795'
  productVersionNbr : String;
  @description : 'Product version name of the solution installed on the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'SAP SOLUTION MANAGER 7.1'
  productVersionTxt : String;
  @description : 'Installation number of the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0020601305'
  installationNbr : String;
  @description : 'System number of the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '000000000312373836'
  systemNbr : String;
  @description : 'Short system ID (SID).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S4H'
  systemId : String;
  @description : 'Long system identifier.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the long system ID of the system'
  longSystemId : String;
  @description : 'System name of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is my System Name'
  systemName : String;
  @description : 'System type of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'DEVELOP'
  systemType : String;
  @description : 'Customer name of the owner of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is my customer name'
  customerName : String;
  @description : 'Installation name of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is my installation name of the system'
  installationName : String;
  @description : 'System type priority of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '3'
  systemTypePriority : String;
  @description : 'Support partner number.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0001234567'
  supportPartnerNbr : String;
  @description : 'Support partner name.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is my support partner name'
  supportPartnerName : String;
  @description : 'Support partner URL.'
  supportPartnerURL : String;
  @description : 'Indicates whether the system is a cloud solution. X = cloud, empty = on-premise.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'X'
  isCloud : String;
  @description : 'Cloud access URL of the system.'
  cloudURL : String;
  @description : 'Leading product installed on the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'SAP Solution Manager 7.1'
  leadingProduct : String;
};

@title : 'LandscapeObjectsExtended'
type ITSM_types.LandscapeObjectExtended {
  @description : 'S-Users that have access to the landscape object'
  susers : {
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 10
    count : Integer;
    @Core.Example.$Type : 'Core.PrimitiveExampleValue'
    @Core.Example.Value : 100
    totalCount : Integer;
    results : many ITSM.anonymous.type7;
  };
  @description : 'Product number of the solution installed on the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '01200615320800000636'
  productNbr : String;
  @description : 'Product name of the solution installed on the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'SAP SOLUTION MANAGER'
  productTxt : String;
  @description : 'Product version number of the solution installed on the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '01200314690900002795'
  productVersionNbr : String;
  @description : 'Product version name of the solution installed on the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'SAP SOLUTION MANAGER 7.1'
  productVersionTxt : String;
  @description : 'Installation number of the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0020601305'
  installationNbr : String;
  @description : 'System number of the system'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '000000000312373836'
  systemNbr : String;
  @description : 'Short system ID (SID).'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'S4H'
  systemId : String;
  @description : 'Long system identifier.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is the long system ID of the system'
  longSystemId : String;
  @description : 'System name of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is my System Name'
  systemName : String;
  @description : 'System type of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'DEVELOP'
  systemType : String;
  @description : 'Customer name of the owner of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is my customer name'
  customerName : String;
  @description : 'Installation name of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is my installation name of the system'
  installationName : String;
  @description : 'System type priority of the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '3'
  systemTypePriority : String;
  @description : 'Support partner number.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0001234567'
  supportPartnerNbr : String;
  @description : 'Support partner name.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'This is my support partner name'
  supportPartnerName : String;
  @description : 'Support partner URL.'
  supportPartnerURL : String;
  @description : 'Indicates whether the system is a cloud solution. X = cloud, empty = on-premise.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Is the system a cloud solution'
  isCloud : String;
  @description : 'Cloud access URL of the system.'
  cloudURL : String;
  @description : 'Leading product installed on the system.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'SAP Solution Manager 7.1'
  leadingProduct : String;
};

@description : 'Relationship between a CCC member and a supported customer.'
type ITSM_types.SupportedCustomerRelationship {
  @description : 'Machine-readable relationship type. SUPPORTED and SERVICED entries are only returned if the reporter holds the correct authorization; otherwise they are silently excluded.'
  @assert.range : true
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'SUPPORTED'
  type : String enum {
    SUPPORTED;
    CCC;
    SERVICED;
    DEFAULT;
  };
  @description : 'Human-readable label for the relationship type.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'Supported Customer'
  description : String;
};

@description : 'A customer that a CCC group member is responsible for supporting.'
type ITSM_types.SupportedCustomer {
  @description : 'Child customer ID.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0000012345'
  customerNumber : String;
  @description : 'Name of the customer, extracted from the SAP backend composite value.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : 'ABC-EDFG GmbH & Co'
  customerName : String;
  @description : 'Parent customer ID in the VAR hierarchy. Null indicates a top-level customer with no parent.'
  @Core.Example.$Type : 'Core.PrimitiveExampleValue'
  @Core.Example.Value : '0001234567'
  parentCustomerNumber : String;
  relationship : ITSM_types.SupportedCustomerRelationship;
};

