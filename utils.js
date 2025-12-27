// @ts-check
const { spawn } = require("child_process");
const { Chess } = require("chess.js");
const fs = require("fs");

const THINK_TIME_PER_MOVE_MS = 1500;
// const DEPTH = 25;
const MULTIPV_COUNT = 5; // number of lines for stockfish to calculate
const THRESHHOLD = 130

let timeoutId
let outputBuffer = ""
let evaluatingPuzzle = false
let puzzleSequence = ""
let puzzleMoveIndex = 0;
let puzzleFen = "";
let fenWherePuzzleStarts = ""
let puzzleSide = "" // b or w
let FEN_BEING_ANALYZED;
let STOCKFISH_OUTPUT_PER_FEN = []
const gameEvaluation = []

 /**
 * Funtion called by lambda to get puzzles for one chess game
 *
 * @param {string} pgn - game pgn
 * @returns {Promise}
 */
function getPuzzles(pgn, spawn, thinkTimePerMoveMs, relaxTimeMs = 200) {
  const puzzles = []
  const game = new Chess();
  game.loadPgn(pgn);

  const moves = game.history({ verbose: true });

  return new Promise((resolve, reject) => {
    // const stockfish = spawn('./stockfish');
    const stockfish = spawn('stockfish'); // for local
    // stockfish.stdin.setEncoding("utf-8");

    const send = (cmd) => {
      stockfish.stdin.write(cmd + "\n");
    }

    let currentBoard = new Chess();
    let currentIndex = 0;

    const analyzeMove = () => {
      const fen = currentBoard.fen();
      FEN_BEING_ANALYZED = fen;
      send("position fen " + fen);
      send(`go movetime ${thinkTimePerMoveMs}`);
      // send(`go depth ${DEPTH}`);
    };

    const nextMove = () => {
      if (currentIndex >= moves.length) {
        // console.log({ currentIndex, movesLength: moves.length });
        clearTimeout(timeoutId)
        stockfish.stdin.end();

        console.log('gameEvaluation')
        console.log(JSON.stringify(gameEvaluation, null, 4))
        resolve(puzzles)
        
      } else {
        const move = moves[currentIndex].san;
        const moveString = getCurrentMoveString(move, currentIndex)
        // console.log(`🤔 on move ${moveString}`)
        // console.log(`Analyzing move ${getCurrentMoveString(move, currentIndex)}`);
        currentBoard.move(move);
        currentIndex++;
        analyzeMove();
      }
    };

    stockfish.stdout.on("data", (data) => handleStockfishOutput({
      data,
      currentIndex,
      moves,
      currentBoard,
      analyzeMove,
      nextMove,
      puzzles
    }));

    stockfish.stderr.on("data", (data) => {
      console.error("Stockfish error:", data.toString());
    });

    stockfish.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Stockfish exited with code ${code}`));
      }
    });

    // Start UCI setup
    send("uci");
    send(`setoption name MultiPV value ${MULTIPV_COUNT}`);
    timeoutId = setTimeout(() => {
      currentBoard.reset();
      nextMove();
    }, thinkTimePerMoveMs + relaxTimeMs);
  });
}

function withoutLastMove(moveSequence) {
  return moveSequence.trim().split(' ').slice(0, -1).join(' ')
}

 /**
 * Handles Stockfish stream data
 *
 * @param {Object} params 
 * @param {string} params.data
 * @param {number} params.currentIndex - ply
 * @param {Array} params.moves - whether we are evaluating puzzle
 * @param {any} params.currentBoard - ply
 * @param {function} params.analyzeMove - ply
 * @param {function} params.nextMove - ply
 * @param {Array} params.puzzles - list of generated puzzles
 * @returns {void}
 */
function handleStockfishOutput({
  data,
  currentIndex,
  moves,
  currentBoard,
  analyzeMove,
  nextMove,
  puzzles
}) {
    if (!STOCKFISH_OUTPUT_PER_FEN[FEN_BEING_ANALYZED]) {
      STOCKFISH_OUTPUT_PER_FEN[FEN_BEING_ANALYZED] = []
    }
    STOCKFISH_OUTPUT_PER_FEN[FEN_BEING_ANALYZED].push(data.toString())

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
        STOCKFISH_OUTPUT_PER_FEN.push(lines)
        const isMate = line.includes("(none)") && outputBuffer.includes("mate 0")
        outputBuffer = "";
        const variations = multipv.filter(Boolean);

        const isBlack = currentIndex % 2 === 1;
        const isWhite = !isBlack;

        // const sorted = [...variations].sort((a, b) => (isWhite ? 1 : -1) * (parseEval(b.evaluation) - parseEval(a.evaluation)));
        const sorted = [...variations].sort((a, b) => parseEval(b.evaluation) - parseEval(a.evaluation));
        const topEval = parseEval(sorted[0]?.evaluation ?? 0);
        const secondEval = parseEval(sorted[1]?.evaluation ?? 0);
        const computerMove = sorted[0]?.moves?.[0];

        const onlyOneGoodMove = isOnlyMove(topEval, secondEval)
        // const onlyOneGoodMove = Math.abs(topEval - secondEval) > /* 200 */ THRESHHOLD &&
        //   ((topEval * secondEval) <= 0 || Math.abs(secondEval) < 100) &&
        //   topEval >= 0 /* && sorted.length > 1 */
          
          // if (puzzleMoveIndex > 0) {
          //   console.log({
          //     topEval,
          //     secondEval,
          //     currentIndex,
          //     computerMove
          //   })
          // }
          if (computerMove === 'g7f6') {
            console.log({
              topEval,
              secondEval,
              onlyOneGoodMove,
              puzzleMoveIndex,
              fen: currentBoard.fen()
            })
          }
        if (
            onlyOneGoodMove || (evaluatingPuzzle && currentBoard.turn() !== puzzleSide) && computerMove
        ) {
          if (gameEvaluation[gameEvaluation.length - 1].lines) {
            gameEvaluation[gameEvaluation.length - 1].lines.push({
              computerMove,
              topEval,
              secondEval
            })
          } else {
            gameEvaluation[gameEvaluation.length - 1].lines = [{
              computerMove,
              topEval,
              secondEval
            }]
          }
          if (onlyOneGoodMove) {
            // const gameMove = moves[currentIndex]?.lan;
            // console.log(`🤓 Only one good move: ${getCurrentMoveString(computerMove, evaluatingPuzzle ? puzzleMoveIndex : currentIndex)} vs ${gameMove}`);
            // console.log("Lines:\n", JSON.stringify(lines, null, 4))
          }
          if (!evaluatingPuzzle) {
            // console.log('🤖 analysis started')
            puzzleMoveIndex = currentIndex;
            puzzleSide = isBlack ? 'b' : 'w'
            puzzleFen = currentBoard.history({ verbose: true })?.at(-1)?.before
            fenWherePuzzleStarts = currentBoard.fen()
            puzzleSequence += moves[puzzleMoveIndex - 1]?.lan ?? ''
            puzzleSequence += ' '
          }
          evaluatingPuzzle = true;
          // puzzleSequence += `${getCurrentMoveString(computerMove, puzzleMoveIndex)} `
          puzzleSequence += `${computerMove} `

          // console.log(`Analyzing move ${getCurrentMoveString(computerMove, puzzleMoveIndex)}`);
          try {
            currentBoard.move(computerMove);
          } catch(e) {
            console.log({e})
            console.log({ computerMove });
            console.log('fen: ', currentBoard.fen());
            console.log('lines: ', JSON.stringify(lines, null, 4));
          }
          puzzleMoveIndex++;
          analyzeMove();
        } else {
          gameEvaluation.push({gameMove: moves[currentIndex]?.san, topEval , secondEval})
          if (evaluatingPuzzle) {
            if (puzzleMoveIndex - currentIndex > 2) {
              puzzles.push({
                // if there was mate in the puzzle sequence do not remove the last move as the last move was mate
                puzzleSequence: isMate ? puzzleSequence.trim() : withoutLastMove(puzzleSequence),
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

function getCurrentMoveString (move, index) {
  const isBlack = index % 2 === 1;
  return `${Math.ceil((index + 1) / 2)}. ${isBlack ? "..." : ""}${move}`;
};

function parseEval (evalValue) {
  if (typeof evalValue === "string" && evalValue.startsWith("#")) {
    return evalValue.includes("-") ? -10000 : 10000;
  }
  return evalValue;
};

function isOnlyMove(topEval, secondEval) {
  return Math.abs(topEval - secondEval) > /* 200 */ THRESHHOLD &&
          ((topEval * secondEval) <= 0 || Math.abs(secondEval) < 100) &&
          topEval >= 0 /* && sorted.length > 1 */
}

module.exports = {
  isOnlyMove,
  handleStockfishOutput,
  getCurrentMoveString,
  getPuzzles,
  THINK_TIME_PER_MOVE_MS
};


const pgn = fs.readFileSync("game12.pgn", "utf8");

getPuzzles(pgn, spawn, THINK_TIME_PER_MOVE_MS, 200).then((puzzles) => {
  // console.log(JSON.stringify(STOCKFISH_OUTPUT_PER_FEN, null, 4))
  fs.writeFileSync('stockfish_ouput.json', JSON.stringify(STOCKFISH_OUTPUT_PER_FEN, null, 4))
  console.log(puzzles)
})
