function dibujar_tablero(){
    var canvas = document.getElementById("canvas");
    var w = canvas.width, h = canvas.height;

    var acmR=0, acmB=0;
    var r = 10*(w/400), d = 40*(w/400);
    var left = (w-8*d)/2;
    var top = (h-8*d)/2;

    dots = new Array(9);
    for(let i=0;i<9;i++){
        dots[i] = new Array(9);
    }

    for(let j=0;j<9;j++){
        for(let i=0;i<9;i++){    
            if(i%2!==j%2){
                var circle = new Circle(canvas,d*j+left,d*i+top,r,((j%2) ? acmR++ : acmB++),((j%2) ? "red" : "blue"),i,j);    
                dots[i][j] = circle;
                circle.radial_animation();
            }
        }    
    }
    return dots;
}

function draw_line(c1,c2,ratio){
    var canvas = document.getElementById("canvas");
    if(canvas.getContext){
        var ctx = canvas.getContext("2d");
        ctx.lineWidth = 4*(canvas.width/400);
        ctx.strokeStyle = c1.color;
        ctx.beginPath();
        ctx.moveTo(c1.x,c1.y);
        ctx.lineTo(c1.x+ratio*(c2.x-c1.x),c1.y+ratio*(c2.y-c1.y));
        ctx.stroke();
    }
}

function animate_line(c1,c2,ratio){
    ratio = ratio || 0;
    draw_line(c1,c2,ratio);
    if(ratio<1){
        requestAnimationFrame(()=>{animate_line(c1,c2,ratio+.05)});
    }
}

function intersect(circle, mouse){
    return ((circle) ? ((circle.x-mouse.x)**2+(circle.y-mouse.y)**2 < circle.r**2) : false);
}

function find_selected_circleed(turn,mouse){
    for(let i = 1*(turn.player=="blue");i<9;i+=2){
        for(let j = (i+1)%2;j<9;j+=2){
            if(intersect(turn.dots[i][j],mouse)){
                return turn.dots[i][j];
            }
        }
    }
    return undefined;
}

function is_move_valid(turn,c1,c2){
    if(c1 && c2 && c1.color==c2.color && c1.color==turn.player){
        return ((Math.abs(c1.i-c2.i)+Math.abs(c1.j-c2.j)==2) ? (turn.dots[(c1.i+c2.i)/2][(c1.j+c2.j)/2]==undefined) : false);
    }
    return false;
}

function click_event(turn,e){
    var rect = document.getElementById("canvas").getBoundingClientRect();
    var mouse = {x: e.clientX-rect.left, y: e.clientY-rect.top};
    var target = find_selected_circleed(turn,mouse);

    if(!turn.last_clicked && target){
        turn.last_clicked = target;
        turn.last_clicked.erase();
        turn.last_clicked.radial_animation(0,"blue");
    }
    else if(turn.last_clicked && turn.last_clicked==target){
        turn.last_clicked.erase();
        turn.last_clicked.draw();
        turn.last_clicked = undefined;
    }
    
    if(is_move_valid(turn,turn.last_clicked,target)){
        make_move(turn,{x: turn.last_clicked, y: target});
    }
}


function make_move(turn, next_move){
    var i = next_move.x.i, li = next_move.y.i, j = next_move.x.j, lj = next_move.y.j;
    turn.dsu[turn.player].union(next_move.x.id,next_move.y.id);
    turn.dots[(i+li)/2][(j+lj)/2] = 0;
    
    next_move.x.draw();
    next_move.y.draw();
    animate_line(next_move.x,next_move.y);

    if(turn.dsu[turn.player].find(0)==turn.dsu[turn.player].find(19)){
        blue_Win_screen();
    }

    turn.player = ((turn.player=="red") ? "blue" :"red");
    turn.last_clicked = undefined;

    if(turn.player=="blue"){
        if(li==i){
            last_move = {x: (turn.dots[li+1]) ? turn.dots[li+1][(j+lj)/2] : undefined ,y: (turn.dots[li-1]) ? turn.dots[li-1][(j+lj)/2] : undefined}
        }
        else{
            last_move = {x: (turn.dots[(li+i)/2][j-1]) ? turn.dots[(li+i)/2][j-1] : undefined ,y: (turn.dots[(li+i)/2][j+1]) ? turn.dots[(li+i)/2][j+1] : undefined}
        }
        bot_select_move(last_move);
    }
}

