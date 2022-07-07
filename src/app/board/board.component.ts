import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { Checker } from './checker';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {

  constructor(private gameService: GameService) { }

  size_of_board: number = this.gameService.getSizeOfBoard();
  turn = this.gameService.turn;

  ngOnInit(): void {

  }


  board = this.gameService.initBoard();

  /**
   * requesting the service to check move options for a given checker
   * @param checker 
   * @param row current row
   * @param col current col
   */
  showMoveOptions(checker: Checker, row: number, col: number) {
    let resp = this.gameService.showMoveOptions(checker, row, col);

    // If there is any move options available, update the board
    if (resp) {
      this.board = resp;
    }
  }

  /**
   * Requesting the service to move the last clicked checker to a given location
   * @param newRow the location of the new row
   * @param newCol the location of the new col
   */
  move(newRow: number, newCol: number) {
    this.gameService.move(newRow, newCol);
    this.board = this.gameService.getBoard();
    this.turn = this.gameService.getTurn();
  }

  undo() {
    if (this.gameService.getUndoStackSize() > 0) {
      this.board = this.gameService.undo();
      this.turn = this.gameService.getTurn();
    }
  }

  redo() {
    if (this.gameService.getRedoStackSize() > 0) {
      this.board = this.gameService.redo();
      this.turn = this.gameService.getTurn();
    }
  }
}
