import { Board } from './Board.js'
import { BoardFormDialog } from './dialogs/BoardFormDialog.js'
import { loadDataSample } from '../js/loadDataSample.js'
import { reactive, html } from '../js/arrow.js'

export class App {
    boards = {}
    maxBoard = 10
    storageKey = 'app'
    keysToSave = ['boardsIds', 'currentBoard', 'hideSidebar', 'isDark']
    
    boardFormDialog = new BoardFormDialog({ app: this })

    data = reactive({
        boardsIds: []
    })
    
    constructor() {
        // remove
        window.app = this

        this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)

        if (!savedData) {
            // demo
            localStorage.setItem(this.storageKey, JSON.stringify(loadDataSample()))
            
            return this.load()
        }
        
        const { boardsIds, currentBoard, hideSidebar, isDark } = JSON.parse(savedData)
        const { data } = this

        for (const id of boardsIds) {
            this.addBoard({ id })
        }
        
        data.currentBoard = currentBoard
        data.hideSidebar = hideSidebar
        data.isDark = isDark ?? matchMedia('(prefers-color-scheme: dark)').matches
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => [key, data[key]])
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    addBoard({ id, name, columns, isNew }) {
        const { data } = this
        const board = new Board({ id, name, isNew, app: this })

        if (columns) {
            for (const column of columns) {
                board.addColumn(column)
            }
        }

        this.boards[id] = board
        data.boardsIds.push(id)

        if (isNew) data.currentBoard = id
    }

    removeBoard(id) {
        const { boards } = this
        const { boardsIds } = this.data
        const index = boardsIds.indexOf(id)
        
        this.data.currentBoard = boardsIds[index == 0 ? 1 : index - 1]

        boardsIds.splice(index, 1)
        boards[id].removeSave()
        delete boards[id]
    }

    render() {
        const { data } = this
        
        const showSidebarBtn = () => data.hideSidebar ? html`
        
        <button class="show-sidebar-btn"
            @click="${() => data.hideSidebar = false}">
            
            <span class="visually-hidden">Show Sidebar</span>
        </button>

        ` : ''

        return html`
        
        <div class="app" data-is-dark="${() => data.isDark}">
            <header class="app__header">
                <h1 class="kanban-logo">
                    <span class="visually-hidden">Kanban</span>
                </h1>
            </header>

            <main class="app__content">
                ${() => this.renderSidebar()}
                ${showSidebarBtn}
                
                ${() => this.renderBoard()}
            </main>

            ${() => this.boardFormDialog.render()}
        </div>

        `
    }

    renderSidebar() {
        const { data } = this

        if (data.hideSidebar) return ''

        return html`
            
        <aside class="sidebar">
            <h2 class="sidebar__title | title title--s">
                ${() => `All boards (${data.boardsIds.length})`}
            </h2>

            <menu class="sidebar__boards">
                ${() => this.renderBoardList()}
            </menu>
            
            ${() => this.renderNewBoardBtn()}

            <button class="sidebar__theme-btn"
                aria-pressed="${() => data.isDark}"
                @click="${() => data.isDark = !data.isDark}">
                
                <span class="theme-btn__toggler">
                    <span class="visually-hidden">Toggle theme</span>
                </span>
            </button>

            <button class="sidebar__hide-btn | title title--m"
                @click="${() => data.hideSidebar = true}">
                
                Hide Sidebar
            </button>
        </aside>
        
        `
    }

    renderBoard() {
        const { data } = this

        if (data.boardsIds.length == 0) return ''

        return this.boards[data.currentBoard].render()
    }

    renderBoardList() {
        const { data } = this

        return data.boardsIds.map(id => {
            return html`
        
            <li class="sidebar__board | title title--m"
                aria-current="${() => data.currentBoard == id}">
                
                <button @click="${() => data.currentBoard = id}">
                    <svg class="board-icon"><use href="#board-icon"></svg>
                    ${() => this.boards[id].getName()}
                </button>
            </li>

            `
        })
    }

    renderNewBoardBtn() {
        if (this.data.boardsIds.length == this.maxBoard) return ''
            
        return html`
        
        <button class="sidebar__new-board-btn | title title--m"
            @click="${() => this.boardFormDialog.show()}">
            
            <svg class="board-icon"><use href="#board-icon"></svg>
            + Create New Board
        </button>
        
        `
    }
}