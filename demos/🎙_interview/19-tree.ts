// 👋 run with npx tsx 19-tree.ts

type NodeRef = TNode | null

class TNode {
    left: NodeRef
    right: NodeRef
    val: number

    constructor(val: number) {
        this.val = val
        this.right = null
        this.left = null
    }
}

class BTree {
    root: NodeRef
    level: number

    constructor() {
        this.root = null
    }

    private _insert(newNode: TNode, cNode:TNode): void {
        if (newNode.val < cNode.val) {
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

    private _goDeep( cNode: NodeRef, level: number): void {
        if (cNode === null) return
        this.level = Math.max(this.level, level)
        this._goDeep(cNode.left, level + 1)
        this._goDeep(cNode.right, level + 1)
    }

    insert(val:number): void {
        let newNode = new TNode(val)
        this.root === null ? 
            this.root = newNode :
            this._insert(newNode, this.root)
    }

    getLevel(): number {
        this.level = 0
        this._goDeep(this.root, 0)
        return this.level
    }
}

const bTree = new BTree()

bTree.insert(10)
bTree.insert(5)
bTree.insert(15)
bTree.insert(3)
bTree.insert(7)
bTree.insert(12)
bTree.insert(18)
bTree.insert(2)
bTree.insert(1)
bTree.insert(0)

console.log(bTree.getLevel())


console.log('done')