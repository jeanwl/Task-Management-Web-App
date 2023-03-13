import { reactive, html } from '../lib/arrow.js'
import { generateId } from '../helpers.js'

export class BoardDialog {
    id = 'boardDialog'
    defaultColumns = ['Todo', 'Doing']
    
    data = reactive({
        columns: [],
        isEdit: false,
        name: ''
    })

    constructor(app) {
        this.app = app
    }

    get el() {
        return this._el ?? (this._el = window[this.id])
    }

    show(board) {
        const { data } = this
        
        this.board = board
        data.isEdit = !!board
        data.name = board?.getName() ?? ''

        this.buildColumns()

        // wait for columns to build before showing
        setTimeout(() => this.el.showModal())
    }

    buildColumns() {
        const { isEdit, columns } = this.data

        columns.splice(0, columns.length)

        if (isEdit) {
            const idsMap = this.idsMap = {}

            this.board.getColumns().forEach(column => {
                const newColumn = this.newColumn(column.getName())
                
                idsMap[newColumn.id] = column.id

                columns.push(newColumn)
            })
        }
        else {
            columns.push(...this.defaultColumns.map(name => (
                this.newColumn(name)
            )))
        }
    }

    newColumn(name) {
        return {
            name: name ?? '',
            id: generateId()
        }
    }

    moveColumn(from, to) {

    }

    onSubmit(e) {
        const formData = new FormData(e.target)
        const name = formData.get('name')
        const columnsNames = formData.getAll('column')

        if (this.data.isEdit) {
            const { idsMap } = this
            const columns = this.data.columns.map(({id}, i) => {
                const isNew = !(id in idsMap)
                
                return {
                    id: isNew ? id : idsMap[id],
                    name: columnsNames[i],
                    isNew
                }
            })

            return this.board.edit({ name, columns })
        }
        
        this.app.addBoard({
            id: generateId(),
            name,
            columnsNames
        })
    }

    render() {
        const { isEdit, name, columns } = this.data

        return html`
        
        <dialog id="${this.id}" @click="${() => this.el.close()}">
            <form method="dialog" @submit="${(e) => this.onSubmit(e)}"
                @click="${(e) => e.stopPropagation()}">
                
                <h2>${() => isEdit ? 'Edit' : 'Add New'} Board</h2>

                <label for="name">Board Name</label>
                <input type="text" name="name"
                    value="${() => name}"
                    placeholder="e.g. Web Design" required>

                <fieldset>
                    <label for="column">Board Columns</label>
                    ${() => this.renderColumns()}

                    <button type="button"
                        @click="${() => columns.push(this.newColumn())}">
                        
                        Add New Column
                    </button>
                </fieldset>
                
                <button type="submit">
                    ${() => isEdit ? 'Save Changes' : 'Create New Board'}
                </button>
            </form>
        </dialog>
        
        `
    }

    renderColumns() {
        const { columns } = this.data

        return columns.map(({name, id}, i) => {
            return html`
        
            <li>
                <input type="text" name="column" value="${name}" required>
                
                <button type="button" @click="${() => columns.splice(i, 1)}">
                    <span class="visually-hidden">Remove Column</span>
                </button>
            </li>

            `.key(id)
        })
    }
}