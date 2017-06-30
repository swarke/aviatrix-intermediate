// All Imports
import { APIMethod } from '../services/index';


/**
 * Model for handling parameters of http request
 */
export class APIRequest {
  endpoint: string;
  token: string;
  method: APIMethod;
  private contentType: string;
  private keys: Array<string>;
  private values: Array<string>;

  constructor(endpoint: string, method: APIMethod) {
    this.endpoint = endpoint;
    this.method = method;
    this.keys = [];
    this.values = [];
    this.contentType = 'application/json';
  }

  addProperty(key: any, value: any) {
    this.keys.push(key);
    this.values.push(value);
  }

  getBody(): any {
    const rawData = {};
    for (let index = 0; index < this.keys.length; index++) {
      rawData[this.keys[index]] = this.values[index];
    }

    return JSON.stringify(rawData);
  }

  getContentType() {
    return this.contentType;
  }

  setContentType(contentType: string) {
    this.contentType = contentType;
  }

  getToken() {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
  }

  isEmptyRequestBody() {
    return (Object.keys(this.getBody()).length === 0);
  }
}

// Controls all API Urls
export enum APIUrls {

  // BASE_URL = <any>'http://0.0.0.0:5001/api/v1/',
  DASHBOARD = <any> '/dashboard'
}
