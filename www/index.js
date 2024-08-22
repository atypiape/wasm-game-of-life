// @ts-check
import { Universe } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

(() => {
    const CELL_SIZE = 5; // px
    const GRID_COLOR = "#CCCCCC";
    const DEAD_COLOR = "#FFFFFF";
    const ALIVE_COLOR = "#000000";
    
    const universe = Universe.new();
    const width = universe.width();
    const height = universe.height();
    
    /** @type {HTMLCanvasElement | null} */
    const canvas = document.querySelector('#game-of-life-canvas');
    if (!canvas) {
        return;
    }
    canvas.height = (CELL_SIZE + 1) * height + 1;
    canvas.width = (CELL_SIZE + 1) * width + 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    const drawGrid = () => {
        ctx.beginPath();
        ctx.strokeStyle = GRID_COLOR;

        // Vertical lines.
        for (let i = 0; i < width; ++i) {
            ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
            ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);

        }

        // Horizontal lines.
        for (let j = 0; j <= height; j++) {
            ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
            ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
        }

        ctx.stroke();
    }

    /**
     * 
     * @param {number} row 
     * @param {number} col 
     * @returns {number}
     */
    const getIndex = (row, col) => {
        return row * width + col;
    }

     /**
     * @param {number} n 第 n 个比特位
     * @param {Uint8Array} arr
     * @returns {boolean}
     */
    const bitIsSet = (n, arr) => {
        const byte = Math.floor(n / 8);
        const mask = 1 << (n % 8);
        return (arr[byte] & mask) === mask;
        // const idx = Math.floor(n / 8); // u8 数组索引
        // const byte = arr[idx]; // 比特位所在字节值
        // const offset = n % 8; // 比特位偏移
        // const mask = 1 << offset; // 偏移生成掩码
        // const result = (byte & mask) === mask; // 与运算去除其余干扰比特，比较结果
        // return result;
    }

    const drawCells = () => {
        const cellsPtr = universe.cells();
        const size = Math.ceil((width * height) / 8);
        const cells = new Uint8Array(memory.buffer, cellsPtr, size);

        ctx.beginPath();

        for (let row = 0; row < height; ++row) {
            for (let col = 0; col < width; ++col) {
                const idx = getIndex(row, col);
                const isSet = bitIsSet(idx, cells);
                ctx.fillStyle = isSet ? ALIVE_COLOR : DEAD_COLOR;
                ctx.fillRect(
                    col * (CELL_SIZE + 1) + 1,
                    row * (CELL_SIZE + 1) + 1,
                    CELL_SIZE,
                    CELL_SIZE
                );
            }
        }

        ctx.stroke();
    }
    
    const renderLoop = () => {
        // debugger;
        universe.tick();
        drawGrid();
        drawCells();
        requestAnimationFrame(renderLoop);
        // setTimeout(() => requestAnimationFrame(renderLoop), 200);
    }
    
    drawGrid();
    drawCells();
    requestAnimationFrame(renderLoop);
})();

