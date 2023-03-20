import { Dialog } from './Dialog.js'
import { TaskFormDialog } from './TaskFormDialog.js'
import { ConfirmDialog } from './ConfirmDialog.js'
import { Dropdown } from '../Dropdown.js'
import { html } from '../../js/arrow.js'
import { generateId } from '../../js/helpers.js'

export class TaskDialog extends Dialog {
    id = generateId()
    selectId = generateId()

    constructor(task) {
        super()

        this.task = task
        this.taskFormDialog = new TaskFormDialog({ task })
        this.confirmDialog = new ConfirmDialog({ task })

        this.dropdown = new Dropdown([
            {
                text: 'Edit Task',
                action: () => this.taskFormDialog.show()
            },
            {
                text: 'Delete Task',
                style: 'danger',
                action: () => this.confirmDialog.show()
            }
        ])
    }

    get selectEl() {
        return window[this.selectId]
    }

    show() {
        const { task } = this
        const id = this.columnId = task.column.id

        this.columnsOptions = task.column.board.getColumns().map(column => (
            {
                id: column.id,
                name: column.getName(),
                current: column.id == id
            }
        ))

        super.show()
    }

    onClose() {
        super.onClose()
        
        const selectId = this.selectEl.value

        if (this.columnId != selectId) {
            const { task } = this

            task.column.board.moveTask({ task, to: selectId })
        }
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

        ${() => this.taskFormDialog.render()}
        ${() => this.confirmDialog.render()}
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
            <select name="column" id="${this.selectId}">
                ${this.renderColumnsOptions()}
            </select>
        </div>
        
        ` : ''
    }

    renderColumnsOptions() {
        return this.columnsOptions.map(({ id, name, current }) => {
            return html`
            
            <option value="${id}" selected="${() => current}">
                ${name}
            </option>

            `
        })
    }
}