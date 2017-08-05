const dns = require('dns')
const retry = require('retry')

function srvResolver(Container) {
    const operation = retry.operation({
        retries: 5,
        factor: 3,
        minTimeout: 10,     // 10ms
        maxTimeout: 100     // 100ms
    })

    return new Promise(function (resolve) {
        const host = Container.params.host;
        operation.attempt(function () {
            dns.resolveSrv(host, function (err, address) {
                if (operation.retry(err)) {
                    return
                }

                if (err) { resolve(Container) }
                else {
                    Container.params.host = `http://${address[0].name}:${address[0].port}`
                    resolve(Container)
                }
            })
        })
    })
}

module.exports = srvResolver