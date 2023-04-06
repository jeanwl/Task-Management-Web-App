import { Column } from './Column.js'
import { BoardFormDialog } from './dialogs/BoardFormDialog.js'
import { ConfirmDialog } from './dialogs/ConfirmDialog.js'
import { TaskFormDialog } from './dialogs/TaskFormDialog.js'
import { ColumnFormDialog } from './dialogs/ColumnFormDialog.js'
import { Dropdown } from './Dropdown.js'
import { reactive, html } from '../arrow.js'

export class Board {
    columns = {}
    keysToSave = ['name', 'columnsIds']

    boardFormDialog = new BoardFormDialog({ board: this })
    confirmDialog = new ConfirmDialog({ board: this })
    taskFormDialog = new TaskFormDialog({ board: this })
    columnFormDialog = new ColumnFormDialog({ board: this })

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
        columnsIds: [],
        dragging: false
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

    get el() {
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

    addColumn({ id, name, color, isNew }) {
        const column = new Column({ id, name, color, isNew, board: this })

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
        
        this.columns[to].insertTask({ task })
    }

    edit({ name, columns: editedColumns }) {
        const { columns, data } = this
        const { columnsIds } = data

        data.name = name
        
        editedColumns.forEach(({ id, name, color, isNew }, i) => {
            if (isNew) {
                this.addColumn({ id, name, color, isNew })
                this.moveColumn({ column: columns[id], to: i })

                return
            }

            const column = columns[id]
            column.setName(name)
            column.setColor(color)

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

    cancelDrag = () => {
        removeEventListener('pointermove', this.startDrag)
        removeEventListener('pointerup', this.cancelDrag)
    }

    startDrag = e => {
        this.cancelDrag()
        
        this.el.setPointerCapture(e.pointerId)
        this.data.dragging = true
    }

    onPointerDown(e) {
        if (e.pointerType != 'mouse') return

        addEventListener('pointermove', this.startDrag)
        addEventListener('pointerup', this.cancelDrag)
    }

    onLostPointerCapture() {
        this.data.dragging = false
    }

    onPointerMove(e) {
        if (!this.data.dragging) return
        
        this.el.scrollBy(-e.movementX, -e.movementY)
    }

    onTaskDragStart({ task }) {
        this.cancelDrag()

        const rect = this.el.getBoundingClientRect()
        this.bounds = {
            top: rect.top + 20,
            right: rect.right - 20,
            bottom: rect.bottom - 20,
            left: rect.left + 20
        }

        this.data.draggingTask = task
        this.app.data.draggingTask = true
    }

    onTaskDrag(e) {
        this.attemptTaskDrop(e)

        const { top, right, bottom, left } = this.bounds
        const { clientX, clientY } = e
        const x = clientX < left ? -1 : clientX > right ? 1 : 0
        const y = clientY < top ? -1 : clientY > bottom ? 1 : 0

        clearInterval(this.scrollInterval)

        if (x == 0 && y == 0) return

        this.scrollInterval = setInterval(() => this.el.scrollBy(x, y))
    }

    attemptTaskDrop({ clientX, clientY }) {
        const el = document.elementFromPoint(clientX, clientY)

        if (!el) return
        
        const columnEl = el.closest('.column:not(.column--new)')

        if (!columnEl) return
        
        const taskEl = el.closest('.task-item')
        const { draggingTask } = this.data
        const draggingTaskColumn = draggingTask.column
        const draggingTaskId = draggingTask.id

        if (!taskEl) {
            const column = this.columns[columnEl.dataset.id]
            
            draggingTaskColumn.removeTask({ id: draggingTaskId })
            column.insertTask({ task: draggingTask })

            return
        }
        
        const taskId = Number(taskEl.dataset.id)

        if (taskId == draggingTaskId) return

        const columnId = Number(taskEl.dataset.columnId)
        const column = this.columns[columnId]
        
        if (columnId == draggingTaskColumn.id) {
            const isAbove = column.isIdAbove({ id: draggingTaskId, otherId: taskId })
            const isAboveTopHalf = el.matches('.task__top-hitbox')

            if (isAbove && isAboveTopHalf) return
            if (!isAbove && !isAboveTopHalf) return

            column.switchTasks({ id: draggingTask.id, otherId: taskId })

            return
        }

        draggingTaskColumn.removeTask({ id: draggingTaskId })
        column.insertTask({ task: draggingTask, belowId: taskId })
    }

    onTaskDragStop() {
        this.data.draggingTask = null
        this.app.data.draggingTask = false

        clearInterval(this.scrollInterval)
    }

    render() {
        const { data } = this

        const newTaskBtn = () => data.columnsIds.length ? html`
          
        <button class="new-task-btn | btn btn--large btn--primary"
            @click="${() => this.taskFormDialog.show()}">
            
            Add New Task
        </button>

        ` : ''

        return html`
        
        <section class="board">
            <header class="board__header">
                <button class="board__title-btn"
                    @click="${e => this.app.toggleAltMenu(e)}">
                    
                    <h2 class="board__title | title title--xl">
                        ${() => data.name}
                    </h2>
                    <svg class="chevron-icon"><use href="#chevron-icon"></svg>
                </button>

                ${newTaskBtn}
                
                ${() => this.dropdown.render()}
            </header>

            <section class="board__content" id="${this.elId}"
                data-dragging="${() => data.dragging}"
                @pointerdown="${e => this.onPointerDown(e)}"
                @lostpointercapture="${() => this.onLostPointerCapture()}"
                @pointermove="${e => this.onPointerMove(e)}">
                
                ${() => this.renderColumns()}
            
                ${() => data.draggingTask?.render({ followPointer: true })}
            </section>

            ${() => this.boardFormDialog.render()}
            ${() => this.confirmDialog.render()}
            ${() => this.taskFormDialog.render()}
            ${() => this.columnFormDialog.render()}
        </section>

        `
    }

    renderColumns() {
        const columns = this.getColumns()

        if (columns.length == 0) return html`
        
        <div class="board__new">
            <p class="title title--l">
                This board is empty. Create a new column to get started.
            </p>
            <button class="btn btn--large btn--primary"
                @click="${() => this.columnFormDialog.show()}">
                
                + Create New Column
            </button>
        </div>

        `

        return html`
        
        <ul class="board__columns">
            ${() => columns.map(column => column.render())}

            <li class="column column--new">
                <button class="column__new-btn | title title--m"
                    @click="${() => this.columnFormDialog.show()}">
                    
                    + New Column
                </button>
            </li>
        </ul>

        `
    }
}