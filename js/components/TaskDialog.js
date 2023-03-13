import { reactive, html } from '../lib/arrow.js'
import { generateId } from '../helpers.js'

export class TaskDialog {
    id = 'taskDialog'
    subtasksPlaceholders = [
        'e.g. Make coffee',
        'e.g. Drink coffee & smile'
    ]
    columnsOptions = []

    data = reactive({
        subtasks: [],
        menuIsOpen: false
    })

    get el() {
        return this._el ?? (this._el = window[this.id])
    }

    showInfo(task) {
        const { data } = this
        
        this.task = task
        
        data.showInfo = true
        
        
        setTimeout(() => this.el.showModal())
    }

    showForm({ task, board }) {
        const { data } = this
        const { subtasks } = data

        subtasks.splice(0, subtasks.length)

        setTimeout(() => this.el.showModal())
    }

    buildSubtasks() {
        const { isEdit, subtasks } = this.data

        subtasks.splice(0, subtasks.length)

        if (isEdit) {
            const idsMap = this.idsMap = {}

            this.task.getSubtasks().forEach(subtask => {
                const newSubtask = this.newSubtask(subtask.getTitle())
                
                idsMap[newSubtask.id] = subtask.id

                subtasks.push(newSubtask)
            })
        }
        else {
            subtasks.push(...Array.from({ length: 2 }, () => (
                this.newSubtask()
            )))
        }
    }

    buildColumnsOptions() {
        const { board, columnsOptions } = this

        board.getColumns().forEach(column => {
            columnsOptions
        })
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

    close() {
        this.data.showInfo = null

        this.el.close()
    }

    render() {
        const { data } = this
        const { showInfo } = data

        const content = showInfo == null ? '' : showInfo
            ? this.renderInfos()
            : this.renderForm()

        return html`
        
        <dialog id="${this.id}" @click="${() => this.close()}">
            <div @click="${(e) => e.stopPropagation()}">
                ${() => content}
            </div>
        </dialog>
        
        `
    }

    renderInfos() {
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

    renderInfosSubtasks() {
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

    renderForm() {
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

    renderFormSubtasks() {
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