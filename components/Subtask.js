import { reactive, html } from '../js/arrow.js'

export class Subtask {
    keysToSave = ['title', 'isCompleted']
    
    data = reactive({
        isCompleted: false
    })

    constructor({ id, title, isNew, task }) {
        this.task = task
        this.id = id
        this.storageKey = this.elId = `subtask_${id}`

        if (!isNew) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        if (isNew) data.title = title
    }

    getTitle() {
        return this.data.title
    }

    setTitle(title) {
        this.data.title = title
    }

    getIsCompleted() {
        return this.data.isCompleted
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { title, isCompleted } = JSON.parse(savedData)

        const { data } = this
        
        data.title = title
        data.isCompleted = isCompleted
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => [key, data[key]])
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    removeSave() {
        localStorage.removeItem(this.storageKey)
    }

    toggle() {
        const { data } = this

        data.isCompleted = !data.isCompleted
    }

    render() {
        const { data, elId } = this

        return html`
        
        <li class="subtask">
            <input type="checkbox" id="${elId}"
                checked="${() => data.isCompleted}"
                @change="${() => data.isCompleted = !data.isCompleted}">
            
            <label for="${elId}">${data.title}</label>
        </li>

        `
    }
}