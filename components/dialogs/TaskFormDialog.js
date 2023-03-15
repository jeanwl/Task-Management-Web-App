import { Dialog } from './Dialog.js'
import { reactive, html } from '/js/arrow.js'
import { generateId } from '/js/helpers.js'

export class TaskFormDialog extends Dialog {
    id = 'taskFormDialog'
    subtasksPlaceholders = [
        'e.g. Make coffee',
        'e.g. Drink coffee & smile'
    ]

    showNew(board) {
        this.isEdit = false
        this.board = board

        this.buildColumnsOptions(board)

        this.subtasks = reactive(Array.from({ length: 2 }, _ => this.newSubtask()))

        this.show()
    }

    showEdit() {

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
            const { idsMap } = this
            const subtasks = this.data.subtasks.map(({id}, i) => {
                const isNew = !(id in idsMap)
                
                return {
                    id: isNew ? id : idsMap[id],
                    name: subtasksNames[i],
                    isNew
                }
            })

            if (columnId != this.task.column.id) {
                this.board.moveTask()
            }

            return this.task.edit({ title, description, subtasks })
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
                value="${isEdit ? task.getName() : ''}"
                placeholder="e.g. Take coffee break">

            <label for="description">Title</label>
            <textarea name="description" required
                placeholder="e.g. It’s always good to take a break. This 15 minute break will 
                recharge the batteries a little.">${isEdit ? task.getDescription() : ''}</textarea>

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
        const { subtasks } = this

        return subtasks.map(({title, id}, i) => {
            return html`
        
            <li>
                <input type="text" name="subtask" value="${title}" required
                    placeholder="${() => this.subtasksPlaceholders[i] ?? ''}">
                
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
            return html`
            
            <option value="${id}">${name}</option>

            `
        })
    }
}