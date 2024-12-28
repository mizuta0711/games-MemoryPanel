type HighlightCallback = (cells: number[]) => void;
type GameUpdateCallback = () => void;

/**
 * GameManagerクラスは、メモリーゲームのロジックを管理します。
 * プレイヤーは、表示されたシーケンスを記憶し、同じ順序で入力する必要があります。
 * ゲームは、シーケンスが正しく入力されるたびに次のラウンドに進みます。
 * 最大シーケンス数に到達するとゲームクリアとなります。
 */
export class GameManager {
  private readonly HIGH_LIGHT_INTERVAL: number = 1000; // ハイライトの間隔
  private readonly HIGH_LIGHT_DURATION: number = 500; // ハイライトの持続時間
  private readonly NEXT_ROUND_INTERVAL: number = 1000; // 次のラウンドの間隔

  private readonly gridSize: number; // グリッドサイズ
  private readonly maxSequence: number; // 最大シーケンス数
  private readonly highlightCallback: HighlightCallback; // 演出のコールバック
  private readonly gameUpdateCallback: GameUpdateCallback; // 状態更新のコールバック

  public sequence: number[] = []; // 現在の正解シーケンス
  public playerSequence: number[] = []; // プレイヤーの入力シーケンス
  public isPlaying: boolean = false; // ハイライト中かどうか
  public gameOver: boolean = false; // ゲームオーバー状態
  public highlightedCells: number[] = []; // ハイライトされたセル

  /**
   * コンストラクタで必要な情報を受け取る
   * @param gridSize グリッドサイズ
   * @param maxSequence 最大シーケンス数
   * @param highlightCallback 演出のコールバック
   * @param gameUpdateCallback 状態更新のコールバック
   */
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

  /**
   * ゲームを開始する
   */
  startGame(): void {
    this.sequence = [this.generateRandomCell()];
    this.playerSequence = [];
    this.highlightedCells = [];
    this.gameOver = false;
    this.startHighlightSequence();
  }

  /**
   * プレイヤーの入力を処理する
   * @param index プレイヤーが入力したセルのインデックス
   */
  handlePlayerInput(index: number): void {
    if (this.isPlaying || this.gameOver) return;

    // ハイライト中のセルは無視（重複入力を防ぐ）
    if (this.highlightedCells.includes(index)) return;

    // プレイヤーの入力を処理
    this.playerSequence.push(index);
    this.addHighlight(index); // ボタンをハイライトする
    setTimeout(() => this.removeHighlight(index), this.HIGH_LIGHT_DURATION); // ハイライトを戻す

      // 入力が不正の場合、ゲームオーバー
      if (!this.validatePlayerInput()) {
      this.gameOver = true;
      this.gameUpdateCallback();
      return;
    }

    // 入力が正しい場合
    if (this.playerSequence.length === this.sequence.length) {
      // シーケンスをすべて正しく入力した場合、次のラウンドへ
      if (this.sequence.length === this.maxSequence) {
        // 最大シーケンスに到達した場合はクリア
        this.gameOver = true;
        this.gameUpdateCallback();
        return;
      }
      setTimeout(() => this.addNextSequence(), this.NEXT_ROUND_INTERVAL); // 次のシーケンスを追加
    }
  }

  /**
   * ハイライトするセルを追加
   * @param cell ハイライトするセルのインデックス
   */
  private addHighlight(cell: number): void {
    this.highlightedCells.push(cell);
    this.highlightCallback([...this.highlightedCells]);
  }

  /**
   * ハイライトしたセルの削除
   * @param cell ハイライトを削除するセルのインデックス
   */
  private removeHighlight(cell: number): void {
    this.highlightedCells = this.highlightedCells.filter((c) => c !== cell);
    this.highlightCallback([...this.highlightedCells]);
  }

  /**
   * 現在のシーケンスを順番にハイライトする
   */
  private startHighlightSequence(): void {
    this.isPlaying = true;
    this.sequence.forEach((cell, index) => {
      setTimeout(() => {
        this.addHighlight(cell);
        setTimeout(() => this.removeHighlight(cell), this.HIGH_LIGHT_DURATION); // ハイライトを戻す
      }, index * this.HIGH_LIGHT_INTERVAL);
    });
    setTimeout(() => {
      this.isPlaying = false;
      this.gameUpdateCallback();
    }, this.sequence.length * this.HIGH_LIGHT_INTERVAL);
  }

  /**
   * 次のラウンドの準備としてランダムなセルを追加
   */
  private addNextSequence(): void {
    this.sequence.push(this.generateRandomCell());
    this.playerSequence = [];
    this.startHighlightSequence();
  }

  /**
   * ランダムなセル番号を生成
   * @returns ランダムなセル番号
   */
  private generateRandomCell(): number {
    let cell;
    const maxCells = this.gridSize * this.gridSize;

    // sequenceの要素数がgridSize*gridSizeよりも大きい場合、端数を切り出す
    // 端数を求める
    const remainder = this.sequence.length % maxCells;
    const usedSequence = (remainder === 0) ? [] : this.sequence.slice(-remainder);

    // 重複しない番号を生成
    do {
      cell = Math.floor(Math.random() * maxCells);
    } while (usedSequence.includes(cell));

    return cell;
  }

  /**
   * プレイヤー入力が正しいか検証
   * @returns プレイヤー入力が正しいかどうか
   */
  private validatePlayerInput(): boolean {
    const currentIndex = this.playerSequence.length - 1;
    return this.playerSequence[currentIndex] === this.sequence[currentIndex];
  }
}
