import React, { useCallback, useRef, useState } from 'react';
import produce from 'immer';
import "./App.css";

const numRows = 30;
const numColumns = 40;
const speed = 2000;

const seedGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(Array.from(Array(numColumns), () => (Math.random() > 0.7 ? 1 : 0)));
  }
  return rows;
};

const resetGrid = () =>
  Array.from({ length: numRows }).map(() =>
    Array.from({ length: numColumns }).fill(0),
  );

//operations for checking neighbors across the grid
const operations = [
  [1, 1],
  [0, 1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [1, -1]
];

//eslint-ignore-next-line
const countNeighbors = (grid: any[][], x: number, y: number) => {
  return operations.reduce((acc, [i, j]) => {
    const row = (x + i + numRows) % numRows;
    const col = (y + j + numColumns) % numColumns;
    acc += grid[row][col];
    return acc;
  }, 0);
};

const App = () => {
  const [grid, setGrid] = useState(() => resetGrid());

  const [generation, setGeneration] = useState(0);
  const [running, setRunning] = useState(false);

  const generationRef = useRef(generation);
  generationRef.current = generation;

  const runningCount = useRef(running);
  runningCount.current = running;

  const play = useCallback(() => {
    setInterval(() => {
      if (!runningCount.current) {
        return;
      }

      setGrid((currentGrid) =>
        produce(currentGrid, (gridCopy) => {
          for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numColumns; j++) {
              const count = countNeighbors(currentGrid, i, j);
              if (currentGrid[i][j] === 1 && (count < 2 || count > 3))
                gridCopy[i][j] = 0;
              if (!currentGrid[i][j] && count === 3) gridCopy[i][j] = 1;
            }
          }
        }),
      );
      setGeneration(++generationRef.current);
    }, speed);
  }, []);

  return (
    <div class="page-container">
      <h1>Game of Life</h1>
      <div class="description-container">
        <div class="description">
          <div>
            <h2>Instructions</h2>
            <ul>
              <li>Click anywhere in the grid to give "life" to a cell.</li>
              <li>Click Start to enable the simulation.</li>
              <li>
                Seed will populate with random patterns.
            </li>
            </ul>
          </div>
        </div>
        <div class="description">
          <div>
            <h2>Rules:</h2>
            <ul>
              <li>Any live cell with two or three live neighbours survives.</li>
              <li>Any dead cell with three live neighbours becomes a live cell.</li>
              <li>All other live cells die in the next generation. Similarly, all other dead cells stay dead.</li>
            </ul>
          </div>
        </div>
      </div>
      <p>Generation Count: {generation}</p>
      <div class="button-container">
        <button
          class="button"
          onClick={() => {
            setRunning(!running);
            runningCount.current = !running;
            if (!running) {
              play();
            }
          }}
        >{!running ? 'Start' : 'Stop'}
        </button>
        <button
          class="button"
          onClick={() => {
            setGrid(resetGrid());
            setGeneration(0);
          }}
        >Clear
      </button>
        <button
          class="button"
          onClick={() => {
            setGrid(seedGrid());
          }}
        >Seed
      </button>
      </div>
      <div
        class="grid-container"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${numColumns}, 20px)`, }} >
        {grid.map((rows, rowIdx) =>
          rows.map((col, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              onClick={() => {
                const newGrid = produce(grid, (gridCopy) => {
                  gridCopy[rowIdx][colIdx] = grid[rowIdx][colIdx] ? 0 : 1;
                });
                setGrid(newGrid);
              }}
              style={{
                width: 20,
                height: 20,
                backgroundColor: grid[rowIdx][colIdx] ? 'cyan' : '#eee',
                border: '1px solid black',
              }}
            />
          )),
        )}
      </div>
    </div>
  );
};

export default App;