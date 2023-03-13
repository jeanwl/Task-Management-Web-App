import { reactive, html } from '../lib/arrow.js'

export class Subtask {
    data = reactive({
        title: '',
        isCompleted: false
    })
    keysToSave = ['title', 'isCompleted']

    constructor({ task, id, title, isCompleted, wasSaved }) {
        this.task = task
        this.id = id
        this.storageKey = `subtask_${id}`

        if (wasSaved) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        if (wasSaved) return

        data.title = title
        data.isCompleted = isCompleted
    }

    getTitle() {
        return this.data.title
    }

    getIsCompleted() {
        return this.data.isCompleted
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { title, isCompleted } = JSON.parse(savedData)

        const { data } = this
        
        if (title != null) data.title = title
        if (isCompleted != null) data.isCompleted = isCompleted
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => (
            [key, data[key]]
        ))
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
        const { data } = this

        return html`
        


        `
    }
}