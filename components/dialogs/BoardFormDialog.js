import { Dialog } from './Dialog.js'
import { reactive, html } from '/js/arrow.js'
import { generateId } from '/js/helpers.js'

export class BoardFormDialog extends Dialog {
    id = 'boardFormDialog'
    defaultColumns = ['Todo', 'Doing']

    showNew(app) {
        this.app = app
        this.isEdit = false

        const columns = this.defaultColumns.map(name => (
            this.newColumn(name)
        ))

        this.columns = reactive(columns)

        this.show()
    }

    showEdit(board) {
        this.board = board
        this.isEdit = true

        const idsMap = this.idsMap = {}
        const columns = this.board.getColumns().map(column => {
            const newColumn = this.newColumn(column.getName())
            
            idsMap[newColumn.id] = column.id

            return newColumn
        })

        this.columns = reactive(columns)

        this.show()
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

        if (this.isEdit) {
            const { idsMap } = this
            const columns = this.columns.map(({id}, i) => {
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

    renderContent() {
        const { isEdit } = this

        return html`
        
        <form method="dialog" @submit="${(e) => this.onSubmit(e)}">
            
            <h2>${isEdit ? 'Edit' : 'Add New'} Board</h2>

            <label for="name">Board Name</label>
            <input type="text" name="name"
                value="${isEdit ? this.board.getName() : ''}"
                placeholder="e.g. Web Design" required>

            <fieldset>
                <label for="column">Board Columns</label>
                ${() => this.renderColumns()}

                <button type="button"
                    @click="${() => this.columns.push(this.newColumn())}">
                    
                    Add New Column
                </button>
            </fieldset>
            
            <button type="submit">
                ${isEdit ? 'Save Changes' : 'Create New Board'}
            </button>
        </form>
        
        `
    }

    renderColumns() {
        const { columns } = this

        return columns.map(({name, id}, i) => {
            const removeBtn = () => columns.length < 2 ? '' : html`
            
            <button type="button" @click="${() => columns.splice(i, 1)}">
                <span class="visually-hidden">Remove Column</span>
            </button>
    
            `
            
            return html`
        
            <li>
                <input type="text" name="column" value="${name}" required>
                
                ${removeBtn}
            </li>

            `.key(id)
        })
    }
}