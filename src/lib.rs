mod utils;

use fixedbitset::FixedBitSet;
use std::fmt;
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

// #[wasm_bindgen]
// #[repr(u8)]
// #[derive(Clone, Copy, Debug, PartialEq, Eq)]
// pub enum Cell {
//     Dead = 0,
//     Alive = 1,
// }

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet,
    tick_count: usize,
}

impl Universe {
    /// 获取对应行号列号的细胞索引
    fn get_index(&self, row: u32, col: u32) -> usize {
        (row * self.width + col) as usize
    }

    /// 活着的邻居细胞数
    fn live_neighbor_count(&self, row: u32, col: u32) -> u8 {
        let mut count = 0;
        for detal_row in [self.height - 1, 0, 1] {
            for detal_col in [self.width - 1, 0, 1] {
                if detal_row == 0 && detal_col == 0 {
                    continue;
                }
                let neighbor_row = (row + detal_row) % self.height;
                let neighbor_col = (col + detal_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }

    /// 重置所有宇宙细胞状态
    fn reset_cells(cells: &mut FixedBitSet, size: usize) {
        for i in 0..size {
            cells.set(i, i % 2 == 0 || i % 7 == 0);
        }
    }
}

// 定义公共方法，导出给 JavaScript
#[wasm_bindgen]
impl Universe {
    pub fn new() -> Universe {
        utils::set_panic_hook();

        let width = 64;
        let height = 64;
        let size = (width * height) as usize;
        let mut cells = FixedBitSet::with_capacity(size);
        Self::reset_cells(&mut cells, size);

        // panic!();

        Universe {
            width,
            height,
            cells,
            tick_count: 0,
        }
    }

    /// 重置所有宇宙细胞为初始状态
    pub fn reset(&mut self) {
        let size = (self.width * self.height) as usize;
        Self::reset_cells(&mut self.cells, size);
    }

    /// 重置所有宇宙细胞为死亡状态
    pub fn dead(&mut self) {
        let size = (self.width * self.height) as usize;
        for i in 0..size {
            self.cells.set(i, false);
        }
    }

    /// 文本方式渲染宇宙细胞
    pub fn render(&self) -> String {
        self.to_string()
    }

    /// 获取宇宙的宽度
    pub fn width(&self) -> u32 {
        self.width
    }

    /// 获取宇宙的高度
    pub fn height(&self) -> u32 {
        self.height
    }

    /// 获取当前滴答次数
    pub fn tick_count(&self) -> usize {
        self.tick_count
    }

    /// 设置宇宙的宽度
    ///
    /// 将所有细胞置为死亡状态
    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        self.cells = FixedBitSet::with_capacity((width * self.height) as usize);
    }

    /// 设置宇宙的高度
    ///
    /// 将所有细胞置为死亡状态
    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        self.cells = FixedBitSet::with_capacity((self.width * height) as usize);
    }

    /// 返回宇宙细胞切片指针
    pub fn cells(&self) -> *const usize {
        self.cells.as_slice().as_ptr()
    }

    /// 反转细胞状态
    /// 
    /// 死的变活的，活的变死的
    pub fn toggle_cell(&mut self, row: u32, col: u32) {
        let idx = self.get_index(row, col);
        let set = self.cells[idx];
        self.cells.set(idx, !set);
    }

    /// 在指定单元格中心添加滑翔机
    pub fn add_glider(&mut self, row: u32, col: u32) {
        let h = self.height;
        let w = self.width;
        let nine_grids = [
            // 左上，中上，右上
            (h - 1, w - 1, false), (h - 1, 0, false), (h - 1, 1, true),
            // 左中，中中，右中
            (0, w - 1, true), (0, 0, false), (0, 1, true),
            // 左下，中下，右下
            (1, w - 1, false), (1, 0, true), (1, 1, true),
        ];
        for (detal_row, detal_col, set) in nine_grids {
            let the_row = (row + detal_row) % h;
            let the_col = (col + detal_col) % w; 
            let idx = self.get_index(the_row, the_col);
            self.cells.set(idx, set);
        }
    }

    /// 进行下一次宇宙细胞迭代
    pub fn tick(&mut self) {
        let mut next = self.cells.clone();
        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbor = self.live_neighbor_count(row, col);

                // log!(
                //     "cell[{}, {}] is initially {:?} and has {} live neighbors",
                //     row,
                //     col,
                //     cell,
                //     live_neighbor
                // );

                let next_cell = match (cell, live_neighbor) {
                    (true, x) if x < 2 => false,
                    (true, 2) | (true, 3) => true,
                    (true, x) if x > 3 => false,
                    (false, 3) => true,
                    (otherwise, _) => otherwise,
                };

                // log!("    it becomes {:?}", next_cell);

                next.set(idx, next_cell);
            }
        }
        self.cells = next;
        self.tick_count += 1;
        // log!("tick count: {}", self.tick_count);
    }
}

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == 0 { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }
        Ok(())
    }
}

impl Universe {
    /// Get the dead and alive values of the entrie universe.
    pub fn get_cells(&self) -> &FixedBitSet {
        &self.cells
    }

    /// Set cells to be alive in a universe by passing the row and column
    /// of each cell as an array.
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            self.cells.set(idx, true);
        }
    }
}
