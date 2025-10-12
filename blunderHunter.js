const { spawn } = require("child_process");
const { Chess } = require("chess.js");
const fs = require("fs");

const PGN_PATH = "game.pgn"; // change this to your PGN file path
const THINK_TIME_PER_MOVE_MS = 500;
const MULTIPV_COUNT = 5;

function withoutLastMove(moveSequence) {
  return moveSequence.trim().split(' ').slice(0, -1).join(' ')
}

// Read PGN file and parse moves
const pgn = fs.readFileSync(PGN_PATH, "utf8");
const game = new Chess();
game.loadPgn(pgn);

const moves = game.history({ verbose: true });
const puzzles = []
let evaluatingPuzzle = false
let puzzleSequence = ""
let puzzleMoveIndex = 0;
let puzzleFen = "";
let fenWherePuzzleStarts = ""
let puzzleSide = "" // b or w
// const analysisResults = [];

let stockfish;
let currentIndex = 0;

function startStockfish() {
  stockfish = spawn("stockfish");
  stockfish.stdin.setEncoding("utf-8");
  stockfish.stdout.on("data", handleStockfishOutput);
  send("uci");
  send(`setoption name MultiPV value ${MULTIPV_COUNT}`);
}

function getCurrentMoveString(move, currentIndex) {
  const isBlack = currentIndex % 2 === 1;
  return `${Math.ceil((currentIndex + 1) / 2)}. ${isBlack ? '...' : ''}${move}`
}

function parseEval(evalValue) {
  if (typeof evalValue === "string" && evalValue.startsWith("#")) {
    return evalValue.includes("-") ? -10000 : 10000;
  }
  return evalValue;
}

function send(cmd) {
  stockfish.stdin.write(cmd + "\n");
}

let outputBuffer = "";
let currentBoard = new Chess();

function handleStockfishOutput(data) {
    outputBuffer += data.toString();
    const lines = outputBuffer.split("\n");
    const multipv = [];

    for (const line of lines) {
      if (line.includes("multipv")) {
        const match = line.match(/multipv (\d+).*score (cp|mate) (-?\d+).* pv (.+)/);
        if (match) {
          const [, id, type, value, pvMoves] = match;
          multipv[parseInt(id) - 1] = {
            evaluation: type === "cp" ? parseInt(value) : `#${value}`,
            moves: pvMoves.split(" ")
          };
        }
      }

      if (line.startsWith("bestmove")) {
        const variations = multipv.filter(Boolean);
        // analysisResults.push({
        //   move: moves[currentIndex - 1].san,
        //   fen: currentBoard.fen(),
        //   variations,
        // });

        const isBlack = currentIndex % 2 === 1;
        const isWhite = !isBlack;

        const sorted = [...variations].sort((a, b) => (isWhite ? 1 : -1) * (parseEval(b.evaluation) - parseEval(a.evaluation)));
        const topEval = parseEval(sorted[0]?.evaluation ?? 0);
        const secondEval = parseEval(sorted[1]?.evaluation ?? 0);
        const computerMove = sorted[0]?.moves?.[0];
        const gameMove = moves[currentIndex]?.lan;

        const onlyOneGoodMove = Math.abs(topEval - secondEval) > 200 &&
          ((topEval * secondEval) < 0 || Math.abs(secondEval) < 100) &&
          (isWhite ? topEval >= 0 : topEval <= 0) && sorted.length > 1
        if (
            onlyOneGoodMove || (evaluatingPuzzle && currentBoard.turn() !== puzzleSide) && computerMove
        ) {
          if (onlyOneGoodMove) {
            console.log(`🤓 Only one good move: ${getCurrentMoveString(computerMove, evaluatingPuzzle ? puzzleMoveIndex : currentIndex)} vs ${gameMove}`);
          }
          if (!evaluatingPuzzle) {
            console.log('🤖 analysis started')
            puzzleMoveIndex = currentIndex;
            puzzleSide = isBlack ? 'b' : 'w'
            puzzleFen = currentBoard.history({ verbose: true }).at(-1).before
            fenWherePuzzleStarts = currentBoard.fen()
            puzzleSequence += moves[puzzleMoveIndex - 1]?.lan ?? ''
            puzzleSequence += ' '
          }
          evaluatingPuzzle = true;
          // puzzleSequence += `${getCurrentMoveString(computerMove, puzzleMoveIndex)} `
          puzzleSequence += `${computerMove} `

          console.log(`Analyzing move ${getCurrentMoveString(computerMove, puzzleMoveIndex)}`);
          currentBoard.move(computerMove);
          puzzleMoveIndex++;
          outputBuffer = "";
          analyzeMove();
        } else {
          if (evaluatingPuzzle) {
            console.log('🤖 analysis ended')
            if (puzzleMoveIndex - currentIndex > 2) {
              puzzles.push({
                // if there was mate in the puzzle sequence do not remove the last move as the last move was mate
                puzzleSequence: puzzleSequence.includes('#') ? puzzleSequence :  withoutLastMove(puzzleSequence),
                puzzleFen
              })
            }
            evaluatingPuzzle = false;
            puzzleSequence = ""
            puzzleSide = ""
            currentBoard.load(fenWherePuzzleStarts);
            puzzleFen = ""
          }
        }

        if (!evaluatingPuzzle) {
          nextMove();
        }
      }
    }
}

function analyzeMove() {
  const fen = currentBoard.fen();
  send("position fen " + fen);
  send(`go movetime ${THINK_TIME_PER_MOVE_MS}`); // 2 seconds
}

function nextMove() {
  if (currentIndex >= moves.length) {
    stockfish.stdin.end();
    // fs.writeFileSync("analysis.json", JSON.stringify(analysisResults, null, 2));
    // console.log("✅ Analysis complete. Saved to analysis.json");
    fs.writeFileSync("puzzles.json", JSON.stringify(puzzles, null, 2));
    console.log("✅ Puzzles complete. Saved to puzzles.json");
    return;
  }
  const move = moves[currentIndex].san;
  const moveString = getCurrentMoveString(move, currentIndex)
  console.log(`🤔 on move ${moveString}`)
  currentBoard.move(move);
  currentIndex++;
  outputBuffer = ''
  analyzeMove();
}

// Start
startStockfish();
setTimeout(() => {
  currentBoard.reset();
  nextMove();
}, THINK_TIME_PER_MOVE_MS + 200 /* some buffer */); // give UCI init some buffer

