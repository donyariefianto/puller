const Env = use('Env')

module.exports = {
    host: Env.get('MONGO_HOST', 'userSiwalusi:!Welkom123@54.254.27.64'),
    port: Env.get('MONGO_PORT', '27017'),
    user: Env.get('MONGO_USER', 'userSiwalusi'),
    pass: Env.get('MONGO_PASS', '!Welkom123'),
    database: Env.get('MONGO_DATABASE', 'siwalusiDataExternal?authSource=admin'),
    options: {
        // authSource: Env.get('MONGO_AUTH_SOURCE', 'admin')
    },
};
