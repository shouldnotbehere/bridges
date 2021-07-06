class Dsu{
    constructor(n){
        this.parent = new Array(n);
        this.rank = new Array(n);
        for(let i=0;i<n;i++){
            this.parent[i] = i;
            this.rank[i] = 0;
        }
    }

    find(x){
        return ((this.parent[x]==x) ? x : this.parent[x] = this.find(this.parent[x]));
    }

    union(x,y){
        x = this.find(x);
        y = this.find(y);
        if(x!=y){
            if(this.rank[x]>this.rank[y]){
                this.parent[y] = x;
            }
            else{
                this.parent[x] = y;
                this.rank[y] += (this.rank[x]==this.rank[y]);
            }
        }
    }
}