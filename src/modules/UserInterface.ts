/**
 * Created by slava on 16/04/17.
 */

import * as $ from 'jquery';
import CanvasMap from './CanvasMap';
import Logger from "./Logger";

export default class UserInterface {
    currentMap: CanvasMap;


    attachAllUIListeners() {
        UserInterface.attachLogToggleButton();
        UserInterface.attachTabListeners();
        UserInterface.attachSliderListeners();
        this.addGenerateButtonListener();
        this.handlePopulateButtonClick();
        this.handleButtonRenderFull();
    }

    static attachLogToggleButton() {
        let button = document.querySelector('.js-toggle-log');
        button.addEventListener('click', UserInterface.toggleLogButton);
    }

    static toggleLogButton() {
        let panelDisplay = <HTMLElement>document.querySelector('.logWindow');
        if (!panelDisplay.style.display || panelDisplay.style.display === 'block') {
            panelDisplay.style.display = 'none';
        } else {
            panelDisplay.style.display = 'block';
        }
    }

    static attachTabListeners() {
        $('.js-tab-link').on('click', (e: Event) => {
            e.preventDefault();
            // Remove all isActive classes, hide all tabbed content
            $('.js-tab-link').removeClass('is-active');
            $('.tabbed-item').hide();
            // Add active class to the one clicked
            let target:any = e.target;

            $(target.parentNode).addClass('is-active');
            $('.' + $(target.parentNode).attr('data-tab-target')).show();

        });
    }

    static toggleIsActiveClass(item: any) {
        let jItem = $(item);
        if (jItem.hasClass('is-active')) {
            jItem.removeClass('is-active');
        } else {
            jItem.addClass('is-active');
        }
    }

    static attachSliderListeners() {
        // Scale slider
        $('#map_scale').on('input', (e) => {
            let target: any = e.target;
            $('.js-current-scale').html(target.value);
        });
        // Octaves
        $('#map_octaves').on('input', (e) => {
            let target: any = e.target;
            $('.js-current-octaves').html(target.value);
        });
        // Lacunarity
        $('#map_lacunarity').on('input', (e) => {
            let target: any = e.target;
            $('.js-current-lacunarity').html(target.value);
        });
        // Persistance
        $('#map_persistence').on('input', (e) => {
            let target: any = e.target;
            $('.js-current-persistence').html(target.value);
        });
    }

    addGenerateButtonListener() {
        let UI = this;

        $('.js-generate-map').on('click', (e) => {
            $('.js-generate-map').addClass('is-loading');

            // Gather input fields, pass to Generator

            const canvasId = 'main_map';
            // TODO: add fields to change canvas dimensions programmatically
            let width = 750;
            let height = 400;

            let seed = $('#map_seed').val();
            let scale = $('#map_scale').val();
            let octaves = $('#map_octaves').val();
            let lacunarity = $('#map_lacunarity').val();
            let persistence = $('#map_persistence').val();

            let map = new CanvasMap(canvasId);
            map.generatePerlinBased(seed, scale, octaves, persistence, lacunarity);
            map.renderOnCanvas();
            UserInterface.handleMapZoom(map);

            // Save map to the object
            UI.currentMap = map;

        });
    }

    static stopGenerateButtonLoading() {
        $('.js-generate-map').removeClass('is-loading');
    }

    static handleMapZoom(map: CanvasMap) {
        // Handle zooming area
        const mapDiv: any = document.getElementById('zoom_map');
        let zoomContext = mapDiv.getContext('2d');

        const canvas = document.getElementById('main_map');

        // Disable anti aliasing
        zoomContext.imageSmoothingEnabled = false;
        zoomContext.mozImageSmoothingEnabled = false;
        zoomContext.webkitImageSmoothingEnabled = false;

        const zoom = function (event: any) {
            let x = event.layerX;
            let y = event.layerY;

            zoomContext.drawImage(
                canvas,
                Math.abs(x-18),
                Math.abs(y-18),
                50, 50,
                0, 0,
                400, 400
            );

            zoomContext.fillStyle = 'rgb(195,0,0)';
            zoomContext.fillRect(144,144,8,8);

            $('.cur-x').html(x);
            $('.cur-y').html(y);

            // Make pixel looked at green

            //let pixel = zoomContext.getImageData(x,y,1,1);
            //let pixelData = pixel.data;


        };

        const updateZoomInfo = function(event: any){

            let x = event.layerX;
            let y = event.layerY;

            $('.js-clicked-x').html(x);
            $('.js-clicked-y').html(y);

            const tile = map.tiles[y][x];

            // Find map stuff
            let type: any = tile.type.name;
            let altitude: any = Math.floor(tile.altitude);
            let passable: any = tile.type.passable;
            let settlement: any = tile.hasSettlement;

            $('.js-clicked-type').html(type);
            $('.js-clicked-altitude').html(altitude);
            $('.js-clicked-passable').html(passable.toString());
            $('.js-clicked-hasSettlement').html(settlement.toString());

        };

        canvas.addEventListener('mousemove', zoom);
        canvas.addEventListener('click', updateZoomInfo);
    }

    handlePopulateButtonClick(){

        // Bind the scope
        let UI = this;

        $('.js-populate-map').on('click', () => {
            if (UI.currentMap){
                UI.currentMap.addRandomColony();
            } else {
                console.log('No map has been generated');
            }
        });

    }

    handleButtonRenderFull(){
        let UI = this;

        $('.js-render-full').on('click', () => {
            if (UI.currentMap){
                UI.currentMap.renderOnCanvas();
            } else {
                Logger.logError('No map present');
            }
        });
    }
}