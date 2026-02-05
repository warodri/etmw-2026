
export class PersistanceUtils {

    public static logout() {
        localStorage.removeItem('auth_token')
    }

}