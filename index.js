const { spawn } = require("child_process");
const { Chess } = require("chess.js");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const THINK_TIME_PER_MOVE_MS = 500;
const MULTIPV_COUNT = 5;

const client = new DynamoDBClient({ region: "eu-central-1" });
const docClient = DynamoDBDocumentClient.from(client);

function withoutLastMove(moveSequence) {
  return moveSequence.trim().split(' ').slice(0, -1).join(' ')
}

exports.handler = async (event) => {
  const record = event.Records[0];
  const body = JSON.parse(record.body);
  const pgn = body.pgn;
  if (!pgn) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing PGN in event" }),
    };
  }

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

        const pgnHeaders = game.getHeaders()
        const date = pgnHeaders.Date || 'unknown-date'
        const time = pgnHeaders.UTCTime || 'unknown-time'
        const eloWhite = Number(pgnHeaders.WhiteElo) || 0
        const eloBlack = Number(pgnHeaders.BlackElo) || 0

        const event = pgnHeaders.Event || 'unknown-event'
        console.log('saving to DynamoDB', JSON.stringify(puzzles))
        Promise.all(puzzles.map(puzzle => {
          const params = {
            TableName: 'chessPuzzles',
            Item: {
              Event: event,
              DateTime: `${date}T${time}`,
              Puzzle: `${puzzle.puzzleFen},${puzzle.puzzleSequence}`,
              CombinedElo: eloWhite + eloBlack
            },
          };
          const command = new PutCommand(params);
          return docClient.send(command).catch(e => {
            console.log('💾 Error while sending command', JSON.stringify(command))
            console.log('Error: ', e)
          })
        })).then(() => {
          resolve({
            statusCode: 200,
            // body: JSON.stringify(analysisResults),
            body: JSON.stringify(puzzles)
          });
        })
      } else {
        const move = moves[currentIndex].san;
        console.log(`Analyzing move ${getCurrentMoveString(move, currentIndex)}`);
        currentBoard.move(move);
        currentIndex++;
        outputBuffer = "";
        analyzeMove();
      }
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
          // analysisResults.push({
          //   move: moves[currentIndex - 1].san,
          //   fen: currentBoard.fen(),
          //   variations,
          // });

          const sorted = [...variations].sort((a, b) => parseEval(b.evaluation) - parseEval(a.evaluation));
          const topEval = parseEval(sorted[0]?.evaluation ?? 0);
          const secondEval = parseEval(sorted[1]?.evaluation ?? 0);
          const computerMove = sorted[0]?.moves?.[0];
          const gameMove = moves[currentIndex]?.lan;

          const onlyOneGoodMove = Math.abs(topEval - secondEval) > 200 && ((topEval * secondEval) < 0 || Math.abs(secondEval) < 100)
          if (
              onlyOneGoodMove || (evaluatingPuzzle && currentBoard.turn() !== puzzleSide)
          ) {
            if (onlyOneGoodMove) {
              console.log(`🤓 Only one good move: ${getCurrentMoveString(computerMove, evaluatingPuzzle ? puzzleMoveIndex : currentIndex)} vs ${gameMove}`);
            }
            if (!evaluatingPuzzle) {
              console.log('🤖 analysis started')
              puzzleMoveIndex = currentIndex;
              const isBlack = currentIndex % 2 === 1;
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
                  puzzleSequence: withoutLastMove(puzzleSequence),
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
