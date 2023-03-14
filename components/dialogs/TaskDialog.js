import { Dialog } from './Dialog.js'
import { reactive, html } from '/js/arrow.js'

export class TaskDialog extends Dialog {
    id = 'taskDialog'
    columnsOptions = []

    data = reactive({
        subtasks: [],
        menuIsOpen: false
    })

    show(task) {
        this.task = task
        
        super.show()
    }

    buildColumnsOptions() {
        const { board, columnsOptions } = this

        board.getColumns().forEach(column => {
            columnsOptions
        })
    }

    onColumnChange(e) {

    }

    renderContent() {
        const { data, task } = this
        const { board } = task.column
        const subtasks = task.getSubtasks()
        const nSubtasks = subtasks.length

        const subtaskTitle = nSubtasks ? html`
        
        <h5>Subtasks (${() => task.getNCompleted()} of ${nSubtasks})</h5>
        
        ` : ''

        return html`
        
        <div class="task-dialog__top">
            <h4>${task.getTitle()}</h4>
            
            <button class="dropdown-btn" id="dropdownTaskDialogMenuBtn"
                aria-haspopup="true"
                aria-expanded="${() => data.menuIsOpen}"
                @click="${() => data.menuIsOpen = !data.menuIsOpen}">
                
                <span class="visually-hidden">Show menu</span>
            </button>
            <menu class="dropdown-menu"
                aria-labelledby="dropdownTaskDialogMenuBtn">
                
                <li>
                    <button @click="${() => this.showForm({ task, board })}">
                        Edit Task
                    </button>
                    <button @click="${() => task.column.removeTask(task.id)}">
                        Delete Task
                    </button>
                </li>
            </menu>
        </div>

        <p>${task.getDescription()}</p>

        ${subtaskTitle}
        ${this.renderInfosSubtasks()}
        `
    }

    renderSubtasks() {
        return this.task.getSubtasks().map(subtask => {
            return html`
        
            <div class="subtask">
                <input type="checkbox" id="${subtask.id}"
                    checked="${() => subtask.getIsCompleted()}"
                    @change="${() => subtask.toggle()}">
                
                <label for="${subtask.id}">${subtask.getTitle()}</label>
            </div>

            `
        })
    }

    renderColumnSelect() {
        if (this.data.columnsOptions.length < 2) return ''

        return html`
        
        <label for="column">Column</label>
        <select name="column">
            ${() => this.renderColumnsOptions()}
        </select>
        
        `
    }

    renderColumnsOptions() {
        const { data } = this

        return data.columnsOptions.map(({ key, text }) => {
            return html`
            
            <option value="${key}" selected=${key == data.currentColumnKey}>
                ${text}"
            </option>

            `
        })
    }
}