import { LightningElement, track, api } from 'lwc';
import getTasks from '@salesforce/apex/UniversalTaskController.getTasks';
import saveTask from '@salesforce/apex/UniversalTaskController.saveTask';

export default class UniversalTaskTimeline extends LightningElement {
    @track tasks = [];
    @api recordId;
    @api objectApiName;

    connectedCallback() {
        this.loadTasks();
    }

    async loadTasks() {
        try {
            const data = await getTasks({ recordId: this.recordId });
            this.tasks = data.map(task => ({
                id: task.Id,
                date: task.ActivityDate,
                description: task.Subject,
                isEditing: false
            })).sort((a, b) => new Date(a.date) - new Date(b.date));
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    handleEdit(event) {
        const index = event.target.dataset.index;
        this.tasks[index].isEditing = true;
    }

    async handleSave(event) {
        const index = event.target.dataset.index;
        const task = this.tasks[index];

        const taskRecord = {
            Id: task.id,
            Subject: task.description,
            ActivityDate: task.date
        };

        if (this.objectApiName === 'Lead' || this.objectApiName === 'Contact') {
            taskRecord.WhoId = this.recordId;
        } else {
            taskRecord.WhatId = this.recordId;
        }

        try {
            const result = await saveTask({ taskRecord });
            this.tasks[index].id = result.Id;
            this.tasks[index].isEditing = false;
            this.tasks = [...this.tasks].sort((a, b) => new Date(a.date) - new Date(b.date));
        } catch (error) {
            console.error('Error saving task:', error);
        }
    }

    handleDateChange(event) {
        const index = event.target.dataset.index;
        this.tasks[index].date = event.target.value;
    }

    handleDescriptionChange(event) {
        const index = event.target.dataset.index;
        this.tasks[index].description = event.target.value;
    }

    addTask() {
        const today = new Date().toISOString().split('T')[0];
        this.tasks = [...this.tasks, {
            id: null,
            date: today,
            description: '',
            isEditing: true
        }].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
}
