import { Task } from './Task.js'
import { reactive, html } from '../js/arrow.js'

export class Column {
    tasks = {}
    keysToSave = ['name', 'tasksIds']

    data = reactive({
        tasksIds: []
    })

    constructor({ board, id, name, wasSaved }) {
        this.board = board
        this.id = id
        this.storageKey = `column_${id}`

        if (wasSaved) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        if (wasSaved) return

        data.name = name
    }

    getName() {
        return this.data.name
    }

    setName(name) {
        this.data.name = name
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { name, tasksIds } = JSON.parse(savedData)
        
        for (const id of tasksIds) this.addTask({ id, wasSaved: true })
        
        this.data.name = name
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => [key, data[key]])
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    addTask({ id, title, description, subtasksTitles, wasSaved }) {
        this.tasks[id] = new Task({ column: this, id, title, description, subtasksTitles, wasSaved })
        
        this.data.tasksIds.push(id)
    }

    removeTask({ id, removeSave }) {
        const { tasksIds } = this.data
        
        const { tasks } = this

        if (removeSave) tasks[id].removeSave()

        delete tasks[id]

        tasksIds.splice(tasksIds.indexOf(id), 1)
    }

    insertTask(task) {
        const id = task.id

        task.column = this
        task.data.columnId = this.id
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
        
        <h3 class="column__name | title title--s">
            ${() => `${data.name} (${data.tasksIds.length})`}
        </h3>

        <ul class="tasks">${() => this.renderTasks()}</ul>
        
        `
    }

    renderTasks() {
        const { tasks } = this

        return this.data.tasksIds.map(id => {
            return html`
            
            ${tasks[id].render()}

            `
        })
    }
}