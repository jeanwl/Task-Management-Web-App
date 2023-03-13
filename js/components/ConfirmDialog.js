import { Dialog } from './Dialog.js'
import { html } from '../lib/arrow.js'

export class ConfirmDialog extends Dialog {
    id = 'confirmDialog'

    showBoard(board) {
        this.board = board
        this.isTask = false

        this.show()
    }

    showTask(task) {
        this.task = task
        this.isTask = true

        this.show()
    }

    getText() {
        return `Are you sure you want to delete the ${this.isTask
            ? `‘${this.task.getTitle()}’ task and its subtasks? This action`
            : `‘${this.board.getName()}’ board? This action will remove all columns and tasks and`
        } cannot be reversed.`
    }

    confirm() {
        const { isTask, task, board } = this

        if (isTask) this.task.column.removeTask(task.id)
        else board.app.removeBoard(board.id)

        this.close()
    }

    renderContent() {
        return html`
        
        <h2>Delete this ${this.isTask ? 'Task' : 'Board'}?</h2>

        <p>${this.getText()}</p>

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