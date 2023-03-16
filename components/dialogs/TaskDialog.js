import { Dialog } from './Dialog.js'
import { reactive, html } from '../../js/arrow.js'

export class TaskDialog extends Dialog {
    id = 'taskDialog'
    selectId = 'taskDialogSelect'
    columnsOptions = []
    columnIdChangeHandler = this.onColumnIdChange.bind(this)

    data = reactive({
        subtasks: []
    })

    show(task) {
        this.task = task

        this.buildColumnsOptions(task.column.board)
        
        super.show()

        this.task.data.$on('columnId', this.columnIdChangeHandler)
    }

    buildColumnsOptions(board) {
        const columnsOptions = board.getColumns().map(column => (
            { name: column.getName(), id: column.id }
        ))

        this.columnsOptions = columnsOptions
    }

    onColumnChange(e) {
        const columnId = e.target.value

        this.task.column.board.moveTask({ task: this.task, to: columnId})
    }

    onColumnIdChange(id) {
        window[this.selectId].value = id
    }

    onClose() {
        this.task.data.$off('columnId', this.columnIdChangeHandler)

        super.onClose()
    }

    renderContent() {
        const { data, task } = this
        const { app } = task.column.board

        data.menuIsOpen = false

        const dropdownMenu = () => data.menuIsOpen ? html`
        
        <menu class="dropdown-menu"
            aria-labelledby="dropdownTaskDialogMenuBtn">
            
            <li>
                <button @click="${() => app.taskFormDialog.showEdit(task)}">
                    Edit Task
                </button>
                <button @click="${() => app.confirmDialog.showTask(task)}">
                    Delete Task
                </button>
            </li>
        </menu>

        ` : ''

        return html`
        
        <div class="task-dialog__top">
            <h4>${() => task.getTitle()}</h4>
            
            <button class="dropdown-toggle" id="dropdownTaskDialogMenuBtn"
                aria-haspopup="true"
                aria-expanded="${() => data.menuIsOpen}"
                @click="${() => data.menuIsOpen = !data.menuIsOpen}">
                
                <span class="visually-hidden">Show menu</span>
            </button>
            
            ${dropdownMenu}
        </div>

        <p>${() => task.getDescription()}</p>

        ${() => this.renderSubtasks()}

        ${this.renderColumnSelect()}
        `
    }

    renderSubtasks() {
        const { task } = this
        const nSubtasks = task.getSubtasks().length

        if (!nSubtasks) return ''

        return html`
        
        <h5>${() => `Subtasks (${task.getNCompleted()} of ${nSubtasks})`}</h5>
        
        ${() => this.renderSubtasksList()}
        
        `
    }

    renderSubtasksList() {
        return this.task.getSubtasks().map(subtask => {
            return html`
        
            <div class="subtask">
                ${subtask.render()}
            </div>

            `
        })
    }

    renderColumnSelect() {
        if (this.columnsOptions.length < 2) return ''

        return html`
        
        <label for="column">Column</label>
        <select name="column" id="${this.selectId}"
            @change="${(e) => this.onColumnChange(e)}">
            
            ${this.renderColumnsOptions()}
        </select>
        
        `
    }

    renderColumnsOptions() {
        return this.columnsOptions.map(({ id, name }) => {
            return html`
            
            <option value="${id}" selected="${() => id == this.task.column.id}">
                ${name}
            </option>

            `
        })
    }
}