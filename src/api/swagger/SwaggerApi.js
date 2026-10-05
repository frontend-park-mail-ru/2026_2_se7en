import { GET_SWAGGER_URL } from './swagger.constants.js';
import { USING_MOCK } from '../api.constants.js';
import { mockGetSwaggerSpec } from './swagger.mock.js';
import { ServerApi } from '../ServerApi.js';

export class SwaggerApi extends ServerApi {
  static async getSpec() {
    console.log(USING_MOCK.SWAGGER);
    if (USING_MOCK.SWAGGER) {
      console.log('da');
      return mockGetSwaggerSpec();
    }
    return await this._request(GET_SWAGGER_URL, { responseType: 'text' });
  }
}
