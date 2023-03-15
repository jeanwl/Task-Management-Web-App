import { Subtask } from './Subtask.js'
import { reactive, html } from '/js/arrow.js'
import { generateId } from '/js/helpers.js'

export class Task {
    subtasks = {}
    keysToSave = ['title', 'description', 'subtasksIds']

    data = reactive({
        subtasksIds: []
    })

    constructor({ column, id, title, description, subtasksTitles, wasSaved }) {
        this.column = column
        this.data.columnId = column.id
        this.data.$on('columnId', () => console.log('columnId changed'))
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

        for (const title of subtasksTitles) {
            this.addSubtask({ id: generateId(), title })
        }
    }

    getTitle() {
        return this.data.title
    }

    getDescription() {
        return this.data.description
    }

    getSubtasks() {
        const { subtasks } = this
        
        return this.data.subtasksIds.map(id => subtasks[id])
    }

    getNCompleted() {
        return this.getSubtasks().filter(subtask => (
            subtask.getIsCompleted()
        )).length
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { title, description, subtasksIds } = JSON.parse(savedData)
        
        for (const id of subtasksIds) this.addSubtask({ id, wasSaved: true })

        const { data } = this
        
        data.title = title
        data.description = description
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => [key, data[key]])
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    addSubtask({ id, title, wasSaved }) {
        this.subtasks[id] = new Subtask({ task: this, id, title, wasSaved })
        
        this.data.subtasksIds.push(id)
    }

    removeSubtask(id) {
        const { subtasksIds } = this.data

        subtasksIds.splice(subtasksIds.indexOf(id), 1)
        
        const { subtasks } = this

        subtasks[id].removeSave()

        delete subtasks[id]
    }

    moveSubtask({ subtask, to }) {
        return
        const { subtasksIds } = this.data
        const id = subtask.id

        subtasksIds.splice(subtasksIds.indexOf(id), 1)
        subtasksIds.splice(to, 0, id)
    }

    edit({ title, description, subtasks: editedSubtasks }) {
        const { subtasks, data } = this
        const { subtasksIds } = data

        data.title = title
        data.description = description
        
        editedSubtasks.forEach(({ id, title, isNew }, i) => {
            const subtask = subtasks[id]
            
            if (isNew) {
                this.addSubtask({ id, title })
                
                return this.moveSubtask({ subtask, to: i})
            }

            subtask.setTitle(title)

            if (subtasksIds.indexOf(id) == i) return

            this.moveSubtask({ subtask, to: i })
        })

        const nToRemove = subtasksIds.length - editedSubtasks.length

        if (nToRemove < 1) return

        const idsToRemove = subtasksIds.slice(nToRemove * -1)

        for (const id of idsToRemove) {
            this.removeSubtask(id)
        }
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
        
        <li class="task" @click="${() => this.taskDialog.show(this)}">
            <h4 class="task__title | title title--m">
                ${() => data.title}
            </h4>
            <p class="task__completed | text text--m">
                ${() => `${this.getNCompleted()} of ${subtasksIds.length} subtasks`}
            </p>
        </li>

        `
    }
}