import { Board } from './Board.js'
import { BoardFormDialog } from './dialogs/BoardFormDialog.js'
import { loadDataSample } from '../loadDataSample.js'
import { reactive, html } from '../arrow.js'

export class App {
    boards = {}
    maxBoards = 10
    storageKey = 'app'
    keysToSave = ['boardsIds', 'currentBoard', 'hideSidebar', 'isDark']
    
    boardFormDialog = new BoardFormDialog({ app: this })

    data = reactive({
        boardsIds: [],
        hideSidebar: false
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

    get isFull() {
        this.data.boardsIds.length == this.maxBoards
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
        if (hideSidebar != null) data.hideSidebar = hideSidebar
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
        
        return html`
        
        <div class="app" data-is-dark="${() => data.isDark}"
            data-sidebar-closed="${() => data.hideSidebar}">

            <header class="app__header">
                <h1 class="kanban-logo">
                    <svg class="logo"><use href="#logo-icon"></svg>
                    <span class="kanban-text">kanban</span>
                </h1>
            </header>

            <main class="app__content">
                ${() => this.renderSidebar()}
                ${() => this.renderBoard()}

                <button class="show-sidebar-btn"
                    @click="${() => data.hideSidebar = false}">
                    
                    <svg class="show-icon"><use href="#show-icon"></svg>
                    <span class="visually-hidden">Show Sidebar</span>
                </button>
            </main>

            ${() => this.boardFormDialog.render()}
        </div>

        `
    }

    renderSidebar() {
        const { data } = this

        const newBoardBtn = () => this.isFull ? '' : html`
        
        <button class="sidebar__new-board-btn | title title--m"
            @click="${() => this.boardFormDialog.show()}">
            
            <svg class="board-icon"><use href="#board-icon"></svg>
            + Create New Board
        </button>
        
        `

        return html`
            
        <aside class="sidebar" aria-hidden="${() => data.hideSidebar}">
            <div class="sidebar__wrapper">
                <h2 class="sidebar__title | title title--s">
                    ${() => `All boards (${data.boardsIds.length})`}
                </h2>

                <menu class="sidebar__boards">
                    ${() => this.renderBoardList()}

                    <li>${newBoardBtn}</li>
                </menu>

                <button class="sidebar__theme-btn"
                    aria-pressed="${() => data.isDark}"
                    @click="${() => data.isDark = !data.isDark}">
                    
                    <svg class="light-icon"><use href="#light-icon"></svg>
                    <span class="theme-btn__toggler">
                        <span class="visually-hidden">Toggle theme</span>
                    </span>
                    <svg class="dark-icon"><use href="#dark-icon"></svg>
                </button>

                <button class="sidebar__hide-btn | title title--m"
                    @click="${() => data.hideSidebar = true}">
                    
                    <svg class="hide-icon"><use href="#hide-icon"></svg>
                    Hide Sidebar
                </button>
            </div>
        </aside>
        
        `
    }

    renderBoard() {
        const { data } = this

        if (data.boardsIds.length == 0) return html`
        
        <section class="board board--empty">
            <div class="board__new">
                <p class="title title--l">
                    Create a new board to get started.
                </p>
                <button class="btn btn--large btn--primary"
                    @click="${() => this.boardFormDialog.show()}">
                    
                    + Create New Board
                </button>
            </div>
        </section>

        `

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
}