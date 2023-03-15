import { Dialog } from './Dialog.js'
import { reactive, html } from '/js/arrow.js'
import { generateId } from '/js/helpers.js'

export class TaskFormDialog extends Dialog {
    id = 'taskFormDialog'
    subtasksPlaceholders = [
        'e.g. Make coffee',
        'e.g. Drink coffee & smile'
    ]
    descriptionPlaceholder = 'e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little.'

    showNew(board) {
        this.board = board
        this.isEdit = false

        this.buildColumnsOptions(board)

        this.subtasks = reactive(Array.from({ length: 2 }, _ => this.newSubtask()))

        this.show()
    }

    showEdit(task) {
        this.task = task
        this.isEdit = true

        const board = this.board = task.column.board

        this.buildColumnsOptions(board)

        const idsMap = this.idsMap = {}
        const subtasks = task.getSubtasks().map(subtask => {
            const newSubtask = this.newSubtask(subtask.getTitle())
            
            idsMap[newSubtask.id] = subtask.id

            return newSubtask
        })

        this.subtasks = reactive(subtasks)

        this.show()
    }

    buildColumnsOptions(board) {
        const columnsOptions = board.getColumns().map(column => (
            {name: column.getName(), id: column.id}
        ))

        this.columnsOptions = reactive(columnsOptions)
    }

    newSubtask(title) {
        return {
            title: title ?? '',
            id: generateId()
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

        if (this.isEdit) {
            const { task, idsMap } = this
            const subtasks = this.subtasks.map(({id}, i) => {
                const isNew = !(id in idsMap)
                
                return {
                    id: isNew ? id : idsMap[id],
                    title: subtasksTitles[i],
                    isNew
                }
            })

            task.edit({ title, description, subtasks })

            const taskColumnId = task.column.id
            if (columnId == taskColumnId) return

            return this.board.moveTask({ task, to: columnId})
        }

        this.board.columns[columnId].addTask({
            id: generateId(),
            title,
            description,
            subtasksTitles
        })
    }

    renderContent() {
        const { isEdit, task, subtasks } = this

        return html`
        
        <form method="dialog" @submit="${(e) => this.onSubmit(e)}">
            <h2>${() => isEdit ? 'Edit' : 'Add New'} Task</h2>

            <label for="title">Title</label>
            <input type="text" name="title" required
                value="${isEdit ? task.getTitle() : ''}"
                placeholder="e.g. Take coffee break">

            <label for="description">Title</label>
            <textarea name="description"
                placeholder="${isEdit ? '': this.descriptionPlaceholder}"
                >${isEdit ? task.getDescription() : ''}</textarea>

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
                ${isEdit ? 'Save Changes' : 'Create New Task'}
            </button>
        </form>

        `
    }

    renderSubtasks() {
        const { subtasks, isEdit } = this

        return subtasks.map(({title, id}, i) => {
            return html`
        
            <li>
                <input type="text" name="subtask" value="${title}" required
                    placeholder="${() => (!isEdit && this.subtasksPlaceholders[i]) ?? ''}">
                
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
            ${() => this.renderColumnsOptions()}
        </select>
        
        `
    }

    renderColumnsOptions() {
        return this.columnsOptions.map(({ id, name }) => {
            const isSelected = () => this.isEdit && this.task.column.id == id
            
            return html`
            
            <option value="${id}" selected="${isSelected}">
                ${name}
            </option>

            `
        })
    }
}