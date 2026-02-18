
export class Config {

    public static VERSION = '1.0.0';   
    public static dev = true;

    public static ASSETS_BASE_URL = 'https://entertomyworld.com/images/never-delete'
    
    public static MARKETPLACE = {
        feePercent: 10
    }

    public static SERVER = {
        dev: true,
        local: 'http://localhost:3080',
        remote: 'https://entertomyworld.com:3080',
    }

    public static CLIENT = {
        dev: true,
        local: 'http://localhost:4200/#',
        remote: 'https://entertomyworld.com/#',
    }

    public static SOCKET_SERVER = {
        dev: true,
        local: 'http://localhost',
        remote: 'https://entertomyworld.com',
        port: 3004
    }

    public static PAYMENTS = {
        dev: true,
        local: 'http://localhost:4000',
        remote: 'https://entertomyworld.com:4000',
    }

}