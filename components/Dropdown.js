import { generateId } from '../js/helpers.js'
import { reactive, html } from '../js/arrow.js'

export class Dropdown {
    openChangeHandler = isOpen => this.onOpenChange(isOpen)
    clickHandler = e => this.onClick(e)
    keyHandler = e => this.onKey(e)

    data = reactive({
        isOpen: false
    })

    constructor(items) {
        this.items = items
        this.id = generateId()

        this.data.$on('isOpen', this.openChangeHandler)
    }

    dispose() {
        this.data.$off('isOpen', this.openChangeHandler)
    }

    onOpenChange(isOpen) {
        isOpen ? this.onOpen() : this.onClose()
    }

    onOpen() {
        addEventListener('click', this.clickHandler, true)
        addEventListener('keydown', this.keyHandler, true)
    }

    onClose() {
        removeEventListener('click', this.clickHandler, true)
        removeEventListener('keydown', this.keyHandler, true)
    }

    onClick(e) {
        if (e.target.id == this.id) return

        this.data.isOpen = false
    }

    onKey(e) {
        if (e.key != 'Escape') return
        
        this.data.isOpen = false
        
        e.preventDefault()
    }

    render() {
        const { data } = this

        return html`
        
        <div class="dropdown">
            <button class="dropdown__toggle" id="${this.id}"
                aria-haspopup="true"
                aria-expanded="${() => data.isOpen}"
                @click="${() => data.isOpen = !data.isOpen}">
                
                <span class="visually-hidden">Toggle menu</span>
            </button>
            
            ${() => this.renderMenu()}
        </div>

        `
    }

    renderMenu() {
        if (!this.data.isOpen) return ''

        return html`
        
        <menu class="dropdown__menu"
            aria-labelledby="${this.id}">
            
            ${this.renderItems()}
        </menu>

        `
    }

    renderItems() {
        return this.items.map(({ text, style, action }) => {
            const className = style ? ` dropdown__item--${style}` : ''

            return html`
            
            <li class="dropdown__item${className} | text text--l">
                <button class="dropdown__btn"
                    @click="${() => action()}">
                    ${text}
                </button>
            </li>

            `
        })
    }
}