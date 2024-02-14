/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import DeviceTypes from '/scripts/enums/DeviceTypes.js';
import InteractionTool from '/scripts/handlers/InteractionTool.js';

export default class InteractableHandler {
    constructor() {
        this._interactables = new Set();
        this._hoveredInteractables = new Map();
        this._selectedInteractables = new Map();
        this._capturedInteractables = new Map();
        this._overInteractables = new Map();
        this._wasPressed = new Map();
        this._listeners = {};
        this._tool = null;
        this._toolHandlers = {};
    }

    _setupXRSubscription() {
        InteractionTool.addUpdateListener((tool) => {
            for(let [option, interactable] of this._hoveredInteractables) {
                if(interactable) interactable.removeHoveredBy(option);
                this._hoveredInteractables.delete(option);
            }
            for(let [option, interactable] of this._selectedInteractables) {
                if(!interactable) continue;
                let count = 0;
                if(tool) count += interactable.getCallbacksLength(tool);
                if(this._tool) count += interactable.getCallbacksLength(
                    this._tool);
                if(count) {
                    interactable.removeSelectedBy(option);
                    this._selectedInteractables.delete(option);
                }
            }
            this._tool = tool;
        });
    }

    init() {
        if(DeviceTypes.active == "XR") {
            this.update = this._updateForXR;
            this._setupXRSubscription();
        } else if(DeviceTypes.active == "POINTER") {
            this.update = this._updateForPointer;
        } else if(DeviceTypes.active == "TOUCH_SCREEN") {
            this.update = this._updateForTouchScreen;
        }
    }

    addEventListener(type, callback) {
        if(!(type in this._listeners)) this._listeners[type] = new Set();
        this._listeners[type].add(callback);
    }

    removeEventListener(type, callback) {
        if(!(type in this._listeners)) return;
        this._listeners[type].delete(callback);
        if(this._listeners[type].size == 0) delete this._listeners[type];
    }

    _trigger(type, eventDetails, interactable) {
        if(this._listeners[type]) {
            let eventCopy = { ...eventDetails };
            if(interactable) {
                eventCopy.target = interactable.getObject();
                interactable[type](eventDetails);
            }
            for(let callback of this._listeners[type]) {
                callback(eventCopy);
            }
        } else if(interactable) {
            interactable[type](eventDetails);
        }
    }

    registerToolHandler(tool, handler) {
        this._toolHandlers[tool] = handler;
    }

    addInteractable(interactable) {
        this._interactables.add(interactable);
    }

    addInteractables(interactables) {
        interactables.forEach((interactable) => {
            this._interactables.add(interactable);
        });
    }

    removeInteractable(interactable) {
        this._interactables.delete(interactable);
        interactable.reset();
    }

    removeInteractables(interactables) {
        interactables.forEach((interactable) => {
            this._interactables.delete(interactable);
            interactable.reset();
        });
    }

    reset() {
        this._interactables.forEach(interactable => { interactable.reset(); });
        this._interactables = new Set();
        this._hoveredInteractables = new Map();
        this._selectedInteractables = new Map();
    }

    update() {}
    _updateForXR() {}
    _updateForPointer() {}
    _updateForTouchScreen() {}

}
