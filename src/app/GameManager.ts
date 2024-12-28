type HighlightCallback = (cells: number[]) => void;
type GameUpdateCallback = () => void;

/**
 * GameManagerクラスは、メモリーゲームのロジックを管理します。
 * プレイヤーは、表示されたシーケンスを記憶し、同じ順序で入力する必要があります。
 * ゲームは、シーケンスが正しく入力されるたびに次のラウンドに進みます。
 * 最大シーケンス数に到達するとゲームクリアとなります。
 */
export class GameManager {
  private readonly gridSize: number; // グリッドサイズ
  private readonly maxSequence: number; // 最大シーケンス数
  private readonly highlightCallback: HighlightCallback; // 演出のコールバック
  private readonly gameUpdateCallback: GameUpdateCallback; // 状態更新のコールバック

  public sequence: number[] = []; // 現在の正解シーケンス
  public playerSequence: number[] = []; // プレイヤーの入力シーケンス
  public isPlaying: boolean = false; // ハイライト中かどうか
  public gameOver: boolean = false; // ゲームオーバー状態

  // コンストラクタで必要な情報を受け取る
  constructor(
    gridSize: number,
    maxSequence: number,
    highlightCallback: HighlightCallback,
    gameUpdateCallback: GameUpdateCallback
  ) {
    this.gridSize = gridSize;
    this.maxSequence = maxSequence;
    this.highlightCallback = highlightCallback;
    this.gameUpdateCallback = gameUpdateCallback;
  }

  // ゲームを開始する
  startGame(): void {
    this.sequence = [this.generateRandomCell()];
    this.playerSequence = [];
    this.gameOver = false;
    this.startHighlightSequence();
  }

  // プレイヤーの入力を処理する
  handlePlayerInput(index: number): void {
    if (this.isPlaying || this.gameOver) return;

    this.playerSequence.push(index);
    this.highlightCallback([index]); // ボタンを一時的にハイライトする
    setTimeout(() => this.highlightCallback([]), 500); // ハイライトを戻す

    if (!this.validatePlayerInput()) {
      // 入力が不正の場合、ゲームオーバー
      this.gameOver = true;
      this.gameUpdateCallback();
      return;
    }

    if (this.playerSequence.length === this.sequence.length) {
      // シーケンスをすべて正しく入力した場合、次のラウンドへ
      if (this.sequence.length === this.maxSequence) {
        // 最大シーケンスに到達した場合はクリア
        this.gameOver = true;
        this.gameUpdateCallback();
        return;
      }
      setTimeout(() => this.addNextSequence(), 1000); // 次のシーケンスを追加
    }
  }

  // 現在のシーケンスを順番にハイライトする
  private startHighlightSequence(): void {
    this.isPlaying = true;
    this.sequence.forEach((cell, index) => {
      setTimeout(() => {
        this.highlightCallback([cell]);
        setTimeout(() => this.highlightCallback([]), 500); // ハイライトを戻す
      }, index * 1000);
    });
    setTimeout(() => {
      this.isPlaying = false;
      this.gameUpdateCallback();
    }, this.sequence.length * 1000);
  }

  // 次のラウンドの準備としてランダムなセルを追加
  private addNextSequence(): void {
    this.sequence.push(this.generateRandomCell());
    this.playerSequence = [];
    this.startHighlightSequence();
  }

  // ランダムなセル番号を生成
  private generateRandomCell(): number {
    return Math.floor(Math.random() * (this.gridSize * this.gridSize));
  }

  // プレイヤー入力が正しいか検証
  private validatePlayerInput(): boolean {
    const currentIndex = this.playerSequence.length - 1;
    return this.playerSequence[currentIndex] === this.sequence[currentIndex];
  }
}
