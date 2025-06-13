@isTest
private class HierarchyControllerTest {
    
    @TestSetup
    static void setupTestData() {
        // Create a parent Account
        Account parentAccount = new Account(Name = 'Parent',Description='Parent Work Order', BillingCountry ='UK');
        insert parentAccount;
        parentAccount.Ultimate_Parent__c = parentAccount.Id;
        Update parentAccount;
        // Create child Accounts
        List<Account> childAccounts = new List<Account>{
            new Account(Name = 'Child1',Description='Child Work Order 1', Ultimate_Parent__c=parentAccount.Id, BillingCountry ='UK'),
                new Account(Name = 'Child2',Description='Child Work Order 2', Ultimate_Parent__c=parentAccount.Id, BillingCountry ='UK')
                };
                    insert childAccounts;
    }
    
    // Helper method to get stored test records
    private static List<Account> getTestAccounts() {
        return [SELECT Id, Description, Ultimate_Parent__c FROM Account];
    }
    
    // Test hierarchical data retrieval
    @isTest static void testHierarchyDataRetrieval() {
        List<Account> testAccounts = getTestAccounts();
        HierarchyController.QueryWrapper queryParams = new HierarchyController.QueryWrapper();
        queryParams.sObjectApiName = 'Account';
        queryParams.recordId = testAccounts[0].Id; // Assuming the first one is the parent
        queryParams.rootFieldApiName = 'Ultimate_Parent__c';
        queryParams.parentFieldApiName = 'Ultimate_Parent__c';
        queryParams.fieldsToQuery = 'Id,RecordType.Name,Name,BillingCountry,Owner.Name,NumberOfEmployees';
        
        Test.startTest();
        HierarchyController.HierarchyWrapper result = HierarchyController.getAllRecordHierarchy(queryParams);
        Test.stopTest();
    }
    
    // Test the scenario with no children
    @isTest static void testHierarchyWithNoChildren() {
        List<Account> testAccounts = getTestAccounts();
        Account testParent = testAccounts[0]; // Assuming the first one is the parent
        
        HierarchyController.QueryWrapper queryParams = new HierarchyController.QueryWrapper();
        queryParams.sObjectApiName = 'Account';
        queryParams.recordId = testParent.Id; // Use the parent ID
        queryParams.rootFieldApiName = 'Ultimate_Parent__c';
        queryParams.parentFieldApiName = 'Ultimate_Parent__c';
        queryParams.fieldsToQuery = 'Id,RecordType.Name,Name,BillingCountry,Owner.Name,NumberOfEmployees';
        
        Test.startTest();
        HierarchyController.HierarchyWrapper result = HierarchyController.getAllRecordHierarchy(queryParams);
        Test.stopTest();
    }
    
    @isTest static void testGetCustomMetadata(){
        Test.startTest();
        sObject mdta = HierarchyController.getCustomMetadata('Data_table_Tree_Grid_Configuration__mdt');
        Test.stopTest();
    }
    
}