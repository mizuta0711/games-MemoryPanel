import { GameDifficulty } from './types';

type HighlightCallback = (cells: number[]) => void;
type GameUpdateCallback = () => void;

/**
 * 難易度に応じたゲーム設定
 * @type {Object.<GameDifficulty, {timing: number, gridSize: number, sequences: number}>}
 */
const DIFFICULTY_SETTINGS = {
    easy: { timing: 1500, gridSize: 2, sequences: 4 },
    normal: { timing: 1000, gridSize: 3, sequences: 9 },
    hard: { timing: 500, gridSize: 4, sequences: 16 },
    expert: { timing: 250, gridSize: 5, sequences: 25 },
    oni: { timing: 100, gridSize: 5, sequences: 50 },
}

/**
 * GameManagerクラスは、メモリーゲームのロジックを管理します。
 * プレイヤーは、表示されたシーケンスを記憶し、同じ順序で入力する必要があります。
 * ゲームは、シーケンスが正しく入力されるたびに次のラウンドに進みます。
 * 最大シーケンス数に到達するとゲームクリアとなります。
 */
export class GameManager {
    private readonly START_INTERVAL: number = 1000; // ハイライトの間隔
    private readonly HIGH_LIGHT_INTERVAL: number = 1000; // ハイライトの間隔
    private readonly HIGH_LIGHT_DURATION: number = 500; // ハイライトの持続時間
    private readonly INPUT_HIGH_LIGHT_DURATION: number = 500; // ユーザー入力のハイライトの持続時間
    private readonly NEXT_ROUND_INTERVAL: number = 1000; // 次のラウンドの間隔

    public readonly difficulty: GameDifficulty; // 難易度
    private readonly gridSize: number; // グリッドサイズ
    private readonly maxSequence: number; // 最大シーケンス数
    private readonly highlightCallback: HighlightCallback; // 演出のコールバック
    private readonly gameUpdateCallback: GameUpdateCallback; // 状態更新のコールバック

    public sequence: number[] = []; // 現在の正解シーケンス
    public playerSequence: number[] = []; // プレイヤーの入力シーケンス
    public isPlaying: boolean = false; // ゲーム中かどうか
    public isHilighting: boolean = false; // ハイライト中かどうか
    public isCorrect: boolean = false; // プレイヤーの入力が正しいかどうか
    public isGameOver: boolean = false; // ゲームオーバー状態
    public highlightedCells: number[] = []; // ハイライトされたセル

    /**
     * コンストラクタで必要な情報を受け取る
     * @param gridSize グリッドサイズ
     * @param maxSequence 最大シーケンス数
     * @param highlightCallback 演出のコールバック
     * @param gameUpdateCallback 状態更新のコールバック
     * @param difficulty 難易度
     */
    constructor(
        difficulty: GameDifficulty,
        highlightCallback: HighlightCallback,
        gameUpdateCallback: GameUpdateCallback
    ) {
        const { timing, gridSize, sequences } = DIFFICULTY_SETTINGS[difficulty]
        this.gridSize = gridSize;
        this.maxSequence = sequences;
        this.highlightCallback = highlightCallback;
        this.gameUpdateCallback = gameUpdateCallback;
        this.difficulty = difficulty;

        // 難易度に応じてタイミングを調整
        this.HIGH_LIGHT_INTERVAL = timing;
        this.HIGH_LIGHT_DURATION = timing * 0.75;
    }

    // グリッドサイズを取得
    getGridSize(): number {
        return this.gridSize;
    }

    // 難易度に応じたグリッドサイズを取得
    getDifficultyGridSize(difficulty: GameDifficulty): number {
        return DIFFICULTY_SETTINGS[difficulty].gridSize;
    }

    /**
     * ゲームを開始する
     */
    startGame(): void {
        this.sequence = [this.generateRandomCell()];
        this.playerSequence = [];
        this.highlightedCells = [];
        this.isPlaying = true;
        this.isGameOver = false;
        this.isHilighting = true;
        this.isCorrect = false;
        // 最初のシーケンスをハイライト
        this.startHighlightSequence();
        this.gameUpdateCallback();
    }

    /**
     * ゲームオーバー状態にする
     */
    private gameOver(): void {
        this.isPlaying = false;
        this.isGameOver = true;
        this.isHilighting = false;
        this.isCorrect = false;
        this.gameUpdateCallback();
    }

    /**
     * プレイヤーの入力を処理する
     * @param index プレイヤーが入力したセルのインデックス
     */
    handlePlayerInput(index: number): void {
        if (!this.isPlaying || this.isHilighting || this.isGameOver) return;

        // ハイライト中のセルは無視（重複入力を防ぐ）
        if (this.highlightedCells.includes(index)) return;

        // プレイヤーの入力を処理
        this.playerSequence.push(index);
        this.addHighlight(index); // ボタンをハイライトする
        setTimeout(() => this.removeHighlight(index), this.INPUT_HIGH_LIGHT_DURATION); // ハイライトを戻す

        // 入力が不正の場合、ゲームオーバー
        if (!this.validatePlayerInput()) {
            this.gameOver();
            return;
        }

        // 入力が正しい場合
        if (this.playerSequence.length === this.sequence.length) {
            // シーケンスをすべて正しく入力した場合、次のラウンドへ
            if (this.sequence.length === this.maxSequence) {
                // 最大シーケンスに到達した場合はクリア
                this.gameOver();
                return;
            }
            // 次のシーケンスを追加
            this.isCorrect = true;
            this.gameUpdateCallback();
            setTimeout(() => this.addNextSequence(), this.NEXT_ROUND_INTERVAL);
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
        this.isHilighting = true;

        // シーケンスを順番にハイライト
        this.sequence.forEach((cell, index) => {
            setTimeout(() => {
                this.addHighlight(cell);
                setTimeout(() => this.removeHighlight(cell), this.HIGH_LIGHT_DURATION); // ハイライトを戻す
            }, this.START_INTERVAL + index * this.HIGH_LIGHT_INTERVAL);
        });

        // ハイライトが終わったら、ハイライト中フラグを戻す
        setTimeout(() => {
            this.isHilighting = false;
            this.isCorrect = false;
            this.gameUpdateCallback();
        }, this.START_INTERVAL + this.sequence.length * this.HIGH_LIGHT_INTERVAL);
    }

    /**
     * 次のラウンドの準備としてランダムなセルを追加
     */
    private addNextSequence(): void {
        this.isCorrect = false;
        this.sequence.push(this.generateRandomCell());
        this.playerSequence = [];
        this.startHighlightSequence();
        this.gameUpdateCallback();
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
