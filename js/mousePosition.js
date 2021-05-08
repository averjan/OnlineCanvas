class MousePosition {
    pointers = [];
    mainPanel = null;
    canvas = null;

    push(mouseElement) {
        this.pointers.push(mouseElement)
    }

    createMousePointer(x, y, id) {
        const m = document.createElement('img');
        m.style.position = 'absolute';
        m.style.zIndex = '2';
        m.style.width = '20px';
        m.style.height = '20px';
        m.setAttribute('src', '/img/pointer/pointer.svg');
        m.setAttribute('id', id);
        this.mainPanel.appendChild(m);
        this.push(m)
        return m;
    }

    setUserMousePosition(x, y, id) {
        let m = this.pointers.find((v) => {
            return v.id === id;
        });
        if (!m) {
            m = this.createMousePointer(x, y, id);
        }

        const canvRect = this.canvas.getBoundingClientRect();
        // let realX = Math.round(x / scrWidth * window.innerWidth)
        // let realY = Math.round(y / scrHeight * window.innerHeight)
        m.style.top = `${canvRect.top + y}px`;
        m.style.left = `${canvRect.left + x}px`;
    }

    deleteUserMousePointer(id) {
        const e = this.pointers.find((v) => {
            return v.id === id;
        });
        if (e) {
            e.remove();
        }

        let index = this.pointers.indexOf(e);
        if (index !== -1) {
            this.pointers.splice(index, 1);
        }
    }
}

let mousePointer = new MousePosition();
export { mousePointer }
