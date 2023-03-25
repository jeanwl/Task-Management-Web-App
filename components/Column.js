import { Task } from './Task.js'
import { ColumnFormDialog } from './dialogs/ColumnFormDialog.js'
import { reactive, html } from '../js/arrow.js'

export class Column {
    tasks = {}
    keysToSave = ['name', 'color', 'tasksIds']
    
    columnFormDialog = new ColumnFormDialog({ column: this })

    data = reactive({
        tasksIds: []
    })

    constructor({ id, name, color, isNew, board }) {
        this.board = board
        this.id = id
        this.storageKey = `column_${id}`

        if (!isNew) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        if (!isNew) return
        
        data.name = name
        data.color = color
    }

    getName() {
        return this.data.name
    }

    setName(name) {
        this.data.name = name
    }

    getColor() {
        return this.data.color
    }

    setColor(color) {
        this.data.color = color
    }

    getTasks() {
        const { tasks } = this
        
        return this.data.tasksIds.map(id => tasks[id])
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { name, color, tasksIds } = JSON.parse(savedData)
        const { data } = this
        
        for (const id of tasksIds) this.addTask({ id })
        
        data.name = name
        data.color = color
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => [key, data[key]])
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    addTask({ id, title, description, subtasks, isNew }) {
        const task = new Task({ id, title, description, isNew, column: this })

        if (subtasks) {
            for (const subtask of subtasks) {
                task.addSubtask(subtask)
            }
        }

        this.tasks[id] = task
        this.data.tasksIds.push(id)
    }

    removeTask({ id, removeSave }) {
        const { tasks } = this
        const { tasksIds } = this.data

        tasksIds.splice(tasksIds.indexOf(id), 1)
        
        if (removeSave) tasks[id].removeSave()
        
        delete tasks[id]
    }

    insertTask(task) {
        const id = task.id

        task.column = this
        this.tasks[id] = task
        this.data.tasksIds.push(id)
    }

    moveTask({ task, to }) {
        // not used yet?
        const { tasksIds } = this.data
        const id = task.id

        tasksIds.splice(tasksIds.indexOf(id), 1)
        tasksIds.splice(to, 0, id)
    }

    dropTask(toId) {
        const { tasksIds } = this.data
        const id = this.draggedTaskId
        const indexFrom = tasksIds.indexOf(id)
        const indexTo = tasksIds.indexOf(toId)

        tasksIds.splice(indexFrom, 1)
        tasksIds.splice(indexTo, 0, id)
    }

    removeSave() {
        for (const task of Object.values(this.tasks)) {
            task.removeSave()
        }

        localStorage.removeItem(this.storageKey)
    }

    edit({ name, color }) {
        const { data } = this

        data.name = name
        data.color = color
    }

    render() {
        const { data } = this

        return html`
        
        <li class="column">
            <h3 class="column__name | title title--s"
                @click="${() => this.columnFormDialog.show()}"
                @mousedown="${e => e.stopPropagation()}">
                
                <span class="column__circle" aria-hidden="true"
                    style="background-color: ${data.color}"></span>
                
                ${() => `${data.name} (${data.tasksIds.length})`}
            </h3>

            <ul class="tasks">
                ${() => this.getTasks().map(task => task.render())}
            </ul>

            <div @click="${e => e.stopPropagation()}"
                @mousedown="${e => e.stopPropagation()}">
                ${() => this.columnFormDialog.render()}
            </div>
        </li>
        
        `
    }
}