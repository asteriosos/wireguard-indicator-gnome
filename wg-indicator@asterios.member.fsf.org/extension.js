const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const Util = imports.misc.util;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;

const WgIndicator = new Lang.Class({
    Name: 'WgIndicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "WG Indicator", false);
        this.buttonText = new St.Label({
            text: _("Loading..."),
            y_align: Clutter.ActorAlign.CENTER
        });

        this.actor.add_actor(this.buttonText);
        this._refresh();
    },

    _checkWG: function() {
        let [res, out, err, exit] = GLib.spawn_sync(null, ["/bin/bash", "-c", "ip a | grep wg0"], null, GLib.SpawnFlags.SEARCH_PATH, null);

        return exit;
    },

    _refresh: function() {
        this._refreshUI(this._checkWG());

        if (this._timeout) {
            Mainloop.source_remove(this._timeout);
            this._timeout = null;
        }

        this._timeout = Mainloop.timeout_add_seconds(2, Lang.bind(this, this._refresh));
    },

    _refreshUI: function(data) {
        var text;

        if (data == 256) {
            text = "wg0 down";
        } else if (data == 0) {
            text = "wg0 up";
        } else {
            text = "wg0 error";
        }

        this.buttonText.set_text(text);
    }
});

let twMenu;

function init() {
}

function enable() {
    twMenu = new WgIndicator;
    Main.panel.addToStatusArea('wg-indicator', twMenu);
}

function disable() {
    if (twMenu && twMenu._timeout) {
        Mainloop.source_remove(twMenu._timeout);
    }

    twMenu.destroy();
    twMenu = null;
}