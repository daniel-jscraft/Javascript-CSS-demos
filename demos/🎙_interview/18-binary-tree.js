class Node {
    constructor(val) {
        this.val = val
        this.left = null
        this.right = null
    }
}

class BinaryTree {
    constructor() {
        this.root = null
    }

    insert(val) {
        const newNode = new Node(val)
        this.root === null ? 
            this.root = newNode :
            this._insert(newNode, this.root)
    }

    _insert(newNode, cNode) {
        if (cNode === null) 
            return cNode = newNode
        if (cNode.val > newNode.val) {
            cNode.left === null ?
                cNode.left = newNode :
                this._insert(newNode, cNode.left)
        }
        else {
            cNode.right === null ?
                cNode.right = newNode :
                this._insert(newNode, cNode.right)
        }
    }

    printRooLeftRight(cNode) {
        if (cNode === null) return
        console.log(cNode.val)
        this.printRooLeftRight(cNode.left)
        this.printRooLeftRight(cNode.right)
    }

    _goDeep(cNode, level) {
        if (cNode === null) return
        this.level = Math.max(level, this.level)
        this._goDeep(cNode.left, level + 1)
        this._goDeep(cNode.right, level + 1)
    }

    getTreeLevel() {
        this.level = 0
        this._goDeep(this.root, 0)
        return this.level
    }
}



const myTree = new BinaryTree() 
myTree.insert(10)
myTree.insert(5)
myTree.insert(15)
myTree.insert(3)
myTree.insert(7)
myTree.insert(12)
myTree.insert(18)
myTree.insert(2)
myTree.insert(1)
myTree.insert(0)

myTree.printRooLeftRight(myTree.root)

console.log(myTree.getTreeLevel())

//             10
//     5               15
// 3       7       12      18

// Pre-order Traversal ; (Root → Left → Right):
// 10, 5, 3, 7, 15, 12, 18
    