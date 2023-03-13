import { reactive, html } from '../lib/arrow.js'

export class Dialog {
    data = reactive({})

    get el() {
        return this._el ?? (this._el = window[this.id])
    }

    show() {
        this.data.content = this.renderContent()

        setTimeout(() => this.el.showModal())
    }

    close() {
        this.el.close()
    }

    render() {
        return html`
        
        <dialog id="${this.id}" @click="${() => this.close()}">
            <div @click="${e => e.stopPropagation()}">
                ${() => this.data.content}
            </div>
        </dialog>
        
        `
    }
}