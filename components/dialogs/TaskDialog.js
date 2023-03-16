import { Dialog } from './Dialog.js'
import { Dropdown } from '../Dropdown.js'
import { html } from '../../js/arrow.js'

export class TaskDialog extends Dialog {
    id = 'taskDialog'
    selectId = 'taskDialogSelect'
    columnsOptions = []
    columnIdChangeHandler = id => this.onColumnIdChange(id)

    show(task) {
        this.task = task

        this.buildColumnsOptions(task.column.board)

        const app = task.column.board.app

        this.dropdown = new Dropdown([
            {
                text: 'Edit Task',
                action: () => app.taskFormDialog.showEdit(task)
            },
            {
                text: 'Delete Task',
                style: 'danger',
                action: () => app.confirmDialog.showTask(task)
            }
        ])
        
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
        this.dropdown.dispose()
        this.task.data.$off('columnId', this.columnIdChangeHandler)

        super.onClose()
    }

    renderContent() {
        return html`
        
        <h2 class="task-dialog__title | title title--l">
            ${() => this.task.getTitle()}
        </h2>

        ${() => this.renderDescription()}

        ${() => this.renderSubtasks()}

        ${this.renderColumnSelect()}

        ${this.dropdown.render()}
        `
    }

    renderDescription() {
        const description = this.task.getDescription()

        return description ? html`
        
        <p class="task-description | text text--l">
            ${description}
        </p>

        ` : ''
    }

    renderSubtasks() {
        const { task } = this
        const nSubtasks = task.getSubtasks().length

        if (!nSubtasks) return ''

        return html`
        
        <div class="task-subtasks">
            <h3 class="subtasks__title | text text--m">
                ${() => `Subtasks (${task.getNCompleted()} of ${nSubtasks})`}
            </h3>
            
            <ul class="subtasks__list">
                ${() => task.getSubtasks().map(subtask => subtask.render())}
            </ul>
        </div>
        
        `
    }

    renderColumnSelect() {
        return this.columnsOptions.length > 1 ? html`
        
        <div class="task-column">
            <label for="column">Column</label>
            <select name="column" id="${this.selectId}"
                @change="${(e) => this.onColumnChange(e)}">
                
                ${this.renderColumnsOptions()}
            </select>
        </div>
        
        ` : ''
    }

    renderColumnsOptions() {
        return this.columnsOptions.map(({ id, name }) => {
            return html`
            
            <option value="${id}"
                selected="${() => id == this.task.column.id}">
                
                ${name}
            </option>

            `
        })
    }
}