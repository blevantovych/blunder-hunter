const { spawn } = require("child_process");
const { Chess } = require("chess.js");
const path = require("path");

const THINK_TIME_PER_MOVE_MS = 500;
const MULTIPV_COUNT = 5;

exports.handler = async (event) => {
  const pgn = event.pgn;
  if (!pgn) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing PGN in event" }),
    };
  }

  const game = new Chess();
  game.loadPgn(pgn);
  const moves = game.history({ verbose: true });
  const analysisResults = [];

  return new Promise((resolve, reject) => {
    const stockfish = spawn('./stockfish');
    stockfish.stdin.setEncoding("utf-8");

    const send = (cmd) => stockfish.stdin.write(cmd + "\n");

    let outputBuffer = "";
    let currentBoard = new Chess();
    let currentIndex = 0;

    const parseEval = (evalValue) => {
      if (typeof evalValue === "string" && evalValue.startsWith("#")) {
        return evalValue.includes("-") ? -10000 : 10000;
      }
      return evalValue;
    };

    const getCurrentMoveString = (move, index) => {
      const isBlack = index % 2 === 1;
      return `${Math.ceil((index + 1) / 2)}. ${isBlack ? "..." : ""}${move}`;
    };

    const analyzeMove = () => {
      const fen = currentBoard.fen();
      send("position fen " + fen);
      send(`go movetime ${THINK_TIME_PER_MOVE_MS}`);
    };

    const nextMove = () => {
      if (currentIndex >= moves.length) {
        stockfish.stdin.end();
        resolve({
          statusCode: 200,
          body: JSON.stringify(analysisResults),
        });
        return;
      }
      const move = moves[currentIndex].san;
      console.log(`Analyzing move ${getCurrentMoveString(move, currentIndex)}`);
      currentBoard.move(move);
      currentIndex++;
      outputBuffer = "";
      analyzeMove();
    };

    stockfish.stdout.on("data", (data) => {
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
              moves: pvMoves.split(" "),
            };
          }
        }

        if (line.startsWith("bestmove")) {
          const variations = multipv.filter(Boolean);
          analysisResults.push({
            move: moves[currentIndex - 1].san,
            fen: currentBoard.fen(),
            variations,
          });

          const sorted = [...variations].sort((a, b) => parseEval(b.evaluation) - parseEval(a.evaluation));
          const topEval = parseEval(sorted[0]?.evaluation ?? 0);
          const secondEval = parseEval(sorted[1]?.evaluation ?? 0);
          const computerMove = sorted[0]?.moves?.[0];
          const gameMove = moves[currentIndex]?.lan;

          if (Math.abs(topEval - secondEval) > 200 && computerMove !== gameMove) {
            console.log(`🤓 Only one good move: ${getCurrentMoveString(computerMove, currentIndex)} vs ${gameMove}`);
          }

          nextMove();
        }
      }
    });

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
    setTimeout(() => {
      currentBoard.reset();
      nextMove();
    }, THINK_TIME_PER_MOVE_MS + 200);
  });
};
