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

        await this.setObjectAsync('UV_Bewertung', {
            type: 'state',
            common: {
                name: 'UV_Bewertung',
                type: 'string',
                role: 'info',
                read: true,
                write: true,
            },
            native: {},
        });

        await this.setObjectAsync('UV_safe_exposure_time1', {
            type: 'state',
            common: {
                name: 'UV_safe_exposure_time1',
                type: 'number',
                role: 'info',
                read: true,
                write: true,
            },
            native: {},
        });

        await this.setObjectAsync('UV_safe_exposure_time2', {
            type: 'state',
            common: {
                name: 'UV_safe_exposure_time2',
                type: 'number',
                role: 'info',
                read: true,
                write: true,
            },
            native: {},
        });

        await this.setObjectAsync('UV_safe_exposure_time3', {
            type: 'state',
            common: {
                name: 'UV_safe_exposure_time3',
                type: 'number',
                role: 'info',
                read: true,
                write: true,
            },
            native: {},
        });

        await this.setObjectAsync('UV_safe_exposure_time4', {
            type: 'state',
            common: {
                name: 'UV_safe_exposure_time4',
                type: 'number',
                role: 'info',
                read: true,
                write: true,
            },
            native: {},
        });

        await this.setObjectAsync('UV_safe_exposure_time5', {
            type: 'state',
            common: {
                name: 'UV_safe_exposure_time5',
                type: 'number',
                role: 'info',
                read: true,
                write: true,
            },
            native: {},
        });

        await this.setObjectAsync('UV_safe_exposure_time6', {
            type: 'state',
            common: {
                name: 'UV_safe_exposure_time6',
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
        if (!this.config.interval || this.config.interval < 30){
            setInterval(() => this.main(), 1800000);
        } else {
            var interv = this.config.interval;
            interv = interv * 60000;
            setInterval(() => this.main(), interv);    
        }
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
         var bewertung = "unbekannt";
         if (obj.result.uv < 3){ bewertung = "niedrig"}
         if (obj.result.uv >= 3 && obj.result.uv < 6){ bewertung = "mäßig"}
         if (obj.result.uv >= 6 && obj.result.uv < 8){ bewertung = "hoch"}
         if (obj.result.uv >= 8 && obj.result.uv < 11){ bewertung = "sehr hoch"}
         if (obj.result.uv > 11){ bewertung = "extrem"}
         t.setStateAsync('UV_Bewertung', { val: bewertung, ack: true });
         t.setStateAsync('UV_safe_exposure_time1', { val: obj.result.safe_exposure_time.st1, ack: true });
         t.setStateAsync('UV_safe_exposure_time2', { val: obj.result.safe_exposure_time.st2, ack: true });
         t.setStateAsync('UV_safe_exposure_time3', { val: obj.result.safe_exposure_time.st3, ack: true });
         t.setStateAsync('UV_safe_exposure_time4', { val: obj.result.safe_exposure_time.st4, ack: true });
         t.setStateAsync('UV_safe_exposure_time5', { val: obj.result.safe_exposure_time.st5, ack: true });
         t.setStateAsync('UV_safe_exposure_time6', { val: obj.result.safe_exposure_time.st6, ack: true });
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