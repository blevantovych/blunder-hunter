// @ts-check
const { Chess } = require("chess.js");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { PutCommand, DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const { getPuzzles } = require('./utils');

const client = new DynamoDBClient({ region: "eu-central-1" });
const docClient = DynamoDBDocumentClient.from(client);

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
  const pgnHeaders = game.getHeaders()
  const date = pgnHeaders.Date || 'unknown-date'
  const time = pgnHeaders.UTCTime || 'unknown-time'
  const eloWhite = Number(pgnHeaders.WhiteElo) || 0
  const eloBlack = Number(pgnHeaders.BlackElo) || 0
  const Site = pgnHeaders.Site || ""
  const White = pgnHeaders.White || ""
  const Black = pgnHeaders.Black || ""
  const Event = pgnHeaders.Event || ""

  console.log(`Analyzing game ${pgnHeaders.Site}`);


  const puzzles = await getPuzzles(pgn)

  await Promise.all(puzzles.map(puzzle => {
    const params = {
      TableName: 'chessPuzzles',
      Item: {
        Event: Event,
        DateTime: `${date}T${time}`,
        Puzzle: `${puzzle.puzzleFen},${puzzle.puzzleSequence}`,
        CombinedElo: eloWhite + eloBlack,
        Site,
        White,
        Black,
      },
    };
    const command = new PutCommand(params);
    return docClient.send(command).catch(e => {
      console.log('💾 Error while sending command', JSON.stringify(command))
      console.log('Error: ', e)
    })
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(puzzles)
  };
};

