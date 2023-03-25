import { reactive, html } from '../../js/arrow.js'
import { generateId } from '../../js/generateId.js'

export class Dialog {
    elId = `dialog_${generateId()}`

    data = reactive({})
    
    get el() {
        return window[this.elId]
    }

    show() {
        this.data.show = true

        setTimeout(() => this.el.showModal())
    }

    close() {
        this.el.close()
    }

    onClose() {
        this.data.show = false
    }

    render() {
        return this.data.show ? html`
        
        <dialog class="dialog" id="${this.elId}"
            @pointerdown="${() => this.close()}"
            @close="${() => this.onClose()}">
            
            <div class="dialog__content"
                @pointerdown="${e => e.stopPropagation()}"
                @click="${e => e.stopPropagation()}">
                
                ${this.renderContent()}
            </div>
        </dialog>
        
        ` : ''
    }
}