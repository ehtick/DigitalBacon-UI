/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import LayoutComponent from '/scripts/components/LayoutComponent.js';
import PointerInteractable from '/scripts/interactables/PointerInteractable.js';
import TouchInteractable from '/scripts/interactables/TouchInteractable.js';
import PointerInteractableHandler from '/scripts/handlers/PointerInteractableHandler.js';
import TouchInteractableHandler from '/scripts/handlers/TouchInteractableHandler.js';
import { capitalizeFirstLetter } from '/scripts/utils.js';
import * as THREE from 'three';

class InteractableComponent extends LayoutComponent {
    constructor(...styles) {
        super(...styles);
        this.pointerInteractable = new PointerInteractable(this);
        this.touchInteractable = new TouchInteractable(this);
        this._clickAction = (e) => this._pointerClick(e);
        this._dragAction = (e) => this._pointerDrag(e);
        this._touchAction = (e) => this._touch(e);
        this._touchDragAction = (e) => this._touchDrag(e);
        this.addEventListener('added', () => this._onAdded());
        this.addEventListener('removed', () => this._onRemoved());
    }

    _createBackground() {
        super._createBackground();
        this.pointerInteractable.setObject(this._background);
        this.touchInteractable.setObject(this._background);
    }

    _pointerClick(e) {
        if(this._onClick) {
            this._onClick(e);
        }
    }

    _pointerDrag(e) {
        if(this._onDrag) {
            this._onDrag(e);
        }
    }

    _touch(e) {
        if(this._onTouch) {
            this._onTouch(e);
        }
    }

    _touchDrag(e) {
        if(this._onTouchDrag) {
            this._onTouchDrag(e);
        }
    }

    _onAdded() {
        let p = this.parentComponent;
        if(p instanceof InteractableComponent) {
            p.pointerInteractable.addChild(this.pointerInteractable);
            p.touchInteractable.addChild(this.touchInteractable);
        } else {
            p = this.parent;
            while(p) {
                if(p instanceof THREE.Scene) {
                    PointerInteractableHandler.addInteractable(
                        this.pointerInteractable);
                    TouchInteractableHandler.addInteractable(
                        this.touchInteractable);
                    return;
                }
                p = p.parent;
            }
            PointerInteractableHandler.removeInteractable(
                this.pointerInteractable);
            TouchInteractableHandler.removeInteractable(this.touchInteractable);
        }
    }

    _onRemoved() {
        if(this.pointerInteractable.parent) {
            this.pointerInteractable.parent.removeChild(
                this.pointerInteractable);
        } else {
            PointerInteractableHandler.removeInteractable(
                this.pointerInteractable);
        }
    }

    _setCallback(interactable, type, name, newCallback) {
        let callbackName = '_on' + capitalizeFirstLetter(name);
        let localCallbackName = '_' + name + 'Action';
        if(newCallback && !this[callbackName]) {
            interactable.addEventListener(type, this[localCallbackName]);
        } else if(!newCallback && this[callbackName]) {
            interactable.removeEventListener(type, this[localCallbackName]);
        }
        this[callbackName] = newCallback;
    }

    get onClick() { return this._onClick; }
    get onDrag() { return this._onDrag; }
    get onTouch() { return this._onTouch; }
    get onTouchDrag() { return this._onTouchDrag; }

    set onClick(v) {
        this._setCallback(this.pointerInteractable, 'click', 'click', v);
    }
    set onDrag(v) {
        this._setCallback(this.pointerInteractable, 'drag', 'drag', v);
    }
    set onTouch(v) {
        this._setCallback(this.touchInteractable, 'click', 'touch', v);
    }
    set onTouchDrag(v) {
        this._setCallback(this.touchInteractable, 'drag', 'touchDrag', v);
    }
}

export default InteractableComponent;
