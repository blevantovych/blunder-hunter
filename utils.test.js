import {handleStockfishOutput, getPuzzles} from './utils.js'
import { Chess } from "chess.js";
import {test, expect, vi} from 'vitest'
// import stockfishOutput from './stockfish_output_delimiter.json' assert { type: 'json' };
import stockfishOutput from './game_12_updated.json' assert { type: 'json' };
import stockfishOutputWithMate from './game_with_mate_puzzle.json' assert { type: 'json' };
import {readFileSync} from 'node:fs'


// const moves = [
//      {
//       color: 'w',
//       from: 'd2',
//       to: 'd4',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'b',
//       san: 'd4',
//       lan: 'd2d4',
//       before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
//       after: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1'
//     },
//      {
//       color: 'b',
//       from: 'g8',
//       to: 'f6',
//       piece: 'n',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Nf6',
//       lan: 'g8f6',
//       before: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
//       after: 'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2'
//     },
//      {
//       color: 'w',
//       from: 'c2',
//       to: 'c4',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'b',
//       san: 'c4',
//       lan: 'c2c4',
//       before: 'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2',
//       after: 'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2'
//     },
//      {
//       color: 'b',
//       from: 'e7',
//       to: 'e6',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'e6',
//       lan: 'e7e6',
//       before: 'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
//       after: 'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3'
//     },
//      {
//       color: 'w',
//       from: 'g2',
//       to: 'g3',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'g3',
//       lan: 'g2g3',
//       before: 'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
//       after: 'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3'
//     },
//      {
//       color: 'b',
//       from: 'd7',
//       to: 'd5',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'b',
//       san: 'd5',
//       lan: 'd7d5',
//       before: 'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3',
//       after: 'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq - 0 4'
//     },
//      {
//       color: 'w',
//       from: 'f1',
//       to: 'g2',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bg2',
//       lan: 'f1g2',
//       before: 'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PP1P/RNBQKBNR w KQkq - 0 4',
//       after: 'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq - 1 4'
//     },
//      {
//       color: 'b',
//       from: 'f8',
//       to: 'b4',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bb4+',
//       lan: 'f8b4',
//       before: 'rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/6P1/PP2PPBP/RNBQK1NR b KQkq - 1 4',
//       after: 'rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/6P1/PP2PPBP/RNBQK1NR w KQkq - 2 5'
//     },
//      {
//       color: 'w',
//       from: 'b1',
//       to: 'd2',
//       piece: 'n',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Nd2',
//       lan: 'b1d2',
//       before: 'rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/6P1/PP2PPBP/RNBQK1NR w KQkq - 2 5',
//       after: 'rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/6P1/PP1NPPBP/R1BQK1NR b KQkq - 3 5'
//     },
//      {
//       color: 'b',
//       from: 'e8',
//       to: 'g8',
//       piece: 'k',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'k',
//       san: 'O-O',
//       lan: 'e8g8',
//       before: 'rnbqk2r/ppp2ppp/4pn2/3p4/1bPP4/6P1/PP1NPPBP/R1BQK1NR b KQkq - 3 5',
//       after: 'rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/6P1/PP1NPPBP/R1BQK1NR w KQ - 4 6'
//     },
//      {
//       color: 'w',
//       from: 'g1',
//       to: 'f3',
//       piece: 'n',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Nf3',
//       lan: 'g1f3',
//       before: 'rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/6P1/PP1NPPBP/R1BQK1NR w KQ - 4 6',
//       after: 'rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/5NP1/PP1NPPBP/R1BQK2R b KQ - 5 6'
//     },
//      {
//       color: 'b',
//       from: 'b7',
//       to: 'b6',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'b6',
//       lan: 'b7b6',
//       before: 'rnbq1rk1/ppp2ppp/4pn2/3p4/1bPP4/5NP1/PP1NPPBP/R1BQK2R b KQ - 5 6',
//       after: 'rnbq1rk1/p1p2ppp/1p2pn2/3p4/1bPP4/5NP1/PP1NPPBP/R1BQK2R w KQ - 0 7'
//     },
//      {
//       color: 'w',
//       from: 'a2',
//       to: 'a3',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'a3',
//       lan: 'a2a3',
//       before: 'rnbq1rk1/p1p2ppp/1p2pn2/3p4/1bPP4/5NP1/PP1NPPBP/R1BQK2R w KQ - 0 7',
//       after: 'rnbq1rk1/p1p2ppp/1p2pn2/3p4/1bPP4/P4NP1/1P1NPPBP/R1BQK2R b KQ - 0 7'
//     },
//      {
//       color: 'b',
//       from: 'b4',
//       to: 'd6',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bd6',
//       lan: 'b4d6',
//       before: 'rnbq1rk1/p1p2ppp/1p2pn2/3p4/1bPP4/P4NP1/1P1NPPBP/R1BQK2R b KQ - 0 7',
//       after: 'rnbq1rk1/p1p2ppp/1p1bpn2/3p4/2PP4/P4NP1/1P1NPPBP/R1BQK2R w KQ - 1 8'
//     },
//      {
//       color: 'w',
//       from: 'b2',
//       to: 'b4',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'b',
//       san: 'b4',
//       lan: 'b2b4',
//       before: 'rnbq1rk1/p1p2ppp/1p1bpn2/3p4/2PP4/P4NP1/1P1NPPBP/R1BQK2R w KQ - 1 8',
//       after: 'rnbq1rk1/p1p2ppp/1p1bpn2/3p4/1PPP4/P4NP1/3NPPBP/R1BQK2R b KQ - 0 8'
//     },
//      {
//       color: 'b',
//       from: 'a7',
//       to: 'a5',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'b',
//       san: 'a5',
//       lan: 'a7a5',
//       before: 'rnbq1rk1/p1p2ppp/1p1bpn2/3p4/1PPP4/P4NP1/3NPPBP/R1BQK2R b KQ - 0 8',
//       after: 'rnbq1rk1/2p2ppp/1p1bpn2/p2p4/1PPP4/P4NP1/3NPPBP/R1BQK2R w KQ - 0 9'
//     },
//      {
//       color: 'w',
//       from: 'c4',
//       to: 'c5',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'c5',
//       lan: 'c4c5',
//       before: 'rnbq1rk1/2p2ppp/1p1bpn2/p2p4/1PPP4/P4NP1/3NPPBP/R1BQK2R w KQ - 0 9',
//       after: 'rnbq1rk1/2p2ppp/1p1bpn2/p1Pp4/1P1P4/P4NP1/3NPPBP/R1BQK2R b KQ - 0 9'
//     },
//      {
//       color: 'b',
//       from: 'd6',
//       to: 'e7',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Be7',
//       lan: 'd6e7',
//       before: 'rnbq1rk1/2p2ppp/1p1bpn2/p1Pp4/1P1P4/P4NP1/3NPPBP/R1BQK2R b KQ - 0 9',
//       after: 'rnbq1rk1/2p1bppp/1p2pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/R1BQK2R w KQ - 1 10'
//     },
//      {
//       color: 'w',
//       from: 'a1',
//       to: 'b1',
//       piece: 'r',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Rb1',
//       lan: 'a1b1',
//       before: 'rnbq1rk1/2p1bppp/1p2pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/R1BQK2R w KQ - 1 10',
//       after: 'rnbq1rk1/2p1bppp/1p2pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQK2R b K - 2 10'
//     },
//      {
//       color: 'b',
//       from: 'c7',
//       to: 'c6',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'c6',
//       lan: 'c7c6',
//       before: 'rnbq1rk1/2p1bppp/1p2pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQK2R b K - 2 10',
//       after: 'rnbq1rk1/4bppp/1pp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQK2R w K - 0 11'
//     },
//      {
//       color: 'w',
//       from: 'e1',
//       to: 'g1',
//       piece: 'k',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'k',
//       san: 'O-O',
//       lan: 'e1g1',
//       before: 'rnbq1rk1/4bppp/1pp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQK2R w K - 0 11',
//       after: 'rnbq1rk1/4bppp/1pp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQ1RK1 b - - 1 11'
//     },
//      {
//       color: 'b',
//       from: 'b8',
//       to: 'd7',
//       piece: 'n',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Nbd7',
//       lan: 'b8d7',
//       before: 'rnbq1rk1/4bppp/1pp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQ1RK1 b - - 1 11',
//       after: 'r1bq1rk1/3nbppp/1pp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQ1RK1 w - - 2 12'
//     },
//      {
//       color: 'w',
//       from: 'f1',
//       to: 'e1',
//       piece: 'r',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Re1',
//       lan: 'f1e1',
//       before: 'r1bq1rk1/3nbppp/1pp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQ1RK1 w - - 2 12',
//       after: 'r1bq1rk1/3nbppp/1pp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQR1K1 b - - 3 12'
//     },
//      {
//       color: 'b',
//       from: 'c8',
//       to: 'a6',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Ba6',
//       lan: 'c8a6',
//       before: 'r1bq1rk1/3nbppp/1pp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQR1K1 b - - 3 12',
//       after: 'r2q1rk1/3nbppp/bpp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQR1K1 w - - 4 13'
//     },
//      {
//       color: 'w',
//       from: 'e2',
//       to: 'e4',
//       piece: 'p',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'b',
//       san: 'e4',
//       lan: 'e2e4',
//       before: 'r2q1rk1/3nbppp/bpp1pn2/p1Pp4/1P1P4/P4NP1/3NPPBP/1RBQR1K1 w - - 4 13',
//       after: 'r2q1rk1/3nbppp/bpp1pn2/p1Pp4/1P1PP3/P4NP1/3N1PBP/1RBQR1K1 b - - 0 13'
//     },
//      {
//       color: 'b',
//       from: 'a6',
//       to: 'd3',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bd3',
//       lan: 'a6d3',
//       before: 'r2q1rk1/3nbppp/bpp1pn2/p1Pp4/1P1PP3/P4NP1/3N1PBP/1RBQR1K1 b - - 0 13',
//       after: 'r2q1rk1/3nbppp/1pp1pn2/p1Pp4/1P1PP3/P2b1NP1/3N1PBP/1RBQR1K1 w - - 1 14'
//     },
//      {
//       color: 'w',
//       from: 'e4',
//       to: 'd5',
//       piece: 'p',
//       captured: 'p',
//       promotion: undefined,
//       flags: 'c',
//       san: 'exd5',
//       lan: 'e4d5',
//       before: 'r2q1rk1/3nbppp/1pp1pn2/p1Pp4/1P1PP3/P2b1NP1/3N1PBP/1RBQR1K1 w - - 1 14',
//       after: 'r2q1rk1/3nbppp/1pp1pn2/p1PP4/1P1P4/P2b1NP1/3N1PBP/1RBQR1K1 b - - 0 14'
//     },
//      {
//       color: 'b',
//       from: 'f6',
//       to: 'd5',
//       piece: 'n',
//       captured: 'p',
//       promotion: undefined,
//       flags: 'c',
//       san: 'Nxd5',
//       lan: 'f6d5',
//       before: 'r2q1rk1/3nbppp/1pp1pn2/p1PP4/1P1P4/P2b1NP1/3N1PBP/1RBQR1K1 b - - 0 14',
//       after: 'r2q1rk1/3nbppp/1pp1p3/p1Pn4/1P1P4/P2b1NP1/3N1PBP/1RBQR1K1 w - - 0 15'
//     },
//      {
//       color: 'w',
//       from: 'b1',
//       to: 'b3',
//       piece: 'r',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Rb3',
//       lan: 'b1b3',
//       before: 'r2q1rk1/3nbppp/1pp1p3/p1Pn4/1P1P4/P2b1NP1/3N1PBP/1RBQR1K1 w - - 0 15',
//       after: 'r2q1rk1/3nbppp/1pp1p3/p1Pn4/1P1P4/PR1b1NP1/3N1PBP/2BQR1K1 b - - 1 15'
//     },
//      {
//       color: 'b',
//       from: 'd3',
//       to: 'b5',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bb5',
//       lan: 'd3b5',
//       before: 'r2q1rk1/3nbppp/1pp1p3/p1Pn4/1P1P4/PR1b1NP1/3N1PBP/2BQR1K1 b - - 1 15',
//       after: 'r2q1rk1/3nbppp/1pp1p3/pbPn4/1P1P4/PR3NP1/3N1PBP/2BQR1K1 w - - 2 16'
//     },
//      {
//       color: 'w',
//       from: 'b3',
//       to: 'b2',
//       piece: 'r',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Rb2',
//       lan: 'b3b2',
//       before: 'r2q1rk1/3nbppp/1pp1p3/pbPn4/1P1P4/PR3NP1/3N1PBP/2BQR1K1 w - - 2 16',
//       after: 'r2q1rk1/3nbppp/1pp1p3/pbPn4/1P1P4/P4NP1/1R1N1PBP/2BQR1K1 b - - 3 16'
//     },
//      {
//       color: 'b',
//       from: 'a5',
//       to: 'b4',
//       piece: 'p',
//       captured: 'p',
//       promotion: undefined,
//       flags: 'c',
//       san: 'axb4',
//       lan: 'a5b4',
//       before: 'r2q1rk1/3nbppp/1pp1p3/pbPn4/1P1P4/P4NP1/1R1N1PBP/2BQR1K1 b - - 3 16',
//       after: 'r2q1rk1/3nbppp/1pp1p3/1bPn4/1p1P4/P4NP1/1R1N1PBP/2BQR1K1 w - - 0 17'
//     },
//      {
//       color: 'w',
//       from: 'a3',
//       to: 'b4',
//       piece: 'p',
//       captured: 'p',
//       promotion: undefined,
//       flags: 'c',
//       san: 'axb4',
//       lan: 'a3b4',
//       before: 'r2q1rk1/3nbppp/1pp1p3/1bPn4/1p1P4/P4NP1/1R1N1PBP/2BQR1K1 w - - 0 17',
//       after: 'r2q1rk1/3nbppp/1pp1p3/1bPn4/1P1P4/5NP1/1R1N1PBP/2BQR1K1 b - - 0 17'
//     },
//      {
//       color: 'b',
//       from: 'e7',
//       to: 'f6',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bf6',
//       lan: 'e7f6',
//       before: 'r2q1rk1/3nbppp/1pp1p3/1bPn4/1P1P4/5NP1/1R1N1PBP/2BQR1K1 b - - 0 17',
//       after: 'r2q1rk1/3n1ppp/1pp1pb2/1bPn4/1P1P4/5NP1/1R1N1PBP/2BQR1K1 w - - 1 18'
//     },
//      {
//       color: 'w',
//       from: 'd2',
//       to: 'e4',
//       piece: 'n',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Ne4',
//       lan: 'd2e4',
//       before: 'r2q1rk1/3n1ppp/1pp1pb2/1bPn4/1P1P4/5NP1/1R1N1PBP/2BQR1K1 w - - 1 18',
//       after: 'r2q1rk1/3n1ppp/1pp1pb2/1bPn4/1P1PN3/5NP1/1R3PBP/2BQR1K1 b - - 2 18'
//     },
//      {
//       color: 'b',
//       from: 'b6',
//       to: 'c5',
//       piece: 'p',
//       captured: 'p',
//       promotion: undefined,
//       flags: 'c',
//       san: 'bxc5',
//       lan: 'b6c5',
//       before: 'r2q1rk1/3n1ppp/1pp1pb2/1bPn4/1P1PN3/5NP1/1R3PBP/2BQR1K1 b - - 2 18',
//       after: 'r2q1rk1/3n1ppp/2p1pb2/1bpn4/1P1PN3/5NP1/1R3PBP/2BQR1K1 w - - 0 19'
//     },
//      {
//       color: 'w',
//       from: 'b4',
//       to: 'c5',
//       piece: 'p',
//       captured: 'p',
//       promotion: undefined,
//       flags: 'c',
//       san: 'bxc5',
//       lan: 'b4c5',
//       before: 'r2q1rk1/3n1ppp/2p1pb2/1bpn4/1P1PN3/5NP1/1R3PBP/2BQR1K1 w - - 0 19',
//       after: 'r2q1rk1/3n1ppp/2p1pb2/1bPn4/3PN3/5NP1/1R3PBP/2BQR1K1 b - - 0 19'
//     },
//      {
//       color: 'b',
//       from: 'd8',
//       to: 'a5',
//       piece: 'q',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Qa5',
//       lan: 'd8a5',
//       before: 'r2q1rk1/3n1ppp/2p1pb2/1bPn4/3PN3/5NP1/1R3PBP/2BQR1K1 b - - 0 19',
//       after: 'r4rk1/3n1ppp/2p1pb2/qbPn4/3PN3/5NP1/1R3PBP/2BQR1K1 w - - 1 20'
//     },
//      {
//       color: 'w',
//       from: 'c1',
//       to: 'd2',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bd2',
//       lan: 'c1d2',
//       before: 'r4rk1/3n1ppp/2p1pb2/qbPn4/3PN3/5NP1/1R3PBP/2BQR1K1 w - - 1 20',
//       after: 'r4rk1/3n1ppp/2p1pb2/qbPn4/3PN3/5NP1/1R1B1PBP/3QR1K1 b - - 2 20'
//     },
//      {
//       color: 'b',
//       from: 'a5',
//       to: 'a4',
//       piece: 'q',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Qa4',
//       lan: 'a5a4',
//       before: 'r4rk1/3n1ppp/2p1pb2/qbPn4/3PN3/5NP1/1R1B1PBP/3QR1K1 b - - 2 20',
//       after: 'r4rk1/3n1ppp/2p1pb2/1bPn4/q2PN3/5NP1/1R1B1PBP/3QR1K1 w - - 3 21'
//     },
//      {
//       color: 'w',
//       from: 'e4',
//       to: 'f6',
//       piece: 'n',
//       captured: 'b',
//       promotion: undefined,
//       flags: 'c',
//       san: 'Nxf6+',
//       lan: 'e4f6',
//       before: 'r4rk1/3n1ppp/2p1pb2/1bPn4/q2PN3/5NP1/1R1B1PBP/3QR1K1 w - - 3 21',
//       after: 'r4rk1/3n1ppp/2p1pN2/1bPn4/q2P4/5NP1/1R1B1PBP/3QR1K1 b - - 0 21'
//     },
//      {
//       color: 'b',
//       from: 'd5',
//       to: 'f6',
//       piece: 'n',
//       captured: 'n',
//       promotion: undefined,
//       flags: 'c',
//       san: 'N5xf6',
//       lan: 'd5f6',
//       before: 'r4rk1/3n1ppp/2p1pN2/1bPn4/q2P4/5NP1/1R1B1PBP/3QR1K1 b - - 0 21',
//       after: 'r4rk1/3n1ppp/2p1pn2/1bP5/q2P4/5NP1/1R1B1PBP/3QR1K1 w - - 0 22'
//     },
//      {
//       color: 'w',
//       from: 'd1',
//       to: 'a4',
//       piece: 'q',
//       captured: 'q',
//       promotion: undefined,
//       flags: 'c',
//       san: 'Qxa4',
//       lan: 'd1a4',
//       before: 'r4rk1/3n1ppp/2p1pn2/1bP5/q2P4/5NP1/1R1B1PBP/3QR1K1 w - - 0 22',
//       after: 'r4rk1/3n1ppp/2p1pn2/1bP5/Q2P4/5NP1/1R1B1PBP/4R1K1 b - - 0 22'
//     },
//      {
//       color: 'b',
//       from: 'a8',
//       to: 'a4',
//       piece: 'r',
//       captured: 'q',
//       promotion: undefined,
//       flags: 'c',
//       san: 'Rxa4',
//       lan: 'a8a4',
//       before: 'r4rk1/3n1ppp/2p1pn2/1bP5/Q2P4/5NP1/1R1B1PBP/4R1K1 b - - 0 22',
//       after: '5rk1/3n1ppp/2p1pn2/1bP5/r2P4/5NP1/1R1B1PBP/4R1K1 w - - 0 23'
//     },
//      {
//       color: 'w',
//       from: 'g2',
//       to: 'f1',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bf1',
//       lan: 'g2f1',
//       before: '5rk1/3n1ppp/2p1pn2/1bP5/r2P4/5NP1/1R1B1PBP/4R1K1 w - - 0 23',
//       after: '5rk1/3n1ppp/2p1pn2/1bP5/r2P4/5NP1/1R1B1P1P/4RBK1 b - - 1 23'
//     },
//      {
//       color: 'b',
//       from: 'b5',
//       to: 'f1',
//       piece: 'b',
//       captured: 'b',
//       promotion: undefined,
//       flags: 'c',
//       san: 'Bxf1',
//       lan: 'b5f1',
//       before: '5rk1/3n1ppp/2p1pn2/1bP5/r2P4/5NP1/1R1B1P1P/4RBK1 b - - 1 23',
//       after: '5rk1/3n1ppp/2p1pn2/2P5/r2P4/5NP1/1R1B1P1P/4RbK1 w - - 0 24'
//     },
//      {
//       color: 'w',
//       from: 'g1',
//       to: 'f1',
//       piece: 'k',
//       captured: 'b',
//       promotion: undefined,
//       flags: 'c',
//       san: 'Kxf1',
//       lan: 'g1f1',
//       before: '5rk1/3n1ppp/2p1pn2/2P5/r2P4/5NP1/1R1B1P1P/4RbK1 w - - 0 24',
//       after: '5rk1/3n1ppp/2p1pn2/2P5/r2P4/5NP1/1R1B1P1P/4RK2 b - - 0 24'
//     },
//      {
//       color: 'b',
//       from: 'f8',
//       to: 'a8',
//       piece: 'r',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Rfa8',
//       lan: 'f8a8',
//       before: '5rk1/3n1ppp/2p1pn2/2P5/r2P4/5NP1/1R1B1P1P/4RK2 b - - 0 24',
//       after: 'r5k1/3n1ppp/2p1pn2/2P5/r2P4/5NP1/1R1B1P1P/4RK2 w - - 1 25'
//     },
//      {
//       color: 'w',
//       from: 'b2',
//       to: 'b7',
//       piece: 'r',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Rb7',
//       lan: 'b2b7',
//       before: 'r5k1/3n1ppp/2p1pn2/2P5/r2P4/5NP1/1R1B1P1P/4RK2 w - - 1 25',
//       after: 'r5k1/1R1n1ppp/2p1pn2/2P5/r2P4/5NP1/3B1P1P/4RK2 b - - 2 25'
//     },
//      {
//       color: 'b',
//       from: 'a8',
//       to: 'a7',
//       piece: 'r',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'R8a7',
//       lan: 'a8a7',
//       before: 'r5k1/1R1n1ppp/2p1pn2/2P5/r2P4/5NP1/3B1P1P/4RK2 b - - 2 25',
//       after: '6k1/rR1n1ppp/2p1pn2/2P5/r2P4/5NP1/3B1P1P/4RK2 w - - 3 26'
//     },
//      {
//       color: 'w',
//       from: 'e1',
//       to: 'b1',
//       piece: 'r',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Reb1',
//       lan: 'e1b1',
//       before: '6k1/rR1n1ppp/2p1pn2/2P5/r2P4/5NP1/3B1P1P/4RK2 w - - 3 26',
//       after: '6k1/rR1n1ppp/2p1pn2/2P5/r2P4/5NP1/3B1P1P/1R3K2 b - - 4 26'
//     },
//      {
//       color: 'b',
//       from: 'g8',
//       to: 'f8',
//       piece: 'k',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Kf8',
//       lan: 'g8f8',
//       before: '6k1/rR1n1ppp/2p1pn2/2P5/r2P4/5NP1/3B1P1P/1R3K2 b - - 4 26',
//       after: '5k2/rR1n1ppp/2p1pn2/2P5/r2P4/5NP1/3B1P1P/1R3K2 w - - 5 27'
//     },
//      {
//       color: 'w',
//       from: 'd2',
//       to: 'f4',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bf4',
//       lan: 'd2f4',
//       before: '5k2/rR1n1ppp/2p1pn2/2P5/r2P4/5NP1/3B1P1P/1R3K2 w - - 5 27',
//       after: '5k2/rR1n1ppp/2p1pn2/2P5/r2P1B2/5NP1/5P1P/1R3K2 b - - 6 27'
//     },
//      {
//       color: 'b',
//       from: 'f8',
//       to: 'e8',
//       piece: 'k',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Ke8',
//       lan: 'f8e8',
//       before: '5k2/rR1n1ppp/2p1pn2/2P5/r2P1B2/5NP1/5P1P/1R3K2 b - - 6 27',
//       after: '4k3/rR1n1ppp/2p1pn2/2P5/r2P1B2/5NP1/5P1P/1R3K2 w - - 7 28'
//     },
//      {
//       color: 'w',
//       from: 'f4',
//       to: 'd6',
//       piece: 'b',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Bd6',
//       lan: 'f4d6',
//       before: '4k3/rR1n1ppp/2p1pn2/2P5/r2P1B2/5NP1/5P1P/1R3K2 w - - 7 28',
//       after: '4k3/rR1n1ppp/2pBpn2/2P5/r2P4/5NP1/5P1P/1R3K2 b - - 8 28'
//     },
//      {
//       color: 'b',
//       from: 'f6',
//       to: 'e4',
//       piece: 'n',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Ne4',
//       lan: 'f6e4',
//       before: '4k3/rR1n1ppp/2pBpn2/2P5/r2P4/5NP1/5P1P/1R3K2 b - - 8 28',
//       after: '4k3/rR1n1ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/1R3K2 w - - 9 29'
//     },
//      {
//       color: 'w',
//       from: 'b7',
//       to: 'b8',
//       piece: 'r',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Rb8+',
//       lan: 'b7b8',
//       before: '4k3/rR1n1ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/1R3K2 w - - 9 29',
//       after: '1R2k3/r2n1ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/1R3K2 b - - 10 29'
//     },
//      {
//       color: 'b',
//       from: 'd7',
//       to: 'b8',
//       piece: 'n',
//       captured: 'r',
//       promotion: undefined,
//       flags: 'c',
//       san: 'Nxb8',
//       lan: 'd7b8',
//       before: '1R2k3/r2n1ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/1R3K2 b - - 10 29',
//       after: '1n2k3/r4ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/1R3K2 w - - 0 30'
//     },
//      {
//       color: 'w',
//       from: 'b1',
//       to: 'b8',
//       piece: 'r',
//       captured: 'n',
//       promotion: undefined,
//       flags: 'c',
//       san: 'Rxb8+',
//       lan: 'b1b8',
//       before: '1n2k3/r4ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/1R3K2 w - - 0 30',
//       after: '1R2k3/r4ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/5K2 b - - 0 30'
//     },
//      {
//       color: 'b',
//       from: 'e8',
//       to: 'd7',
//       piece: 'k',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Kd7',
//       lan: 'e8d7',
//       before: '1R2k3/r4ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/5K2 b - - 0 30',
//       after: '1R6/r2k1ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/5K2 w - - 1 31'
//     },
//      {
//       color: 'w',
//       from: 'f3',
//       to: 'e5',
//       piece: 'n',
//       captured: undefined,
//       promotion: undefined,
//       flags: 'n',
//       san: 'Ne5#',
//       lan: 'f3e5',
//       before: '1R6/r2k1ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/5K2 w - - 1 31',
//       after: '1R6/r2k1ppp/2pBp3/2P1N3/r2Pn3/6P1/5P1P/5K2 b - - 2 31'
//     }
//   ]
//
// test('nextMove is called if there are multiple good moves', () => {
//   const data = `info depth 18 seldepth 25 multipv 1 score cp -23 nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv g8f6 c2c4 e7e6 b1c3 d7d5 c1g5 f8e7 e2e3 h7h6 g5h4 e8g8 g1f3 d5c4 f1c4 c7c5 d4c5 d8a5 e1g1
// info depth 18 seldepth 26 multipv 2 score cp -25 nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv d7d5 c2c4 e7e6 b1c3 g8f6 c4d5 e6d5 c1g5 f8e7 e2e3 h7h6 g5h4 c8f5 h4f6 e7f6 d1b3 c7c5 d4c5
// info depth 18 seldepth 29 multipv 3 score cp -38 nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv e7e6 e2e4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 f1d3 c5d4 e1g1 g8e7 f1e1 a7a6 c3d4 c6d4
// info depth 18 seldepth 28 multipv 4 score cp -57 nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv f7f5 c2c4 g8f6 b1c3 e7e6 a2a3 f8e7 c1f4 f6h5 e2e3 h5f4 e3f4 e8g8 g1f3 d7d6 d1c2
// info depth 18 seldepth 28 multipv 5 score cp -60 upperbound nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv d7d6 g1f3
// bestmove g8f6 ponder c2c4`
//
//   const currentBoard = new Chess();
//   currentBoard.load('3r2k1/2r2pp1/1p1Nn2p/3RP3/p7/P3R2P/1P3PP1/6K1 w - - 1 33')
//   currentBoard.move('d5b5') // so that history is avaible in currentBoard.history({ verbose: true }).at(-1).before
//   
//   const analyzeMove = vi.fn();
//   const nextMove = vi.fn();
//   handleStockfishOutput({data, currentIndex: 1, moves, currentBoard, analyzeMove, nextMove,  });
//   expect(nextMove).toHaveBeenCalled()
// })
//
// test('analyzeMove is called when there is only one good move, so puzzle can be created', () => {
// //   const data = `info depth 18 seldepth 25 multipv 1 score cp -23 nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv g8f6 c2c4 e7e6 b1c3 d7d5 c1g5 f8e7 e2e3 h7h6 g5h4 e8g8 g1f3 d5c4 f1c4 c7c5 d4c5 d8a5 e1g1
// // info depth 18 seldepth 26 multipv 2 score cp -25 nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv d7d5 c2c4 e7e6 b1c3 g8f6 c4d5 e6d5 c1g5 f8e7 e2e3 h7h6 g5h4 c8f5 h4f6 e7f6 d1b3 c7c5 d4c5
// // info depth 18 seldepth 29 multipv 3 score cp -38 nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv e7e6 e2e4 d7d5 e4e5 c7c5 c2c3 b8c6 g1f3 d8b6 f1d3 c5d4 e1g1 g8e7 f1e1 a7a6 c3d4 c6d4
// // info depth 18 seldepth 28 multipv 4 score cp -57 nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv f7f5 c2c4 g8f6 b1c3 e7e6 a2a3 f8e7 c1f4 f6h5 e2e3 h5f4 e3f4 e8g8 g1f3 d7d6 d1c2
// // info depth 18 seldepth 28 multipv 5 score cp -60 upperbound nodes 884859 nps 589906 hashfull 300 tbhits 0 time 1500 pv d7d6 g1f3
// // bestmove g8f6 ponder c2c4`
//
//  const data = [
//     "info string Available processors: 0-9",
//     "info string Using 1 thread",
//     "info string NNUE evaluation using nn-1c0000000000.nnue (133MiB, (22528, 3072, 15, 32, 1))",
//     "info string NNUE evaluation using nn-37f18f62d772.nnue (6MiB, (22528, 128, 15, 32, 1))",
//     "info depth 1 seldepth 5 multipv 1 score cp -67 nodes 302 nps 302000 hashfull 0 tbhits 0 time 1 pv c7c1 g1h2 e6c7",
//     "info depth 1 seldepth 5 multipv 2 score cp -109 nodes 302 nps 302000 hashfull 0 tbhits 0 time 1 pv c7c6",
//     "info depth 1 seldepth 5 multipv 3 score cp -183 nodes 302 nps 302000 hashfull 0 tbhits 0 time 1 pv d8b8",
//     "info depth 1 seldepth 5 multipv 4 score cp -186 nodes 302 nps 302000 hashfull 0 tbhits 0 time 1 pv f7f6 b5b6",
//     "info depth 1 seldepth 3 multipv 5 score cp -190 nodes 302 nps 302000 hashfull 0 tbhits 0 time 1 pv e6f4",
//     "info depth 2 seldepth 5 multipv 1 score cp -67 nodes 976 nps 976000 hashfull 0 tbhits 0 time 1 pv c7c1 g1h2 e6c7",
//     "info depth 2 seldepth 3 multipv 2 score cp -153 nodes 976 nps 976000 hashfull 0 tbhits 0 time 1 pv c7c6 b5b4",
//     "info depth 2 seldepth 5 multipv 3 score cp -193 nodes 976 nps 976000 hashfull 0 tbhits 0 time 1 pv e6f4",
//     "info depth 2 seldepth 5 multipv 4 score cp -198 nodes 976 nps 976000 hashfull 0 tbhits 0 time 1 pv f7f6 b5b6",
//     "info depth 2 seldepth 3 multipv 5 score cp -206 nodes 976 nps 976000 hashfull 0 tbhits 0 time 1 pv d8b8 b5b4",
//     "info depth 3 seldepth 5 multipv 1 score cp -67 nodes 1425 nps 1425000 hashfull 0 tbhits 0 time 1 pv c7c1 g1h2 e6c7",
//     "info depth 3 seldepth 5 multipv 2 score cp -195 nodes 1425 nps 1425000 hashfull 0 tbhits 0 time 1 pv c7c6 e3c3",
//     "info depth 3 seldepth 3 multipv 3 score cp -195 nodes 1425 nps 1425000 hashfull 0 tbhits 0 time 1 pv e6f4 b5b4",
//     "info depth 3 seldepth 4 multipv 4 score cp -211 nodes 1425 nps 1425000 hashfull 0 tbhits 0 time 1 pv f7f6 b5b6",
//     "info depth 3 seldepth 3 multipv 5 score cp -212 nodes 1425 nps 1425000 hashfull 0 tbhits 0 time 1 pv d8b8 b5b4",
//     "info depth 4 seldepth 7 multipv 1 score cp -89 nodes 2598 nps 2598000 hashfull 0 tbhits 0 time 1 pv c7c1 g1h2 c1c2",
//     "info depth 4 seldepth 5 multipv 2 score cp -162 nodes 2598 nps 2598000 hashfull 0 tbhits 0 time 1 pv e6f4 b5b4 c7c1 g1h2",
//     "info depth 4 seldepth 6 multipv 3 score cp -214 nodes 2598 nps 2598000 hashfull 0 tbhits 0 time 1 pv d8b8 b5b4",
//     "info depth 4 seldepth 6 multipv 4 score cp -224 nodes 2598 nps 2598000 hashfull 0 tbhits 0 time 1 pv c7c6 e3c3 c6c5 c3c5",
//     "info depth 4 seldepth 6 multipv 5 score cp -234 nodes 2598 nps 2598000 hashfull 0 tbhits 0 time 1 pv e6d4 b5b6",
//     "info depth 5 seldepth 7 multipv 1 score cp -89 nodes 3559 nps 1779500 hashfull 0 tbhits 0 time 2 pv c7c1 g1h2 c1c2 b5b6 c2f2",
//     "info depth 5 seldepth 9 multipv 2 score cp -193 nodes 3559 nps 1779500 hashfull 0 tbhits 0 time 2 pv e6f4 e3e4 f4d3 b5b6 c7c1 g1h2",
//     "info depth 5 seldepth 7 multipv 3 score cp -210 nodes 3559 nps 1779500 hashfull 0 tbhits 0 time 2 pv d8b8 b5b4 c7c1 g1h2 c1c2",
//     "info depth 5 seldepth 6 multipv 4 score cp -228 nodes 3559 nps 1779500 hashfull 0 tbhits 0 time 2 pv c7c6 e3c3 c6c5 c3c5",
//     "info depth 5 seldepth 5 multipv 5 score cp -232 nodes 3559 nps 1779500 hashfull 0 tbhits 0 time 2 pv e6d4 b5b6 c7c1 g1h2",
//     "info depth 6 seldepth 7 multipv 1 score cp -86 nodes 4571 nps 2285500 hashfull 0 tbhits 0 time 2 pv c7c1 g1h2 c1c2 b5b6 c2f2",
//     "info depth 6 seldepth 7 multipv 2 score cp -167 nodes 4571 nps 2285500 hashfull 0 tbhits 0 time 2 pv d8b8 b5b4 c7c1 g1h2",
//     "info depth 6 seldepth 9 multipv 3 score cp -194 nodes 4571 nps 2285500 hashfull 0 tbhits 0 time 2 pv e6f4 e3e4 f4d3 b5b6 c7c1 g1h2",
//     "info depth 6 seldepth 8 multipv 4 score cp -207 nodes 4571 nps 2285500 hashfull 0 tbhits 0 time 2 pv g7g5 b5b6 e6f4 b6b5 c7c1 g1h2",
//     "info depth 6 seldepth 10 multipv 5 score cp -208 nodes 4571 nps 2285500 hashfull 0 tbhits 0 time 2 pv c7c6 e3c3 c6c3 b2c3 e6f4 b5b6 f4e2 g1h2",
//     "info depth 7 seldepth 9 multipv 1 score cp -54 nodes 5348 nps 2674000 hashfull 0 tbhits 0 time 2 pv c7c1 g1h2 e6c7 b5b6 c7d5",
//     "info depth 7 seldepth 8 multipv 2 score cp -153 nodes 5348 nps 1782666 hashfull 0 tbhits 0 time 3 pv d8b8 e3e4",
//     "info depth 7 seldepth 8 multipv 3 score cp -192 nodes 5348 nps 1782666 hashfull 0 tbhits 0 time 3 pv e6f4 e3e4 f4d3 b5b6 c7c1 g1h2",
//     "info depth 7 seldepth 10 multipv 4 score cp -208 nodes 5348 nps 1782666 hashfull 0 tbhits 0 time 3 pv c7c6 e3c3 c6c3 b2c3 e6f4 b5b6 f4e2 g1h2",
//     "info depth 7 seldepth 10 multipv 5 score cp -208 nodes 5348 nps 1782666 hashfull 0 tbhits 0 time 3 pv c7c2 e3c3 c2c3 b2c3 e6f4 b5b6 f4e2 g1h2",
//     "info depth 8 seldepth 9 multipv 1 score cp -51 nodes 10399 nps 1299875 hashfull 1 tbhits 0 time 8 pv c7c1 g1h2 e6c7 b5b6 c7d5",
//     "info depth 8 seldepth 11 multipv 2 score cp -173 nodes 10399 nps 1299875 hashfull 1 tbhits 0 time 8 pv c7c6 e3c3 c6c5 b5c5 e6c5",
//     "info depth 8 seldepth 9 multipv 3 score cp -175 nodes 10399 nps 1299875 hashfull 1 tbhits 0 time 8 pv d8b8 b5b4 c7c1 g1h2",
//     "info depth 8 seldepth 13 multipv 4 score cp -207 nodes 10399 nps 1299875 hashfull 1 tbhits 0 time 8 pv e6f4 e3e4 f4d3 b5b6 c7c1 g1h2 c1c2",
//     "info depth 8 seldepth 11 multipv 5 score cp -224 nodes 10399 nps 1299875 hashfull 1 tbhits 0 time 8 pv c7c2 b5b6 e6f4 e3f3 f4g6 f3f7 g6e5 f7e7",
//     "info depth 9 seldepth 11 multipv 1 score cp 61 nodes 12312 nps 1368000 hashfull 1 tbhits 0 time 9 pv c7c1 g1h2 e6c7 b5b6 c7d5 b6b7 d5e3 f2e3",
//     "info depth 9 seldepth 15 multipv 2 score cp -154 nodes 12312 nps 1368000 hashfull 1 tbhits 0 time 9 pv c7c6 e3c3 c6c5 b5c5 e6c5 f2f4 f7f6 g1f2 g7g5 f2e3 g5f4 e3f4 f6e5 f4e5",
//     "info depth 9 seldepth 17 multipv 3 score cp -177 nodes 12312 nps 1368000 hashfull 1 tbhits 0 time 9 pv d8b8 b5b4 f7f6 d6f5",
//     "info depth 9 seldepth 12 multipv 4 score cp -218 nodes 12312 nps 1368000 hashfull 1 tbhits 0 time 9 pv e6f4 e3e4 f4d3 b5b6 c7c2 e4a4 c2f2 b6b3 f2b2 b3d3",
//     "info depth 9 seldepth 12 multipv 5 score cp -230 nodes 12312 nps 1368000 hashfull 1 tbhits 0 time 9 pv c7c2 b5b6 e6f4 e3f3 f4g6 f3f7 g6e5 f7e7 e5g6",
//     "info depth 10 seldepth 20 multipv 1 score cp 70 nodes 19904 nps 1047578 hashfull 3 tbhits 0 time 19 pv c7c1 g1h2 e6c7 b5b6 c7d5 b6b7 d5e3 f2e3 c1c2 b7f7 c2e2",
//     "info depth 10 seldepth 17 multipv 2 score cp -114 nodes 19904 nps 1047578 hashfull 3 tbhits 0 time 19 pv c7c6 b5b4 f7f6 e3c3 c6c5 b4b6 c5e5 c3c4 e5e1 g1h2",
//     "info depth 10 seldepth 13 multipv 3 score cp -152 nodes 19904 nps 1047578 hashfull 3 tbhits 0 time 19 pv f7f6 b5b6 f6e5 e3c3 c7d7 d6c4 e6f4 c3c2 f4d5",
//     "info depth 10 seldepth 16 multipv 4 score cp -209 nodes 19904 nps 1047578 hashfull 3 tbhits 0 time 19 pv d8b8 b5b4 b6b5 f2f4 c7c2 f4f5 e6c7 e3c3 c2c3 b2c3",
//     "info depth 10 seldepth 16 multipv 5 score cp -230 nodes 19904 nps 1047578 hashfull 3 tbhits 0 time 19 pv h6h5 b5b6 c7c1 g1h2 c1c2 h2g3",
//     "info depth 11 seldepth 26 multipv 1 score cp 29 nodes 46905 nps 781750 hashfull 8 tbhits 0 time 60 pv c7c1 g1h2 e6c7 b5b6 c7d5 b6b5 d5e3 f2e3 c1e1 e3e4 e1e2 h2g3 e2d2 h3h4 f7f6",
//     "info depth 11 seldepth 18 multipv 2 score cp -152 nodes 46905 nps 781750 hashfull 8 tbhits 0 time 60 pv c7c6 e3c3 c6c5 c3c5 b6c5 b5a5 f7f6 a5a4 f6e5 d6f5 d8d2",
//     "info depth 11 seldepth 15 multipv 3 score cp -183 nodes 46905 nps 781750 hashfull 8 tbhits 0 time 60 pv f7f6 b5b6 f6e5 e3e5 e6f4 b6a6 f4d3 e5e2",
//     "info depth 11 seldepth 20 multipv 4 score cp -184 nodes 46905 nps 781750 hashfull 8 tbhits 0 time 60 pv d8b8 b5b4 b6b5 f2f4 c7c1 g1h2 e6c7 e3f3 c7d5 b4b5 b8b5 d6b5",
//     "info depth 11 seldepth 16 multipv 5 score cp -209 nodes 46905 nps 781750 hashfull 8 tbhits 0 time 60 pv e6f4 e3e4 f7f6 e4f4 f6e5 b5e5 d8d6 f4a4 d6d2 a4b4",
//     "info depth 12 seldepth 30 multipv 1 score cp 31 nodes 79970 nps 740462 hashfull 20 tbhits 0 time 108 pv c7c1 g1h2 e6c7 b5b6 c7d5 b6b7 d5e3 f2e3 c1e1 e3e4 d8f8 h3h4 h6h5 h2g3 e1e2 g3f3 e2d2 d6c4 d2d4 c4d6",
//     "info depth 12 seldepth 17 multipv 2 score cp -143 nodes 79970 nps 740462 hashfull 20 tbhits 0 time 108 pv f7f6 b5b6 f6e5 e3e5 e6f4 b6a6 c7c2 e5e4",
//     "info depth 12 seldepth 19 multipv 3 score cp -166 nodes 79970 nps 740462 hashfull 20 tbhits 0 time 108 pv d8b8 b5b4 b6b5 h3h4 c7c1 g1h2",
//     "info depth 12 seldepth 15 multipv 4 score cp -171 nodes 79970 nps 740462 hashfull 20 tbhits 0 time 108 pv c7c6 b5b4 c6c1 g1h2 c1c2 h2g3 e6c5 b4b6 c5d7 b6b4",
//     "info depth 12 seldepth 23 multipv 5 score cp -211 nodes 79970 nps 740462 hashfull 20 tbhits 0 time 108 pv e6f4 e3e4 f4d3 f2f4 c7c2 b5b6 g7g5 f4f5",
//     "info depth 13 seldepth 29 multipv 1 score cp 49 nodes 119001 nps 743756 hashfull 30 tbhits 0 time 160 pv c7c1 g1h2 e6c7 b5b6 c7d5 b6b7 d5e3 f2e3 c1e1 e3e4 e1e2 h3h4 h6h5 h2g3 e2c2 g3f3 c2d2",
//     "info depth 13 seldepth 17 multipv 2 score cp -158 nodes 119001 nps 743756 hashfull 30 tbhits 0 time 160 pv c7c6 b5b4 e6c5 d6f5 c6e6 f5d4",
//     "info depth 13 seldepth 22 multipv 3 score cp -168 nodes 119001 nps 743756 hashfull 30 tbhits 0 time 160 pv d8b8 e3c3 c7c3 b2c3 e6f4 c3c4 f4e2 g1h2",
//     "info depth 13 seldepth 18 multipv 4 score cp -195 nodes 119001 nps 743756 hashfull 30 tbhits 0 time 160 pv e6f4 e3e4 f4d3 f2f4 d3c5 e4c4 c7c6 c4b4",
//     "info depth 13 seldepth 16 multipv 5 score cp -213 nodes 119001 nps 743756 hashfull 30 tbhits 0 time 160 pv f7f6 b5b6 f6e5 e3e5 e6f4 d6e4 f4d3 e5e6 c7c2",
//     "info depth 14 seldepth 33 multipv 1 score cp 55 nodes 281345 nps 687885 hashfull 86 tbhits 0 time 409 pv c7c1 g1h2 e6c7 b5b6 c7d5 d6f7 g8f7 e3f3 f7g8 f3d3 d5b6 d3d8 g8f7 f2f4 c1c8 d8c8 b6c8",
//     "info depth 14 seldepth 23 multipv 2 score cp -196 nodes 281345 nps 687885 hashfull 86 tbhits 0 time 409 pv c7c6 b5b4 c6c1 g1h2 c1c2 h2g3 f7f6 b4b6 f6e5 e3e5 e6c5 e5e3 c2d2 d6f5 d8d3 b6b8 g8f7 e3d3 c5d3",
//     "info depth 14 seldepth 21 multipv 3 score cp -204 nodes 281345 nps 687885 hashfull 86 tbhits 0 time 409 pv d8b8 b5b4 c7c1 g1h2 b6b5 f2f4 e6c7 e3d3 c1c2 d6f5 c7e6 d3d7 c2f2 h2g3",
//     "info depth 14 seldepth 18 multipv 4 score cp -220 nodes 281345 nps 687885 hashfull 86 tbhits 0 time 409 pv f7f6 b5b6 f6e5 e3e5 e6f4 b6a6 g8h7 a6a4 f4d3 e5d5 d3b2 a4d4 c7c1 g1h2 c1a1 d4d2 b2a4",
//     "info depth 14 seldepth 20 multipv 5 score cp -234 nodes 281345 nps 687885 hashfull 86 tbhits 0 time 409 pv e6f4 e3e4 f4d3 b5b6 c7c5 f2f4 g7g5 f4g5 h6g5 e5e6 f7e6 e4a4 d3f4 a4c4 c5c4 d6c4 d8c8 b6b4 f4d3",
//     "info depth 15 seldepth 27 multipv 1 score cp 60 nodes 503491 nps 653884 hashfull 167 tbhits 0 time 770 pv c7c1 g1h2 e6c7 b5b6 c7d5 b6b5 d5e3 f2e3 c1e1 e3e4 e1e2 b5b4 d8d7 h2g3 d7e7 d6f5",
//     "info depth 15 seldepth 29 multipv 2 score cp -183 nodes 503491 nps 653884 hashfull 167 tbhits 0 time 770 pv c7c6 b5b4 f7f6 d6f5 g8f7 e5f6 f7f6 f5g3 e6c5 g3e4 c5e4 e3e4 d8d2 e4f4 f6e6 b4e4 e6d6 e4a4 d2b2",
//     "info depth 15 seldepth 27 multipv 3 score cp -192 nodes 503491 nps 653884 hashfull 167 tbhits 0 time 770 pv d8b8 b5b4 b6b5 f2f4 c7c1 g1h2 e6c7 e3d3 c1c2 h3h4 c7a6 b4b5 b8b5 d6b5 c2b2",
//     "info depth 15 seldepth 26 multipv 4 score cp -205 nodes 503491 nps 653884 hashfull 167 tbhits 0 time 770 pv f7f6 b5b6 f6e5 e3e5 e6f4 d6e4 f4d3 e5a5 d8d4 a5a8 g8h7 a8e8 c7c2 b6b7 d3f2 e4f2 d4d2 f2g4 d2g2 g1f1 c2b2 b7b2 g2b2",
//     "info depth 15 seldepth 25 multipv 5 score cp -215 nodes 503491 nps 653884 hashfull 167 tbhits 0 time 770 pv e6f4 e3e4 f4d3 b5b6 c7c1 g1h2 d3f2 e4e3 d8f8 b6b4 c1c2 b4a4 c2b2 a4b4 f2d1 e3d3",
//     "info depth 16 seldepth 30 multipv 1 score cp 63 nodes 622624 nps 652645 hashfull 207 tbhits 0 time 954 pv c7c1 g1h2 e6c7 b5b6 c7d5 b6b7 d5e3 f2e3 c1c5 b7a7 d8b8 d6f7 b8e8 e3e4 c5c2 h3h4 c2e2 f7d6 e8e5 h2g3 e2b2 a7a4 e5c5 d6f5 c5c3 g3h2",
//     "info depth 16 seldepth 25 multipv 2 score cp -175 nodes 622624 nps 652645 hashfull 207 tbhits 0 time 954 pv c7c6 b5b4 f7f6 d6f5 g8f7 e5f6 f7f6 g2g4 d8d2 g1g2 e6c5 h3h4 c5d3 b4d4 d2f2 g2g3",
//     "info depth 16 seldepth 22 multipv 3 score cp -190 nodes 622624 nps 652645 hashfull 207 tbhits 0 time 954 pv d8b8 e3c3 c7c3 b2c3 e6c5 g2g3 g8f8 f2f4 f8e7 g1g2",
//     "info depth 16 seldepth 28 multipv 4 score cp -213 nodes 622624 nps 652645 hashfull 207 tbhits 0 time 954 pv e6f4 e3e4 f4d3 b5b6 c7c1 g1h2 d3f2 e4e3 d8f8 b6b4 c1c2 e3g3 c2e2 b4a4 e2e5 b2b3",
//     "info depth 16 seldepth 24 multipv 5 score cp -222 nodes 622624 nps 652645 hashfull 207 tbhits 0 time 954 pv f7f6 b5b6 f6e5 e3e5 e6f4 b6a6 c7c2 d6e4 c2b2 a6a4 d8d1 g1h2 d1d7 e5e8 g8h7 e4f6 g7f6",
//     "info depth 17 seldepth 35 multipv 1 score cp 67 nodes 784003 nps 650624 hashfull 263 tbhits 0 time 1205 pv c7c1 g1h2 e6c7 b5b6 c7d5 b6b7 d5e3 f2e3 c1c5 h3h4 d8f8 b7e7 c5d5 e3e4 d5d2 e7a7 f8b8 d6f7 b8b2 e5e6 d2g2 h2h3 g2e2 a7a8 g8h7",
//     "info depth 17 seldepth 26 multipv 2 score cp -185 nodes 784003 nps 650624 hashfull 263 tbhits 0 time 1205 pv c7c6 b5b4 f7f6 d6f5 g8f7 e5f6 f7f6 g2g4 d8d2 f5g3 f6g6 g3e4 d2d1 g1h2",
//     "info depth 17 seldepth 20 multipv 3 score cp -194 nodes 784003 nps 650624 hashfull 263 tbhits 0 time 1205 pv d8b8 e3c3 c7c3 b2c3 g8f8 d6c4 b8c8 b5b4 g7g6 c4b6 c8c3 b4a4 c3c1 g1h2",
//     "info depth 17 seldepth 32 multipv 4 score cp -195 nodes 784003 nps 650624 hashfull 263 tbhits 0 time 1205 pv e6f4 e3e4 c7c1 g1h2 g7g5 e4a4 c1f1 h2g3 f1g1 b5b6 g1g2 g3f3 g2h2 a4a7 h2h3 f3e4 h3h4 d6f7 f4d5 e4d3 d5b6 f7d8 h4f4 d8e6 f4f2",
//     "info depth 17 seldepth 28 multipv 5 score cp -210 nodes 784003 nps 650624 hashfull 263 tbhits 0 time 1205 pv f7f6 b5b6 f6e5 e3e5 e6f4 g1h2 d8f8 d6f5 f4d3 e5a5 c7c2",
//     "info depth 18 seldepth 39 multipv 1 score cp 52 nodes 965325 nps 643550 hashfull 323 tbhits 0 time 1500 pv c7c1 g1h2 e6c7 b5b6 c7d5 b6b7 d5e3 f2e3 c1e1 e3e4 d8a8 h3h4 h6h5 h2g3 e1f1 b7b4 a8a7 b4b8 g8h7 b8b4 f1c1 g3f4 c1c2 f4f3 a7e7",
//     "info depth 18 seldepth 25 multipv 2 score cp -176 upperbound nodes 965325 nps 643550 hashfull 323 tbhits 0 time 1500 pv c7c6 b5b4",
//     "info depth 17 seldepth 20 multipv 3 score cp -194 nodes 965325 nps 643550 hashfull 323 tbhits 0 time 1500 pv d8b8 e3c3 c7c3 b2c3 g8f8 d6c4 b8c8 b5b4 g7g6 c4b6 c8c3 b4a4 c3c1 g1h2",
//     "info depth 17 seldepth 32 multipv 4 score cp -195 nodes 965325 nps 643550 hashfull 323 tbhits 0 time 1500 pv e6f4 e3e4 c7c1 g1h2 g7g5 e4a4 c1f1 h2g3 f1g1 b5b6 g1g2 g3f3 g2h2 a4a7 h2h3 f3e4 h3h4 d6f7 f4d5 e4d3 d5b6 f7d8 h4f4 d8e6 f4f2",
//     "info depth 17 seldepth 28 multipv 5 score cp -210 nodes 965325 nps 643550 hashfull 323 tbhits 0 time 1500 pv f7f6 b5b6 f6e5 e3e5 e6f4 g1h2 d8f8 d6f5 f4d3 e5a5 c7c2",
//     "bestmove c7c1 ponder g1h2"
// ].join('\n')
//
//   const currentBoard = new Chess();
//   currentBoard.load('3r2k1/2r2pp1/1p1Nn2p/3RP3/p7/P3R2P/1P3PP1/6K1 w - - 1 33')
//   currentBoard.move('d5b5') // so that history is avaible in currentBoard.history({ verbose: true }).at(-1).before
//   
//   const analyzeMove = vi.fn();
//   const nextMove = vi.fn();
//   handleStockfishOutput({data, currentIndex: 1, moves, currentBoard, analyzeMove, nextMove,  });
//   expect(analyzeMove).toHaveBeenCalled()
// })

