/** PM2 staging — adjust `cwd` to where you cloned the repo on the server. */
module.exports = {
    apps: [
        {
            name: 'remxcall-api',
            cwd: '/home/ec2-user/rem-x-call/server',
            script: 'src/index.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};
