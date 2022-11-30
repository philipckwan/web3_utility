class Utilities {

    static formatTime(d) {
        let aDate = new Date(d);
        let hour = aDate.getHours();
        let minute = aDate.getMinutes();
        let second = aDate.getSeconds();
        let mSec = aDate.getMilliseconds();
        return `${hour.toString().padStart(2,"0")}:${minute.toString().padStart(2,"0")}:${second.toString().padStart(2,"0")}:${mSec.toString().padStart(3,"0")}`;
    }

    static formatTimeFull(d) {
        let month = d.getMonth()+1;
        let date = d.getDate();

        let hour = d.getHours();
        let minute = d.getMinutes();
        let second = d.getSeconds();
        //let mSec = d.getMilliseconds();
        return `${month.toString().padStart(2,"0")}-${date.toString().padStart(2,"0")}|${hour.toString().padStart(2,"0")}:${minute.toString().padStart(2,"0")}:${second.toString().padStart(2,"0")}`;
    }

    static ARGV_KEY_SWAPS = ["-s", "SWAPS"]
    static ARGV_KEY_AMOUNT = ["-a", "AMOUNT"]
    static ARGV_KEY_NETWORK = ["-n", "NETWORK"]
    static ARGV_KEY_LOCAL = ["-l", "LOCAL"]
    static ARGV_KEY_REVERSE = ["-r", "REVERSE"]

    static argumentParsers(argv) {
        let parsedArgMap = new Map()
        let remainingArgv = [];
        for (let i = 2; i < argv.length; i++) {
            if (argv[i].substring(0,2) == this.ARGV_KEY_SWAPS[0]) {
                parsedArgMap.set(this.ARGV_KEY_SWAPS[1], argv[i].substring(2))
                continue
            }
            if (argv[i].substring(0,2) == this.ARGV_KEY_AMOUNT[0]) {
                parsedArgMap.set(this.ARGV_KEY_AMOUNT[1], argv[i].substring(2))
                continue
            }
            if (argv[i].substring(0,2) == this.ARGV_KEY_NETWORK[0]) {
                parsedArgMap.set(this.ARGV_KEY_NETWORK[1], argv[i].substring(2))
                continue
            }
            if (argv[i].substring(0,2) == this.ARGV_KEY_LOCAL[0]) {
                parsedArgMap.set(this.ARGV_KEY_LOCAL[1], argv[i].substring(2))
                continue
            }
            if (argv[i].substring(0,2) == this.ARGV_KEY_REVERSE[0]) {
                parsedArgMap.set(this.ARGV_KEY_REVERSE[1], argv[i].substring(2))
                continue
            }
            remainingArgv.push(argv[i]);
        }
        return [parsedArgMap, remainingArgv]
    }
}

exports.Utilities = Utilities;