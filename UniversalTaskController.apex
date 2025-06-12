public with sharing class UniversalTaskController {

    @AuraEnabled(cacheable=true)
    public static List<Task> getTasks(Id recordId) {
        return [
            SELECT Id, Subject, ActivityDate, WhoId, WhatId
            FROM Task
            WHERE WhoId = :recordId OR WhatId = :recordId
            ORDER BY ActivityDate DESC
        ];
    }

    @AuraEnabled
    public static Task saveTask(Task taskRecord) {
        upsert taskRecord;
        return taskRecord;
    }
}
