'use strict';

/*
* x3l4 OpenUV
*/

const utils = require('@iobroker/adapter-core');
const request = require('request');

var x = 1;
var intervalObj;


class OpenUV extends utils.Adapter {

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
        this.on('unload', this.onUnload.bind(this));
    }

    async start() {
        this.log.info('x: ' + x);
        x = x + 1;
       
        var options = { method: 'GET',
        url: 'https://api.openuv.io/api/v1/uv',
        qs: { lat: '-33.34', lng: '115.342'},
        headers: 
        { 'content-type': 'application/json',
        'x-access-token': 'YOUR_API_KEY' } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            utils.Adapter.log.info('IP: ' + body);
        });
    }

   
    async onReady() {
       
        this.log.info('config option1: ' + this.config.option1);
        this.log.info('config option2: ' + this.config.option2);

        /*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
        await this.setObjectAsync('UVNow', {
            type: 'state',
            common: {
                name: 'UVNow',
                type: 'number',
                role: "info",
                read: true,
                write: true,
            },
            native: {},
        });

        // in this template all states changes inside the adapters namespace are subscribed
        this.subscribeStates('*');

        /*
        setState examples
        you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
        */
        // the variable testVariable is set to true as command (ack=false)
        //await this.setStateAsync('UVNow', true);

        // same thing, but the value is flagged "ack"
        // ack should be always set to true if the value is received from or acknowledged from the target system
        await this.setStateAsync('testVariable', { val: "5.5", ack: true });

        // same thing, but the state is deleted after 30s (getState will return null afterwards)
        //await this.setStateAsync('testVariable', { val: true, ack: true, expire: 30 });

        this.start();
        intervalObj = setInterval(() => {
            this.start();
        }, 300000);
        
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.log.info('cleaned everything up...');
            clearInterval(intervalObj);
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
            
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            
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
            
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
           
            this.log.info(`state ${id} deleted`);
        }
    }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new OpenUV(options);
} else {
    // otherwise start the instance directly
    new OpenUV();
}