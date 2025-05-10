// const { spawn } = require('child_process');
const { Chess } = require("chess.js");

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

  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 200, body: {moves: game.history().length}
    })
  })

  // const stockfish = spawn('./stockfish');
  //
  // stockfish.stdin.write('uci\n');
  // stockfish.stdin.write('quit\n');
  //
  // stockfish.stdout.on('data', (data) => {
  //   console.log(`Stockfish says: ${data}`);
  // });
  //
  // return { statusCode: 200, body: 'Stockfish ran.', event: JSON.stringify(event) };
};
