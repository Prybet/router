import { route, type Route } from "@std/http/unstable-route";
import { serveDir, type ServeDirOptions } from "@std/http/file-server";

/**
 * Type definition for a route handler function.
 * @param req Incoming HTTP request.
 * @param res Response builder instance.
 * @param params Extracted URL parameters.
 * @param queries Extracted query parameters.
 * @returns An HTTP response.
 */
type Handler = (
  req: Request,
  res: ResponseBuilder,
  params?: Record<string, string>,
  queries?: Record<string, string>
) => Promise<Response> | Response;

/**
 * Set of HTTP status codes that should not have a response body.
 */
const empties = new Set([204, 304]);

/**
 * Checks if data is a binary type that can be sent directly.
 */
const isBinary = (data: unknown): boolean => {
  return (
    data instanceof ArrayBuffer ||
    data instanceof Uint8Array ||
    data instanceof Uint16Array ||
    data instanceof Uint32Array ||
    data instanceof Int8Array ||
    data instanceof Int16Array ||
    data instanceof Int32Array ||
    data instanceof Float32Array ||
    data instanceof Float64Array ||
    data instanceof Blob ||
    data instanceof ReadableStream
  );
};

/**
 * Router class for handling HTTP routes.
 */
export class Router {
  private routes: Route[] = [];

  /**
   * Default headers for CORS and JSON responses.
   */
  static HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  /**
   * Registers a GET route.
   * @param path Route path.
   * @param handler Route handler function.
   */
  get(path: string, handler: Handler) {
    this.addRoute("GET", path, handler);
  }

  /**
   * Registers a POST route.
   * @param path Route path.
   * @param handler Route handler function.
   */
  post(path: string, handler: Handler) {
    this.addRoute("POST", path, handler);
  }

  /**
   * Registers a PUT route.
   * @param path Route path.
   * @param handler Route handler function.
   */
  put(path: string, handler: Handler) {
    this.addRoute("PUT", path, handler);
  }

  /**
   * Registers a DELETE route.
   * @param path Route path.
   * @param handler Route handler function.
   */
  delete(path: string, handler: Handler) {
    this.addRoute("DELETE", path, handler);
  }

  /**
   * Serves static files from a directory.
   * @param path Base route for static files.
   * @param dir Root directory for the files.
   * @param options Optional configuration settings of "serveDir".
   */
  static(path: string, dir: string, options: Partial<ServeDirOptions> = {}) {
    this.routes.push({
      method: "GET",
      pattern: new URLPattern({ pathname: `${path}/*` }),
      handler: (req: Request) => {
        return serveDir(req, {
          fsRoot: dir,
          showDirListing: true,
          enableCors: true,
          quiet: false,
          ...options,
        });
      },
    });
  }

  /**
   * Adds a new route to the router.
   * @param method HTTP method (GET, POST, PUT, DELETE).
   * @param path Route path.
   * @param handler Function to handle requests.
   */
  private addRoute(method: string, path: string, handler: Handler) {
    const pattern = new URLPattern({ pathname: path });

    this.routes.push({
      method,
      pattern,
      handler: async (req) => {
        try {
          const url = new URL(req.url);
          const queries = Object.fromEntries(url.searchParams.entries());
          const params = pattern.exec(url)?.pathname.groups || {};

          return await handler(
            req,
            new ResponseBuilder(),
            params as Record<string, string> | undefined,
            queries
          );
        } catch (error) {
          console.error("Error handling request:", error);
          return new Response("Internal Server Error", {
            status: 500,
          });
        }
      },
    });
  }

  /**
   * Enables CORS support by adding an OPTIONS route.
   */
  cors() {
    this.routes.unshift({
      method: "OPTIONS",
      pattern: new URLPattern({ pathname: "*" }),
      handler: () =>
        new Response(null, {
          status: 204,
          headers: new Headers(Router.HEADERS),
        }),
    });
  }

  /**
   * Returns the request handler for the router.
   * @returns Function to handle incoming requests.
   */
  get handler(): (req: Request) => Response | Promise<Response> {
    return route(this.routes, () => new Response("404", { status: 404 }));
  }
}

/**
 * Response builder with preconfigured headers.
 */
class ResponseBuilder {
  private headers: Headers;
  private code: number = 200;

  constructor() {
    this.headers = new Headers(Router.HEADERS);
  }

  /**
   * Sets the response status code.
   * @param code HTTP status code.
   * @returns Current instance for chaining.
   */
  status(code: number): this {
    this.code = code;
    return this;
  }

  /**
   * Sets a custom header in the response.
   * @param key Header name.
   * @param value Header value.
   * @returns Current instance for chaining.
   */
  setHeader(key: string, value: string): this {
    this.headers.set(key, value);
    return this;
  }

  /**
   * Sends the response with the provided data.
   * @param data Response body.
   * @returns A Response object.
   */
  send(data: unknown = null): Response {
    if (empties.has(this.code))
      return new Response(undefined, {
        status: this.code,
        headers: this.headers,
      });

    const body = isBinary(data)
      ? data
      : typeof data === "object"
      ? JSON.stringify(data)
      : String(data);

    return new Response(body as BodyInit, {
      status: this.code,
      headers: this.headers,
    });
  }
}