function bot_select_move(last_move){
    if(!last_move.x || !last_move.y){
        turn.player = "red"
        return;
    }

    var ni = ((last_move.x.id<4) ? 0 : (last_move.x.id>=16) ?  19 : last_move.x.id)
    var nj = ((last_move.y.id<4) ? 0 : (last_move.y.id>=16) ?  19 : last_move.y.id)
    var alg  = new Dsu(20); var t
    
    //find out in which tree the edge is
    t = ((t1[ni].indexOf(nj)!=-1) ? t1 : (t2[ni].indexOf(nj)!=-1) ? t2 : undefined)

    //remove the edge
    t[ni].splice(t[ni].indexOf(nj),1)
    t[nj].splice(t[nj].indexOf(ni),1)

    //construct a dsu
    for(let i=0;i<4;i++){
        alg.union(0,0+i);
        alg.union(19,19-i)
    }
    for(let i=4;i<16;i++){
        for(j of t[i]){
            alg.union(i, j);
        }
    }

    var possible_moves = [];
    for(let i = 1;i<9;i+=2){
        for(let j = 0;j<9;j+=2){
            let k = turn.dots[i][j].id;
            if(k%4!=3 && alg.find(k)!=alg.find(k+1) && is_move_valid(turn,turn.dots[i][j],turn.dots[i+2][j])){
                possible_moves.push({x: turn.dots[i][j], y: turn.dots[i+2][j]});
            }
            if(alg.find(k)!=alg.find(k+4) && is_move_valid(turn,turn.dots[i][j],turn.dots[i][j+2])){
                possible_moves.push({x: turn.dots[i][j], y: turn.dots[i][j+2]});
            }
        }
    }

    next_move = possible_moves[Math.floor(Math.random()*possible_moves.length)]
    make_move(turn, next_move)

    next_move.x = ((next_move.x.id<4) ? 0 : (next_move.x.id>=16) ?  19 : next_move.x.id)
    next_move.y = ((next_move.y.id<4) ? 0 : (next_move.y.id>=16) ?  19 : next_move.y.id)

    t[next_move.x].push(next_move.y)
    t[next_move.y].push(next_move.x)
}


var turn = {player: "blue",last_clicked: undefined, candidates: undefined, dsu: {blue: new Dsu(20), red: new Dsu(20)}, dots: dibujar_tablero()};
for(let i=0;i<4;i++){
    turn.dsu.red.union(0,0+5*i);
    turn.dsu.red.union(19,19-5*i);
    turn.dsu.blue.union(0,0+i);
    turn.dsu.blue.union(19,19-i)
}

document.getElementById("canvas").addEventListener("click",(e)=>click_event(turn,e));

var last_move = {x: turn.dots[1][0], y: turn.dots[7][8]}
var t1 = [[7], undefined, undefined, undefined, [5], [4, 6], [5, 10], [0, 11], [9], [8, 13], [6, 14], [7, 15], [19], [9, 19], [10, 19], [11, 19], undefined, undefined, undefined, [12,13,14,15]]
var t2 = [[4, 5, 6, 19], undefined, undefined, undefined, [0, 8], [0, 9], [0, 7], [6], [4, 12], [5, 10],[9, 11], [10], [8,13], [12,14],[13,15],[14],undefined, undefined, undefined, [0]]
bot_select_move(last_move)

function blue_Win_screen(){
    var canvas = document.getElementById("canvas");
    var winMsg = document.getElementById("win-message");
    winMsg.style.visibility = "visible";
    winMsg.style.opacity = "1";
}