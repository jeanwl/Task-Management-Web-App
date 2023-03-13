import { reactive, html } from '../lib/arrow.js'

export class ConfirmDialog {
    id = 'confirmDialog'
    
    data = reactive({})

    get el() {
        return this._el ?? (this._el = window[this.id])
    }

    showBoard(board) {
        this.board = board
        this.data.isTask = false
        
        setTimeout(() => this.el.showModal())
    }

    showTask(task) {
        this.task = task
        this.data.isTask = true
        
        setTimeout(() => this.el.showModal())
    }

    confirm() {
        const { data, task, board } = this
        const { isTask } = this.data

        if (isTask) task.column.removeTask(task.id)
        else board.app.removeBoard(board.id)

        data.isTask = null

        this.el.close()
    }

    render() {
        return html`
        
        <dialog id="${this.id}" @click="${() => this.el.close()}">
            <h2>Delete this ${() => this.data.isTask ? 'Task' : 'Board'}?</h2>

            ${() => this.renderText()}

            <menu>
                <li>
                    <button @click="${() => this.confirm()}">
                        Delete
                    </button>
                </li>
                <li>
                    <button @click="${() => this.el.close()}">
                        Cancel
                    </button>
                </li>
            </menu>
        </dialog>
        
        `
    }
        
    renderText() {
        const { data, task, board } = this
        const { isTask } = data

        if (isTask == null) return ''

        return isTask ? html`

        <p>Are you sure you want to delete the ‘${() => task.getTitle()}’ task and its subtasks? This action cannot be reversed.</p>

        ` : html`
        
        <p>Are you sure you want to delete the ‘${() => board.getName()}’ board? This action will remove all columns and tasks and cannot be reversed.</p>

        `
    }
}