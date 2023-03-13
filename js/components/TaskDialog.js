import { reactive, html } from '../lib/arrow.js'

export class TaskDialog {
    id = 'taskDialog'

    data = reactive({
        title: '',
        description: '',
        subtasks: [],
        showInfo: false,
        isEdit: false
    })

    constructor(app) {
        this.app = app
    }

    get el() {
        return this._el ?? (this._el = window[this.id])
    }

    showInfo(task) {
        const { data } = this



        data.showInfo = true
        data.task = task
        
        setTimeout(() => this.el.showModal())
    }

    showForm(task) {
        const { data } = this
        const subtasks = data.subtasks

        subtasks.splice(0, subtasks.length)
        
        if (task) {

            data.task = task
        }
        else {

            data.task = null
        }

        setTimeout(() => this.el.showModal())
    }

    render() {
        const { data } = this
        const { task } = data

        return html`
        
        <dialog id="${this.id}" @click="${() => this.el.close()}">
            <h4>Ok</h4>
        </dialog>
        
        `
    }

    renderInfos() {
        return html`
        
        <h4>${() => task.getTitle()}</h4>
        
        `
    }
}