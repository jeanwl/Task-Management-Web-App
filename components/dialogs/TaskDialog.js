import { Dialog } from './Dialog.js'
import { reactive, html } from '/js/arrow.js'

export class TaskDialog extends Dialog {
    id = 'taskDialog'
    columnsOptions = []

    data = reactive({
        subtasks: []
    })

    show(task) {
        this.task = task

        this.buildColumnsOptions(task.column.board)
        
        super.show()
    }

    buildColumnsOptions(board) {
        const columnsOptions = board.getColumns().map(column => (
            {name: column.getName(), id: column.id}
        ))

        this.columnsOptions = reactive(columnsOptions)
    }

    onColumnChange(e) {

    }

    renderContent() {
        const { data, task } = this
        const { board } = task.column

        const dropdownMenu = () => data.menuIsOpen ? html`
        
        <menu class="dropdown-menu"
            aria-labelledby="dropdownTaskDialogMenuBtn">
            
            <li>
                <button @click="${() => board.taskFormDialog.showEdit(task)}">
                    Edit Task
                </button>
                <button @click="${() => task.column.removeTask(task.id)}">
                    Delete Task
                </button>
            </li>
        </menu>

        ` : ''

        const nSubtasks = task.getSubtasks().length
        const subtaskTitle = nSubtasks ? html`
        
        <h5>Subtasks (${() => task.getNCompleted()} of ${nSubtasks})</h5>
        
        ` : ''

        return html`
        
        <form method="dialog">
            <div class="task-dialog__top">
                <h4>${task.getTitle()}</h4>
                
                <button class="dropdown-btn" id="dropdownTaskDialogMenuBtn"
                    aria-haspopup="true" type="button"
                    aria-expanded="${() => data.menuIsOpen}"
                    @click="${() => data.menuIsOpen = !data.menuIsOpen}">
                    
                    <span class="visually-hidden">Show menu</span>
                </button>
                
                ${dropdownMenu}
            </div>

            <p>${task.getDescription()}</p>

            ${subtaskTitle}
            ${this.renderSubtasks()}

            ${this.renderColumnSelect()}
        </form>
        `
    }

    renderSubtasks() {
        return this.task.getSubtasks().map(subtask => {
            return html`
        
            <div class="subtask">
                ${() => subtask.render()}
            </div>

            `
        })
    }

    renderColumnSelect() {
        if (this.columnsOptions.length < 2) return ''

        return html`
        
        <label for="column">Column</label>
        <select name="column" @change="${(e) => this.onColumnChange(e)}">
            ${() => this.renderColumnsOptions()}
        </select>
        
        `
    }

    renderColumnsOptions() {
        return this.columnsOptions.map(({ id, name }) => {
            return html`
            
            <option value="${id}">${name}</option>

            `
        })
    }
}