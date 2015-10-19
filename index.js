var spawn = require("child_process").spawn;

var state = {
    coreTemperature: 0,
    coreVolts: 0,
    coreSDRamVolts: 0
};

function piTemperature(callback) {
    var regex = /temp=([^'C]+)/;
    var cmd = spawn("/opt/vc/bin/vcgencmd", ["measure_temp"]);
    cmd.stdout.on("data", function(buf) {
        callback(Number(regex.exec(buf.toString("utf8"))[1]))
    });

    cmd.stderr.on("data", function(buf) {
        callback(null, new Error(buf.toString("utf8")));
    });
}

function piVolts(callback, opts) {
    var id = opts ? opts.id || "core" : "core";
    var regex = /volt=([^V]+)/;
    var cmd = spawn("/opt/vc/bin/vcgencmd", ["measure_volts", id]);
    cmd.stdout.on("data", function(buf) {
        callback(Number(regex.exec(buf.toString("utf8"))[1]))
    });

    cmd.stderr.on("data", function(buf) {
        callback(null, new Error(buf.toString("utf8")));
    });
}

module.exports.get = function(cb) {

    piTemperature(function(temp, err) {
        
        if (err) return cb(err, null);

        state.coreTemperature = temp;

        piVolts(function(volts, err) {
            if (err) return cb(err, null);

            state.coreVolts = volts;

            piVolts(function(volts, err) {
                if (err) return cb(err, null);

                state.coreSDRamVolts = volts;

                return cb(err, state);

            }, {
                id: 'sdram_p'
            });

        });

    });

};
