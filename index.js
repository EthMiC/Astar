var canv = document.createElement("canvas");
canv.style.border = "1px solid black";
canv.width = 800;
canv.height = 600;
document.body.appendChild(canv);
var ctx = canv.getContext("2d");
var mousePos = {
    x: 0,
    y: 0
}

var nextType = "";
var clicked = false;
var brushSize = 100;
var stepped = false;

const canvPos = () => {
    const rect = canv.getBoundingClientRect();
    return {
        left: rect.left,
        top: rect.top
    };
}

document.addEventListener("mousemove", function (e) {
    mousePos.x = e.clientX - canvPos().left;
    mousePos.y = e.clientY - canvPos().top;
})

document.addEventListener("keydown", function (e) {
    switch (e.key) {
        case "1":
            nextType = "";
            break;
        case "2":
            nextType = "wall";
            break;
        case "3":
            nextType = "start";
            break;
        case "4":
            nextType = "target";
            break;
    }
    if (e.key == " ") {
        for (let i = 0; i < tiles.length; i++) {
            for (let j = 0; j < tiles[i].length; j++) {
                switch (tiles[i][j].state) {
                    case "visited":
                    case "searching":
                    case "path":
                        tiles[i][j].state = "";
                        tiles[i][j].gCost = undefined;
                        tiles[i][j].hCost = undefined;
                        tiles[i][j].fCost = undefined;
                        break;
                }
            }
        }
        activeTiles = [startPos];
        search();
    }
})

canv.onmousedown = function () {
    clicked = true;
}

canv.onmouseup = function () {
    clicked = false;
}

document.addEventListener("wheel", function (e) {
    brushSize = brushSize - e.deltaY / 100;
})

class Tile {
    constructor(_x, _y, _sx, _sy, _state) {
        this.x = _x;
        this.y = _y;
        this.sx = _sx;
        this.sy = _sy;
        this.state = _state;
        this.gCost;
        this.hCost;
        this.fCost;
        this.clr = "White";
    }
    render() {
        switch (this.state) {
            case "searching":
                if (activeTiles.some(e => e.x == this.x / this.sx && e.y == this.y / this.sy)) {
                    this.clr = "Orange";
                } else {
                    this.clr = "Crimson";
                }
                break;
            case "visited":
                this.clr = "Yellow";
                break;
            case "path":
                this.clr = "Green";
                break;
            case "wall":
                this.clr = "Black";
                break;
            case "target":
                this.clr = "Red";
                break;
            case "start":
                this.clr = "Blue";
                break;
            case "":
                this.clr =  "White";
                break;
        }
        ctx.fillStyle = this.clr;
        ctx.fillRect(this.x, this.y, this.sx, this.sy);
        // ctx.strokeStyle = "Black";
        // ctx.strokeRect(this.x, this.y, this.sx, this.sy);
        // if (this.gCost != undefined) {
        //     ctx.strokeText(this.gCost, this.x + 5, this.y + 10);
        // }
        // if (this.hCost != undefined) {
        //     ctx.strokeText(this.hCost, this.x + this.sx / 2 + 5, this.y + 10);
        // }
        // if (this.fCost != undefined) {
        //     ctx.strokeText(this.fCost, this.x + this.sx / 2 - 2.5, this.y + this.sy / 2 + 10);
        // }
    }
    calculateCost(_gCost) {
        // this.gCost = Math.sqrt(2 * Math.pow(Math.min(Math.abs((this.x / tileSize) - startPos.x), Math.abs((this.y / tileSize) - startPos.y)), 2)) + (Math.max(Math.abs((this.x / tileSize) - startPos.x), Math.abs((this.y / tileSize) - startPos.y)) - Math.min(Math.abs((this.x / tileSize) - startPos.x), Math.abs((this.y / tileSize) - startPos.y)));
        // this.hCost = Math.sqrt(2 * Math.pow(Math.min(Math.abs((this.x / tileSize) - targetPos.x), Math.abs((this.y / tileSize) - targetPos.y)), 2)) + (Math.max(Math.abs((this.x / tileSize) - targetPos.x), Math.abs((this.y / tileSize) - targetPos.y)) - Math.min(Math.abs((this.x / tileSize) - targetPos.x), Math.abs((this.y / tileSize) - targetPos.y)));
        // this.gCost = Math.sqrt(Math.pow((this.x / tileSize) - startPos.x, 2) + Math.pow((this.y / tileSize) - startPos.y, 2));
        // this.hCost = Math.sqrt(Math.pow((this.x / tileSize) - targetPos.x, 2) + Math.pow((this.y / tileSize) - targetPos.y, 2));
        this.gCost = this.gCost != undefined ? Math.min(_gCost, this.gCost) : _gCost;
        this.hCost = Math.round(((1.4 * Math.min(Math.abs((this.x / tileSize) - targetPos.x), Math.abs((this.y / tileSize) - targetPos.y))) + (Math.max(Math.abs((this.x / tileSize) - targetPos.x), Math.abs((this.y / tileSize) - targetPos.y)) - Math.min(Math.abs((this.x / tileSize) - targetPos.x), Math.abs((this.y / tileSize) - targetPos.y)))) * 10);
        this.fCost = this.gCost + this.hCost;
    }
}

