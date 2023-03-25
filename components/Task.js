import { Subtask } from './Subtask.js'
import { TaskDialog } from './dialogs/TaskDialog.js'
import { reactive, html } from '../js/arrow.js'

export class Task {
    subtasks = {}
    keysToSave = ['title', 'description', 'subtasksIds']

    taskDialog = new TaskDialog(this)

    data = reactive({
        subtasksIds: [],
        description: '',
        dragging: false
    })

    constructor({ id, title, description, isNew, column }) {
        this.column = column
        this.id = id
        this.storageKey = `task_${id}`

        if (!isNew) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        if (!isNew) return

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
        
        for (const id of subtasksIds) this.addSubtask({ id })

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

    addSubtask({ id, title, isNew }) {
        const subtask = new Subtask({ id, title, isNew, task: this })
        
        this.subtasks[id] = subtask
        this.data.subtasksIds.push(id)
    }

    removeSubtask(id) {
        const { subtasks } = this
        const { subtasksIds } = this.data

        subtasksIds.splice(subtasksIds.indexOf(id), 1)
        subtasks[id].removeSave()
        delete subtasks[id]
    }

    moveSubtask({ subtask, to }) {
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
            if (isNew) {
                this.addSubtask({ id, title, isNew })
                this.moveSubtask({ subtask: subtasks[id], to: i })
                
                return
            }
            
            const subtask = subtasks[id]
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

    onDragStart() {
        this.data.dragging = true
        this.column.draggedTaskId = this.id
    }

    onDragOver(e) {
        e.preventDefault()

        if (this.column.draggedTaskId == this.id) return
        
        this.column.dropTask(this.id)
    }

    onDragEnd() {
        this.data.dragging = false
    }

    onDrop() {
        this.data.dragging = false
    }

    render() {
        const { data } = this
        const { subtasksIds } = data

        return html`
        
<<<<<<< HEAD
        <li>
            <div class="task" data-dragging="${() => data.dragging}"
                draggable="true"
                @dragstart="${e => this.onDragStart(e)}"
                @dragover="${e => this.onDragOver(e)}"
                @dragend="${e => this.onDragEnd(e)}"
                @drop="${e => this.onDrop(e)}"
                @click="${() => this.taskDialog.show(this)}"
                @mousedown="${e => e.stopPropagation()}">
=======
        <li class="task" data-dragging="${() => data.dragging}"
            draggable="true"
            @dragstart="${e => this.onDragStart(e)}"
            @dragover="${e => this.onDragOver(e)}"
            @dragend="${e => this.onDragEnd(e)}"
            @drop="${e => this.onDrop(e)}"
            @click="${() => this.taskDialog.show(this)}"
            @mousedown="${e => e.stopPropagation()}">
>>>>>>> bc50c7cd89f9dd9644fd8c457df96cf75095c3e0
            
                <h4 class="task__title | title title--m">
                    ${() => data.title}
                </h4>
                <p class="task__completed | text text--m">
                    ${() => `${this.getNCompleted()} of ${subtasksIds.length} subtasks`}
                </p>
            </div>

            <div @mousedown="${e => e.stopPropagation()}">
                ${() => this.taskDialog.render()}
            </div>
        </li>

        `
    }
}