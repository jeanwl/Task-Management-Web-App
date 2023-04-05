import { reactive, html } from '../arrow.js'
import { generateId } from '../generateId.js'

export class Dropdown {
    elId = `dropdown_${generateId()}`

    data = reactive({
        isOpen: false
    })

    constructor(items) {
        this.items = items
    }

    toggle() {
        if (this.data.isOpen) this.close()
        else this.open()
    }

    open() {
        this.data.isOpen = true

        addEventListener('pointerdown', this.onClick, true)
        addEventListener('keydown', this.onKey, true)
    }

    close() {
        removeEventListener('pointerdown', this.onClick, true)
        removeEventListener('keydown', this.onKey, true)

        this.data.isOpen = false
    }

    onClick = e => {
        if (e.target.closest(`#${this.elId}`)) return

        this.close()
    }

    onKey = e => {
        if (e.key != 'Escape') return
        
        this.close()
        
        e.preventDefault()
    }

    render() {
        return html`
        
        <div class="dropdown" id="${this.elId}">
            <button class="dropdown__toggle"
                type="button"
                aria-haspopup="true"
                aria-expanded="${() => this.data.isOpen}"
                @click="${() => this.toggle()}">
                
                <svg class="menu-icon"><use href="#menu-icon"></svg>
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
            aria-labelledby="${this.elId}">
            
            ${this.renderItems()}
        </menu>

        `
    }

    renderItems() {
        return this.items.map(({ text, style, action }) => {
            const className = style ? ` dropdown__item--${style}` : ''

            return html`
            
            <li class="dropdown__item${className} | text text--l">
                <button class="dropdown__btn" type="button"
                    @click="${() => { action(); this.close() }}">
                    
                    ${text}
                </button>
            </li>

            `
        })
    }
}