@isTest
private class HierarchyControllerTest {
    
    @TestSetup
    static void setupTestData() {
        // Create a parent Account
        Account parentAccount = new Account(Name = 'Parent',Description='Parent Account', BillingCountry ='UK');
        insert parentAccount;
        // Create child Accounts
        List<Account> childAccounts = new List<Account>{
            new Account(Name = 'Child1',Description='Child Account', ParentId=parentAccount.Id, BillingCountry ='UK'),
            new Account(Name = 'Child2',Description='Child Account', ParentId=parentAccount.Id, BillingCountry ='UK')
        };
        insert childAccounts;
        // Create grandchild Accounts
        Account grandChildAccount = new Account(Name = 'Grandchild',Description='Grandchild Account', ParentId=childAccounts[0].Id, BillingCountry ='UK');    
        insert grandChildAccount;

        //Create solo account
        Account soloAccount = new Account(Name = 'Solo',Description='Solo Account', BillingCountry ='UK');
        insert soloAccount;
    }
    
    // Helper method to get stored test records
    private static List<Account> getSoloAccounts() {
        return [SELECT Id, Description, ParentId FROM Account WHERE Name = 'Solo'];
    }

    // Helper method to get stored test records
    private static List<Account> getParentAccounts() {
        return [SELECT Id, Description, ParentId FROM Account WHERE Name = 'Parent'];
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
        System.Assert.isTrue(result.totalRecordCount == 4);

        Test.stopTest();
    }
    
    // Test the scenario with no children
    @isTest static void testHierarchyWithNoChildren() {
        List<Account> currentAccounts = getSoloAccounts();
        Account currentAccount = currentAccounts[0];
        
        HierarchyController.QueryWrapper queryParams = new HierarchyController.QueryWrapper();
        queryParams.sObjectApiName = 'Account';
        queryParams.recordId = currentAccount.Id;
        queryParams.parentFieldApiName = 'ParentId';
        queryParams.fieldsToQuery = 'Id,ParentId,Name,BillingCountry,Owner.Name,NumberOfEmployees';
        
        Test.startTest();
        HierarchyController.HierarchyWrapper result = HierarchyController.getAllRecordHierarchy(queryParams);
        system.debug('results'+ result);
        //There should be no hierarchy records as there is only a standalone account
        System.Assert.isTrue(result.totalRecordCount == 1);
        Test.stopTest();
    }
    
    @isTest static void testGetCustomMetadata(){
        Test.startTest();
        sObject mdta = HierarchyController.getCustomMetadata('Data_table_Tree_Grid_Configuration__mdt');
        Test.stopTest();
    }
    
}