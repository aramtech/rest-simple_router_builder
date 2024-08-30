import express from "express";
import path from "path";
import fs from "fs";

import env from "$/server/env.js";
import root_paths from "../../dynamic_configuration/root_paths.js";

const app_path = root_paths.app_path;

type Opts = {
    routes_directory?: string;
    prefix?: string;
    router?: any;
};

export default async function build(opts: Opts = {}) {
    const routes_dir = opts.routes_directory || path.join(app_path, env.router.router_directory);
    const prefix = opts.prefix || "/";
    const router = opts.router || express.Router();

    const routes_dir_contents = fs.readdirSync(routes_dir);

    for (const item of routes_dir_contents) {
        const item_path = path.join(routes_dir, item);
        const item_stat = fs.statSync(item_path);

        if (item_stat.isDirectory()) {
            await build({
                routes_directory: item_path,
                router: router,
                prefix: prefix === "/" ? `/${item}` : `${prefix}/${item}`,
            });
            continue;
        }

        if (item.startsWith("get")) {
            router.get(prefix, (await import(item_path)).default);
        } else if (item.startsWith("post")) {
            router.post(prefix, (await import(item_path)).default);
        } else if (item.startsWith("delete")) {
            router.delete(prefix, (await import(item_path)).default);
        } else if (item.startsWith("patch")) {
            router.patch(prefix, (await import(item_path)).default);
        } else if (item.startsWith("put")) {
            router.put(prefix, (await import(item_path)).default);
        }
    }

    return router;
}
