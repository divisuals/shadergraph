/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

import { serialize as _serialize } from "./serialize.js";
import * as _markup from "./markup.js";

export const serialize = _serialize;
export const markup = _markup;

const _visualize = function (graph) {
  if (!graph) {
    return;
  }
  if (!graph.nodes) {
    return graph;
  }

  const data = serialize(graph);
  return markup.process(data);
};

const resolve = function (arg) {
  if (arg == null) {
    return arg;
  }
  if (arg instanceof Array) {
    return arg.map(resolve);
  }
  if (arg.vertex != null && arg.fragment != null) {
    return [resolve(arg.vertex, resolve(arg.fragment))];
  }
  if (arg._graph != null) {
    return arg._graph;
  }
  if (arg.graph != null) {
    return arg.graph;
  }
  return arg;
};

const merge = function (args) {
  let out = [];
  for (const arg of Array.from(args)) {
    if (arg instanceof Array) {
      out = out.concat(merge(arg));
    } else if (arg != null) {
      out.push(arg);
    }
  }
  return out;
};

export const visualize = function () {
  const list = merge(resolve([].slice.call(arguments)));
  return markup.merge(
    Array.from(list)
      .filter((graph) => graph)
      .map((graph) => _visualize(graph))
  );
};

export const inspect = function () {
  const contents = visualize.apply(null, arguments);
  const element = markup.overlay(contents);

  for (const el of Array.from(
    document.querySelectorAll(".shadergraph-overlay")
  )) {
    el.remove();
  }
  document.body.appendChild(element);
  contents.update();

  return element;
};
