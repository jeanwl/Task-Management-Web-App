import { Subtask } from './Subtask.js'
import { TaskDialog } from './dialogs/TaskDialog.js'
import { reactive, html } from '../arrow.js'

export class Task {
    subtasks = {}
    keysToSave = ['title', 'description', 'subtasksIds']

    taskDialog = new TaskDialog(this)

    data = reactive({
        subtasksIds: [],
        description: '',
        dragging: false
    })

    constructor({ id, title, description, isNew, column }) {
        this.column = column
        this.board = this.column.board
        this.id = id
        this.storageKey = `task_${id}`

        if (!isNew) this.load()

        const { data } = this

        for (const key of this.keysToSave) {
            data.$on(key, () => this.save())
        }

        if (!isNew) return

        data.title = title
        data.description = description
    }

    getTitle() {
        return this.data.title
    }

    getDescription() {
        return this.data.description
    }

    getSubtasks() {
        const { subtasks } = this
        
        return this.data.subtasksIds.map(id => subtasks[id])
    }

    getNCompleted() {
        return this.getSubtasks().filter(subtask => (
            subtask.getIsCompleted()
        )).length
    }

    load() {
        const savedData = localStorage.getItem(this.storageKey)
        
        const { title, description, subtasksIds } = JSON.parse(savedData)
        
        for (const id of subtasksIds) this.addSubtask({ id })

        const { data } = this
        
        data.title = title
        data.description = description
    }

    save() {
        const { data } = this
        const entries = this.keysToSave.map(key => [key, data[key]])
        const save = Object.fromEntries(entries)

        localStorage.setItem(this.storageKey, JSON.stringify(save))
    }

    addSubtask({ id, title, isNew }) {
        const subtask = new Subtask({ id, title, isNew, task: this })
        
        this.subtasks[id] = subtask
        this.data.subtasksIds.push(id)
    }

    removeSubtask(id) {
        const { subtasks } = this
        const { subtasksIds } = this.data

        subtasksIds.splice(subtasksIds.indexOf(id), 1)
        subtasks[id].removeSave()
        delete subtasks[id]
    }

    moveSubtask({ subtask, to }) {
        const { subtasksIds } = this.data
        const id = subtask.id

        subtasksIds.splice(subtasksIds.indexOf(id), 1)
        subtasksIds.splice(to, 0, id)
    }

    edit({ title, description, subtasks: editedSubtasks }) {
        const { subtasks, data } = this
        const { subtasksIds } = data

        data.title = title
        data.description = description
        
        editedSubtasks.forEach(({ id, title, isNew }, i) => {
            if (isNew) {
                this.addSubtask({ id, title, isNew })
                this.moveSubtask({ subtask: subtasks[id], to: i })
                
                return
            }
            
            const subtask = subtasks[id]
            subtask.setTitle(title)

            if (subtasksIds.indexOf(id) == i) return

            this.moveSubtask({ subtask, to: i })
        })

        const nToRemove = subtasksIds.length - editedSubtasks.length

        if (nToRemove < 1) return

        const idsToRemove = subtasksIds.slice(nToRemove * -1)

        for (const id of idsToRemove) {
            this.removeSubtask(id)
        }
    }

    removeSave() {
        for (const subtask of Object.values(this.subtasks)) {
            subtask.removeSave()
        }

        localStorage.removeItem(this.storageKey)
    }

    cancelPress = () => {
        removeEventListener('pointermove', this.cancelPress)
        removeEventListener('pointerup', this.cancelPress)
        removeEventListener('pointercancel', this.cancelPress)
        
        clearTimeout(this.pressTimeout)
    }

    onPointerDown(e) {
        this.pressTimeout = setTimeout(() => this.onPress(e), 100)
        
        addEventListener('pointermove', this.cancelPress)
        addEventListener('pointerup', this.cancelPress)
        addEventListener('pointercancel', this.cancelPress)
    }

    onPress(e) {
        const { data } = this
        const { target } = e
        
        this.cancelPress()
        
        data.dragging = true

        const { x, y } = target.getBoundingClientRect()
        data.posX = x
        data.posY = y
        
        this.board.onTaskDragStart({ task: this })

        addEventListener('pointermove', this.onDrag)
        addEventListener('pointerup', this.onRelease)
        addEventListener('pointercancel', this.onRelease)
    }

    onDrag = e => {
        const { data } = this

        data.posX += e.movementX
        data.posY += e.movementY
        
        this.board.onTaskDrag(e)
    }

    onRelease = () => {
        removeEventListener('pointermove', this.onDrag)
        removeEventListener('pointerup', this.onRelease)
        removeEventListener('pointercancel', this.onRelease)
        
        this.data.dragging = false

        this.board.onTaskDragStop()
    }

    render({ followPointer } = {}) {
        const { data } = this
        const nSubtasks = data.subtasksIds.length

        const completed = () => nSubtasks ? html`
        
        <p class="task__completed | text text--m">
            ${() => `${this.getNCompleted()} of ${nSubtasks} subtasks`}
        </p>

        ` : ''

        const style = () => !!followPointer && `
            translate: ${data.posX}px ${data.posY}px
        `

        return html`
        
        <li class="task-item" data-id="${this.id}" data-column-id="${this.column.id}">
            <div class="task${followPointer ? ' task--follow-pointer' : ''}"
                style="${style}"
                data-dragging="${() => !followPointer && data.dragging}"
                @pointerdown="${e => this.onPointerDown(e)}"
                @click="${() => !data.dragging && this.taskDialog.show(this)}"
                @touchmove="${e => data.dragging && e.preventDefault() }">
            
                <h4 class="task__title | title title--m">
                    ${() => data.title}
                </h4>
                
                ${completed}

                <div class="task__top-hitbox"></div>
            </div>

            <div>
                ${() => this.taskDialog.render()}
            </div>
        </li>

        `
    }
}