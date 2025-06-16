# Hierarchy Tree Grid

Hierarchy Tree Grid is a dynamic and versatile tool to facilitate hierarchical views of records within Salesforce. With Hierarchy Tree Grid, you can customize the contents of the tree grid to visualize the hierarchy from a defined root record.

## Installation
<a href="https://githubsfdeploy.herokuapp.com?owner=Gnana-Sai-P&repo=GenericRecordHierarchyLWC">
  <img alt="Deploy to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>

## Key Features
Hierarchy Tree Grid offers a range of customisation options to support your use case.

### Field Customization

Select which fields you would like to display in the Tree Grid.

### Header Customization

Choose which lightning design system icon you want to use

### Current Record Identifier

Leverage the lightning design system icons to show where in the hierachy you are

### Related List Mode

Choose to show the collected records in a related list rather than Tree Grid

## Setup

Install the package.

### Begin Configuration

First, create a row in the Data_table_Tree_Grid_Configuration__mdt custom metadata type.


#### Object and Field Names

![Screenshot 2025-06-13 at 10 52 05](https://github.com/user-attachments/assets/25f5951a-fed0-4982-b434-2020bd7e3167)

> [!NOTE]
> Ensure all the records in your hierarchy have their ultimate parent field populated with the Id for the appropriate record.

#### Fields to Query
Add the fields you would like to include in your Tree Grid.

![Screenshot 2025-06-13 at 10 54 03](https://github.com/user-attachments/assets/1b07f0a0-3aea-41aa-a6df-c8e769a48367)

#### Icons
Select the icon for the header and for the current record. Use the [Lightning Design System Icon Library](https://www.lightningdesignsystem.com/2e1ef8501/p/83309d-icons) to select the chosen icons.

> [!IMPORTANT]
> Be sure to include 'standard:' / 'utility:' / 'action:' / 'doctype:' before the icon name.

#### Column Structure
The Column structure field allows you to order the fields as you require and size them to fit in your chosen location.

```
[
{
"label": "Account Name",
"fieldName": "navigationUrl",
"initialWidth": 300,
"type": "url",
"wrapText": true,
"cellAttributes": {
"iconName": {
"fieldName": "dynamicIcon"
},
"iconPosition": "right",
"class": {
"fieldName": "dynamicClass"
}
},
"typeAttributes": {
"label": {
"fieldName": "Name"
},
"variant": "base"
}
},
{
"type": "text",
"fieldName": "BillingCountry",
"label": "Billing Country"
},
{
"type": "text",
"fieldName": "OwnerName",
"label": "Owner"
}
]
```
#### Record Structure

Define the record structure in the following example format:

```
let record = {};
record.navigationUrl = baseUrl + '/' + fetchedRecord.Id;
record.dynamicIcon = parentThis.getDynamicIcon(fetchedRecord.Id);
record.OwnerName = fetchedRecord.Owner?.Name;
return record;
```

> [!WARNING]
> Field Traversal: Cross-object traversal, such as Owner.Name, must be mapped in record structure, it is advisable to have checks before assigning, such as
>
>```
>record.OwnerName = fetchedRecord.Owner?.Name
>```


#### Place Component 

Place the component on the page layout / flow and add your Data table/Tree Grid Configuration Name for the chosen record you would like to use.


### Troubleshooting & Support

· Metadata Accuracy: Ensure correctness in 'Data Table/Tree Grid Configuration' metadata record setups.

· API Name Verification: Confirm the accuracy of field API names and their hierarchical alignments.

· Support Contacts: For discrepancies or additional assistance, reach out to your Salesforce administrator or development team.



Additional Permissions: The "Generic Record Hierarchy Access" permission set has been added, providing users with access to the "Data table/Tree Grid Configuration" custom metadata type and "HierarchyController" Apex class, enhancing security while enabling robust configuration capabilities and control over hierarchy management.


Product Impact: This release underscores our commitment to enhancing user interaction and visibility of complex business hierarchies in Salesforce environments, leveraging advanced, configurable LWC technology for seamless integration and usability.
