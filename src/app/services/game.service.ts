import { Injectable } from '@angular/core';
import { Checker } from '../board/checker';
import { Square } from '../board/square';


@Injectable({
  providedIn: 'root'
})

export class GameService {
  readonly SIZE_OF_BOARD = 8; // Size of board NxN, which the value represents N
  board = new Array(this.SIZE_OF_BOARD);
  onChecker?: Checker; //a copy of the last clicked checker
  players = ["Red", "Black"];
  turn = this.players[1];
  undo_stack: any[] = [];
  do_stack: any[] = [];
  needToJump: boolean = false;
  jumpingOver: any;
  possibleMovesLocations = new Array(); //Storing the locations of possible moves, so it will be faster to clean them later

  constructor() { }

  getSizeOfBoard(): number {
    return this.SIZE_OF_BOARD;
  }

  initBoard() {

    let board = new Array(this.SIZE_OF_BOARD)
    for (let i = 0; i < board.length; i++) {
      board[i] = new Array(this.SIZE_OF_BOARD)
    }

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let position = { row: i, col: j }
        board[i][j] = new Square(this.checkIfPlayableSquare(i, j), (i.toString() + j.toString))
        if (board[i][j].playable && (i <= 2 || i >= 5)) {
          board[i][j].haveChecker = true;
          if (i <= 2) {
            let checker = new Checker(position, this.players[0]);
            board[i][j].checker = checker;
          }
          if (i >= 5) {
            let checker = new Checker(position, this.players[1]);
            board[i][j].checker = checker;
          }
        }
      }
    }

    this.board = board;

    return board;
  }

  getBoard() {
    return this.board;
  }

  /**
   * Checking if a given square is playable
   * @param row the row of the square
   * @param col the col of the square
   * @returns true is it's playable, false if it's not
   */
  checkIfPlayableSquare(row: number, col: number) {
    if (row % 2 == 0 && col % 2 == 0)
      return true
    if (row % 2 !== 0 && col % 2 !== 0)
      return true
    else
      return false;
  }

  /**
   * checking move options for a given checker
   * @param checker 
   * @param row current row
   * @param col current col
   */
  showMoveOptions(checker: Checker, row: number, col: number) {
    if (checker.ownedBy !== this.turn) {
      return;
    }
    this.clearPossibleMoves();
    let state = { board: this.board, turn: this.turn }
    this.undo_stack.push((JSON.stringify(state)));

    this.onChecker = checker;

    // In case you clicked on your opponent checkers- do nothing
    if (this.turn == this.players[0] && checker.ownedBy == this.players[1])
      return;
    if (this.turn == this.players[1] && checker.ownedBy == this.players[0])
      return;
    else {
      if (checker.ownedBy == this.players[0]) {
        this.calcPlayerA_MoveOptions(checker, row, col);
      }

      if (checker.ownedBy == this.players[1]) {
        this.calcPlayerB_MoveOptions(checker, row, col);
      }
    }
    return this.board;
  }

  /**
   * calculates Player A(Red) move options for a given checker
   * @param checker the checker 
   * @param row the row of the checker
   * @param col the col of the checker
   */
  calcPlayerA_MoveOptions(checker: Checker, row: number, col: number) {
    if (row == 7) {
      return;
    }

    //checking if there is a possible jump
    let canJump = this.canJump(row, col, this.players[0])
    if (canJump) {
      this.board[canJump.row][canJump.col].possibleMove = true;
      let moveLocation = {
        row: canJump.row,
        col: canJump.col
      }
      this.possibleMovesLocations.push(moveLocation)
      this.needToJump = true;
      this.jumpingOver = canJump.checkerToJumpOver;

      return;
    }
    //If we are at col 0, we can't move to the left
    if (col == 0) {
      if (!this.board[row + 1][col + 1].haveChecker) {
        this.board[row + 1][col + 1].possibleMove = true;
        let moveLocation = {
          row: row + 1,
          col: col + 1
        }
        this.possibleMovesLocations.push(moveLocation)
      }
    }

    //If we are at col 7, we can't move to the right
    else if (col == 7) {
      if (!this.board[row + 1][col - 1].haveChecker) {
        this.board[row + 1][col - 1].possibleMove = true;
        let moveLocation = {
          row: row + 1,
          col: col - 1
        }
        this.possibleMovesLocations.push(moveLocation)
      }
    }

    else {
      if (!this.board[row + 1][col + 1].haveChecker) {
        this.board[row + 1][col + 1].possibleMove = true;
        let moveLocation = {
          row: row + 1,
          col: col + 1
        }
        this.possibleMovesLocations.push(moveLocation)
      }

      if (!this.board[row + 1][col - 1].haveChecker) {
        this.board[row + 1][col - 1].possibleMove = true;
        let moveLocation = {
          row: row + 1,
          col: col - 1
        }
        this.possibleMovesLocations.push(moveLocation)
      }
    }
  }

  /**
   * calculates Player B (Black) move options for a given checker
   * @param checker the checker 
   * @param row the row of the checker
   * @param col the col of the checker
   */
  calcPlayerB_MoveOptions(checker: Checker, row: number, col: number) {

    if (row == 0) {
      return;
    }

    let canJump = this.canJump(row, col, this.players[1])
    if (canJump) {
      this.board[canJump.row][canJump.col].possibleMove = true;
      let moveLocation = {
        row: canJump.row,
        col: canJump.col
      }
      this.possibleMovesLocations.push(moveLocation)
      this.needToJump = true;
      this.jumpingOver = canJump.checkerToJumpOver;
      return;
    }
    //If we are at col 0, we can't move to the left
    if (col == 0) {
      if (!this.board[row - 1][col + 1].haveChecker) {
        this.board[row - 1][col + 1].possibleMove = true;
        let moveLocation = {
          row: row - 1,
          col: col + 1
        }
        this.possibleMovesLocations.push(moveLocation)
      }
    }

    //If we are at col 7, we can't move to the right
    else if (col == 7) {
      if (!this.board[row - 1][col - 1].haveChecker) {
        this.board[row - 1][col - 1].possibleMove = true;
        let moveLocation = {
          row: row - 1,
          col: col - 1
        }
        this.possibleMovesLocations.push(moveLocation)
      }
    }

    else {
      if (!this.board[row - 1][col + 1].haveChecker) {
        this.board[row - 1][col + 1].possibleMove = true;
        let moveLocation = {
          row: row - 1,
          col: col + 1
        }
        this.possibleMovesLocations.push(moveLocation)
      }

      if (!this.board[row - 1][col - 1].haveChecker) {
        this.board[row - 1][col - 1].possibleMove = true;
        let moveLocation = {
          row: row - 1,
          col: col - 1
        }
        this.possibleMovesLocations.push(moveLocation)
      }
    }
  }

  /**Checks if a checker can jump (=eat) oppnent checker
   * @param row the row of the checker
   * @param col the col of the checker
   * @param player the current player
   * @returns the position of the checker after the jump, or false (if can't jump)
   */
  canJump(row: number, col: number, player: string): any {
    // Red turn
    if (player === this.players[0]) {

      if (row == 6) {
        return false;
      }

      //We can't jump (=eat) to the left if we are at col 0 or 1
      if (col == 0 || col == 1) {
        if (this.checkJumpToRight(row, col, player)) {
          let newPosition = {
            row: row + 2,
            col: col + 2,
            checkerToJumpOver: this.board[row + 1][col + 1].checker
          }
          return newPosition;
        }
        else {
          return false;
        }

      }
      //We can't jump to the right if we are at col 6 or 7
      if (col == 7 || col == 6) {
        if (this.checkJumpToLeft(row, col, player)) {
          let newPosition = {
            row: row + 2,
            col: col - 2,
            checkerToJumpOver: this.board[row + 1][col - 1].checker
          }
          return newPosition;
        }
        else {
          return false;
        }

      }
      else {
        let rightJump = this.checkJumpToRight(row, col, player);
        if (rightJump) {
          let newPosition = {
            row: row + 2,
            col: col + 2,
            checkerToJumpOver: this.board[row + 1][col + 1].checker
          }
          return newPosition;
        }
        else {
          let leftJump = this.checkJumpToLeft(row, col, player);
          if (leftJump) {
            let newPosition = {
              row: row + 2,
              col: col - 2,
              checkerToJumpOver: this.board[row + 1][col - 1].checker
            }
            return newPosition;
          }
        }
      }
    }

    // Black turn
    if (player === this.players[1]) {

      if (row == 1) {
        return false;
      }

      //We can't jump (=eat) to the left if we are at col 0 or 1
      if (col == 0 || col == 1) {
        if (this.checkJumpToRight(row, col, player)) {
          let newPosition = {
            row: row - 2,
            col: col + 2,
            checkerToJumpOver: this.board[row + 1][col + 1].checker
          }
          return newPosition;
        }
        else {
          return false;
        }
      }

      //We can't jump to the right if we are at col 6 or 7
      if (col == 7 || col == 6) {
        if (this.checkJumpToLeft(row, col, player)) {
          let newPosition = {
            row: row - 2,
            col: col - 2,
            checkerToJumpOver: this.board[row - 1][col - 1].checker
          }
          return newPosition;
        }
        else {
          return false;
        }

      }
      else {
        let rightJump = this.checkJumpToRight(row, col, player);
        if (rightJump) {
          let newPosition = {
            row: row - 2,
            col: col + 2,
            checkerToJumpOver: this.board[row - 1][col + 1].checker
          }
          return newPosition;
        }
        else {
          let leftJump = this.checkJumpToLeft(row, col, player);
          if (leftJump) {
            let newPosition = {
              row: row - 2,
              col: col - 2,
              checkerToJumpOver: this.board[row - 1][col - 1].checker
            }
            return newPosition;
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if a checker can jump to right
   * @param row the row of the checker
   * @param col the col of the checker
   * @param player the player that is making a move
   * @returns boolean answer
   */
  checkJumpToRight(row: number, col: number, player: string): boolean {
    // Red move
    if (player === this.players[0]) {
      if (this.board[row + 1][col + 1].haveChecker && this.board[row + 1][col + 1].checker.ownedBy === this.players[1]) {
        if (!this.board[row + 2][col + 2].haveChecker) {
          return true;
        }
      }
      return false;
    }

    // Black move
    if (player === this.players[1]) {
      if (this.board[row - 1][col + 1].haveChecker && this.board[row - 1][col + 1].checker.ownedBy === this.players[0]) {
        if (!this.board[row - 2][col + 2].haveChecker) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  /**
   * Check if a checker can jump to left
   * @param row the row of the checker
   * @param col the col of the checker
   * @param player the player that is making a move
   * @returns boolean answer
   */
  checkJumpToLeft(row: number, col: number, player: string): boolean {
    // Red moves
    if (player === this.players[0]) {
      if (this.board[row + 1][col - 1].haveChecker && this.board[row + 1][col - 1].checker.ownedBy === this.players[1]) {
        if (!this.board[row + 2][col - 2].haveChecker) {
          return true;
        }
      }
      return false;
    }

    // Black moves
    if (player === this.players[1]) {
      if (this.board[row - 1][col - 1].haveChecker && this.board[row - 1][col - 1].checker.ownedBy === this.players[0]) {
        if (!this.board[row - 2][col - 2].haveChecker) {
          return true;
        }
      }
      return false;
    }
    return false;
  }

  /**
   * jumping over a rival checker (if needed) OR moves the last clicked checker to a new location
   * @param newRow the new row of the checker
   * @param newCol the new col of the checker
   */
  move(newRow: number, newCol: number) {
    if (this.needToJump) {
      this.jump(newRow, newCol, this.jumpingOver)
      this.needToJump = false;
      this.jumpingOver = {};
      return;
    }
    else {
      this.moveChecker(newRow, newCol)
    }
  }

  /**
   * Jump(=eat) a checker over a rival checker
   * @param newRow the new row of the checker
   * @param newCol the new col of the checker
   * @param checkerToJumpOver the checker we jump over
   */
  jump(newRow: number, newCol: number, checkerToJumpOver: Checker) {
    this.moveChecker(newRow, newCol)
    this.removeCheckerFromBoard(checkerToJumpOver)
  }

  /**
   * moves the last clicked checker to a new location
   * @param newRow the new row of the checker
   * @param newCol the new col of the checker
   */
  moveChecker(newRow: number, newCol: number) {
    let state = { board: this.board, turn: this.turn }
    this.undo_stack.push(JSON.stringify(state));

    let checker = this.onChecker;
    if (checker) {
      this.removeCheckerFromBoard(checker)
      checker.position = { row: newRow, col: newCol };
      this.board[newRow][newCol].haveChecker = true;
      this.board[newRow][newCol].checker = checker;
    }
    if (this.turn == this.players[0])
      this.turn = this.players[1];
    else if (this.turn == this.players[1])
      this.turn = this.players[0];

    return this.board;
  }

  /**
   * undo the last action
   * @returns the board after the undo action
   */
  undo() {
    let temp = JSON.parse(this.undo_stack.pop());
    this.do_stack.push(JSON.stringify({ board: this.board, turn: this.turn }))
    this.board = temp.board;
    this.turn = temp.turn;

    return this.board;
  }

  /**
   * redo the last action that was canceled (only available after undo actions)
   * @returns the board after the redo action
   */
  redo() {
    let temp = JSON.parse(this.do_stack.pop())
    this.undo_stack.push(JSON.stringify({ board: this.board, turn: this.turn }))
    this.board = temp.board;
    this.turn = temp.turn;

    return this.board;
  }

  getUndoStackSize() {
    return this.undo_stack.length
  }
  getRedoStackSize() {
    return this.do_stack.length
  }

  getTurn() {
    return this.turn;
  }

  removeCheckerFromBoard(checker: Checker) {
    this.board[checker.position.row][checker.position.col].haveChecker = false;
    this.board[checker.position.row][checker.position.col].checker = null;

    if (checker.ownedBy === this.players[0]) {
      for (let j = 0; j < this.SIZE_OF_BOARD; j++) {
        if (this.board[checker.position.row + 1][j].possibleMove)
          this.board[checker.position.row + 1][j].possibleMove = false;
      }
    }

    if (checker.ownedBy === this.players[1]) {
      for (let j = 0; j < this.SIZE_OF_BOARD; j++) {
        if (this.board[checker.position.row - 1][j].possibleMove)
          this.board[checker.position.row - 1][j].possibleMove = false;
      }
    }

    this.clearPossibleMoves();
  }

  /**
   * Clears possible moves signs from board
   */
  clearPossibleMoves() {
    if (this.possibleMovesLocations.length == 0)
      return;

    for (let move of this.possibleMovesLocations) {
      this.board[move.row][move.col].possibleMove = false;
    }
    this.possibleMovesLocations = [];
  }
}
