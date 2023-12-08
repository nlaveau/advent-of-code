



export class TreeNode<T> {
    private left: TreeNode<T> | null = null;
    private right: TreeNode<T> | null = null;
    private parent: TreeNode<T> | null = null;

    constructor(public value: T|null) {}
    static createLeaf<T>(value: T) {
        return new TreeNode<T>(value);
    }

    public addLeftNode(node: TreeNode<T>) {
        this.left = node;
        this.left.parent = this;
    }

    public addRightNode(node: TreeNode<T>) {
        this.right = node;
        this.right.parent = this;
    }

    public popLeftNode() {
        let node = this.left;
        if (node !== null) {
            node.parent = null;
        }
        this.left = null;
        return node;
    }

    public popRightNode() {
        let node = this.right;
        if (node !== null) {
            node.parent = null;
        }
        this.right = null;
        return node;
    }

    public getParent() {
        return this.parent;
    }

    public getLeftNode() {
        return this.left;
    }

    public getRightNode() {
        return this.right;
    }

    public isLeaf() {
        return (this.left === null) && (this.right === null);
    }

    public getRightMostChild(): TreeNode<T>|null {
        if (this.right === null) {
            return (this.left === null) ? this : this.left.getRightMostChild();
        } else {
            return this.right.getRightMostChild();
        }
    }

    public getLeftMostChild(): TreeNode<T>|null {
        if (this.left === null) {
            return (this.right === null) ? this : this.right.getLeftMostChild();
        } else {
            return this.left.getLeftMostChild();
        }
    }

    public getNextLeftNode(): TreeNode<T>|null {
        let node:TreeNode<T> = this;
        while (node.parent !== null) {
            if (node.parent.right === node) {
                if (node.parent.left !== null) {
                    return node.parent.left.getRightMostChild();
                } else {
                    throw 'unbalanced tree';
                }
            }
            node = node.parent;
        }
        return null;
    }

    public getNextRightNode(): TreeNode<T>|null {
        let node:TreeNode<T> = this;
        while (node.parent !== null) {
            if (node.parent.left === node) {
                if (node.parent.right !== null) {
                    return node.parent.right.getLeftMostChild();
                } else {
                    throw 'unbalanced tree';
                }
            }
            node = node.parent;
        }
        return null;
    }

    public getDepth(): number {
        if (this.left === null && this.right === null) return 0;
        return Math.max(this.left?.getDepth() || 0, this.right?.getDepth() || 0)+1;
    }

}

