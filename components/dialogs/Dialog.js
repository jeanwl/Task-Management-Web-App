import { reactive, html } from '/js/arrow.js'

export class Dialog {
    data = reactive({})
    
    get el() {
        return window[this.id]
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
        
        <dialog id="${this.id}"
            @click="${() => this.close()}"
            @close="${() => this.onClose()}">
            
            <div @click="${e => e.stopPropagation()}">
                ${this.renderContent()}
            </div>
        </dialog>
        
        ` : ''
    }
}