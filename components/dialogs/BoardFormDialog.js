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
            this.namePlaceholder = 'e.g. Web Design'
            this.btnText = 'Create New Board'
            this.defaultColumns = ['Todo', 'Doing']
            this.defaultColors = ['#49C4E5', '#6460C7', '#67E2AE']
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
                    name: column.getName(),
                    color: column.getColor()
                })
            ))
        }
        else {
            const { defaultColors } = this

            columns = this.defaultColumns.map((name, i) => (
                this.newColumn({ name, color: defaultColors[i] })
            ))
        }
        
        this.columns = reactive(columns)

        super.show()
    }

    newColumn({ id, name, color } = {}) {
        if (!color) {
            const { defaultColors } = this
            const nColumns = this.columns.length
            const colorIndex = (nColumns - 1) % defaultColors.length
            
            color = defaultColors[colorIndex]
        }
        
        return {
            id: id ?? generateId(),
            name: name ?? '',
            color,
            isNew: id == null
        }
    }

    moveColumn(from, to) {

    }

    onSubmit(e) {
        const formData = new FormData(e.target)
        const name = formData.get('name')
        const columnsNames = formData.getAll('column')
        const colors = formData.getAll('color')

        const columns = this.columns.map((column, i) => {
            column.name = columnsNames[i]
            column.color = colors[i]

            return column
        })

        if (this.isEdit) this.board.edit({ name, columns })
        else this.app.addBoard({ id: generateId(), name, columns, isNew: true })
    }

    renderContent() {
        return html`
        
        <form method="dialog" @submit="${(e) => this.onSubmit(e)}">
            <h2 class="title title--l">
                ${this.title}
            </h2>

            <label for="name">Board Name</label>
            <input type="text" name="name"
                value="${this.name}"
                placeholder="${this.namePlaceholder}" required>

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

        return columns.map(({name, color, id}, i) => {
            const removeBtn = () => columns.length < 2 ? '' : html`
            
            <button type="button" @click="${() => columns.splice(i, 1)}">
                <span class="visually-hidden">Remove Column</span>
            </button>
    
            `
            
            return html`
        
            <li>
                <input type="text" name="column" value="${name}" required>
                <input type="color" name="color" value="${color}" required>
                
                ${removeBtn}
            </li>

            `.key(id)
        })
    }
}