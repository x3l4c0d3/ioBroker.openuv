'use strict';

/*
 *
 * x3l4 https://github.com/x3l4c0d3/ioBroker.openuv.git
 *
 */


const utils = require('@iobroker/adapter-core');
const request = require("request");

class Template extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: 'openuv',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        // this.on('message', this.onMessage.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
                
        await this.setObjectAsync('UV', {
            type: 'state',
            common: {
                name: 'UV',
                type: 'number',
                role: 'info',
                read: true,
                write: true,
            },
            native: {},
        });

        await this.setObjectAsync('UV_Max', {
            type: 'state',
            common: {
                name: 'UV_Max',
                type: 'number',
                role: 'info',
                read: true,
                write: true,
            },
            native: {},
        });

        
        this.subscribeStates('*');

        await this.setStateAsync('UV', { val: 0, ack: true });
        await this.setStateAsync('UV_Max', { val: 0, ack: true });


        if (!this.config.apikey || !this.config.lat || !this.config.lng) {
            this.log.info("Bitte füllen Sie alle Einstellungen aus."); 
        } else {
        this.main();
        setInterval(() => this.main(), 1800000);
        }
    }

    async main() {
        var options = { method: 'GET',
        url: 'https://api.openuv.io/api/v1/uv',
        qs: { lat: this.config.lat, lng: this.config.lng},
        headers: 
         { 'content-type': 'application/json',
           'x-access-token': this.config.apikey } };
       var t = this;
       request(options, function (error, response, body) {
         if (error) throw new Error(error);
         var obj = JSON.parse(body);
         t.setStateAsync('UV', { val: obj.result.uv, ack: true });
         t.setStateAsync('UV_Max', { val: obj.result.uv_max, ack: true });
         //t.log.info(body);
       });
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    // /**
    //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
    //  * Using this method requires "common.message" property to be set to true in io-package.json
    //  * @param {ioBroker.Message} obj
    //  */
    // onMessage(obj) {
    // 	if (typeof obj === 'object' && obj.message) {
    // 		if (obj.command === 'send') {
    // 			// e.g. send email or pushover or whatever
    // 			this.log.info('send command');

    // 			// Send response in callback if required
    // 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
    // 		}
    // 	}
    // }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Template(options);
} else {
    // otherwise start the instance directly
    new Template();
}