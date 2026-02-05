import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, of } from "rxjs";

export class InternetCommon {

    httpClient: HttpClient | undefined;

    constructor(httpClient: HttpClient) {
        this.httpClient = httpClient;
    }

    /**
     * DO GET
     * @param url 
     * @param callback 
     */
    public doGet(url: string, headers: HttpHeaders, callback: any) {
        try {
            if (headers) {
                this.httpClient?.get<any>(url, { headers, withCredentials: true })
                .pipe(
                    catchError(error => {
                      console.error('Error from server:', error);
                      callback();  // Handle the error in your callback
                      return of(null); // Return a fallback value to prevent breaking the Observable chain
                    })
                )
                .subscribe((data: any) => {
                    callback(data);
                })
            } else {
                this.httpClient?.get<any>(url)
                .pipe(
                    catchError(error => {
                      console.error('Error from server:', error);
                      callback();  // Handle the error in your callback
                      return of(null); // Return a fallback value to prevent breaking the Observable chain
                    })
                )
                .subscribe((data: any) => {
                    callback(data);
                })
            }
        } catch (ex) {
            console.log(ex);
            callback(null);
        }
    }
    /**
     * DO GET without sending credentials
     * @param url 
     * @param callback 
     */
    public doGetWithoutSendingCredentials(url: string, headers: HttpHeaders, callback: any) {
        try {
            if (headers) {
                this.httpClient?.get<any>(url, { headers })
                .pipe(
                    catchError(error => {
                      console.error('Error from server:', error);
                      callback();  // Handle the error in your callback
                      return of(null); // Return a fallback value to prevent breaking the Observable chain
                    })
                )
                .subscribe((data: any) => {
                    callback(data);
                })
            } else {
                this.httpClient?.get<any>(url)
                .pipe(
                    catchError(error => {
                      console.error('Error from server:', error);
                      callback();  // Handle the error in your callback
                      return of(null); // Return a fallback value to prevent breaking the Observable chain
                    })
                )
                .subscribe((data: any) => {
                    callback(data);
                })
            }
        } catch (ex) {
            console.log(ex);
            callback(null);
        }
    }
    /**
     * DO POST
     * @param url 
     * @param data 
     * @param callback 
     */
    public doPost(url: string, data: any, callback: any) {
        try {
            this.httpClient?.post<any>(url, data, { withCredentials: true })
            .pipe(
                catchError(error => {
                  console.error('Error from server:', error);
                  callback();  // Handle the error in your callback
                  return of(null); // Return a fallback value to prevent breaking the Observable chain
                })
            )
            .subscribe((data: any) => {
                callback(data);
            })
        } catch (ex) {
            console.log(ex);
            callback(null);
        }
    }
    /**
     * DO POST EXPECTING ArrayBuffer
     * @param url 
     * @param data 
     * @param callback 
     */
    public doPostArrayBuffer(url: string, data: any, callback: (result: ArrayBuffer | null) => void) {
        try {
            this.httpClient?.post(url, data, {
                withCredentials: true,
                responseType: 'arraybuffer'  // 👈 key change
            })
                .pipe(
                    catchError(error => {
                        console.error('Error from server:', error);
                        callback(null); // return null in case of error
                        return of(null);
                    })
                )
                .subscribe((result: ArrayBuffer | null) => {
                    callback(result);
                });
        } catch (ex) {
            console.error('Unexpected error in doPostArrayBuffer:', ex);
            callback(null);
        }
    }
    /**
     * DO PUT
     * @param url 
     * @param data 
     * @param callback 
     */
    public doPut(url: string, data: any, callback: any) {
        try {
            this.httpClient?.put<any>(url, data, { withCredentials: true })
            .pipe(
                catchError(error => {
                  console.error('Error from server:', error);
                  callback();  // Handle the error in your callback
                  return of(null); // Return a fallback value to prevent breaking the Observable chain
                })
            )
            .subscribe((data: any) => {
                callback(data);
            })
        } catch (ex) {
            console.log(ex);
            callback(null);
        }
    }
    /**
     * Post to server but sending a multipart/form-data
     * @param url 
     * @param formData 
     * @param callback 
     */
    public doPostFormData(url: string, formData: any, callback: any) {
        try {
            const headers = new HttpHeaders();
            headers.append("Content-Type", "multipart/form-data");
            this.httpClient?.post<any>(url, formData, { headers, withCredentials: true })
            .pipe(
                catchError(error => {
                  console.error('Error from server:', error);
                  callback();  // Handle the error in your callback
                  return of(null); // Return a fallback value to prevent breaking the Observable chain
                })
            )
            .subscribe((data: any) => {
                callback(data);
            })
        } catch (ex) {
            console.log(ex);
            callback(null);
        }
    }
    /**
     * Delete from server
     * @param url 
     * @param formData 
     * @param callback 
     */
    public doDelete(url: string, headers: HttpHeaders, callback: any) {
        try {
            if (headers) {
                this.httpClient?.delete<any>(url, { headers, withCredentials: true })
                .pipe(
                    catchError(error => {
                      console.error('Error from server:', error);
                      callback();  // Handle the error in your callback
                      return of(null); // Return a fallback value to prevent breaking the Observable chain
                    })
                )
                .subscribe((data: any) => {
                    callback(data);
                })
            } else {
                this.httpClient?.delete<any>(url)
                .pipe(
                    catchError(error => {
                      console.error('Error from server:', error);
                      callback();  // Handle the error in your callback
                      return of(null); // Return a fallback value to prevent breaking the Observable chain
                    })
                )
                .subscribe((data: any) => {
                    callback(data);
                })
            }
        } catch (ex) {
            console.log(ex);
            callback(null);
        }
    }   
}