function mockStockfishOutput(stockfishOutput) {
  let onData;
  let stockfishOutputIndex = -1;
  return () => ({
    on: () => {},
    stderr: {
      on: () => {}
    },
    stdout: {
      on: (ev, fn) => {
        onData = fn
      }
    },
    stdin: {
      write: (data) => {
        // const fen = data.replace("position fen ", "").replace("\n", "")
        // console.log(`${fen} json`, fen in stockfishOutput)
        // console.log(Object.keys(stockfishOutput))
        if (data.includes("go movetime")) {
          stockfishOutputIndex++;
          // console.log(stockfishOutput[stockfishOutputIndex].length)
          console.log({stockfishOutputIndex})
          onData(stockfishOutput[stockfishOutputIndex].join('\n'))
          // for (const lines of stockfishOutput[stockfishOutputIndex]) {
          //   try {
          //     // console.log('onData, with line: ', lines)
          //     onData(lines)
          //   } catch(e) {
          //     // console.log(e)
          //   }
          // }
        }
      },
      end: () => {}
    }
  })
}

// test.only('getPuzzles', async() => {
//   const pgn = `[Event "Titled-Tuesday-Blitz-October-07-2025"]
//   [Site "Chess.com"]
//   [Date "2025.10.07"]
//   [Round "10"]
//   [White "wanyaland"]
//   [Black "adreyd"]
//   [Result "1-0"]
//   [WhiteElo "2572"]
//   [BlackElo "2705"]
//   [TimeControl "300"]
//   [EndTime "16:58:44 GMT+0000"]
//   [Termination "wanyaland won by checkmate"]
//
//   1. d4 {[%clk 0:04:59.9]} 1... Nf6 {[%clk 0:04:58.8]} 2. c4 {[%clk 0:04:58.9]}
//   2... e6 {[%clk 0:04:58]} 3. g3 {[%clk 0:04:58.3]} 3... d5 {[%clk 0:04:55.4]} 4.
//     Bg2 {[%clk 0:04:57.6]} 4... Bb4+ {[%clk 0:04:54.6]} 5. Nd2 {[%clk 0:04:55.7]}
//   5... O-O {[%clk 0:04:51.4]} 6. Nf3 {[%clk 0:04:54.1]} 6... b6 {[%clk 0:04:50.7]}
//   7. a3 {[%clk 0:04:48.5]} 7... Bd6 {[%clk 0:04:48.1]} 8. b4 {[%clk 0:04:47.3]}
//   8... a5 {[%clk 0:04:40.9]} 9. c5 {[%clk 0:04:45.7]} 9... Be7 {[%clk 0:04:39.8]}
//   10. Rb1 {[%clk 0:04:44.2]} 10... c6 {[%clk 0:04:22.7]} 11. O-O {[%clk
//     0:04:33.5]} 11... Nbd7 {[%clk 0:04:21.5]} 12. Re1 {[%clk 0:04:31.1]} 12... Ba6
//   {[%clk 0:04:19.1]} 13. e4 {[%clk 0:04:26.3]} 13... Bd3 {[%clk 0:04:10.1]} 14.
//     exd5 {[%clk 0:04:22.7]} 14... Nxd5 {[%clk 0:04:06]} 15. Rb3 {[%clk 0:04:14.6]}
//   15... Bb5 {[%clk 0:04:00.8]} 16. Rb2 {[%clk 0:04:09.7]} 16... axb4 {[%clk
//     0:03:51.3]} 17. axb4 {[%clk 0:04:08.4]} 17... Bf6 {[%clk 0:03:34.6]} 18. Ne4
//   {[%clk 0:04:03.8]} 18... bxc5 {[%clk 0:03:24.6]} 19. bxc5 {[%clk 0:03:59.2]}
//   19... Qa5 {[%clk 0:03:08.9]} 20. Bd2 {[%clk 0:03:56.8]} 20... Qa4 {[%clk
//     0:03:06.6]} 21. Nxf6+ {[%clk 0:03:52.3]} 21... N5xf6 {[%clk 0:02:56.8]} 22. Qxa4
//   {[%clk 0:03:41.1]} 22... Rxa4 {[%clk 0:02:56.7]} 23. Bf1 {[%clk 0:03:14.3]}
//   23... Bxf1 {[%clk 0:02:52.2]} 24. Kxf1 {[%clk 0:03:12.6]} 24... Rfa8 {[%clk
//     0:02:49.3]} 25. Rb7 {[%clk 0:03:10.4]} 25... R8a7 {[%clk 0:02:30.2]} 26. Reb1
//   {[%clk 0:03:08.1]} 26... Kf8 {[%clk 0:02:24.8]} 27. Bf4 {[%clk 0:03:03]} 27...
//     Ke8 {[%clk 0:02:17.1]} 28. Bd6 {[%clk 0:03:01.5]} 28... Ne4 {[%clk 0:02:05]} 29.
//     Rb8+ {[%clk 0:02:48.8]} 29... Nxb8 {[%clk 0:02:00.5]} 30. Rxb8+ {[%clk
//       0:02:48.7]} 30... Kd7 {[%clk 0:02:00.4]} 31. Ne5# {[%clk 0:02:48.1]} 1-0`
//
//   const spawn = mockStockfishOutput()
//   const puzzles = await getPuzzles(pgn, spawn, 0, 0)
//   console.log({ puzzles });
//   expect(puzzles).toEqual([
//     {
//       puzzleSequence: 'f6e4 b7b8 d7b8 b1b8 e8d7',
//       puzzleFen: '4k3/rR1n1ppp/2pBpn2/2P5/r2P4/5NP1/5P1P/1R3K2 b - - 8 28'
//     },
//     {
//       puzzleSequence: 'd7b8 b1b8 e8d7',
//       puzzleFen: '1R2k3/r2n1ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/1R3K2 b - - 10 29'
//     }
//   ])
// }, 120_000)

