const { spawn } = require("child_process");
const fs = require("fs");
const { Chess } = require("chess.js");

const PGN_PATH = "game.pgn"; // change this to your PGN file path
const THINK_TIME_PER_MOVE_MS = 500;

// Read PGN file and parse moves
const pgn = fs.readFileSync(PGN_PATH, "utf8");
const game = new Chess();
game.loadPgn(pgn);

const moves = game.history({verbose: true}); // SAN moves
const analysisResults = [];

let stockfish;
let currentIndex = 0;

function startStockfish() {
  stockfish = spawn("stockfish");
  stockfish.stdin.setEncoding("utf-8");
  stockfish.stdout.on("data", handleStockfishOutput);
  send("uci");
  send("setoption name MultiPV value 5");
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
        const [, id, type, value, moves] = match;
        multipv[parseInt(id) - 1] = {
          evaluation: type === "cp" ? parseInt(value) : `#${value}`,
          moves: moves.split(" ")
        };
      }
    }

    if (line.startsWith("bestmove")) {
      // Save the current move analysis
      const variations = multipv.filter(Boolean)
      analysisResults.push({
        move: moves[currentIndex - 1].san,
        fen: currentBoard.fen(),
        variations 
      });
      const variationsSortedByBestMove = variations.sort((a, b) => parseEval(b.evaluation) - parseEval(a.evaluation))
      const topMoveEval = variationsSortedByBestMove?.[0]?.evaluation ?? 0
      const secondMoveEval = variationsSortedByBestMove?.[1]?.evaluation ?? 0
      if (!Number.isFinite(topMoveEval) || !Number.isFinite(secondMoveEval)) {
        console.warn(`⚠️ Invalid evaluation at move ${currentIndex}`);
        nextMove();
        return;
      }
      const computerMove = variationsSortedByBestMove?.[0]?.moves?.[0];
      const gameMove = moves[currentIndex]?.lan;
      if (Math.abs(topMoveEval - secondMoveEval) > 200 && Number.isFinite(topMoveEval) && computerMove !== gameMove) {
        console.log(`🤓 Found only one good move ${getCurrentMoveString(variationsSortedByBestMove[0].moves[0], currentIndex)}. Move in the game ${moves[currentIndex]?.lan}`)
      }

      nextMove(); // analyze next
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
    fs.writeFileSync("analysis.json", JSON.stringify(analysisResults, null, 2));
    console.log("✅ Analysis complete. Saved to analysis.json");
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

