import { Task } from './Task.js'
import { reactive, html } from '../js/arrow.js'

export class Column {
    tasks = {}
    keysToSave = ['name', 'tasksIds']

    data = reactive({
        tasksIds: []
    })

    constructor({ id, name, isNew, board }) {
        this.board = board
        this.id = id
        this.storageKey = `column_${id}`

        if (!isNew) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        if (isNew) data.name = name
    }

    getName() {
        return this.data.name
    }

    setName(name) {
        this.data.name = name
    }

    getTasks() {
        const { tasks } = this
        
        return this.data.tasksIds.map(id => tasks[id])
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { name, tasksIds } = JSON.parse(savedData)
        
        for (const id of tasksIds) this.addTask({ id })
        
        this.data.name = name
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

    removeSave() {
        for (const task of Object.values(this.tasks)) {
            task.removeSave()
        }

        localStorage.removeItem(this.storageKey)
    }

    render() {
        const { data } = this

        return html`
        
        <li class="column">
            <h3 class="column__name | title title--s"
                @mousedown="${e => e.stopPropagation()}">
                
                ${() => `${data.name} (${data.tasksIds.length})`}
            </h3>

            <ul class="tasks">
                ${() => this.getTasks().map(task => task.render())}
            </ul>
        </li>
        
        `
    }
}