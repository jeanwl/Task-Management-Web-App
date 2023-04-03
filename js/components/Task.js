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

    onPointerDown(e) {
        this.isPointerDown = true

        const rect = e.target.closest('.task').getBoundingClientRect()
        this.offsetX = e.clientX - rect.x
        this.offsetY = e.clientY - rect.y

        this.pointerMoveHandler = e => this.onPointerMove(e)
        this.pointerUpHandler = () => this.onPointerUp()

        addEventListener('pointermove', this.pointerMoveHandler)
        addEventListener('pointerup', this.pointerUpHandler)
        addEventListener('pointercancel', this.pointerUpHandler)
        addEventListener('lostpointercapture', this.pointerUpHandler)
    }

    onPointerUp() {
        removeEventListener('pointermove', this.pointerMoveHandler)
        removeEventListener('pointerup', this.pointerUpHandler)
        removeEventListener('pointercancel', this.pointerUpHandler)
        removeEventListener('lostpointercapture', this.pointerUpHandler)
        
        this.isPointerDown = false
        this.data.dragging = false
        
        this.board.onTaskDragStop()
    }

    onPointerMove(e) {
        if (!this.isPointerDown) return
        
        const { data } = this

        if (!data.dragging) {
            data.dragging = true
            
            this.board.onTaskDragStart({ task: this })
        }
        const { clientX, clientY } = e

        data.posX = clientX - this.offsetX
        data.posY = clientY - this.offsetY
        
        this.board.onTaskDragMove({ clientX, clientY })
    }

    onPointerOver(e) {
        if (!this.draggedTask) return
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
        
        <li>
            <div class="task${followPointer ? ' task--follow-pointer' : ''}"
                style="${style}"
                data-dragging="${() => data.dragging}"
                @pointerdown="${e => this.onPointerDown(e)}"
                @click="${() => this.taskDialog.show(this)}"
                @mousedown="${e => e.stopPropagation()}">
            
                <h4 class="task__title | title title--m">
                    ${() => data.title}
                </h4>
                
                ${completed}
            </div>

            <div @mousedown="${e => e.stopPropagation()}">
                ${() => this.taskDialog.render()}
            </div>
        </li>

        `
    }
}