# @prybet/router

A lightweight and flexible router for Deno, built on `@std/route`. Supports dynamic routes, static file serving, and CORS.

## 📝 About this project

I created this router to use it across multiple projects without repeating code.  
The idea came from a public project by [Fireship](https://github.com/fireship-io) in a [Deno 2.0 course](https://github.com/fireship-io/deno-course), where he has a similar class.  
I modified it with **ChatGPT** to fit my needs, adding **CORS support** and **static file serving**.

Its syntax and abstraction are inspired by **Express.js**, making it easy to use for those familiar with it.  
It provides a simple and flexible API to define routes, handle requests, and serve static files, without requiring a complex setup.

## 🚀 Installation

You can install this package from JSR:

```ts
import { Router } from "jsr:@prybet/router";
```

## 📌 Features

- 🛠 **Dynamic Routing** (`:params` support)
- 📁 **Static File Serving**
- 🌍 **CORS Support**
- ⚡ **Lightweight & Fast**

## 🛠 Usage

### **Basic Example**

```ts
import { Router } from "jsr:@prybet/router";

const app = new Router();

app.get("/", (_, res) => res.send({ message: "Hello, world!" }));

// Route with dynamic params
app.get("/users/:id", (_, res, params) => res.send({ userId: params?.id }));

// Route to handle query parameters (?key=value)
app.get("/search", (_, res, __, queries) => res.send({ query: queries }));

// Route to send binary data (PDF, images, etc.)
app.get("/pdf", async (_, res) => {
  const pdf = await Deno.readFile("./example.pdf");
  return res.setHeader("Content-Type", "application/pdf").send(pdf.buffer);
});

// Route to send SVG
app.get("/svg", (_, res) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>`;
  return res.setHeader("Content-Type", "image/svg+xml").send(svg);
});

app.cors(); // Enable CORS

Deno.serve({ port: 9090 }, (req) => app.handler(req));
```

### **Serving Static Files**

```ts
app.static("/public", "./static");
```

## 🔬 Testing

To run tests:

```sh
deno test --allow-net
```

## 📜 License

MIT

<small>This README.md document was created with the help of AI.</small>
