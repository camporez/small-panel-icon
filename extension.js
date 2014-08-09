/*
    This code is based on https://github.com/emerinohdz/status-title-bar/blob/master/src/extension.js
    Author: Ian Camporez Brunelli <ian at camporez dot com>
    Project page: https://github.com/camporez/small-panel-icon
*/

const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Main = imports.ui.main;
const Panel = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

const PANEL_ICON_SIZE = 24;

const TopPanelButton = new Lang.Class({
    Name: 'TopPanelButton',
    Extends: Panel.AppMenuButton,

    _init: function(panel) {
        this.parent(panel);
        this._container.connect('get-preferred-width', Lang.bind(this, this._getContentPreferredWidth));
    },

    _syncIcon: function() {
        if (!this._targetApp)
            return;

        let icon = new St.Icon({ gicon: this._targetApp.get_app_info().get_icon(), icon_size: PANEL_ICON_SIZE });
        this._iconBox.set_child(icon);
    },
    
    _getContentPreferredWidth: function(actor, forHeight, alloc) {
        let [minSize, naturalSize] = this._iconBox.get_preferred_width(forHeight);
        alloc.min_size = minSize + Math.floor(PANEL_ICON_SIZE * 2) + 20;
        alloc.natural_size = naturalSize + Math.floor(PANEL_ICON_SIZE * 2) + 20;
        [minSize, naturalSize] = this._hbox.get_preferred_width(forHeight);
        alloc.min_size = alloc.min_size + Math.max(0, minSize - Math.floor(alloc.min_size / 2));
        alloc.natural_size = alloc.natural_size + Math.max(0, naturalSize - Math.floor(alloc.natural_size / 2));
    },

    _contentAllocate: function(actor, box, flags) {
        let allocWidth = box.x2 - box.x1;
        let allocHeight = box.y2 - box.y1;
        let childBox = new Clutter.ActorBox();

        let [minWidth, minHeight, naturalWidth, naturalHeight] = this._iconBox.get_preferred_size();

        let direction = this.actor.get_text_direction();

        let yPadding = Math.floor(Math.max(0, allocHeight - naturalHeight) / 2);
        childBox.y1 = yPadding;
        childBox.y2 = childBox.y1 + Math.min(naturalHeight, allocHeight);
        if (direction == Clutter.TextDirection.LTR) {
            childBox.x1 = 10;
            childBox.x2 = childBox.x1 + Math.min(naturalWidth, allocWidth);
        } else {
            childBox.x1 = Math.max(10, allocWidth - naturalWidth);
            childBox.x2 = allocWidth;
        }
        this._iconBox.allocate(childBox, flags);

        let iconWidth = childBox.x2 - childBox.x1;

        [minWidth, naturalWidth] = this._hbox.get_preferred_width(-1);

        childBox.y1 = 0;
        childBox.y2 = allocHeight;

        if (direction == Clutter.TextDirection.LTR) {
            childBox.x1 = Math.floor(iconWidth + 13);
            childBox.x2 = Math.floor(iconWidth + 13) + Math.min(childBox.x1 + naturalWidth, allocWidth);
        } else {
            childBox.x2 = allocWidth - Math.floor(iconWidth + 13);
            childBox.x1 = Math.max(0, childBox.x2 - naturalWidth);
        }
        this._hbox.allocate(childBox, flags);
    },

});

const TopPanel = new Lang.Class({
    Name: 'TopPanel',

    enable: function() {
        this._replaceAppMenu(new TopPanelButton(Main.panel));
    },

disable: function() {
        this._replaceAppMenu(new Panel.AppMenuButton(Main.panel));
    },

    _replaceAppMenu: function(appMenu) {
        let panel = Main.panel;
        let statusArea = panel.statusArea;

        let oldAppMenu = statusArea.appMenu;
        panel._leftBox.remove_actor(oldAppMenu.actor.get_parent());
        oldAppMenu.destroy();

        statusArea.appMenu = appMenu;
        let index = panel._leftBox.get_children().length;
        panel._leftBox.insert_child_at_index(appMenu.actor.get_parent(), index);
    }
});

let SmallPanelIcon = null; 

function init() {
    SmallPanelIcon = new TopPanel();
}

function enable() {
    SmallPanelIcon.enable();
}

function disable() {
    SmallPanelIcon.disable();

}
