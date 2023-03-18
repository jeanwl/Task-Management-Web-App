import { Column } from './Column.js'
import { Dropdown } from './Dropdown.js'
import { reactive, html } from '../js/arrow.js'
import { generateId } from '../js/helpers.js'

export class Board {
    columns = {}
    keysToSave = ['name', 'columnsIds']

    data = reactive({
        columnsIds: []
    })

    constructor({ app, id, name, columnsNames, wasSaved }) {
        this.app = app
        this.id = id
        this.storageKey = `board_${id}`

        if (wasSaved) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        this.dropdown = new Dropdown([
            {
                text: 'Edit Board',
                action: () => app.boardFormDialog.showEdit(this)
            },
            {
                text: 'Delete Board',
                style: 'danger',
                action: () => app.confirmDialog.showBoard(this)
            }
        ])

        if (wasSaved) return

        data.name = name

        for (const name of columnsNames) {
            this.addColumn({ id: generateId(), name })
        }
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
        
        for (const id of columnsIds) this.addColumn({ id, wasSaved: true })
        
        if (name != null) this.data.name = name
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => [key, data[key]])
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    addColumn({ id, name, wasSaved }) {
        this.columns[id] = new Column({ board: this, id, name, wasSaved })
        
        this.data.columnsIds.push(id)
    }

    removeColumn(id) {
        const { columnsIds } = this.data

        columnsIds.splice(columnsIds.indexOf(id), 1)
        
        const { columns } = this

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
                this.addColumn({ id, name })
                
                return this.moveColumn({ column: columns[id], to: i})
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

    render() {
        return html`
        
        <header class="board__header">
            <h2 class="title title--xl">
                ${() => this.data.name}
            </h2>
            
            <button class="new-task-btn | btn btn--large btn--primary"
                @click="${() => this.app.taskFormDialog.showNew(this)}">
                
                Add New Task
            </button>
            
            ${() => this.dropdown.render()}
        </header>

        <ul class="board__content">
            ${() => this.getColumns().map(column => column.render())}
        </ul>

        `
    }
}