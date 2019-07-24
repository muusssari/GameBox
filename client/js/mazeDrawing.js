export default function drawMaze(mazeGrid, ctx){
    if(mazeGrid.length > 0) {
        for(let i = 0; i < mazeGrid.length; i++) {
            let cell = mazeGrid[i];
            drawCell(cell, ctx);
        }
    }
}
function drawCell(cell, ctx) {
    let x = cell.i*cell.w;
    let y = cell.j*cell.w;
    ctx.beginPath();
    if(cell.walls[0]) {
        ctx.moveTo(x,y);
        ctx.lineTo(x+cell.w,y);
    }
    if(cell.walls[1]) {
        ctx.moveTo(x+cell.w,y);
        ctx.lineTo(x+cell.w,y+cell.w);
    }
    if(cell.walls[2]) {
        ctx.moveTo(x+cell.w,y+cell.w);
        ctx.lineTo(x,y+cell.w);
    }
    if(cell.walls[3]) {
        ctx.moveTo(x,y+cell.w);
        ctx.lineTo(x,y);
    }

    if(cell.start) {
        ctx.fillStyle = "#a1dd70";
        ctx.fillRect(x, y, cell.w, cell.w);
    }
    else if(cell.goal) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(x, y, cell.w, cell.w);
    }
    else if(cell.visited) {
        ctx.fillStyle = "#faf5ef";
        ctx.fillRect(x, y, cell.w, cell.w);
    }else {
        ctx.fillStyle = "#525252";
        ctx.fillRect(x, y, cell.w, cell.w);
    }
    ctx.stroke();
}