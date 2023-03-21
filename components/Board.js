import { Column } from './Column.js'
import { BoardFormDialog } from './dialogs/BoardFormDialog.js'
import { ConfirmDialog } from './dialogs/ConfirmDialog.js'
import { TaskFormDialog } from './dialogs/TaskFormDialog.js'
import { Dropdown } from './Dropdown.js'
import { reactive, html } from '../js/arrow.js'

export class Board {
    columns = {}
    maxColumns = 10
    keysToSave = ['name', 'columnsIds']

    mousemoveHandler = e => this.onMousemove(e)
    mouseupHandler = () => this.onMouseup()

    boardFormDialog = new BoardFormDialog({ board: this })
    confirmDialog = new ConfirmDialog({ board: this })
    taskFormDialog = new TaskFormDialog({ board: this })

    dropdown = new Dropdown([
        {
            text: 'Edit Board',
            action: () => this.boardFormDialog.show()
        },
        {
            text: 'Delete Board',
            style: 'danger',
            action: () => this.confirmDialog.show()
        }
    ])

    data = reactive({
        columnsIds: []
    })

    constructor({ id, name, isNew, app }) {
        this.app = app
        this.id = id
        this.storageKey = this.elId = `board_${id}`

        if (!isNew) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        if (isNew) data.name = name
    }

    get isFull() {
        // column == max and each column full
        this.data.columnsIds.length == this.maxColumns
    }

    getEl() {
        return window[this.elId]
    }

    getName() {
        return this.data.name
    }

    getColumns() {
        const { columns } = this
        
        return this.data.columnsIds.map(id => columns[id])
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { name, columnsIds } = JSON.parse(savedData)
        
        for (const id of columnsIds) this.addColumn({ id })
        
        this.data.name = name
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => [key, data[key]])
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    addColumn({ id, name, isNew }) {
        const column = new Column({ id, name, isNew, board: this })

        this.columns[id] = column
        this.data.columnsIds.push(id)
    }

    removeColumn(id) {
        const { columns } = this
        const { columnsIds } = this.data

        columnsIds.splice(columnsIds.indexOf(id), 1)
        columns[id].removeSave()
        delete columns[id]
    }

    moveColumn({ column, to }) {
        const { columnsIds } = this.data
        const id = column.id

        columnsIds.splice(columnsIds.indexOf(id), 1)
        columnsIds.splice(to, 0, id)
    }

    moveTask({ task, to }) {
        task.column.removeTask({ id: task.id })
        
        this.columns[to].insertTask(task)
    }

    edit({ name, columns: editedColumns }) {
        const { columns, data } = this
        const { columnsIds } = data

        data.name = name
        
        editedColumns.forEach(({ id, name, isNew }, i) => {
            if (isNew) {
                this.addColumn({ id, name, isNew })
                this.moveColumn({ column: columns[id], to: i })

                return
            }

            const column = columns[id]
            column.setName(name)

            if (columnsIds.indexOf(id) == i) return

            this.moveColumn({ column, to: i })
        })

        const nToRemove = columnsIds.length - editedColumns.length

        if (nToRemove < 1) return

        const idsToRemove = columnsIds.slice(nToRemove * -1)

        for (const id of idsToRemove) {
            this.removeColumn(id)
        }
    }

    removeSave() {
        for (const column of this.getColumns()) {
            column.removeSave()
        }

        localStorage.removeItem(this.storageKey)
    }

    onMousedown(e) {
        const el = this.el = this.getEl()
        this.mouseX = e.clientX
        this.mouseY = e.clientY
        this.scrollTop = el.scrollTop
        this.scrollLeft = el.scrollLeft

        addEventListener('mousemove', this.mousemoveHandler)
        addEventListener('mouseup', this.mouseupHandler)
    }

    onMousemove(e) {
        const { el } = this
        const dx = e.clientX - this.mouseX
        const dy = e.clientY - this.mouseY

        el.scrollLeft = this.scrollLeft - dx
        el.scrollTop = this.scrollTop - dy
    }

    onMouseup() {
        removeEventListener('mousemove', this.mousemoveHandler)
        removeEventListener('mouseup', this.mouseupHandler)
    }

    render() {
        const newTaskBtn = () => this.isFull ? '' : html`
        
        <button class="new-task-btn | btn btn--large btn--primary"
            @click="${() => this.taskFormDialog.show()}">
            
            Add New Task
        </button>

        `

        return html`
        
        <section class="board">
            <header class="board__header">
                <h2 class="title title--xl">
                    ${() => this.data.name}
                </h2>
                
                ${newTaskBtn}
                
                ${() => this.dropdown.render()}
            </header>

            <ul class="board__content" id="${this.elId}"
                @mousedown="${e => this.onMousedown(e)}">
                
                ${() => this.getColumns().map(column => column.render())}
            </ul>

            ${() => this.boardFormDialog.render()}
            ${() => this.confirmDialog.render()}
            ${() => this.taskFormDialog.render()}
        </section>

        `
    }
}