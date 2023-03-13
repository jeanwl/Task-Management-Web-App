import { Column } from './Column.js'
import { reactive, html } from '../lib/arrow.js'
import { generateId } from '../helpers.js'

export class Board {
    columns = {}

    data = reactive({
        name: '',
        columnsIds: [],
        menuIsOpen: false
    })
    keysToSave = ['name', 'columnsIds']

    constructor({ app, id, name, columnsNames, wasSaved }) {
        this.app = app
        this.id = id
        this.storageKey = `board_${id}`

        if (wasSaved) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

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
        return Object.values(this.columns)
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { name, columnsIds } = JSON.parse(savedData)
        
        for (const id of columnsIds) this.addColumn({ id, wasSaved: true })
        
        if (name != null) this.data.name = name
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => (
            [key, data[key]]
        ))
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

    moveColumn(from, to) {
        const { columnsIds } = this.data
        const id = columnsIds[from]

        columnsIds.splice(from, 1)
        columnsIds.splice(to, 0, id)
    }

    removeSave() {
        for (const column of Object.values(this.columns)) {
            column.removeSave()
        }

        localStorage.removeItem(this.storageKey)
    }

    edit({ name, columns: editedColumns }) {
        const { columns, data } = this
        const { columnsIds } = data

        data.name = name
        
        editedColumns.forEach(({ id, name, isNew }, i) => {
            if (isNew) {
                this.addColumn({ id, name })
                
                return this.moveColumn(columnsIds.length - 1, i)
            }

            columns[id].setName(name)

            const index = columnsIds.indexOf(id)

            if (index == i) return

            this.moveColumn(index, i)
        })

        const nToRemove = columnsIds.length - editedColumns.length

        if (nToRemove < 1) return

        const idsToRemove = columnsIds.slice(nToRemove * -1)

        for (const id of idsToRemove) {
            this.removeColumn(id)
        }
    }

    render() {
        const { data, app } = this

        return html`
        
        <header>
            <h2>${() => data.name}</h2>
            <button @click="${() => app.taskDialog.showForm({ board: this })}">
                Add New Task
            </button>
            <button class="dropdown-btn" id="dropdownBoardMenuBtn"
                aria-haspopup="true"
                aria-expanded="${() => data.menuIsOpen}"
                @click="${() => data.menuIsOpen = !data.menuIsOpen}">
                
                <span class="visually-hidden">Show menu</span>
            </button>
            <menu class="dropdown-menu"
                aria-labelledby="dropdownBoardMenuBtn">
                
                <li>
                    <button @click="${() => app.boardFormDialog.showEdit(this)}">
                        Edit Board
                    </button>
                    <button @click="${() => app.confirmDialog.showBoard(this)}">
                        Delete Board
                    </button>
                </li>
            </menu>
        </header>

        <ul class="board__content">${() => this.renderColumns()}</ul>

        `
    }

    renderColumns() {
        const { data, columns } = this

        return data.columnsIds.map(id => {
            return html`
            
            <li class="column">${() => columns[id].render()}</li>

            `
        })
    }
}