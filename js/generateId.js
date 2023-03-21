const storageKey = 'lastUsedId'
let id = localStorage.getItem(storageKey) || 0

export const generateId = () => {
    localStorage.setItem(storageKey, ++id)
    
    return id
}