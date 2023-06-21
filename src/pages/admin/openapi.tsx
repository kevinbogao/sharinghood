/* eslint-disable react/no-unknown-property */

import type { NextPage } from "next";
import Script from "next/script";

import { appConfig } from "../../lib/client/appConfig";

export const OpenApi: NextPage = () => (
  <div>
    <Script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js" />
    {/* @ts-expect-error redoc is not a react component */}
    <redoc disable-search="true" hide-loading="true" scroll-y-offset="3" spec-url={`${appConfig.apiUrl}/openapi`} />
  </div>
);

export default OpenApi;
