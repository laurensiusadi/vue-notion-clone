import { NodeSelection } from 'prosemirror-state'
import { serializeForClipboard } from 'prosemirror-view/src/clipboard'
import { Extension, Plugin } from 'tiptap'

export default class Drop extends Extension {
  get name() {
    return 'drop'
  }

  get plugins() {
    const brokenClipboardAPI = false

    function blockPosAtCoords(coords, view) {
      const pos = view.posAtCoords(coords)
      let node = view.domAtPos(pos.pos)

      node = node.node
      while (node && node.parentNode) {
        if (node.parentNode.classList.contains('ProseMirror')) { // todo
          break
        }
        node = node.parentNode
      }

      if (node && node.nodeType === 1) {
        const desc = view.docView.nearestDesc(node, true)
        if (!(!desc || desc === view.docView)) {
          return desc.posBefore
        }
      }
      return null
    }

    function dragStart(e, view) {
      if (!e.dataTransfer) return

      const coords = { left: e.clientX + 50, top: e.clientY }
      const pos = blockPosAtCoords(coords, view)
      if (pos != null) {
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)))

        const slice = view.state.selection.content()
        const { dom, text } = serializeForClipboard(view, slice)

        e.dataTransfer.clearData()
        e.dataTransfer.setData(brokenClipboardAPI ? 'Text' : 'text/html', dom.innerHTML)
        if (!brokenClipboardAPI) e.dataTransfer.setData('text/plain', text)

        view.dragging = { slice, move: true }
      }
    }

    let dropElement
    const WIDTH = 24

    return [
      new Plugin({
        view(editorView) {
          dropElement = document.createElement('div')
          dropElement.setAttribute('draggable', 'true')
          dropElement.className = 'editor-drag-handle'
          dropElement.addEventListener('dragstart', e => dragStart(e, editorView))
          dropElement.textContent = '⠿'
          document.body.appendChild(dropElement)
          return {
            update(view, prevState) {
            },
            destroy() {
              removeNode(dropElement)
              dropElement = null
            }
          }
        },
        props: {
          handleDOMEvents: {
            drop(view, event) {
              setTimeout(() => {
                const node = document.querySelector('.ProseMirror-hideselection')
                if (node) {
                  node.classList.remove('ProseMirror-hideselection')
                }
              }, 50)
            },
            mousemove(view, event) {
              const coords = { left: event.clientX + WIDTH + 10, top: event.clientY }
              const pos = view.posAtCoords(coords)
              if (pos) {
                let node = view.domAtPos(pos.pos)

                node = node.node
                if (node instanceof Element) {
                  while (node && node.parentNode) {
                    if (node.parentNode.classList && node.parentNode.classList.contains('ProseMirror')) { // todo
                      break
                    }
                    node = node.parentNode
                  }

                  const rect = absoluteRect(node)
                  if (typeof rect !== 'undefined') {
                    const win = node.ownerDocument.defaultView
                    rect.top += win.pageYOffset
                    rect.left += win.pageXOffset
                    rect.width = WIDTH + 'px'

                    dropElement.style.left = -WIDTH + rect.left + 'px'
                    dropElement.style.top = rect.top + 'px'
                  }
                }
              }
            }
          }
        }
      })
    ]
  }
}

function createRect(rect) {
  if (rect === null) {
    return null
  }
  const newRect = {
    left: rect.left + document.body.scrollLeft,
    top: rect.top + document.body.scrollTop,
    width: rect.width,
    height: rect.height,
    bottom: 0,
    right: 0
  }
  newRect.bottom = newRect.top + newRect.height
  newRect.right = newRect.left + newRect.width
  return newRect
}

function absoluteRect(element) {
  if (element instanceof Element) {
    return createRect(element.getBoundingClientRect())
  }
}

function removeNode(node) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node)
  }
}
