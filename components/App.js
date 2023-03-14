import { Board } from './Board.js'
import { BoardFormDialog } from './dialogs/BoardFormDialog.js'
import { TaskDialog } from './dialogs/TaskDialog.js'
import { TaskFormDialog } from './dialogs/TaskFormDialog.js'
import { ConfirmDialog } from './dialogs/ConfirmDialog.js'
import { loadDataSample } from '/js/loadDataSample.js'
import { reactive, html } from '/js/arrow.js'

export class App {
    boards = {}
    maxBoard = 10
    storageKey = 'app'
    boardFormDialog = new BoardFormDialog()
    taskDialog = new TaskDialog()
    taskFormDialog = new TaskFormDialog()
    confirmDialog = new ConfirmDialog()

    data = reactive({
        boardsIds: [],
        isDark: matchMedia('(prefers-color-scheme: dark)').matches
    })
    keysToSave = ['boardsIds', 'currentBoard', 'hideSidebar', 'isDark']
    
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

        for (const id of boardsIds) this.addBoard({ id, wasSaved: true })
        
        data.currentBoard = currentBoard
        data.hideSidebar = hideSidebar
        
        if (isDark != null) data.isDark = isDark
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => [key, data[key]])
        
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    addBoard({ id, name, columnsNames, wasSaved }) {
        this.boards[id] = new Board({ app: this, id, name, columnsNames, wasSaved })
        
        const { data } = this

        if (!wasSaved) data.currentBoard = id
        
        data.boardsIds.push(id)
    }

    removeBoard(id) {
        const { boardsIds } = this.data

        boardsIds.splice(boardsIds.indexOf(id), 1)

        this.data.currentBoard = boardsIds[0]
        
        const { boards } = this

        boards[id].removeSave()

        delete boards[id]
    }

    render() {
        const { data } = this
        
        const showSidebarBtn = () => data.hideSidebar ? html`
        
        <button @click="${() => data.hideSidebar = false}">Show Sidebar</button>

        ` : ''

        return html`
        
        <div class="app" data-is-dark="${() => data.isDark}">
            <header>
                <h1>kanban</h1>
            </header>

            <main>
                <aside>${() => this.renderSidebar()}</aside>
                
                <section>${() => this.renderBoard()}</section>
            </main>

            ${showSidebarBtn}

            ${() => this.boardFormDialog.render()}
            ${() => this.taskDialog.render()}
            ${() => this.taskFormDialog.render()}
            ${() => this.confirmDialog.render()}
        </div>

        `
    }

    renderSidebar() {
        const { data } = this

        if (data.hideSidebar) return ''

        return html`
            
        <h2>All boards (${() => data.boardsIds.length})</h2>

        <menu class="boards">${() => this.renderBoardList()}</menu>
        
        ${() => this.renderNewBoardBtn()}

        <div class="theme-wrapper" aria-pressed="">
            <button @click="${() => data.isDark = !data.isDark}">
                <span class="visually-hidden">Toggle theme</span>
            </button>
        </div>

        <button @click="${() => data.hideSidebar = true}">Hide Sidebar</button>
        
        `
    }

    renderBoard() {
        const { data } = this
        const { boardsIds } = data

        if (boardsIds.length == 0) return ''

        return this.boards[data.currentBoard].render()
    }

    renderBoardList() {
        const { data } = this

        return data.boardsIds.map(id => {
            return html`
        
            <li class="boards__item"
                aria-current="${() => data.currentBoard == id}">
                
                <button @click="${() => data.currentBoard = id}">
                    ${() => this.boards[id].getName()}
                </button>
            </li>

            `
        })
    }

    renderNewBoardBtn() {
        if (this.data.boardsIds.length == this.maxBoard) return ''
            
        return html`
        
        <button @click="${() => this.boardFormDialog.showNew(this)}">
            Create New Board
        </button>
        
        `
    }
}