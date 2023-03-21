import { Dialog } from './Dialog.js'
import { reactive, html } from '../../js/arrow.js'
import { generateId } from '../../js/generateId.js'

export class BoardFormDialog extends Dialog {
    constructor({ app, board }) {
        super()
        
        this.app = app
        this.board = board
        this.isEdit = app == null

        if (this.isEdit) {
            this.title = 'Edit Board'
            this.btnText = 'Save Changes'
        }
        else {
            this.title = 'Add New Board'
            this.name = ''
            this.btnText = 'Create New Board'
            this.defaultColumns = ['Todo', 'Doing']
        }
    }

    show() {
        let columns

        if (this.isEdit) {
            const { board } = this

            this.name = board.getName()
            
            columns = board.getColumns().map(column => (
                this.newColumn({
                    id: column.id,
                    name: column.getName()
                })
            ))
        }
        else {
            columns = this.defaultColumns.map(name => (
                this.newColumn({ name })
            ))
        }
        
        this.columns = reactive(columns)

        super.show()
    }

    newColumn({ id, name } = {}) {
        return {
            id: id ?? generateId(),
            name: name ?? '',
            isNew: id == null
        }
    }

    moveColumn(from, to) {

    }

    onSubmit(e) {
        const formData = new FormData(e.target)
        const name = formData.get('name')
        const columnsNames = formData.getAll('column')

        const columns = this.columns.map((column, i) => {
            column.name = columnsNames[i]

            return column
        })

        if (this.isEdit) this.board.edit({ name, columns })
        else this.app.addBoard({ id: generateId(), name, columns, isNew: true })
    }

    renderContent() {
        return html`
        
        <form method="dialog" @submit="${(e) => this.onSubmit(e)}">
            <h2 class="">
                ${this.title}
            </h2>

            <label for="name">Board Name</label>
            <input type="text" name="name"
                value="${this.name}"
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
                ${this.btnText}
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