// All Imports
import { Http, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APIRequest, APIUrls } from '../models';

import { Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';


// Controls the all API (http) method
export enum APIMethod {
  GET,
  POST,
  PUT,
  DELETE,
  IMAGE_GET
};

/**
 * Service for manage API executions like GET, POST, PUT, DELETE.
 * [Injectable description] -> Annotation to indicate that service will be injectale in application.
 */
@Injectable()
export class ApiService {
  // Variable declarations
  result: string;
  baseURl: string = "";
  headers: Headers;

  /**
   * Constructor for ApiService.
   * @param {Http} public apiExecuter [HTTP client to execute methods like GET, POST, PUT, DELETE]
   */
  constructor(public apiExecuter: Http) {
    this.headers = new Headers();
  }

  /**
   * Executes Post request.
   * @param {RequestDataModel} requestDataModel [Model to get metadata of request.]
   */
  executeAPI(apiRequest: APIRequest) {
    this.populateHeaders(apiRequest);
    switch (apiRequest.method) {
      case APIMethod.GET:
        return this.apiExecuter.get(apiRequest.endpoint, { headers: this.headers })
          .map((res: Response) => this.handleResponse(res))
          .catch((errorObj: any) => this.handleError(errorObj));

      case APIMethod.POST:
        return this.apiExecuter.post(apiRequest.endpoint, apiRequest.getBody
          (), { headers: this.headers })
          .map(res => this.handleResponse(res))
          .catch((errorObj: any) => this.handleError(errorObj));

      case APIMethod.PUT:
        return this.apiExecuter.put(apiRequest.endpoint, apiRequest.getBody
          (), { headers: this.headers })
          .map(res => this.handleResponse(res));

      case APIMethod.DELETE:
        if (!apiRequest.isEmptyRequestBody()) {
          return this.apiExecuter.delete(apiRequest.endpoint, {
            headers: this.headers,
            body: apiRequest.getBody()
          })
            .map(res => this.handleResponse(res))
            .catch((errorObj: any) => this.handleError(errorObj));
        } else {
          return this.apiExecuter.delete(apiRequest.endpoint, { headers: this.headers })
            .map(res => this.handleResponse(res))
            .catch((errorObj: any) => this.handleError(errorObj));
        }


      case APIMethod.IMAGE_GET:
        return this.apiExecuter.get(apiRequest.endpoint, { headers: this.headers });

      default:
        return this.apiExecuter.get(apiRequest.endpoint, { headers: this.headers })
          .map(res => res.json());
    }
  }

  // Controls the header for all API request
  populateHeaders(apiRequest: APIRequest) {
    // console.log(apiRequest.getContentType());
    // this.headers.set('Content-Type', 'application/json');
    // this.headers.set('Accept', 'q=0.8;application/json;q=0.9');
    // if (apiRequest.getToken() && null != apiRequest.getToken()) {
    //   this.headers.set('grace_auth_token', apiRequest.getToken());
    // } else if (this.sessionService.getAccessToken() && null !== this.sessionService.getAccessToken()) {
    //   this.headers.set('grace_auth_token', this.sessionService.getAccessToken());
    // }
  }

  // Handle the response of API
  handleResponse(res: any) {
    if (res.status === 204) {
      return {};
    } else if(res && res._body) {
      return res._body;
    } else {
      return res.json();
    }
  }

  // Handle the response of API
  handleError(error: any) {
    return Observable.throw(error || 'backend server error');
  }
}
