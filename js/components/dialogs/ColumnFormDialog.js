import { Dialog } from './Dialog.js'
import { ConfirmDialog } from './ConfirmDialog.js'
import { Dropdown } from '../Dropdown.js'
import { html } from '../../arrow.js'
import { generateId } from '../../generateId.js'

export class ColumnFormDialog extends Dialog {
    constructor({ board, column }) {
        super()
        
        this.board = board
        this.column = column
        this.isEdit = board == null

        if (this.isEdit) {
            this.title = 'Edit Column'
            this.btnText = 'Save Changes'
            
            this.confirmDialog = new ConfirmDialog({ column })
            this.dropdown = new Dropdown([
                {
                    text: 'Delete Column',
                    style: 'danger',
                    action: () => this.confirmDialog.show()
                }
            ])
        }
        else {
            this.defaultColors = ['#49C4E5', '#6460C7', '#67E2AE']
            this.title = 'Add New Column'
            this.namePlaceholder = 'Priority'
            this.btnText = 'Create New Column'
        }
    }

    show() {
        if (this.isEdit) {
            const { column } = this

            this.name = column.getName()
            this.color = column.getColor()
        }
        else {
            const { defaultColors } = this
            const nColumns = this.board.getColumns().length || 1
            const colorIndex = nColumns % defaultColors.length
            
            this.color = defaultColors[colorIndex]
        }

        super.show()
    }

    onSubmit(e) {
        const formData = new FormData(e.target)
        const name = formData.get('name')
        const color = formData.get('color')

        if (this.isEdit) this.column.edit({ name, color })
        else this.board.addColumn({ id: generateId(), name, color, isNew: true })
    }

    renderContent() {
        return html`
        
        <form method="dialog" @submit="${(e) => this.onSubmit(e)}">
            <h2 class="title title--l">
                ${this.title}
            </h2>

            <div class="dialog__item dialog__item--single">
                <input type="color" name="color"
                    value="${this.color}" required>
                <input type="text" name="name" maxlength="30"
                    value="${this.name}"
                    placeholder="${this.namePlaceholder}" required
                    @input="${e => e.target.classList.add('modified')}">

                <span class="invalid-msg | text text--l">Can't be empty</span>
            </div>
            
            <button type="submit" class="btn btn--small btn--primary">
                ${this.btnText}
            </button>

            ${this.isEdit ? () => this.dropdown.render() : ''}
        </form>
        
        ${this.isEdit ? () => this.confirmDialog.render() : ''}
        
        `
    }
}