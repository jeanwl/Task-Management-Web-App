Live site: https://jeanwll.github.io/Task-Management-Web-App/

![Preview](./readme-images/preview.png)

# Frontend Mentor - Kanban task management web app solution

This is a solution to the [Kanban task management web app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/kanban-task-management-web-app-wgQLt-HlbB).

## Table of contents

- [The challenge](#the-challenge)
- [Built with](#built-with)
- [Design additions and adaptation](#design-additions-and-adaptation)
  - [Column Dialog]()
  - [Sticky Column Name]()
  - [New Column Button]()
  - [Small screen without boards]()
  - [Dialog menu position]()
  - [Custom Dialog Select]()
- [Managing localStorage]()
- [Managing Pointer Events]()
- [Drag and Drop Everywhere]()
- [Webmanifest and Service Worker]()
- [Continued development](#continued-development)
- [Author](#author)

### The challenge

Users should be able to:

- View the optimal layout for the app depending on their device's screen size
- See hover states for all interactive elements on the page
- Create, read, update, and delete boards and tasks
- Receive form validations when trying to create/edit boards and tasks
- Mark subtasks as complete and move tasks between columns
- Hide/show the board sidebar
- Toggle the theme between light/dark modes
- Drag and drop tasks to re-order them in a column or move them in different column
- Keep track of any changes after refreshing the browser

## Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- Object Oriented JavaScript
- JS Class as Component - same methodology as my previous project [Job listing](https://github.com/jeanwll/static-job-listings-master)
- [ArrowJS](https://www.arrow-js.com/) - Reactive UI with native JavaScript

## Design additions and adaptation

I took the initiative to rework a few of the provided rules and layout.

### Column Dialog

Current requirement mentions that new columns should be created through the edit board modal, which I thought was really not an intuitive behavior; clicking "New Column" would display a form where the first field is "Board Title".
I created a simple form dedicated to form creation/edition, and additionally providing color selection for each columns.

![Column Dialog](./readme-images/preview.png)

### Sticky Column Name

### New Column Button

### Small screen without boards

### Dialog menu position

### Custom Dialog Select

Use this section to recap over some of your major learnings while working through this project. Writing these out and providing code samples of areas you want to highlight is a great way to reinforce your own knowledge.

To see how you can add code snippets, see below:

```html
<h1>Some HTML code I'm proud of</h1>
```
```css
.proud-of-this-css {
  color: papayawhip;
}
```
```js
const proudOfThisFunc = () => {
  console.log('🎉')
}
```

If you want more help with writing markdown, we'd recommend checking out [The Markdown Guide](https://www.markdownguide.org/) to learn more.

**Note: Delete this note and the content within this section and replace with your own learnings.**

### Continued development

Use this section to outline areas that you want to continue focusing on in future projects. These could be concepts you're still not completely comfortable with or techniques you found useful that you want to refine and perfect.

**Note: Delete this note and the content within this section and replace with your own plans for continued development.**

### Useful resources

- [Example resource 1](https://www.example.com) - This helped me for XYZ reason. I really liked this pattern and will use it going forward.
- [Example resource 2](https://www.example.com) - This is an amazing article which helped me finally understand XYZ. I'd recommend it to anyone still learning this concept.

**Note: Delete this note and replace the list above with resources that helped you during the challenge. These could come in handy for anyone viewing your solution or for yourself when you look back on this project in the future.**

## Author

- Website - [Jean Will](https://jeanwill.me)
- Frontend Mentor - [@jeanwll](https://www.frontendmentor.io/profile/jeanwll)