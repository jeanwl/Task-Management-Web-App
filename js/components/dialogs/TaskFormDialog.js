import { Dialog } from './Dialog.js'
import { reactive, html } from '../../arrow.js'
import { generateId } from '../../generateId.js'

export class TaskFormDialog extends Dialog {
    data = reactive({
        subtasks: []
    })
    
    constructor({ board, task }) {
        super()
        
        this.board = board
        this.task = task
        this.isEdit = board == null

        if (this.isEdit) {
            this.title = 'Edit Task'
            this.btnText = 'Save Changes'
        }
        else {
            this.title = 'Add New Task'
            this.titlePlaceholder = 'e.g. Take coffee break'
            this.descriptionPlaceholder = 'e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little.'
            this.subtasksPlaceholders = ['e.g. Make coffee', 'e.g. Drink coffee & smile']
            this.btnText = 'Create New Task'
        }
    }

    show() {
        const { subtasks } = this.data

        if (this.isEdit) {
            const { task } = this

            this.taskTitle = task.getTitle()
            this.description = task.getDescription()
            
            this.buildColumnsOptions(task.column.board)

            subtasks.push(...this.task.getSubtasks().map(subtask => (
                this.newSubtask({
                    id: subtask.id,
                    title: subtask.getTitle()
                })
            )))
        }
        else {
            this.buildColumnsOptions(this.board)

            subtasks.push(...Array.from({ length: 2 }, () => this.newSubtask()))
        }

        super.show()
    }

    buildColumnsOptions(board) {
        this.columnsOptions = board.getColumns().map(column => (
            {name: column.getName(), id: column.id}
        ))
    }

    newSubtask({ id, title } = {}) {
        return {
            id: id ?? generateId(),
            title: title ?? '',
            isNew: id == null
        }
    }

    moveSubtask(from, to) {

    }

    onSubmit(e) {
        const formData = new FormData(e.target)
        const title = formData.get('title')
        const description = formData.get('description')
        const columnId = formData.get('column')
        const subtasksTitles = formData.getAll('subtask')

        const subtasks = this.data.subtasks.map((subtask, i) => {
            subtask.title = subtasksTitles[i]

            return subtask
        })

        if (this.isEdit) {
            const { task } = this

            task.edit({ title, description, subtasks })

            if (columnId == task.column.id) return

            task.taskDialog.selectEl.value = columnId

            return
        }

        this.board.columns[columnId].addTask({
            id: generateId(),
            title,
            description,
            subtasks,
            isNew: true
        })
    }

    renderContent() {
        const { subtasks } = this.data

        return html`
        
        <form method="dialog" @submit="${(e) => this.onSubmit(e)}">
            <h2 class="title title--l">
                ${this.title}
            </h2>

            <div class="input-group">
                <label for="title" class="text text--m">
                    Title
                </label>
                <input type="text" name="title" required maxlength="100"
                    value="${this.taskTitle}"
                    placeholder="${this.titlePlaceholder}"
                    @input="${e => e.target.classList.add('modified')}">

                <span class="invalid-msg | text text--l">Can't be empty</span>
            </div>

            <div class="input-group">
                <label for="description" class="text text--m">
                    Description
                </label>
                <textarea name="description"
                    placeholder="${this.descriptionPlaceholder}"
                    >${this.description}</textarea>
            </div>

            <fieldset>
                <label for="subtask" class="text text--m">
                    Subtasks
                </label>
                
                ${() => this.renderSubtasks()}

                <button type="button" class="btn btn--small btn--secondary"
                    @click="${() => subtasks.push(this.newSubtask())}">
                    
                    + Add New Subtask
                </button>
            </fieldset>

            <div class="dialog__select">
                <label for="column" class="text text--m">
                    Column
                </label>
                <select name="column">
                    ${this.renderColumnsOptions()}
                </select>
                <svg class="chevron-icon"><use href="#chevron-icon"></svg>
            </div>
            
            <button type="submit" class="btn btn--small btn--primary">
                ${this.btnText}
            </button>
        </form>

        `
    }

    renderSubtasks() {
        const { subtasks } = this.data
        const placeholders = !this.isEdit && this.subtasksPlaceholders

        return subtasks.map(({ title, id }, i) => {
            return html`
        
            <li class="dialog__item dialog__item--subtask">
                <input type="text" name="subtask" value="${title}" required
                    maxlength="50"
                    placeholder="${() => placeholders?.[i] ?? false}"
                    @input="${e => e.target.classList.add('modified')}">

                <span class="invalid-msg | text text--l">Can't be empty</span>

                <div class="dialog__drag">
                    <svg class="draggable-icon"><use href="#draggable-icon"></svg>
                </div>
                
                <button type="button" class="item__remove-btn"
                    @click="${() => subtasks.splice(i, 1)}">
                    
                    <span class="visually-hidden">Remove Subtask</span>
                    <svg class="cross-icon"><use href="#cross-icon"></svg>
                </button>
            </li>

            `.key(id)
        })
    }

    renderColumnsOptions() {
        const columnId = this.isEdit && this.task.column.id

        return this.columnsOptions.map(({ id, name }) => {
            return html`
            
            <option value="${id}" selected="${() => id == columnId}">
                ${name}
            </option>

            `
        })
    }
}