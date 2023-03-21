import { Dialog } from './Dialog.js'
import { reactive, html } from '../../js/arrow.js'
import { generateId } from '../../js/generateId.js'

export class TaskFormDialog extends Dialog {
    constructor({ board, task }) {
        super()
        
        this.board = board
        this.task = task
        this.isEdit = board == null

        if (this.isEdit) {
            this.title = 'Edit Task'
            this.titlePlaceholder = this.descriptionPlaceholder = ''
            this.btnText = 'Save Changes'
        }
        else {
            this.title = 'Add New Task'
            this.taskTitle = this.description = ''
            this.titlePlaceholder = 'e.g. Take coffee break'
            this.descriptionPlaceholder = 'e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little.'
            this.subtasksPlaceholders = ['e.g. Make coffee', 'e.g. Drink coffee & smile']
            this.btnText = 'Create New Task'
        }
    }

    show() {
        let subtasks

        if (this.isEdit) {
            const { task } = this

            this.taskTitle = task.getTitle()
            this.description = task.getDescription()
            
            this.buildColumnsOptions(task.column.board)

            subtasks = this.task.getSubtasks().map(subtask => (
                this.newSubtask({
                    id: subtask.id,
                    title: subtask.getTitle()
                })
            ))
        }
        else {
            this.buildColumnsOptions(this.board)

            subtasks = Array.from({ length: 2 }, () => this.newSubtask())
        }
        
        this.subtasks = reactive(subtasks)

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

        const subtasks = this.subtasks.map((subtask, i) => {
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
        const { subtasks } = this

        return html`
        
        <form method="dialog" @submit="${(e) => this.onSubmit(e)}">
            <h2 class="">
                ${this.title}
            </h2>

            <label for="title">Title</label>
            <input type="text" name="title" required
                value="${this.taskTitle}"
                placeholder="${this.titlePlaceholder}">

            <label for="description">Description</label>
            <textarea name="description"
                placeholder="${this.descriptionPlaceholder}"
                >${this.description}</textarea>

            <fieldset>
                <label for="subtask">Subtasks</label>
                ${() => this.renderSubtasks()}

                <button type="button"
                    @click="${() => subtasks.push(this.newSubtask())}">
                    
                    Add New Subtask
                </button>
            </fieldset>

            ${this.renderColumnSelect()}
            
            <button type="submit">
                ${this.btnText}
            </button>
        </form>

        `
    }

    renderSubtasks() {
        const { subtasks } = this
        const placeholders = !this.isEdit && this.subtasksPlaceholders

        return subtasks.map(({ title, id }, i) => {
            return html`
        
            <li>
                <input type="text" name="subtask" value="${title}" required
                    placeholder="${() => placeholders?.[i] ?? false}">
                
                <button type="button" @click="${() => subtasks.splice(i, 1)}">
                    <span class="visually-hidden">Remove Subtask</span>
                </button>
            </li>

            `.key(id)
        })
    }

    renderColumnSelect() {
        if (this.columnsOptions.length < 2) return ''

        return html`
        
        <label for="column">Column</label>
        <select name="column">
            ${this.renderColumnsOptions()}
        </select>
        
        `
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