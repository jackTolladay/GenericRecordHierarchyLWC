@isTest
private class HierarchyControllerTest {
    
    @TestSetup
    static void setupTestData() {
        // Create a parent Account
        Account parentAccount = new Account(Name = 'Parent',Description='Parent Work Order', BillingCountry ='UK');
        insert parentAccount;
        // Create child Accounts
        List<Account> childAccounts = new List<Account>{
            new Account(Name = 'Child1',Description='Child Work Order 1', ParentId=parentAccount.Id, BillingCountry ='UK'),
            new Account(Name = 'Child2',Description='Child Work Order 2', ParentId=parentAccount.Id, BillingCountry ='UK')
        };
        insert childAccounts;
    }
    
    // Helper method to get stored test records
    private static List<Account> getChildAccounts() {
        return [SELECT Id, Description, ParentId FROM Account WHERE ParentId != ''];
    }

    // Helper method to get stored test records
    private static List<Account> getParentAccounts() {
        return [SELECT Id, Description, ParentId FROM Account WHERE ParentId = ''];
    }
    
    // Test hierarchical data retrieval
    @isTest static void testHierarchyDataRetrieval() {
        List<Account> parentAccounts = getParentAccounts();
        HierarchyController.QueryWrapper queryParams = new HierarchyController.QueryWrapper();
        queryParams.sObjectApiName = 'Account';
        queryParams.recordId = parentAccounts[0].Id;
        queryParams.parentFieldApiName = 'ParentId';
        queryParams.fieldsToQuery = 'Id,ParentId,Name,BillingCountry,Owner.Name,NumberOfEmployees';
        
        Test.startTest();
        HierarchyController.HierarchyWrapper result = HierarchyController.getAllRecordHierarchy(queryParams);
        Test.stopTest();
    }
    
    // Test the scenario with no children
    @isTest static void testHierarchyWithNoChildren() {
        List<Account> parentAccounts = getParentAccounts();
        Account testParent = parentAccounts[0];
        
        HierarchyController.QueryWrapper queryParams = new HierarchyController.QueryWrapper();
        queryParams.sObjectApiName = 'Account';
        queryParams.recordId = testParent.Id; // Use the parent ID
        queryParams.parentFieldApiName = 'ParentId';
        queryParams.fieldsToQuery = 'Id,ParentId,Name,BillingCountry,Owner.Name,NumberOfEmployees';
        
        Test.startTest();
        HierarchyController.HierarchyWrapper result = HierarchyController.getAllRecordHierarchy(queryParams);
        system.debug('results'+ result);
        System.Assert.isTrue(result.parentMap.keySet().size() == 0);

        // Assert the parent record is returned
        System.Assert.isTrue(result.superParentList.size() == 1);
        System.Assert.isTrue(result.totalRecordCount == 1);
        Test.stopTest();
    }
    
    @isTest static void testGetCustomMetadata(){
        Test.startTest();
        sObject mdta = HierarchyController.getCustomMetadata('Data_table_Tree_Grid_Configuration__mdt');
        Test.stopTest();
    }
    
}