var tiles = [];
var activeTiles = [];
var tileLookup = [];
var tileSize = 5;

var startPos = {
    x: 0,
    y: 0
}
var targetPos = {
    x: 0,
    y: 0
}

function setupTile() {
    for (let x = 0; x < canv.width / tileSize; x++) {
        tiles.push([]);
        for (let y = 0; y < canv.height / tileSize; y++) {
            tiles[x].push(new Tile(x * tileSize, y * tileSize, tileSize, tileSize, ""));
        }
    }
}

setupTile();
setInterval(() => {
    update();
    render();
});

function render() {
    ctx.clearRect(0, 0, canv.width, canv.height);
    for (let i = 0; i < tiles.length; i++) {
        for (let j = 0; j < tiles[i].length; j++) {
            tiles[i][j].render();
        }
    }
    ctx.beginPath();
    ctx.arc(mousePos.x, mousePos.y, Math.pow(1.025, brushSize), 0, 2 * Math.PI);
    ctx.stroke();
}

function update() {
    if (clicked) {
        if (nextType == "start") {
            startPos = { "x": Math.floor(mousePos.x / tileSize), "y": Math.floor(mousePos.y / tileSize) };
            console.log(startPos);
            let tile = tiles[startPos.x][startPos.y];
            tile.state = nextType;
            tile.gCost = 0;
            for (let i = 0; i < tiles.length; i++) {
                for (let j = 0; j < tiles[i].length; j++) {
                    if (tiles[i][j].state == "start" && tiles[i][j] != tile) {
                        tiles[i][j].state = "";
                        tiles[i][j].gCost = undefined;
                        tiles[i][j].hCost = undefined;
                        tiles[i][j].fCost = undefined;
                    }
                }
            }
        }
        else if (nextType == "target") {
            targetPos = { "x": Math.floor(mousePos.x / tileSize), "y": Math.floor(mousePos.y / tileSize) };
            console.log(targetPos);
            let tile = tiles[targetPos.x][targetPos.y];
            tile.state = nextType;
            for (let i = 0; i < tiles.length; i++) {
                for (let j = 0; j < tiles[i].length; j++) {
                    if (tiles[i][j].state == "target" && tiles[i][j] != tile) {
                        tiles[i][j].state = "";
                    }
                }
            }
        }
        else {
            const brushSizePow = Math.pow(1.025, brushSize);
            for (let x = Math.max(0, Math.floor((mousePos.x - brushSizePow) / tileSize));
                x <= Math.min(tiles.length - 1, Math.floor((mousePos.x + brushSizePow) / tileSize));
                x++) {
                for (let y = Math.max(0, Math.floor((mousePos.y - brushSizePow) / tileSize));
                    y <= Math.min(tiles[x].length - 1, Math.floor((mousePos.y + brushSizePow) / tileSize));
                    y++) {
                    const dx = Math.abs(x * tileSize + tileSize / 2 - mousePos.x);
                    const dy = Math.abs(y * tileSize + tileSize / 2 - mousePos.y);
                    if (Math.sqrt(dx * dx + dy * dy) <= brushSizePow) {
                        tiles[x][y].state = nextType;
                    }
                }
            }
        }
    }
}

