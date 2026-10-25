import type { CSSProperties } from "vue";
import type { BentoCell } from "@/components/shared/bento/types";

type Geometry = Pick<BentoCell, "x" | "y" | "width" | "height">;

export function cellOffset(units: number, size: number, gap: number) {
    return units * (size + gap);
}

export function cellSpan(units: number, size: number, gap: number) {
    return units * size + gap * (units - 1);
}

export function gridSpan(columns: number, size: number, gap: number) {
    return cellSpan(columns, size, gap);
}

export function gridHeight(cells: BentoCell[], size: number, gap: number) {
    const rows = cells.reduce(
        (bottom, cell) => Math.max(bottom, cell.y + cell.height),
        0,
    );

    return cellSpan(rows, size, gap);
}

export function isOverlapping(a: BentoCell, b: BentoCell) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export function hasOverlap(cells: BentoCell[]) {
    return cells.some((cell, index) =>
        cells.slice(index + 1).some((other) => isOverlapping(cell, other)),
    );
}

export function isOutOfBounds(cells: BentoCell[], columns: number) {
    return cells.some(
        (cell) => cell.x < 0 || cell.y < 0 || cell.x + cell.width > columns,
    );
}

function sortByPosition(cells: BentoCell[]) {
    return [...cells].sort((a, b) => a.y - b.y || a.x - b.x);
}

function fits(
    occupied: boolean[][],
    cell: BentoCell,
    row: number,
    col: number,
    columns: number,
) {
    for (let r = row; r < row + cell.height; r++) {
        for (let c = col; c < col + cell.width; c++) {
            if (c >= columns || occupied[r]?.[c] !== false) {
                return false;
            }
        }
    }

    return true;
}

function findFirstFit(occupied: boolean[][], cell: BentoCell, columns: number) {
    for (let row = 0; row < occupied.length; row++) {
        for (let col = 0; col < columns; col++) {
            if (fits(occupied, cell, row, col, columns)) {
                return { row, col };
            }
        }
    }

    return null;
}

function markOccupied(occupied: boolean[][], cell: BentoCell) {
    for (let r = cell.y; r < cell.y + cell.height; r++) {
        for (let c = cell.x; c < cell.x + cell.width; c++) {
            const line = occupied[r];

            if (line !== undefined && c < line.length) {
                line[c] = true;
            }
        }
    }
}

export function repackCells(cells: BentoCell[], columns: number) {
    const rows = cells.reduce((total, cell) => total + cell.y + cell.height, 0);
    const occupied = Array.from({ length: rows }, () => {
        return Array.from<boolean>({ length: columns }).fill(false);
    });

    for (const cell of sortByPosition(cells)) {
        const spot = findFirstFit(occupied, cell, columns);

        if (spot === null) {
            continue;
        }

        cell.x = spot.col;
        cell.y = spot.row;
        markOccupied(occupied, cell);
    }
}

function buildOccupancy(cells: BentoCell[], columns: number) {
    const rows = cells.reduce(
        (bottom, cell) => Math.max(bottom, cell.y + cell.height),
        0,
    );
    const occupied = Array.from({ length: rows }, () => {
        return Array.from<boolean>({ length: columns }).fill(false);
    });

    for (const cell of cells) {
        markOccupied(occupied, cell);
    }

    return occupied;
}

function canGrowRight(occupied: boolean[][], cell: BentoCell, columns: number) {
    const col = cell.x + cell.width;

    if (col >= columns) {
        return false;
    }

    for (let r = cell.y; r < cell.y + cell.height; r++) {
        if (occupied[r]?.[col] !== false) {
            return false;
        }
    }

    return true;
}

export function fillRightGaps(cells: BentoCell[], columns: number) {
    const occupied = buildOccupancy(cells, columns);

    for (const cell of sortByPosition(cells)) {
        while (canGrowRight(occupied, cell, columns)) {
            cell.width++;
            markOccupied(occupied, cell);
        }
    }
}

export function repackIfNeeded(cells: BentoCell[], columns: number) {
    if (hasOverlap(cells) || isOutOfBounds(cells, columns)) {
        repackCells(cells, columns);
    }
}

export function positionStyle(
    cell: Geometry,
    size: number,
    gap: number,
): CSSProperties {
    return {
        position: "absolute",
        transform: `translate3d(${cellOffset(cell.x, size, gap)}px, ${cellOffset(cell.y, size, gap)}px, 0)`,
        width: `${cellSpan(cell.width, size, gap)}px`,
        height: `${cellSpan(cell.height, size, gap)}px`,
    };
}
