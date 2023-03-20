import { Dialog } from './Dialog.js'
import { html } from '../../js/arrow.js'
import { generateId } from '../../js/helpers.js'

export class ConfirmDialog extends Dialog {
    id = generateId()

    constructor({ board, task }) {
        super()
        
        this.board = board
        this.task = task
        this.isTask = board == null

        this.title = this.isTask ? 'Delete this Task?' : 'Delete this Board?'
    }

    show() {
        this.text = this.isTask
            ? `Are you sure you want to delete the ‘${this.task.getTitle()}’ task and its subtasks? This action cannot be reversed.`
            : `Are you sure you want to delete the ‘${this.board.getName()}’ board? This action will remove all columns and tasks and cannot be reversed.`
        
        super.show()
    }

    confirm() {
        const { task, board } = this

        if (this.isTask) {
            task.column.removeTask({ id: task.id, removeSave: true })
        }
        else board.app.removeBoard(board.id)
    }

    renderContent() {
        return html`
        
        <h2>${this.title}</h2>

        <p>${this.text}</p>

        <menu>
            <li>
                <button @click="${() => this.confirm()}">
                    Delete
                </button>
            </li>
            <li>
                <button @click="${() => this.close()}">
                    Cancel
                </button>
            </li>
        </menu>
        
        `
    }
}