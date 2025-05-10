const { spawn } = require("child_process");

exports.handler = async (event) => {
  return new Promise((resolve, reject) => {
    const engine = spawn("stockfish");

    let output = "";

    engine.stdout.on("data", (data) => {
      output += data.toString();
      if (data.toString().includes("readyok")) {
        engine.stdin.write("quit\n");
      }
    });

    engine.stdin.write("uci\n");
    engine.stdin.write("isready\n");

    engine.on("exit", () => {
      resolve({
        statusCode: 200,
        body: JSON.stringify({ output }),
      });
    });

    engine.on("error", (err) => {
      reject({
        statusCode: 500,
        body: JSON.stringify({ error: err.message }),
      });
    });
  });
};

