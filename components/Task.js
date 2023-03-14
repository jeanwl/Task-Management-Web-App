import { Subtask } from './Subtask.js'
import { reactive, html } from '/js/arrow.js'

export class Task {
    subtasks = {}

    data = reactive({
        title: '',
        description: '',
        subtasksIds: []
    })
    keysToSave = ['title', 'description', 'subtasksIds']

    constructor({ column, id, title, description, wasSaved }) {
        this.column = column
        this.id = id
        this.storageKey = `task_${id}`
        this.taskDialog = column.board.app.taskDialog

        if (wasSaved) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        if (wasSaved) return

        data.title = title
        data.description = description
    }

    getTitle() {
        return this.data.title
    }

    getDescription() {
        return this.data.description
    }

    getSubtasks() {
        return Object.values(this.subtasks)
    }

    getNCompleted() {
        const { subtasks } = this

        return this.data.subtasksIds.filter((id) => (
            subtasks[id].getIsCompleted()
        )).length
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { title, description, subtasksIds } = JSON.parse(savedData)
        
        if (subtasksIds) {
            for (const id of subtasksIds) this.addSubtask({ id, wasSaved: true })
        }

        const { data } = this
        
        if (title != null) data.title = title
        if (description != null) data.description = description
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => (
            [key, data[key]]
        ))
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    addSubtask({ id, title, isCompleted, wasSaved }) {
        this.subtasks[id] = new Subtask({ task: this, id, title, isCompleted, wasSaved })
        
        this.data.subtasksIds.push(id)
    }

    removeSave() {
        for (const subtask of Object.values(this.subtasks)) {
            subtask.removeSave()
        }

        localStorage.removeItem(this.storageKey)
    }

    render() {
        const { data } = this
        const { subtasksIds } = data

        return html`
        
        <li class="task" @click="${() => this.taskDialog.showInfo(this)}">
            <h4>${() => data.title}</h4>
            <p>${() => this.getNCompleted()} of ${() => subtasksIds.length} subtasks</p>
        </li>

        `
    }
}