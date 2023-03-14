import { Dialog } from './Dialog.js'
import { reactive, html } from '/js/arrow.js'
import { generateId } from '/js/helpers.js'

export class TaskFormDialog extends Dialog {
    id = 'taskFormDialog'
    subtasksPlaceholders = [
        'e.g. Make coffee',
        'e.g. Drink coffee & smile'
    ]

    showNew() {
        
    }

    showEdit() {

    }

    buildColumnsOptions() {
        
    }

    newSubtask(title) {
        return {
            title: title ?? '',
            id: generateId()
        }
    }

    moveSubtask(from, to) {

    }

    onColumnChange(e) {

    }

    onSubmit(e) {
        const formData = new FormData(e.target)
        const title = formData.get('title')
        const description = formData.get('description')
        const columnKey = formData.get('column')
        const subtasksNames = formData.getAll('subtask')

        if (this.data.isEdit) {
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
    }

    renderContent() {
        const { isEdit } = this

        return html`
        
        <form method="dialog" @submit="${(e) => this.onSubmit(e)}">
            <h2>${() => isEdit ? 'Edit' : 'Add New'} Task</h2>

            <label for="title">Title</label>
            <input type="text" name="title" required
                value="${() => title}"
                placeholder="e.g. Take coffee break">

            <label for="description">Title</label>
            <textarea name="description" required
                placeholder="e.g. It’s always good to take a break. This 15 minute break will 
                recharge the batteries a little.">

                ${() => description}
            </textarea>

            <fieldset>
                <label for="subtask">Subtasks</label>
                ${() => this.renderFormSubtasks()}

                <button type="button"
                    @click="${() => subtasks.push(this.newSubtask())}">
                    
                    Add New Subtask
                </button>
            </fieldset>

            ${this.renderColumnSelect()}
            
            <button type="submit">
                ${() => isEdit ? 'Save Changes' : 'Create New Board'}
            </button>
        </form>

        `
    }

    renderSubtasks() {
        const { subtasks } = this.data

        return subtasks.map(({title, id}, i) => {
            return html`
        
            <li>
                <input type="text" name="subtask" value="${title}" required
                    placeholder="${this.subtasksPlaceholders[i] ?? ''}">
                
                <button type="button" @click="${() => subtasks.splice(i, 1)}">
                    <span class="visually-hidden">Remove Subtask</span>
                </button>
            </li>

            `.key(id)
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