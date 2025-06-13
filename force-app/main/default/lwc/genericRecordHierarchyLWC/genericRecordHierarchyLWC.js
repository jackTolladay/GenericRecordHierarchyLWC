/**
 * @description Generic Record Hierarchy LWC component that fetches record hierarchy based on configuration 
 *              from custom metadata and displays it in a tree grid. Supports dynamic configurations and 
 *              refresh functionality.
 * @date 2024-10-10
 * @version 1.0
 * @author Gnanasai Pedagopu
 */

import { LightningElement, wire, api, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAllRecordHierarchy from '@salesforce/apex/HierarchyController.getAllRecordHierarchy';
import getCustomMetadata from '@salesforce/apex/HierarchyController.getCustomMetadata';

export default class GenericRecordHierarchyLWC extends LightningElement {
    // Current record Id from which to build hierarchy
    @api recordId;
    // This is the field api name of field whose value will be put in parent field of child
    @api primaryKey = 'Id';
    // Name of the template for custom metadata retrieval (public property set on component instantiation)
    @api templateName;

    // Parameters for the tree grid
    @track title;                   // Title to display in Generic header component
    @track columns;               // Columns configuration for tree grid
    @track headerIconName;              // Icon name for the grid header
    @track recordIconName;              // Icon name beside current record in the grid
    @track rootFieldApiName;    // API name of the field used as root reference
    @track parentFieldApiName;    // API name of the field used as parent reference
    @track objectApiName;         // API Name of the sObject for hierarchy
    @track fieldsToQuery;         // Fields to be queried for the hierarchy
    @track defaultSortByField;    // Default field to sort by
    @track defaultSortDirection;  // Default sort direction

    // Custom metadata template data
    mdt;
    // Data structure for tree grid display
    hierarchyMap;
    // Total record count of nodes in the tree
    totalRecordCount;
    // Control flag for displaying spinner during data operations
    showSpinner = true;
    // Base URL for the org
    baseUrl;

    // Cached result from apex data retrieval
    _wiredData;

    // Trims template name to avoid unwanted spaces
    get getTemplateName() {
        return this.templateName?.trim();
    }

    // Gets custom metadata to setup the grid dynamically
    @wire(getCustomMetadata, { templateName: '$getTemplateName' })
    customMetadataInfo({ error, data }) {
        if (data) {
            this.parseMetadata(data);
        } else if (error) {
            console.error('Error retrieving custom metadata info:', error);
        }
    }

    // Parse metadata and setup component configurations
    parseMetadata(data) {
        this.mdt = data;
        this.headerIconName = this.mdt.Header_icon_name__c;
        this.title = this.mdt.MasterLabel;
        this.columns = JSON.parse(this.mdt.Column_structure__c);
        this.objectApiName = this.mdt.Object_api_name__c;
        this.fieldsToQuery = this.mdt.Fields_to_query__c;
        this.recordIconName = this.mdt.Record_icon_name__c;
        this.rootFieldApiName = this.mdt.Root_field_api_name__c;
        this.parentFieldApiName = this.mdt.Parent_field_api_name__c;
        this.defaultSortByField = this.mdt.Default_sort_by_field__c;
        this.defaultSortDirection = this.mdt.Default_sort_direction__c;
    }

    get passQueryParams() {
        let queryParams = {};
        queryParams.sObjectApiName = this.objectApiName,
            queryParams.recordId = this.recordId,
            queryParams.rootFieldApiName = this.rootFieldApiName,
            queryParams.parentFieldApiName = this.parentFieldApiName,
            queryParams.fieldsToQuery = this.fieldsToQuery
        return queryParams;
    }

    // Fetches record hierarchy data and processes it.
    @wire(getAllRecordHierarchy, {
        queryParams: "$passQueryParams"
    })
    wiredResult(result) {
        this._wiredData = result;
        if (result.data) {
            this.parseResult(JSON.parse(JSON.stringify(result.data)));
            console.log(JSON.stringify(this.hierarchyMap));
            
            //Handle data sort after re-fetching the hierarchy
            this.sortData(this.hierarchyMap);

            // Expands all nodes in the tree grid after a delay
            setTimeout(() => this.template.querySelector('lightning-tree-grid')?.expandAll(), 1500);
        } else if (result.data) {
            console.error('Error retrieving hierarchy data:', JSON.stringify(result.data));
        }
        this.showSpinner = false;
    }
    
    // Sort data according to the default sort settings
    sortData(data) {
        data.forEach(item => {
            if (item._children && item._children.length > 0) {
                item._children.sort((a, b) => this.sortField(a,b,this.defaultSortByField)); 
                this.sortData(item._children);  // Recursive sorting inside children
            }
        });
    
        return data.sort((a, b) => this.sortField(a,b,this.defaultSortByField)); 
    }

    // Sort field according to the default sort settings
    sortField(a,b,field) {
        if(this.defaultSortDirection === 'Asc') {
            return a[field].localeCompare(b[field]);
        }
        return b[field].localeCompare(a[field]);
    }

    // Parses hierarchy data for tree grid display
    parseResult(data) {
        this.hierarchyMap = [];
        this.totalRecordCount = data?.totalRecordCount || 0;
        this.baseUrl = data?.baseUrl;
        data?.superParentList?.forEach(parent => {
            let enrichedRecord = this.enrichNode(parent);
            this.hierarchyMap.push(this.findChildrenNode(enrichedRecord, data));
        });
    }

    // Enriches nodes with custom scripting
    enrichNode(fetchedRecord) {
        if (this.mdt && this.mdt.Record_structure__c) {
            let valueFunction = new Function('parentThis', 'fetchedRecord', 'baseUrl', this.mdt.Record_structure__c);
            let preparedRecord = valueFunction(this, fetchedRecord, this.baseUrl);
            return Object.assign(fetchedRecord, preparedRecord);
        }
    }

    // Recursively finds and enriches child nodes
    findChildrenNode(element, data) {
        if (data.parentMap) {
            for (let key in data.parentMap) {
                if (key === element[this.primaryKey]) {
                    element["_children"] = data.parentMap[key];
                    element["_children"].forEach(child => {
                        let enrichedRecord = this.enrichNode(child);
                        this.findChildrenNode(enrichedRecord, data);
                    });
                }
            }
        }
        return element;
    }

    // Handles refresh action from button
    handleRefresh(event) {
        this.showSpinner = event.detail.refresh;
        refreshApex(this._wiredData).finally(() => this.showSpinner = false);
    }

    // Determines the icon to display beside the record in the grid
    getDynamicIcon(currentRecordId) {
        return currentRecordId === this.recordId ? this.recordIconName : '';
    }
}