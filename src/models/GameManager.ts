/**
 * ゲーム管理クラス
 * @class GameManager
 * 
 * @property {number} gridSize - グリッドのサイズ
 * @property {number} maxSequence - 最大シーケンス数
 * @property {number} highlightDuration - ハイライトの持続時間（ミリ秒）
 * @property {number} highlightInterval - ハイライトの間隔（ミリ秒）
 * @property {number} nextSequenceInterval - 次のシーケンスまでの間隔（ミリ秒）
 * @property {number[]} sequence - 現在のシーケンス
 * @property {number[]} playerSequence - プレイヤーのシーケンス
 * @property {boolean} isPlaying - ゲームが進行中かどうか
 * @property {boolean} gameOver - ゲームオーバーかどうか
 * @property {number[]} highlightedCells - ハイライトされているセル
 * 
 * @constructor
 * @param {number} [gridSize=3] - グリッドのサイズ
 * @param {number} [maxSequence=10] - 最大シーケンス数
 * @param {number} [highlightDuration=500] - ハイライトの持続時間（ミリ秒）
 * @param {number} [highlightInterval=1000] - ハイライトの間隔（ミリ秒）
 * @param {number} [nextSequenceInterval=2000] - 次のシーケンスまでの間隔（ミリ秒）
 * 
 * @method startGame - ゲームを開始する
 * @method handleCardClick - カードがクリックされたときの処理
 * @param {number} index - クリックされたカードのインデックス
 * 
 * @method highlightSequence - シーケンスをハイライトする
 * @param {() => void} callback - ハイライト後に呼び出されるコールバック関数
 */
export default class GameManager {
  sequence: number[] = []
  gridSize: number
  maxSequence: number

  constructor(gridSize: number, maxSequence: number) {
    this.gridSize = gridSize
    this.maxSequence = maxSequence
  }

  // シーケンスを初期化
  startGame() {
    this.sequence = [this.generateRandomCell()]
  }

  // シーケンスを拡張
  addNextCell() {
    this.sequence.push(this.generateRandomCell())
  }

  // ランダムなセルを生成
  private generateRandomCell(): number {
    return Math.floor(Math.random() * (this.gridSize * this.gridSize))
  }

  // プレイヤーの入力が正しいか確認
  validatePlayerInput(playerSequence: number[]): boolean {
    const currentIndex = playerSequence.length - 1
    return playerSequence[currentIndex] === this.sequence[currentIndex]
  }

  // ゲームクリア条件を確認
  isGameClear(): boolean {
    return this.sequence.length === this.maxSequence
  }
}