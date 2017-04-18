/**
 * Created by slava on 16/04/17.
 */


import Tile from './Tile';
import TileTypes from './TileTypeEnum';
import Generator from './Generator';
import CanvasHelper from "./CanvasHelper";
import MathsHelper from "./MathsHelper";
import Logger from "./Logger";
import Colony from "./Colony";


export default class CanvasMap {
    colonies: Array<Colony>;
    width: number;
    height: number;
    canvasId: string;
    tiles: Array<Array<Tile>>;

    /**
     * Creates a new map with given dimensions and fills it with ocean cells
     * @param canvasId
     */
    constructor(canvasId: string) {

        // Get width and height programmatically from the canvas
        const canvasDiv = document.getElementById(canvasId);
        const width = canvasDiv.clientWidth;
        const height = canvasDiv.clientHeight;
        this.colonies = [];

        this.canvasId = canvasId;


        // Create ocean cells
        this.tiles = [];

        for (let h = 0; h < this.height; h++) {
            this.tiles[h] = [];
            for (let w = 0; w < this.width; w++) {
                this.tiles[h][w] = new Tile(w, h, TileTypes.DEEP_WATER, -5000);
            }
        }

    }


    renderOnCanvas() {
        CanvasHelper.drawMap(this, this.canvasId);
    }

    generatePerlinBased(seed: number, scale: number, octaves: number, persistence: number, lacunarity: number, useFalloffMap: boolean = true) {

        const perlinMatrix = Generator.createPerlinNoiseMatrix(this.width, this.height, seed, scale, octaves, persistence, lacunarity);
        let falloffMatrix: Array<Array<number>> = [];
        if (useFalloffMap){
            falloffMatrix = Generator.createFalloffMap(this.width, this.height);
        }

        for (let h = 0; h < this.height; h++) {
            this.tiles[h] = [];
            for (let w = 0; w < this.width; w++) {

                let value: number;
                if (useFalloffMap){
                    let subtracted = perlinMatrix[h][w] - falloffMatrix[h][w];
                    value = MathsHelper.clampNumber(subtracted);
                } else {
                    value = perlinMatrix[h][w];
                }

                const altitude = (value + 1) * 3500 - 2000;

                this.tiles[h][w] = new Tile(w, h, Tile.getTypeByAltitude(altitude), altitude);
            }
        }


    }

    addColony(){

    }

    addRandomColony(){
        // Take a random spot, check requirements, repeat until a spot is found
        let randomTile = this.getRandomPassableTile();
        const x = randomTile.xCor;
        const y = randomTile.yCor;
        randomTile.hasSettlement = true;

        let newColony = new Colony(x,y);
        randomTile.colony = newColony;
        this.colonies.push(newColony);

        CanvasHelper.drawMapPart(this, x-5, y-5, 10);

        Logger.logGood(`Settlement placed on X: ${x}, Y: ${y}`);

        console.log(randomTile,this.colonies);

    }

    addLargeRandomSettlement(size = 9){
        let randomTile = this.getRandomPassableTile();

        const x = randomTile.xCor;
        const y = randomTile.yCor;

        // Find the middle
        const middle = Math.floor(size/2) + 1;

        const startX = x - Math.floor(size/2);
        const startY = y - Math.floor(size/2);

        for (let iy = 0; iy < size; iy ++){
            for (let ix = 0; ix < size; ix ++){
                let tile = this.tiles[startY + iy][startX + ix];
                if (tile.type.passable){
                    tile.hasSettlement = true;
                }
            }
        }

        CanvasHelper.drawMapPart(this, startX -5, startY - 5, 20);


    }

    getRandomTile(){
        const randX = Math.floor(Math.random() * this.width);
        const randY = Math.floor(Math.random() * this.height);

        return this.tiles[randY][randX];
    }

    getRandomPassableTile(){
        let tile = this.getRandomTile();
        while(!tile.type.passable){
            tile = this.getRandomTile();
        }
        return tile;
    }

    updateSinglePixel(x,y){

        // Draw a Rect using the colour needed on the pixel needed

    }

}