/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Dump graph for debug/visualization purposes
import * as Block from "../block/index.js";

export const serialize = function (graph) {
  const nodes = [];
  const links = [];

  for (const node of Array.from(graph.nodes)) {
    let outlet;
    const record = {
      // Data
      id: node.id,
      name: null,
      type: null,
      depth: null,
      graph: null,
      inputs: [],
      outputs: [],
    };

    nodes.push(record);

    const { inputs } = record;
    const { outputs } = record;

    const block = node.owner;

    if (block instanceof Block.Call) {
      record.name = block.snippet._name;
      record.type = "call";
      record.code = block.snippet._original;
    } else if (block instanceof Block.Callback) {
      record.name = "Callback";
      record.type = "callback";
      record.graph = serialize(block.graph);
    } else if (block instanceof Block.Isolate) {
      record.name = "Isolate";
      record.type = "isolate";
      record.graph = serialize(block.graph);
    } else if (block instanceof Block.Join) {
      record.name = "Join";
      record.type = "join";
    } else if (block != null) {
      if (record.name == null) {
        record.name = block.name != null ? block.name : block.type;
      }
      if (record.type == null) {
        record.type = block.type;
      }
      if (record.code == null) {
        record.code = block.code;
      }
      if (block.graph != null) {
        record.graph = serialize(block.graph);
      }
    }

    const format = function (type) {
      type = type.replace(")(", ")→(");
      return (type = type.replace("()", ""));
    };

    for (outlet of Array.from(node.inputs)) {
      inputs.push({
        id: outlet.id,
        name: outlet.name,
        type: format(outlet.type),
        open: outlet.input == null,
      });
    }

    for (outlet of Array.from(node.outputs)) {
      outputs.push({
        id: outlet.id,
        name: outlet.name,
        type: format(outlet.type),
        open: !outlet.output.length,
      });

      for (const other of Array.from(outlet.output)) {
        links.push({
          from: node.id,
          out: outlet.id,
          to: other.node.id,
          in: other.id,
          type: format(outlet.type),
        });
      }
    }
  }

  return { nodes, links };
};