function search() {
    while (true) {
        let bufferTiles = [];
        let activeTile = activeTiles[0];
        activeTiles.shift();
        for (let j = 0; j < 8; j++) {
            let next = { "x": activeTile.x + [-1, -1, -1, 0, 0, 1, 1, 1][j], "y": activeTile.y + [-1, 0, 1, -1, 1, -1, 0, 1][j] };
            let _gCostDelta = [14, 10, 14, 10, 10, 14, 10, 14][j];
            if (next.x < 0 || next.x >= tiles.length || next.y < 0 || next.y >= tiles[0].length) {
                continue;
            }
            switch (tiles[next.x][next.y].state) {
                case "target":
                    tiles[activeTile.x][activeTile.y].state = tiles[activeTile.x][activeTile.y].state == "start" ? "start" : "visited";
                    return drawPath(next);
                case "":
                    tiles[next.x][next.y].state = "searching";
                    tiles[next.x][next.y].calculateCost(tiles[activeTile.x][activeTile.y].gCost + _gCostDelta);
                    bufferTiles.push(next);
                    break;
                case "searching":
                    tiles[next.x][next.y].calculateCost(tiles[activeTile.x][activeTile.y].gCost + _gCostDelta);
                    break;
            }
        }
        tiles[activeTile.x][activeTile.y].state = tiles[activeTile.x][activeTile.y].state == "start" ? "start" : "visited";
        activeTiles.push(...bufferTiles);
        let i = 0;
        while (i < activeTiles.length - 1) {
            let tile = activeTiles[i];
            let nextTile = activeTiles[i + 1];
            if (tiles[tile.x][tile.y].fCost < tiles[nextTile.x][nextTile.y].fCost ||
                (tiles[tile.x][tile.y].fCost == tiles[nextTile.x][nextTile.y].fCost &&
                    tiles[tile.x][tile.y].hCost <= tiles[nextTile.x][nextTile.y].hCost)) {
                i++;
            }
            else {
                [activeTiles[i], activeTiles[i + 1]] = [activeTiles[i + 1], activeTiles[i]];
                i = 0;
            }
        }
        // console.log(activeTiles.map(tile => tiles[tile.x][tile.y].fCost + " " + tiles[tile.x][tile.y].hCost));
    }
}

function drawPath(_current) {
    let current = _current;
    while (true) {
        let bestTile;
        for (let j = 0; j < 8; j++) {
            let previous = { "x": current.x + [-1, -1, -1, 0, 0, 1, 1, 1][j], "y": current.y + [-1, 0, 1, -1, 1, -1, 0, 1][j] };
            if (previous.x < 0 || previous.x >= tiles.length || previous.y < 0 || previous.y >= tiles[previous.x].length) {
                continue;
            }
            if (tiles[previous.x][previous.y].state == "visited") {
                if (bestTile == undefined) {
                    bestTile = previous;
                    continue;
                }
                bestTile = tiles[bestTile.x][bestTile.y].gCost < tiles[previous.x][previous.y].gCost ? bestTile : previous;
            }
            else if (tiles[previous.x][previous.y].state == "start") {
                return;
            }
        }
        console.log(current);
        current = bestTile;
        tiles[bestTile.x][bestTile.y].state = "path";
    }
}