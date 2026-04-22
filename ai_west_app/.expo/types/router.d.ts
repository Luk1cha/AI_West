/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/controller`; params?: Router.UnknownInputParams; } | { pathname: `/excel`; params?: Router.UnknownInputParams; } | { pathname: `/forum`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/ჩემი ბაღი`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/controller`; params?: Router.UnknownOutputParams; } | { pathname: `/excel`; params?: Router.UnknownOutputParams; } | { pathname: `/forum`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/ჩემი ბაღი`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/controller${`?${string}` | `#${string}` | ''}` | `/excel${`?${string}` | `#${string}` | ''}` | `/forum${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/ჩემი ბაღი${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/controller`; params?: Router.UnknownInputParams; } | { pathname: `/excel`; params?: Router.UnknownInputParams; } | { pathname: `/forum`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/ჩემი ბაღი`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; };
    }
  }
}
