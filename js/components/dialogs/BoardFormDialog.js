import { Dialog } from './Dialog.js'
import { reactive, html } from '../../arrow.js'
import { generateId } from '../../generateId.js'

export class BoardFormDialog extends Dialog {
    defaultColors = ['#49C4E5', '#6460C7', '#67E2AE']

    data = reactive({
        columns: []
    })

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
        }
    }

    show() {
        const { columns } = this.data

        columns.splice(0, columns.length)

        if (this.isEdit) {
            const { board } = this

            this.name = board.getName()
            
            columns.push(...board.getColumns().map(column => (
                this.newColumn({
                    id: column.id,
                    name: column.getName(),
                    color: column.getColor()
                })
            )))
        }
        else {
            const { defaultColors } = this

            columns.push(...this.defaultColumns.map((name, i) => (
                this.newColumn({ name, color: defaultColors[i] })
            )))
        }

        super.show()
    }

    newColumn({ id, name, color } = {}) {
        if (!color) {
            const { defaultColors } = this
            const nColumns = this.data.columns.length
            const colorIndex = nColumns % defaultColors.length
            
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

        const columns = this.data.columns.map((column, i) => {
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

            <div class="input-group">
                <label for="name" class="text text--m">Name</label>
                <input type="text" name="name" maxlength="50"
                    value="${this.name}"
                    placeholder="${this.namePlaceholder}" required
                    @input="${e => e.target.classList.add('modified')}">

                <span class="invalid-msg | text text--l">Can't be empty</span>
            </div>

            <fieldset>
                <label for="column" class="text text--m">Columns</label>
                ${() => this.renderColumns()}

                <button type="button" class="btn btn--small btn--secondary"
                    @click="${() => this.data.columns.push(this.newColumn())}">
                    
                    + Add New Column
                </button>
            </fieldset>
            
            <button type="submit" class="btn btn--small btn--primary">
                ${this.btnText}
            </button>
        </form>
        
        `
    }

    renderColumns() {
        const { columns } = this.data

        return columns.map(({name, color, id}, i) => {
            return html`
        
            <li class="dialog__item">
                <input type="color" name="color" value="${color}" required>
                <input type="text" name="column" value="${name}" required
                    @input="${e => e.target.classList.add('modified')}">

                <span class="invalid-msg | text text--l">Can't be empty</span>

                <div class="dialog__drag">
                    <svg class="draggable-icon"><use href="#draggable-icon"></svg>
                </div>
                
                <button type="button" class="item__remove-btn"
                    @click="${() => columns.splice(i, 1)}">
                    
                    <span class="visually-hidden">Remove Column</span>
                    <svg class="cross-icon"><use href="#cross-icon"></svg>
                </button>
            </li>

            `.key(id)
        })
    }
}