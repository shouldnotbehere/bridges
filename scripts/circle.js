class Circle{
    constructor(canvas,x,y,r,id,color,i,j){
        this.x = x;
        this.y = y;
        this.r = r;
        this.id = id;
        this.i = i;
        this.j = j;
        this.color = color;
        this.canvas = canvas;
    }

    draw(color,ratio){
        if(this.canvas.getContext){
            var ctx = canvas.getContext("2d");
            if(ratio==undefined) ratio = 1;
            ctx.fillStyle = (color) ? color : this.color;
            ctx.lineWidth = 2;
            

            ctx.beginPath();
            ctx.arc(this.x,this.y,ratio*this.r,0,2*Math.PI,false);
            ctx.fill();
        }
    }

    radial_animation(ratio,color){
        ratio = ratio || 0;
        this.draw(color,ratio);
        if(ratio<1){
            requestAnimationFrame(()=>{this.radial_animation(ratio+.05,color)});
        }
    }

    erase(){
        if(canvas.getContext){
            var ctx = canvas.getContext("2d");
            ctx.clearRect(this.x-this.r,this.y-this.r,2*(this.r),2*(this.r));
        }
    }

    _testBox(){
        if(canvas.getContext){
            var ctx = canvas.getContext("2d");
            var aux = ctx.lineWidth;
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.x-this.r-aux,this.y-this.r-aux,2*(this.r+aux),2*(this.r+aux));
        }
    }
}