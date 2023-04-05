import { reactive, html } from '../../arrow.js'
import { generateId } from '../../generateId.js'

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
            @click="${() => this.close()}"
            @close="${() => this.onClose()}"
            @pointermove="${e => e.stopPropagation()}">
            
            <div class="dialog__content"
                @click="${e => e.stopPropagation()}">
                
                ${this.renderContent()}
            </div>
        </dialog>
        
        ` : ''
    }
}