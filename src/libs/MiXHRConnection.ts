import {Injectable} from 'angular2/core';
import {isPresent, isString, Json} from 'angular2/src/facade/lang';
import {Connection, XHRConnection, Request, ReadyState, BrowserXhr, ResponseOptions, RequestMethod, Headers, ResponseType, ConnectionBackend } from 'angular2/http';
import {isSuccess, isJsObject, getResponseURL} from 'angular2/src/http/http_utils';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';

class MiResponseOptions extends ResponseOptions {
    statusText: string;
    type: any;
    merge(options?): MiResponseOptions {
        return new MiResponseOptions({
            body: isPresent(options) && isPresent(options.body) ? options.body : this.body,
            status: isPresent(options) && isPresent(options.status) ? options.status : this.status,
            headers: isPresent(options) && isPresent(options.headers) ? options.headers : this.headers,
            statusText: isPresent(options) && isPresent(options.statusText) ? options.statusText :
                                                                                this.statusText,
            type: isPresent(options) && isPresent(options.type) ? options.type : this.type,
            url: isPresent(options) && isPresent(options.url) ? options.url : this.url,
        });
    }
}

class MiResponse {
    type: ResponseType;
    ok: boolean;
    url: string;
    status: number;
    statusText: string;
    bytesLoaded: number;
    totalBytes: number;
    headers: Headers;
    // TODO: Support ArrayBuffer, JSON, FormData, Blob
    private _body: string | Object;
    constructor(responseOptions: MiResponseOptions) {
        this._body = responseOptions.body;
        this.status = responseOptions.status;
        this.statusText = responseOptions.statusText;
        this.headers = responseOptions.headers;
        this.type = responseOptions.type;
        this.url = responseOptions.url;
    }

    blob(): any { 
        return this._body;
    }
    json(): any {
        var jsonResponse: string | Object;
        if (isJsObject(this._body)) {
        jsonResponse = this._body;
        } else if (isString(this._body)) {
        jsonResponse = Json.parse(<string>this._body);
        }
        return jsonResponse;
    }
    text(): string { return this._body.toString(); }
    arrayBuffer(): any {
        return this._body;
    }
}

class MiXHRConnection implements Connection {
    request: Request;
    response: Observable<MiResponse>;
    readyState: ReadyState;
    private _responseType: any;
    constructor(req: Request, browserXHR: BrowserXhr, baseResponseOptions?: MiResponseOptions) {
        // console.log(baseResponseOptions);
        this._responseType = req.headers.get('responseType');
        if (this._responseType) {
            req.headers.delete('responseType');
        }
        this.request = req;
        this.response = new Observable((responseObserver: Observer<{state: string, response: any}>) => {
            let _xhr: XMLHttpRequest = browserXHR.build();
            // 添加blob/arraybuffer responseType到xhr
            switch (this._responseType) {
                case 'blob':
                case 'arraybuffer':
                    _xhr.responseType = this._responseType;
                    break;
                default:
                    break;
            }
            _xhr.open(RequestMethod[req.method].toUpperCase(), req.url);

            let onLoad = () => {
                let body = isPresent(_xhr.response) ? _xhr.response : _xhr.responseText;
                let headers = Headers.fromResponseHeaderString(_xhr.getAllResponseHeaders());
                let url = getResponseURL(_xhr);
                let status: number = _xhr.status === 1223 ? 204 : _xhr.status;
                if (status === 0) {
                    status = body ? 200 : 0;
                }
                var responseOptions = new MiResponseOptions({body, status, headers, url});
                if (isPresent(baseResponseOptions)) {
                    responseOptions = baseResponseOptions.merge(responseOptions);
                }
                let response = new MiResponse(responseOptions);
                if (isSuccess(status)) {
                    responseObserver.next({
                        state: 'loaded',
                        response
                    });
                    responseObserver.complete();
                    return;
                }
                responseObserver.error(response);
            };

            let onError = (err: any) => {
                var responseOptions = new MiResponseOptions({body: err, type: ResponseType.Error});
                if (isPresent(baseResponseOptions)) {
                    responseOptions = baseResponseOptions.merge(responseOptions);
                }
                responseObserver.error({
                    state: 'error',
                    response: new MiResponse(responseOptions)
                });
            };

            let onProgress = (event: any) => {
                responseObserver.next({
                    state: 'progress',
                    response: (event.loaded / event.totalSize).toFixed(2)
                });
            }

            if (isPresent(req.headers)) {
                req.headers.forEach((values, name) => _xhr.setRequestHeader(name, values.join(',')));
            }

            _xhr.addEventListener('load', onLoad);
            _xhr.addEventListener('error', onError);
            _xhr.addEventListener('progress', onProgress);

            _xhr.send(this.request.text());

            return () => {
                _xhr.removeEventListener('load', onLoad);
                _xhr.removeEventListener('error', onError);
                _xhr.removeEventListener('progress', onProgress);
                _xhr.abort();
            };
        });
    }
}

@Injectable()
export class MiXHRBackend implements ConnectionBackend {
    constructor(private _browserXHR: BrowserXhr, private _baseResponseOptions: ResponseOptions) {}
    createConnection(request: Request): MiXHRConnection {
        return new MiXHRConnection(request, this._browserXHR, new MiResponseOptions(this._baseResponseOptions));
    }
}