test('getPuzzles game 12', async() => {
  const pgn = readFileSync('./game12.pgn').toString()
  console.log({ pgn });

  const spawn = mockStockfishOutput(stockfishOutput)
  const puzzles = await getPuzzles(pgn, spawn, 0, 0)
  console.log({ puzzles });
  expect(puzzles).toEqual([
  {
    puzzleSequence: 'f1e1 a7a5 b4c2 c5d3',
    puzzleFen: 'r2q1rk1/pb2bppp/1p6/2n1P3/1N3B2/P4N2/1P3PPP/R2Q1RK1 w - - 1 16'
  },
  {
    puzzleSequence: 'd5b5 c7c1 g1h2 e6c7 b5b6 c7d5 b6b7 d5e3',
    puzzleFen: '3r2k1/2r2pp1/1p1Nn2p/3RP3/p7/P3R2P/1P3PP1/6K1 w - - 1 33'
  },
  {
    puzzleSequence: 'g1h2 e6c7 b5b6 c7d5 b6b7 d5e3',
    puzzleFen: '3r2k1/5pp1/1p1Nn2p/1R2P3/p7/P3R2P/1P3PP1/2r3K1 w - - 3 34'
  },
  {
    puzzleSequence: 'c5e4 c3c2 d8c8 b5b4',
    puzzleFen: '3r2k1/5pp1/1pr4p/1Rn1P3/p1N5/P1R4P/1P3PPK/8 b - - 8 36'
  }
])
}, 120_000)

test('getPuzzles with mate', async() => {
  const pgn = readFileSync('./game20.pgn').toString()
  console.log({ pgn });

  const spawn = mockStockfishOutput(stockfishOutputWithMate)
  const puzzles = await getPuzzles(pgn, spawn, 0, 0)
  console.log({ puzzles });
  expect(puzzles).toEqual([
  {
    puzzleSequence: 'f6e4 b7b8 d7b8 b1b8 e8d7 f3e5',
    puzzleFen: '4k3/rR1n1ppp/2pBpn2/2P5/r2P4/5NP1/5P1P/1R3K2 b - - 8 28'
  },
  {
    puzzleSequence: 'd7b8 b1b8 e8d7 f3e5',
    puzzleFen: '1R2k3/r2n1ppp/2pBp3/2P5/r2Pn3/5NP1/5P1P/1R3K2 b - - 10 29'
  }
])
}, 120_000)
