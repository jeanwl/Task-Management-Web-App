import { Dialog } from './Dialog.js'
import { html } from '../../js/arrow.js'

export class ConfirmDialog extends Dialog {
    constructor({ board, column, task }) {
        super()
        
        this.board = board
        this.column = column
        this.task = task

        this.title =
            board && 'Delete this Board?' ||
            task && 'Delete this Task?' ||
            column && 'Delete this Column?'
    }

    show() {
        const { board, column, task } = this

        this.title =
            board && `Are you sure you want to delete the ‘${board.getName()}’ board? This action will remove all columns and tasks and cannot be reversed.` ||
            column && `Are you sure you want to delete the ‘${column.getName()}’ column and its tasks? This action cannot be reversed.` ||
            task && `Are you sure you want to delete the ‘${task.getTitle()}’ task and its subtasks? This action cannot be reversed.`
        
        super.show()
    }

    confirm() {
        const { board, column, task } = this

        if (board) board.app.removeBoard(board.id)
        else if (column) column.board.removeColumn(column.id)
        else if (task) task.column.removeTask({ id: task.id, removeSave: true })
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